import LegalLayout from "./LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 26, 2025">
      <p>
        LetsConnect (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is an AI assistant platform that connects
        to your work tools through Slack and our web dashboard. Today we support Gmail; additional
        integrations such as Jira and Microsoft Teams are planned. This Privacy Policy explains what
        information we collect, how we use it, and your choices.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> email address and password (stored as a secure hash)
          when you sign up.
        </li>
        <li>
          <strong>Gmail data:</strong> when you connect Gmail, we access email metadata and content
          only as needed to respond to your requests (search, read, summarize, send when you ask).
          OAuth tokens are stored encrypted.
        </li>
        <li>
          <strong>Slack data:</strong> when you connect Slack, we receive your Slack user ID, workspace
          ID, and messages you send to the bot so we can reply in the same conversation.
        </li>
        <li>
          <strong>Usage data:</strong> basic logs (e.g. errors, request timestamps) to keep the service
          running.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>Authenticate you and manage your account.</li>
        <li>Connect to Gmail and Slack on your behalf when you authorize us.</li>
        <li>Process your chat messages and return AI-generated replies using Google Gemini.</li>
        <li>Maintain security and improve reliability of the service.</li>
      </ul>

      <h2>Data sharing</h2>
      <p>
        We do not sell your personal data. We share data only with services required to operate the
        app:
      </p>
      <ul>
        <li>Google (Gmail API, Gemini API) — when you connect Gmail or use the assistant.</li>
        <li>Slack — when you connect Slack or message the bot.</li>
        <li>Hosting providers (e.g. Vercel, Render, Neon) — to run the application and database.</li>
      </ul>

      <h2>Data retention</h2>
      <p>
        We retain your account and connection tokens while your account is active. You may disconnect
        Gmail or Slack from the dashboard or delete your account to remove associated data.
      </p>

      <h2>Security</h2>
      <p>
        Passwords are hashed. OAuth tokens are encrypted at rest. All production traffic uses HTTPS.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access, correction, or deletion of your account data by contacting us at the
        email below.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy:{" "}
        <a href="mailto:gauravdewli1970@gmail.com">gauravdewli1970@gmail.com</a>
      </p>
    </LegalLayout>
  );
}
