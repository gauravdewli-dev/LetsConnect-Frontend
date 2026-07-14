import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  clearConnectingProvider,
  DEFAULT_CONNECTION_STATUS,
  getCachedConnectionStatus,
  setCachedConnectionStatus,
  setConnectingProvider,
} from "@/lib/connectionCache";
import { getUser } from "@/models/auth-model/selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { disconnectGmail, disconnectGithub, disconnectJira, disconnectSlack, getIntegrationConnectUrl } from "../api";
import { useConnections } from "../hooks/useConnections";
import { getConnectTimedOut } from "../selectors";
import { triggerFetchStatus } from "../sagaActions";
import { clearConnectTimedOut, setConnectTimedOut, setConnecting, setFetchStatusFailure, setFetchStatusSuccess } from "../slice";
import { ensureFreshAccessToken } from "@/services/api";

import ConnectionStatusStrip from "./ConnectionStatusStrip";
import { graphNodeTypes, INTEGRATION_STYLES } from "./integrationGraph/nodes";
import {
  DEFAULT_POSITIONS,
  edgeHandlesForIntegration,
  hubIdentity,
  integrationLinked,
  integrationStatus,
  type IntegrationId,
  POSITIONS_STORAGE_KEY,
} from "./integrationGraph/types";

const REDIRECT_STUCK_MS = 15_000;

