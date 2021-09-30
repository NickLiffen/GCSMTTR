import { DynamoDBStreamEvent } from "aws-lambda";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

import { v4 as uuidv4 } from "uuid";

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  const { Records } = event;

  const { dynamodb } = Records[0];

  const repositoryName = dynamodb?.NewImage?.repositoryName as string;

  const input = {
    MessageDeduplicationId: uuidv4(),
    MessageGroupId: repositoryName,
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: JSON.stringify(dynamodb?.NewImage),
  };

  const client = new SQSClient({ region: process.env.REGION });
  const command = new SendMessageCommand(input);

  try {
    await client.send(command);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
