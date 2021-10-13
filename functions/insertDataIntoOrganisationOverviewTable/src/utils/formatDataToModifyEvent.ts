import { differenceInMilliseconds } from "date-fns";

export const formatDataToModifyEvent = async (
  formattedStream: parsedStream,
  formattedRecord: parsedRecord
): Promise<formatDataToModifyEventResponse> => {
  
  let fixedAlerts = formattedRecord.fixedAlerts;
  let closedAlerts = formattedRecord.closedAlerts;
  let totalTimeToRemediate = formattedRecord.totalTimeToRemediate;
  let meanTimeToRemediate = formattedRecord.meanTimeToRemediate;
  let openAlerts = formattedRecord.openAlerts;

  if (formattedStream.alertClosedAtReason === "FIXED") {
    fixedAlerts = formattedRecord.fixedAlerts + 1;
  }

  if (formattedStream.alertClosedAtReason === "CLOSED") {
    closedAlerts = formattedRecord.closedAlerts + 1;
  }

  const createdAtTimestamp = formattedStream.alertCreatedAtFullTimestamp
    ? new Date(formattedStream.alertCreatedAtFullTimestamp)
    : new Date();

  const closedAtTimestamp = formattedStream.alertClosedAtFullTimestamp
    ? new Date(formattedStream.alertClosedAtFullTimestamp)
    : new Date();

  const milliseconds = differenceInMilliseconds(
    closedAtTimestamp,
    createdAtTimestamp
  );

  totalTimeToRemediate = totalTimeToRemediate + milliseconds;
  meanTimeToRemediate = totalTimeToRemediate / (fixedAlerts + closedAlerts);
  openAlerts = openAlerts - 1;

  return {
    fixedAlerts: fixedAlerts.toString(),
    closedAlerts: closedAlerts.toString(),
    totalTimeToRemediate: totalTimeToRemediate.toString(),
    meanTimeToRemediate: meanTimeToRemediate.toString(),
    openAlerts: openAlerts.toString(),
  } as formatDataToModifyEventResponse;
};
