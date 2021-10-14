import { SQSEvent } from "aws-lambda";

import {
  createDynamoID,
  getDynamoRecord,
  formatStreamData,
  formatDynamoRecord,
  formatDataToModifyEvent,
  runquery,
} from "./utils";

export const handler = async (event: SQSEvent): Promise<AWSResponse> => {
  try {
    let Detail = {} as Detail;

    console.log(Detail);

    const [streamEvent, formattedStream, e] = await formatStreamData(event);

    console.log(`The event coming from the DynamoDB Stream is: ${streamEvent}`);

    console.log(`What happened to the data was: ${e}`);

    console.log(
      `The formatted data coming from the DynamoDB Stream is:`,
      formattedStream
    );

    const [dynamoId, monthyPeriod] = await createDynamoID(formattedStream);

    console.log(`The created DynamoDB ID is: ${dynamoId}`);
    console.log(`The created monthly period is: ${monthyPeriod}`);

    const record = await getDynamoRecord(dynamoId);

    console.log(`The record coming from the DB is`, record);
    console.log(`The item coming from the DB is`, record.Item);

    const formattedRecord = await formatDynamoRecord(record);

    console.log(
      `The formatted data from the DynamoDB Record is:`,
      formattedRecord
    );

    const formatedModifiedData = formattedStream.newAlertTotalTimeToRemediate
      ? await formatDataToModifyEvent(formattedStream, formattedRecord, e)
      : "";

    console.log(
      `The formatted data from the modified event is:`,
      formatedModifiedData
    );

    if (e === "NewOpenAlertCreated" && !record.Item) {
      Detail = {
        statusCode: 200,
        action: "INSERT-CREATE",
        id: `${dynamoId}`,
        organisationName: formattedStream.organisationName,
        reportingDate: monthyPeriod,
        openAlerts: "1",
      } as insertCreateResponseFormat;
    }

    if (e === "ExistingOpenAlertAdded" && record.Item) {
      Detail = {
        statusCode: 200,
        action: "INSERT-UPDATE",
        id: `${dynamoId}`,
        openAlerts: (formattedRecord.openAlerts + 1).toString() as string,
      } as insertUpdateResponseFormat;
    }

    if (e === "NewOpenAlertClosed") {
      console.log(e);
    }

    if (e === "NewOpenAlertFixed") {
      console.log(e);
    }

    if (e === "ExistingOpenAlertAdded") {
      console.log(e);
    }

    if (e === "ExistingOpenAlertClosed") {
      console.log(e);
    }

    if (e === "ExistingOpenAlertFixed") {
      console.log(e);
    }

    if (!record.Item) {
      console.log("No Record Item Found in Overtable table");
    }

    if (record.Item) {
      console.log("Record Item Found in Overtable table");
    }

    /* 
      IF Record does not exisit in the Overview Table,
        IF Stream === INSERT,
          IF Record.totalTimeToRemedaite > 0,
            This must mean that an alert has been remedaited
          IF Record.totalTimeToRemedaite === 0,
            This must mean that a new alert has been opened
        IF Stream === MODIFY,
          IF difference between old and new image open alerts has increased
            This must mean that a new alert has been opened
          IF difference between old and new image open alerts has decreased
            This must mean that an alert has been remedaited
      IF Record exists in the Overview Table,
        IF Stream === INSERT,
          IF Record.totalTimeToRemedaite > 0,
            This must mean that an alert has been remedaited
          IF Record.totalTimeToRemedaite === 0,
            This must mean that a new alert has been opened
        IF Stream === MODIFY,
          IF difference between old and new image open alerts has increased
            This must mean that a new alert has been opened
          IF difference between old and new image open alerts has decreased
            This must mean that an alert has been remedaited
    */

    /*if (streamEvent === "INSERT" && !record.Item) {
      console.log("INSERT", "EMPTY RECORD");

      Detail = {
        statusCode: 200,
        action: "INSERT-CREATE",
        id: `${dynamoId}`,
        organisationName: formattedStream.organisationName,
        reportingDate: monthyPeriod,
        openAlerts: "1",
      } as insertCreateResponseFormat;

      console.log(
        `The following Deail object has been built within the INSERT-CREATE IF:`,
        Detail
      );
    }

    if (streamEvent === "MODIFY" && record.Item) {
      console.log("INSERT", "RECORD");

      Detail = {
        statusCode: 200,
        action: "INSERT-UPDATE",
        id: `${dynamoId}`,
        openAlerts: (formattedRecord.openAlerts + 1).toString() as string,
      } as insertUpdateResponseFormat;

      console.log(
        `The following Deail object has been built within the INSERT-RECORD IF: `,
        Detail
      );
    }

    if (streamEvent === "MODIFY" && !record.Item) {
      console.log("MODIFY", "EMPTY RECORD");

      Detail = {
        statusCode: 200,
        action: "MODIFY-CREATE" as string,
        id: `${dynamoId}` as string,
        organisationName: formattedStream.organisationName as string,
        reportingDate: monthyPeriod as string,
        openAlerts: "0" as string,
        numberFixed: d.fixedAlerts as string,
        numberManuallyCosed: d.closedAlerts as string,
        totalTimeToRemediate: d.totalTimeToRemediate as string,
        meanTimeToRemediate: d.meanTimeToRemediate as string,
      } as modifyCreateResponseFormat;

      console.log(
        `The following Deail object has been built within the MODIFT-CREATE IF: `,
        Detail
      );
    }

    if (streamEvent === "MODIFY" && record.Item) {
      console.log("MODIFY", "RECORD");

      Detail = {
        statusCode: 200,
        action: "MODIFY-UPDATE",
        id: `${dynamoId}`,
        openAlerts: d.openAlerts as string,
        numberFixed: d.fixedAlerts as string,
        numberManuallyCosed: d.closedAlerts as string,
        totalTimeToRemediate: d.totalTimeToRemediate as string,
        meanTimeToRemediate: d.meanTimeToRemediate as string,
      } as modifyUpdateResponseFormat;
      console.log(
        `The following Deail object has been built within the MODIFT-UPDATE IF: `,
        Detail
      );
    }
    */

    await runquery(Detail);

    console.log("Data Put/Updated In DynamoDB");

    return { statusCode: 200, body: "success" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
