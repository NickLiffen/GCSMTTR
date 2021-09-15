type record = {
  id: string;
  alertID: number;
  alertURL: string;
  alertCreatedAtFullTimestamp: string;
  repositoryName: string;
  organisationName: string;
  alertCreatedAtYear: number;
  alertCreatedAtMonth: number;
  alertCreatedAtDate: number;
  alertClosedAtFullTimestamp: null;
};

type Response = {
  record: record;
};
