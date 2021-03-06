import { GetItemCommandOutput } from "@aws-sdk/client-dynamodb";

export const formatDynamoRecord = async (
  event: GetItemCommandOutput
): Promise<parsedRecord> => {
  const { Item } = event;

  const fixedAlerts = Item?.numberFixed
    ? parseInt(Item?.numberFixed.N as string)
    : (0 as number);
  const closedAlerts = Item?.numberManuallyCosed
    ? parseInt(Item?.numberManuallyCosed.N as string)
    : (0 as number);
  const totalTimeToRemediate = Item?.totalTimeToRemediate
    ? parseInt(Item?.totalTimeToRemediate.N as string)
    : (0 as number);
  const meanTimeToRemediate = Item?.meanTimeToRemediate
    ? parseInt(Item?.meanTimeToRemediate.N as string)
    : (0 as number);
  const openAlerts = Item?.openAlerts
    ? parseInt(Item?.openAlerts.N as string)
    : (0 as number);

  const parsedRecord = {
    fixedAlerts,
    closedAlerts,
    totalTimeToRemediate,
    meanTimeToRemediate,
    openAlerts,
  } as parsedRecord;

  return parsedRecord;
};
