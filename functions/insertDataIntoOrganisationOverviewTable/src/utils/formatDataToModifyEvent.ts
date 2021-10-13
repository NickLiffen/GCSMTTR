export const formatDataToModifyEvent = async (
  formattedStream: parsedStream,
  formattedRecord: parsedRecord,
  e: e
): Promise<formatDataToModifyEventResponse> => {
  let fixedAlerts = formattedRecord.fixedAlerts;
  let closedAlerts = formattedRecord.closedAlerts;
  let totalTimeToRemediate = formattedRecord.totalTimeToRemediate;
  let meanTimeToRemediate = formattedRecord.meanTimeToRemediate;
  let openAlerts = formattedRecord.openAlerts;

  if (e === "NewOpenAlertFixed" || e === "ExistingOpenAlertFixed") {
    fixedAlerts = formattedRecord.fixedAlerts + 1;
    openAlerts = openAlerts - 1;
  }

  if (e === "NewOpenAlertClosed" || e === "ExistingOpenAlertClosed") {
    closedAlerts = formattedRecord.closedAlerts + 1;
    openAlerts = openAlerts - 1;
  }

  if (e === "NewOpenAlertCreated" || e === "ExistingOpenAlertAdded") {
    openAlerts = openAlerts + 1;
  }

  const oldAlertTotalTimeToRemediate =
    formattedStream.oldAlertTotalTimeToRemediate
      ? formattedStream.oldAlertTotalTimeToRemediate
      : 0;

  const difference =
    formattedStream.newAlertTotalTimeToRemediate - oldAlertTotalTimeToRemediate;

  console.log("difference", difference);

  totalTimeToRemediate = totalTimeToRemediate + difference;
  meanTimeToRemediate = totalTimeToRemediate / (fixedAlerts + closedAlerts);

  return {
    fixedAlerts: fixedAlerts.toString(),
    closedAlerts: closedAlerts.toString(),
    totalTimeToRemediate: totalTimeToRemediate.toString(),
    meanTimeToRemediate: meanTimeToRemediate.toString(),
    openAlerts: openAlerts.toString(),
  } as formatDataToModifyEventResponse;
};
