type Response = {
  statusCode: number;
  record: Input | null;
};

type Input = {
  id: string;
  alertClosedAtReason: string;
  alertClosedAtFullTimestamp: string;
  alertClosedAtYear: string;
  alertClosedAtMonth: string;
  alertClosedAtDate: string;
};
