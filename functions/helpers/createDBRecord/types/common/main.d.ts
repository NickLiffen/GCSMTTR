type record = {
  id: string;
  alertID: string;
  alertURL: string;
  alertCreatedAtFullTimestamp: string;
  repositoryName: string;
  organisationName: string;
  alertCreatedAtYear: string;
  alertCreatedAtMonth: string;
  alertCreatedAtDate: string;
  alertClosedAtFullTimestamp: string;
};

type Response = {
  record: record;
};
