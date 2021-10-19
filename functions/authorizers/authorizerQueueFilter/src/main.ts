import { APIGatewayProxyEventV2 } from "aws-lambda";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import { v4 as uuidv4 } from "uuid";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<string> => {
  try {
    const sourceIP = event.requestContext.http.sourceIp as string;
    const body = event.body;
    const signature = event.headers["x-hub-signature-256"] as string;

    const data = {
      sourceIP,
      body,
      signature,
    };

    const input = {
      MessageDeduplicationId: uuidv4(),
      MessageGroupId: uuidv4(), // make this org/repo/alertId
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify(data),
    };

    const client = new SQSClient({ region: process.env.REGION });
    const command = new SendMessageCommand(input);

    await client.send(command);

    return "data to send to queue successfully";
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};
