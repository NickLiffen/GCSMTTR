import { CodeScanningAlertClosedByUserEvent } from "@octokit/webhooks-types";

import {
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";

export const handler = async (
  event: CodeScanningAlertClosedByUserEvent
): Promise<Response> => {
  console.log(event);

  const { alert, repository } = event;

  const key = `${repository.full_name}/${alert.number}`;

  const config = {
    region: process.env.REGION,
  } as DynamoDBClientConfig;

  const input = {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: {
        S: `${key}`,
      },
    },
  } as GetItemCommandInput;

  const client = new DynamoDBClient(config);
  const command = new GetItemCommand(input);
  const { Item } = await client.send(command);

  if (!Item) return { statusCode: 404 } as Response;

  const date = alert.dismissed_at ? new Date(alert.dismissed_at) : new Date();

  const response = {
    statusCode: 200 as number,
    reason: alert.dismissed_reason ? "ClosedByUser" : ("Fixed" as string),
    alertClosedAtFullTimestamp: date.toString() as string,
    alertClosedAtYear: date.getUTCFullYear().toString() as string,
    alertClosedAtMonth: date.getUTCMonth().toString() as string,
    alertClosedAtDate: date.getUTCDate().toString() as string,
  } as Response;

  return response as Response;
};
