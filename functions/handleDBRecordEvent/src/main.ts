import { DynamoDBStreamEvent } from "aws-lambda";
import { differenceInMilliseconds } from "date-fns";

import {
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
} from "@aws-sdk/client-dynamodb";

import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
  PutEventsCommandOutput,
} from "@aws-sdk/client-eventbridge";

export const handler = async (event: DynamoDBStreamEvent): Promise<number> => {
  let Detail = {};
  const { Records } = event;

  const { eventName, dynamodb } = Records[0];

  const newImage = dynamodb ? dynamodb.NewImage : {};
  const repositoryName = newImage ? newImage.repositoryName.S : "";

  console.log("eventName", eventName);

  console.log("dynamodb", dynamodb);

  console.log("newImage", newImage);

  console.log("repositoryName", repositoryName);

  const date = new Date();
  const month = date.toLocaleString("default", { month: "long" }) as string;
  const year = date.getUTCFullYear().toString() as string;
  const monthyPeriod = `${year}-${month}`;

  console.log("monthyPeriod", monthyPeriod);

  const id = `${monthyPeriod}/${repositoryName}`;

  console.log("id", id);

  const config = {
    region: process.env.REGION,
  } as DynamoDBClientConfig;

  const eventBridgeClient = new EventBridgeClient({
    region: process.env.REGION,
  }) as EventBridgeClient;

  const input = {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: {
        S: `${id}`,
      },
    },
  } as GetItemCommandInput;

  const client = new DynamoDBClient(config);
  const command = new GetItemCommand(input);

  try {
    const { Item } = (await client.send(command)) as GetItemCommandOutput;

    console.log("Item", Item);

    let alertCount = Item ? parseInt(`${Item.openAlerts.N}`, 10) : 0;
    let numberFixed = Item ? parseInt(`${Item.fixedAlerts.N}`, 10) : 0;
    let numberManuallyCosed = Item ? parseInt(`${Item.closedAlerts.N}`, 10) : 0;
    let TTR = Item ? parseInt(`${Item.TTR.N}`, 10) : 0;
    let MTTR = Item ? parseInt(`${Item.MTTR.N}`, 10) : 0;

    if (eventName === "INSERT") {
      console.log("In INSERT");
      if (!Item) {
        Detail = {
          statusCode: 200,
          action: "INSERT-CREATE",
          id: `${id}`,
          repositoryName: repositoryName as string,
          organizationName: (newImage
            ? newImage.organisationName.S
            : "") as string,
          reportingDate: monthyPeriod as string,
          openAlerts: "1" as string,
        };
      } else {
        Detail = {
          statusCode: 200,
          action: "INSERT-UPDATE",
          id: `${id}`,
          openAlerts: (++alertCount).toString() as string,
        };
      }
    }

    if (eventName === "MODIFY") {
      console.log("In MODIFY");
      const alertCreatedAtFullTimestamp = newImage
        ? newImage.alertCreatedAtFullTimestamp.S
        : "";
      const alertClosedAtFullTimestamp = newImage
        ? newImage.alertClosedAtFullTimestamp.S
        : ""; // CHECK HERE

      const alertClosedAtReason = newImage
        ? newImage.alertClosedAtReason.S
        : ""; // CHECK HERE

      alertClosedAtReason === "FIXED" ? ++numberFixed : ++numberManuallyCosed;

      const createdAtTimestamp = alertCreatedAtFullTimestamp
        ? new Date(alertCreatedAtFullTimestamp)
        : new Date();
      const closedAtTimestamp = alertClosedAtFullTimestamp
        ? new Date(alertClosedAtFullTimestamp)
        : new Date();

      const milliseconds = differenceInMilliseconds(
        closedAtTimestamp,
        createdAtTimestamp
      );

      TTR = TTR + milliseconds;
      MTTR = (MTTR + milliseconds) / (numberFixed + numberManuallyCosed);

      if (!Item) {
        Detail = {
          statusCode: 200 as number,
          action: "MODIFY-CREATE" as string,
          id: `${id}` as string,
          repositoryName: repositoryName as string,
          organizationName: (newImage
            ? newImage.organisationName.S
            : "") as string,
          reportingDate: monthyPeriod as string,
          TTRMilliseconds: milliseconds.toString() as string,
          MTTRMilliseconds: milliseconds.toString() as string,
          numberFixed: numberFixed.toString() as string,
          numberManuallyCosed: numberManuallyCosed.toString() as string,
          openAlerts: "0" as string,
        };
      } else {
        Detail = {
          statusCode: 200,
          action: "MODIFY-UPDATE",
          id: `${id}`,
          openAlerts: (--alertCount).toString() as string,
          numberFixed: numberFixed.toString() as string,
          numberManuallyCosed: numberManuallyCosed.toString() as string,
          TTRMilliseconds: TTR.toString() as string,
          MTTRMilliseconds: MTTR.toString() as string,
        };
      }
    }

    console.log("Detail", Detail)

    const eventBridgeInput = {
      Entries: [
        {
          Source: "custom.kickOffRepoOverviewStateMachine" as string,
          EventBusName: process.env.EVENT_BUS_NAME as string,
          DetailType: "transaction" as string,
          Time: new Date() as Date,
          Detail: JSON.stringify(Detail) as string,
        },
      ],
    } as PutEventsCommandInput;

    console.log("eventBridgeInput", eventBridgeInput)

    const eventBridgeCommand = new PutEventsCommand(eventBridgeInput);

    console.log("Send to EventBridge");
    const { FailedEntryCount } = (await eventBridgeClient.send(
      eventBridgeCommand
    )) as PutEventsCommandOutput;

    const count = FailedEntryCount as number;

    return count;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
