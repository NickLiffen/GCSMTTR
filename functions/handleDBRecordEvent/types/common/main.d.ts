type formatDataToModifyEventResponse = {
  fixedAlerts: string;
  closedAlerts: string;
  totalTimeToRemediate: string;
  meanTimeToRemediate: string;
  openAlerts: string;
};

type sqsRecord = {
  alertCreatedAtDate: N
  organisationName: S
  alertCreatedAtFullTimestamp: S
  alertCreatedAtMonth: S
  alertCreatedAtYear: N
  alertID: N
  alertURL: S
  id: S
  repositoryName: S
  S: string
  alertClosedAtFullTimestamp? : S
  alertClosedAtReason?: S
}

type S = {
  S: string;
}

type N = {
  N: string;
}

type dynamoDBReponse = [string, string];

type parsedRecord = {
  fixedAlerts: number;
  closedAlerts: number;
  totalTimeToRemediate: number;
  meanTimeToRemediate: number;
  openAlerts: number;
};

type parsedStream = {
  repositoryName: string;
  organisationName: string;
  alertCreatedAtFullTimestamp: string;
  alertClosedAtFullTimestamp: string;
  alertClosedAtReason: string;
};

type event = "INSERT" | "MODIFY" | "REMOVE" | undefined;

type streamResponse = [event, parsedStream];

type insertCreateResponseFormat = {
  statusCode: number;
  action: "INSERT-CREATE";
  id: string;
  repositoryName: string;
  organizationName: string;
  reportingDate: string;
  openAlerts: string;
};

type insertUpdateResponseFormat = {
  statusCode: number;
  action: "INSERT-UPDATE";
  id: string;
  openAlerts: string;
};

type modifyCreateResponseFormat = {
  statusCode: number;
  action: "MODIFY-CREATE";
  id: string;
  repositoryName: string;
  organizationName: string;
  reportingDate: string;
  openAlerts: string;
  numberFixed: string;
  numberManuallyCosed: string;
  totalTimeToRemediate: string;
  meanTimeToRemediate: string;
};

type modifyUpdateResponseFormat = {
  statusCode: number;
  action: "MODIFY-UPDATE";
  id: string;
  openAlerts: string;
  numberFixed: string;
  numberManuallyCosed: string;
  totalTimeToRemediate: string;
  meanTimeToRemediate: string;
};

type response =
  | insertCreateResponseFormat
  | insertUpdateResponseFormat
  | modifyCreateResponseFormat
  | modifyUpdateResponseFormat;
