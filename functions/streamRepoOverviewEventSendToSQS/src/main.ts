import { DynamoDBStreamEvent } from "aws-lambda";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import { v4 as uuidv4 } from "uuid";

export const handler = async (event: DynamoDBStreamEvent): Promise<string> => {
  try {
    const { Records } = event;

    const { eventName: ev, dynamodb } = Records[0];

    if (ev === "REMOVE" || !ev) return "remove event not supported";

    const organizationName = dynamodb?.NewImage?.organizationName.S as string;

    const eventName = {
      S: ev,
    };

    const merged = { ...dynamodb?.NewImage, ...eventName };

    console.log("merged data:", merged);

    const input = {
      MessageDeduplicationId: uuidv4(),
      MessageGroupId: organizationName,
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify(merged),
    };

    console.log("input", input);
    console.log("dynamodb?.NewImage", dynamodb?.NewImage);

    const client = new SQSClient({ region: process.env.REGION });
    const command = new SendMessageCommand(input);

    await client.send(command);

    return "data to send to queue successfully";
  } catch (error) {
    console.log(error);
    throw error;
  }
};
