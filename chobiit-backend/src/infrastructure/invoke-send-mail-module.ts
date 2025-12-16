import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

export async function invokeSendMailModule(payload) {
  const client = new LambdaClient({region: 'us-east-1'});
  const command = new InvokeCommand({
    InvocationType: "RequestResponse",
    FunctionName: "sendMailModule",
    Payload: JSON.stringify(payload),
  });

  await client.send(command);
};