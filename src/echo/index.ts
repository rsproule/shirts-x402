import Echo from "@merit-systems/echo-next-sdk";

export const { handlers, isSignedIn, openai, anthropic, google } = Echo({
  appId: process.env.ECHO_APP_ID!,
});
