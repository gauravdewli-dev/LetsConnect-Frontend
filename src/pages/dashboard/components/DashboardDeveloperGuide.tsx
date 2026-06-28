import DeveloperSetupGuide from "./DeveloperSetupGuide";

export default function DashboardDeveloperGuide() {
  return (
    <div className="space-y-6 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div>
        <h1 className="text-xl font-semibold">Developer guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          OAuth app setup and environment variables for Gmail, Slack, and Jira.
        </p>
      </div>

      <DeveloperSetupGuide />
    </div>
  );
}
