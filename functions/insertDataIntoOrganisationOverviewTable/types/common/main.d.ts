type formatDataToModifyEventResponse = {
  fixedAlerts: string;
  closedAlerts: string;
  totalTimeToRemediate: string;
  meanTimeToRemediate: string;
  openAlerts: string;
};

type sqsRecord = {
  NewImage: RepoOverviewData;
  OldImage: RepoOverviewData;
  EventName: string;
};

type RepoOverviewData = {
  repositoryName: S;
  organisationName: S;
  openAlerts: N;
  totalTimeToRemediate?: N;
  meanTimeToRemediate?: N;
  numberManuallyCosed?: N;
  numberFixed?: N;
};

type S = {
  S: string;
};

type N = {
  N: string;
};

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
  newOpenAlerts: number;
  newAlertTotalTimeToRemediate: number;
  newAlertMeanTimeToRemediate: number;
  newAlertNumberManuallyCosed: number;
  newAlertNumberFixed: number;
  oldOpenAlerts: number;
  oldAlertTotalTimeToRemediate: number;
  oldAlertMeanTimeToRemediate: number;
  oldAlertNumberManuallyCosed: number;
  oldAlertNumberFixed: number;
};

type event = "INSERT" | "MODIFY" | "REMOVE" | undefined;

type e =
  | "ExistingOpenAlertAdded"
  | "ExistingOpenAlertFixed"
  | "ExistingOpenAlertClosed"
  | "NewOpenAlertCreated"
  | "NewOpenAlertFixed"
  | "NewOpenAlertClosed";

type AlertNumberInformation = {
  newOpenAlerts: string;
  oldOpenAlerts: string;
  newAlertTotalTimeToRemediate: string;
  oldAlertTotalTimeToRemediate: string;
  newAlertMeanTimeToRemediate: string;
  oldAlertMeanTimeToRemediate: string;
  newAlertNumberManuallyCosed: string;
  oldAlertNumberManuallyCosed: string;
  newAlertNumberFixed: string;
  oldAlertNumberFixed: string;
};

type streamResponse = [event, parsedStream, e];

type insertCreateResponseFormat = {
  statusCode: number;
  action: "INSERT-CREATE";
  id: string;
  repositoryName: string;
  organisationName: string;
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
  organisationName: string;
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

type Detail =
  | insertCreateResponseFormat
  | insertUpdateResponseFormat
  | modifyCreateResponseFormat
  | modifyUpdateResponseFormat;

type AWSResponse = {
  statusCode: number;
  body: string;
};
