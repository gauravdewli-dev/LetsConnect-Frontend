import IntegrationNodes from "./IntegrationNodes";

export default function DashboardConnections() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-5 md:px-8 md:py-6">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold">Connected accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          LetsConnect is your hub — drag integrations around the graph, link them to the bot to
          connect, or click × to disconnect.
        </p>
      </div>

      <IntegrationNodes />
    </div>
  );
}
