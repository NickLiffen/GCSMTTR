import { DynamoDBStreamEvent } from "aws-lambda";

import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";

import { v4 as uuidv4 } from "uuid";

export const handler = async (event: DynamoDBStreamEvent): Promise<string> => {
  try {
    let data = {} as QueueData;

    const { Records } = event;

    const { eventName: ev, dynamodb } = Records[0];

    console.log("dynamodb?.NewImage", dynamodb?.NewImage);
    console.log("dynamodb?.OldImage", dynamodb?.OldImage);

    if (ev === "REMOVE" || !ev) {
      return "remove event not supported";
    }

    if (ev === "INSERT") {
      data = { NewImage: dynamodb?.NewImage, EventName: ev };
    }

    if (ev === "MODIFY") {
      data = {
        NewImage: dynamodb?.NewImage,
        OldImage: dynamodb?.OldImage,
        EventName: ev,
      };
    }

    console.log("Data sending to SQS Queue:", data);

    const organisationName = dynamodb?.NewImage?.organisationName.S as string;

    const input = {
      MessageDeduplicationId: uuidv4(),
      MessageGroupId: organisationName,
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify(data),
    } as SendMessageCommandInput;

    console.log("input", input);

    const client = new SQSClient({ region: process.env.REGION });
    const command = new SendMessageCommand(input);

    await client.send(command);

    return "data to send to queue successfully";
  } catch (error) {
    console.log(error);
    throw error;
  }
};
