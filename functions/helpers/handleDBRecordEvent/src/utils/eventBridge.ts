import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
  PutEventsCommandOutput,
} from "@aws-sdk/client-eventbridge";

export const eventBridge = async (Detail: any): Promise<number> => {
  const eventBridgeClient = new EventBridgeClient({
    region: process.env.REGION,
  }) as EventBridgeClient;

  const eventBridgeInput = {
    Entries: [
      {
        Source: "custom.kickOffRepoOverviewStateMachine" as string,
        EventBusName: process.env.EVENT_BUS_NAME as string,
        DetailType: "transaction" as string,
        Time: new Date() as Date,
        Detail: JSON.stringify(Detail) as string,
      },
    ],
  } as PutEventsCommandInput;

  console.log("eventBridgeInput", eventBridgeInput);

  const eventBridgeCommand = new PutEventsCommand(eventBridgeInput);

  console.log("Send to EventBridge");
  const { FailedEntryCount } = (await eventBridgeClient.send(
    eventBridgeCommand
  )) as PutEventsCommandOutput;

  const count = FailedEntryCount as number;

  return count;
};
