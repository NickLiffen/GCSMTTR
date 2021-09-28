import { GetItemCommandOutput } from "@aws-sdk/client-dynamodb";

export const formatDynamoRecord = async (
  event: GetItemCommandOutput
): Promise<parsedRecord> => {
  const { Item } = event;

  const fixedAlerts = Item?.fixedAlerts.N
    ? parseInt(Item?.fixedAlerts.N)
    : (0 as number);
  const closedAlerts = Item?.closedAlerts.N
    ? parseInt(Item?.closedAlerts.N)
    : (0 as number);
  const totalTimeToRemediate = Item?.totalTimeToRemediate.N
    ? parseInt(Item?.totalTimeToRemediate.N)
    : (0 as number);
  const meanTimeToRemediate = Item?.meanTimeToRemediate.N
    ? parseInt(Item?.meanTimeToRemediate.N)
    : (0 as number);
  const openAlerts = Item?.openAlerts.N
    ? parseInt(Item?.openAlerts.N)
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
