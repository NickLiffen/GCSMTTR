import {
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  GetItemCommandInput,
  GetItemCommandOutput,
} from "@aws-sdk/client-dynamodb";

export const getDynamoRecord = async (
  id: string
): Promise<GetItemCommandOutput> => {
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

  try {
    const Item = (await client.send(command)) as GetItemCommandOutput;
    return Item;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
