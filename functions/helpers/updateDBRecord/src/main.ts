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

  const id = `${repository.full_name}/${alert.number}`;

  const config = {
    region: process.env.REGION,
  } as DynamoDBClientConfig;

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
  const { Item } = await client.send(command);

  if (!Item) return { statusCode: 404, record: null } as Response;

  const date = alert.dismissed_at ? new Date(alert.dismissed_at) : new Date();

  const record = {
    id,
    alertClosedAtReason: (alert.dismissed_reason
      ? "CLOSED"
      : "FIXED") as string,
    alertClosedAtFullTimestamp: date.toISOString() as string,
    alertClosedAtYear: date.getUTCFullYear().toString() as string,
    alertClosedAtMonth: date.toLocaleString("default", {
      month: "long",
    }) as string,
    alertClosedAtDate: date.getUTCDate().toString() as string,
  } as Input;

  return { statusCode: 200, record } as Response;
};
