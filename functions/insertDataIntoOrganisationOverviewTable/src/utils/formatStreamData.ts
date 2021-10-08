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

  const repositoryName: string = NewImage.repositoryName
    ? NewImage.repositoryName.S
    : "";

  const organisationName: string = NewImage.organisationName
    ? NewImage.organisationName.S
    : ("" as string);

  const nOpenAlerts: string = NewImage.openAlerts
    ? NewImage.openAlerts.N
    : ("" as string);

  const newOpenAlerts = Number(nOpenAlerts);

  /* ---------- */

  /* ---- Fixed Vulnrabilities have this data ------ */

  const alertCreatedAtFullTimestamp = NewImage.alertCreatedAtFullTimestamp
    ? NewImage.alertCreatedAtFullTimestamp.S
    : ("" as string);

  const alertClosedAtFullTimestamp = NewImage.alertClosedAtFullTimestamp
    ? NewImage.alertClosedAtFullTimestamp.S
    : ("" as string);

  const alertClosedAtReason = NewImage.alertClosedAtReason
    ? NewImage.alertClosedAtReason.S
    : ("" as string);

  /* ---------- */

  if (OldImage) {
    const {
      openAlerts: { N: oOpenAlerts },
    } = OldImage;

    const oldOpenAlerts = Number(oOpenAlerts);

    if (newOpenAlerts > oldOpenAlerts) {
      e = "ExistingOpenAlertAdded";
    } else if (
      oldOpenAlerts > newOpenAlerts &&
      alertClosedAtReason === "FIXED"
    ) {
      e = "ExistingOpenAlertFixed";
    } else if (
      oldOpenAlerts > newOpenAlerts &&
      alertClosedAtReason === "CLOSED"
    ) {
      e = "ExistingOpenAlertClosed";
    } else {
      throw new Error("Unhandled event type");
    }
  } else {
    if (newOpenAlerts > 0) {
      e = "NewOpenAlertCreated";
    } else if (alertClosedAtReason && alertClosedAtReason === "FIXED") {
      e = "NewOpenAlertFixed";
    } else if (alertClosedAtReason && alertClosedAtReason === "CLOSED") {
      e = "NewOpenAlertClosed";
    } else {
      throw new Error("Unhandled event type");
    }
  }

  const formattedStream = {
    repositoryName,
    organisationName,
    newOpenAlerts,
    alertCreatedAtFullTimestamp,
    alertClosedAtFullTimestamp,
    alertClosedAtReason,
  } as parsedStream;

  return [streamEvent, formattedStream, e] as streamResponse;
};