function loadPositions(): Record<string, { x: number; y: number }> {
  try {
    const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_POSITIONS;
    return { ...DEFAULT_POSITIONS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_POSITIONS;
  }
}

function savePositions(nodes: Node[]) {
  const positions = Object.fromEntries(nodes.map((n) => [n.id, n.position]));
  localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
}

function integrationFromConnection(connection: Connection): IntegrationId | null {
  const peer = connection.source === "hub" ? connection.target : connection.source;
  if (peer === "gmail" || peer === "slack" || peer === "jira" || peer === "github") return peer;
  return null;
}

export default function IntegrationGraph() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(getUser);
  const { status, refreshing, error, connecting } = useConnections();
  const connectTimedOut = useAppSelector(getConnectTimedOut);
  const [redirecting, setRedirecting] = useState(false);

  const displayStatus = useMemo(
    () => status ?? getCachedConnectionStatus() ?? DEFAULT_CONNECTION_STATUS,
    [status],
  );

  const applyStatus = useCallback(
    (nextStatus: typeof displayStatus) => {
      setCachedConnectionStatus(nextStatus);
      dispatch(setFetchStatusSuccess(nextStatus));
    },
    [dispatch],
  );

  const disconnectHandlers = useMemo(
    () => ({
      gmail: async () => {
        try {
          await disconnectGmail();
          dispatch(triggerFetchStatus());
        } catch (err) {
          dispatch(setFetchStatusFailure(err instanceof Error ? err.message : "Failed to disconnect Gmail"));
        }
      },
      slack: async () => {
        try {
          const nextStatus = await disconnectSlack();
          applyStatus(nextStatus);
        } catch (err) {
          dispatch(setFetchStatusFailure(err instanceof Error ? err.message : "Failed to disconnect Slack"));
        }
      },
      jira: async () => {
        try {
          await disconnectJira();
          dispatch(triggerFetchStatus());
        } catch (err) {
          dispatch(setFetchStatusFailure(err instanceof Error ? err.message : "Failed to disconnect Jira"));
        }
      },
      github: async () => {
        try {
          await disconnectGithub();
          dispatch(triggerFetchStatus());
        } catch (err) {
          dispatch(setFetchStatusFailure(err instanceof Error ? err.message : "Failed to disconnect GitHub"));
        }
      },
    }),
    [applyStatus, dispatch],
  );

  const beginConnect = useCallback(
    async (id: IntegrationId) => {
      if (redirecting || connecting) return;

      const meta = integrationStatus(id, displayStatus);
      if (!meta.connectable) return;
      if (
        meta.connected &&
        !(id === "slack" && displayStatus.slack_connected && !displayStatus.slack_send_as_user) &&
        !(id === "gmail" && displayStatus.gmail_connected && !displayStatus.calendar_connected)
      ) {
        return;
      }

      setRedirecting(true);
      dispatch(clearConnectTimedOut());
      dispatch(setConnecting(id));
      setConnectingProvider(id);

      const stuckTimer = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          setRedirecting(false);
          dispatch(setConnecting(null));
          clearConnectingProvider();
          dispatch(setConnectTimedOut(id));
        }
      }, REDIRECT_STUCK_MS);

      try {
        await ensureFreshAccessToken();
        const url = await getIntegrationConnectUrl(id);
        window.clearTimeout(stuckTimer);
        window.location.href = url;
      } catch {
        window.clearTimeout(stuckTimer);
        setRedirecting(false);
        dispatch(setConnecting(null));
        clearConnectingProvider();
        dispatch(setConnectTimedOut(id));
      }
    },
    [connecting, dispatch, displayStatus, redirecting],
  );

  const buildNodes = useCallback((): Node[] => {
    const positions = loadPositions();
    const hubNode: Node = {
      id: "hub",
      type: "hub",
      position: positions.hub,
        data: {
          label: "LetsConnect",
          ...hubIdentity(displayStatus, user?.email),
          active: Boolean(connecting),
        },
      draggable: !connecting,
    };

    const integrations: IntegrationId[] = ["gmail", "slack", "jira", "github"];
    const labels: Record<IntegrationId, string> = {
      gmail: "Gmail",
      slack: "Slack",
      jira: "Jira",
      github: "GitHub",
    };

    const integrationNodes: Node[] = integrations.map((id) => {
      const meta = integrationStatus(id, displayStatus);
      const isConnecting = connecting === id;
      return {
        id,
        type: "integration",
        position: positions[id],
        data: {
          kind: id,
          label: labels[id],
          subtitle: isConnecting ? "Authorize access" : meta.subtitle,
          username: isConnecting ? undefined : meta.username,
          detail: isConnecting ? undefined : meta.detail,
          connected: meta.connected,
          connectable: meta.connectable,
          connecting: isConnecting,
          warning: isConnecting ? undefined : meta.warning,
          onDisconnect:
            integrationLinked(id, displayStatus) && !isConnecting
              ? () => void disconnectHandlers[id]()
              : undefined,
        },
        draggable: !isConnecting,
      };
    });

    return [hubNode, ...integrationNodes];
  }, [connecting, disconnectHandlers, displayStatus, user?.email]);

  const buildEdges = useCallback((): Edge[] => {
    const edges: Edge[] = [];
    const addEdge = (id: IntegrationId, connected: boolean, dashed = false) => {
      if (!connected) return;
      const { sourceHandle, targetHandle } = edgeHandlesForIntegration(id);
      edges.push({
        id: dashed ? `hub-${id}-warn` : `hub-${id}`,
        source: "hub",
        target: id,
        sourceHandle,
        targetHandle,
        animated: !dashed,
        style: {
          stroke: dashed ? "#f59e0b" : INTEGRATION_STYLES[id].edge,
          strokeWidth: dashed ? 2 : 2.5,
          strokeDasharray: dashed ? "6 4" : undefined,
        },
      });
    };

    addEdge("gmail", displayStatus.calendar_connected);
    addEdge("slack", displayStatus.slack_connected && displayStatus.slack_send_as_user);
    addEdge("jira", displayStatus.jira_connected);
    addEdge("github", displayStatus.github_connected);

    if (displayStatus.gmail_connected && !displayStatus.calendar_connected) {
      addEdge("gmail", true, true);
    }

    if (displayStatus.slack_connected && !displayStatus.slack_send_as_user) {
      addEdge("slack", true, true);
    }

    if (connecting) {
      const { sourceHandle, targetHandle } = edgeHandlesForIntegration(connecting);
      edges.push({
        id: `hub-${connecting}-pending`,
        source: "hub",
        target: connecting,
        sourceHandle,
        targetHandle,
        animated: true,
        style: {
          stroke: INTEGRATION_STYLES[connecting].edge,
          strokeWidth: 2,
          strokeDasharray: "5 5",
          opacity: 0.7,
        },
      });
    }

    return edges;
  }, [connecting, displayStatus]);

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges());

  useEffect(() => {
    setNodes(buildNodes());
    setEdges(buildEdges());
  }, [buildEdges, buildNodes, setEdges, setNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const integrationId = integrationFromConnection(connection);
      if (!integrationId) return;
      beginConnect(integrationId);
    },
    [beginConnect],
  );

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (connecting || redirecting) return false;
      const ids = [connection.source, connection.target];
      if (!ids.includes("hub")) return false;
      const integrationId = ids.find((id) => id !== "hub");
      if (integrationId !== "gmail" && integrationId !== "slack" && integrationId !== "jira" && integrationId !== "github") {
        return false;
      }
      return integrationStatus(integrationId, displayStatus).connectable;
    },
    [connecting, displayStatus, redirecting],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type !== "integration" || connecting || redirecting) return;
      beginConnect(node.id as IntegrationId);
    },
    [beginConnect, connecting, redirecting],
  );

  const onNodeDragStop = useCallback(() => {
    setNodes((current) => {
      savePositions(current);
      return current;
    });
  }, [setNodes]);

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
      {connecting && <ConnectionStatusStrip provider={connecting} phase="connecting" />}

      {connectTimedOut && !connecting && (
        <ConnectionStatusStrip
          provider={connectTimedOut}
          phase="timeout"
          onDismiss={() => dispatch(clearConnectTimedOut())}
        />
      )}

      {error && !status && (
        <p className="shrink-0 rounded-lg border border-red-100 bg-red-50/50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50/80 to-white shadow-sm">
        {refreshing && (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-indigo-100">
            <div
              className="h-full w-2/5 bg-indigo-500/80"
              style={{ animation: "sync-bar 1.4s ease-in-out infinite" }}
            />
          </div>
        )}

        <div className="min-h-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            isValidConnection={isValidConnection}
            nodeTypes={graphNodeTypes}
            nodesDraggable={!connecting}
            nodesConnectable={!connecting}
            fitView
            fitViewOptions={{ padding: 0.35 }}
            minZoom={0.5}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            className="h-full w-full"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>

      <p className="shrink-0 text-center text-xs text-muted-foreground">
        Drag to arrange · Link or tap a node to connect · × removes a link
      </p>
    </div>
  );
}
