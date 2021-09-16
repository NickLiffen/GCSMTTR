import { APIGatewayProxyResultV2 } from "aws-lambda";

import { CodeScanningAlertCreatedEvent } from "@octokit/webhooks-types";

import {
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";

export const handler = async (
  event: CodeScanningAlertCreatedEvent
): Promise<APIGatewayProxyResultV2> => {
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
  const response = await client.send(command);
  console.log(response);
  return "success";
};
