import { SQSEvent } from "aws-lambda";

export const formatStreamData = async (
  event: SQSEvent
): Promise<streamResponse> => {
  let e: string;

  const { Records } = event;

  const { body } = Records[0];

  const { NewImage, OldImage, EventName } = JSON.parse(body) as sqsRecord;

  console.log("NewImage", NewImage);
  console.log("OldImage", OldImage);

  /* ---- All Events Have These Data ------ */

  const streamEvent: string = EventName ? EventName : "";

  const repositoryName: string =
    NewImage && NewImage.repositoryName ? NewImage.repositoryName.S : "";

  const organisationName: string =
    NewImage && NewImage.organisationName ? NewImage.organisationName.S : "";

  const newOpenAlerts: number =
    NewImage && NewImage.openAlerts ? parseInt(NewImage.openAlerts.N) : 0;

  /* ---------- */

  /* ---- Fixed Vulnrabilities have this data ------ */

  const newAlertTotalTimeToRemediate: number =
    NewImage && NewImage.totalTimeToRemediate
      ? parseInt(NewImage.totalTimeToRemediate.N)
      : 0;

  const newAlertMeanTimeToRemediate: number =
    NewImage && NewImage.meanTimeToRemediate
      ? parseInt(NewImage.meanTimeToRemediate.N)
      : 0;

  const newAlertNumberManuallyCosed: number =
    NewImage && NewImage.numberManuallyCosed
      ? parseInt(NewImage.numberManuallyCosed.N)
      : 0;

  const newAlertNumberFixed: number =
    NewImage && NewImage.numberFixed ? parseInt(NewImage.numberFixed.N) : 0;

  /* ---------- */

  /* ---- Fixed Vulnrabilities on a Pre-Recorded Alert have this data ------ */

  const oldOpenAlerts: number =
    OldImage && OldImage.openAlerts ? parseInt(OldImage.openAlerts.N) : 0;

  const oldAlertTotalTimeToRemediate: number =
    OldImage && OldImage.totalTimeToRemediate
      ? parseInt(OldImage.totalTimeToRemediate.N)
      : 0;

  const oldAlertMeanTimeToRemediate: number =
    OldImage && OldImage.meanTimeToRemediate
      ? parseInt(OldImage.meanTimeToRemediate.N)
      : 0;

  const oldAlertNumberManuallyCosed: number =
    OldImage && OldImage.numberManuallyCosed
      ? parseInt(OldImage.numberManuallyCosed.N)
      : 0;

  const oldAlertNumberFixed: number =
    OldImage && OldImage.numberFixed ? parseInt(OldImage.numberFixed.N) : 0;

  /* ---------- */

  if (OldImage) {
    if (newOpenAlerts > oldOpenAlerts) {
      e = "ExistingOpenAlertAdded";
    } else if (
      oldOpenAlerts > newOpenAlerts &&
      newAlertNumberFixed > oldAlertNumberFixed
    ) {
      e = "ExistingOpenAlertFixed";
    } else if (
      oldOpenAlerts > newOpenAlerts &&
      newAlertNumberManuallyCosed > oldAlertNumberManuallyCosed
    ) {
      e = "ExistingOpenAlertClosed";
    } else {
      throw new Error("Unhandled event type");
    }
  } else {
    if (newOpenAlerts > 0) {
      e = "NewOpenAlertCreated";
    } else if (newAlertNumberFixed === 1) {
      e = "NewOpenAlertFixed";
    } else if (newAlertNumberManuallyCosed === 1) {
      e = "NewOpenAlertClosed";
    } else {
      throw new Error("Unhandled event type");
    }
  }

  const formattedStream = {
    repositoryName,
    organisationName,
    newOpenAlerts,
    newAlertTotalTimeToRemediate,
    newAlertMeanTimeToRemediate,
    newAlertNumberManuallyCosed,
    newAlertNumberFixed,
    oldOpenAlerts,
    oldAlertTotalTimeToRemediate,
    oldAlertMeanTimeToRemediate,
    oldAlertNumberManuallyCosed,
    oldAlertNumberFixed,
  } as parsedStream;

  return [streamEvent, formattedStream, e] as streamResponse;
};
