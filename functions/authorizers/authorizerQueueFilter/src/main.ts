import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import { v4 as uuidv4 } from "uuid";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  try {
    /* Structuring the data we need to perform secret + IP validation of webhook */
    const MessageBody = JSON.stringify({
      sourceIP: event.requestContext.http.sourceIp as string,
      body: event.body as string,
      signature: event.headers["x-hub-signature-256"] as string,
    }) as string;

    const input = {
      MessageDeduplicationId: uuidv4(),
      MessageGroupId: uuidv4(), // make this org/repo/alertId
      QueueUrl: process.env.QUEUE_URL,
      MessageBody,
    };

    const client = new SQSClient({ region: process.env.REGION });
    const command = new SendMessageCommand(input);

    await client.send(command);

    return {
      statusCode: 200,
      body: "data sent to queue successfully",
    };
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};
