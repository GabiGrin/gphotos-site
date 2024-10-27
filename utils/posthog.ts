import { PostHog } from "posthog-node";

const posthogServer = new PostHog(
  "phc_Paw44RHF5gwCq5owZ62uvPRDVZ5TcOk0FkyNNovHHlg",
  {
    host: "https://us.i.posthog.com",
  }
);

export default posthogServer;
