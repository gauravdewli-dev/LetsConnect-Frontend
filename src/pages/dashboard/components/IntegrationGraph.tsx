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
  setConnectingProvider,
} from "@/lib/connectionCache";
import { getToken, getUser } from "@/models/auth-model/selectors";
import { API_URL } from "@/pages/dashboard/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { disconnectGmail, disconnectJira, disconnectSlack } from "../api";
import { useConnections } from "../hooks/useConnections";
import { getConnectTimedOut } from "../selectors";
import { triggerFetchStatus } from "../sagaActions";
import { clearConnectTimedOut, setConnectTimedOut, setConnecting } from "../slice";

import ConnectionStatusStrip from "./ConnectionStatusStrip";
import { graphNodeTypes, INTEGRATION_STYLES } from "./integrationGraph/nodes";
import {
  DEFAULT_POSITIONS,
  integrationStatus,
  type IntegrationId,
  POSITIONS_STORAGE_KEY,
} from "./integrationGraph/types";

const REDIRECT_DELAY_MS = 600;
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
  if (peer === "gmail" || peer === "slack" || peer === "jira") return peer;
  return null;
}

export default function IntegrationGraph() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(getToken);
  const user = useAppSelector(getUser);
  const { status, refreshing, error, connecting } = useConnections();
  const connectTimedOut = useAppSelector(getConnectTimedOut);
  const [redirecting, setRedirecting] = useState(false);

  const displayStatus = useMemo(
    () => status ?? getCachedConnectionStatus() ?? DEFAULT_CONNECTION_STATUS,
    [status],
  );

  const disconnectHandlers = useMemo(
    () => ({
      gmail: async () => {
        await disconnectGmail();
        dispatch(triggerFetchStatus());
      },
      slack: async () => {
        await disconnectSlack();
        dispatch(triggerFetchStatus());
      },
      jira: async () => {
        await disconnectJira();
        dispatch(triggerFetchStatus());
      },
    }),
    [dispatch],
  );

  const beginConnect = useCallback(
    (id: IntegrationId) => {
      if (!token || redirecting || connecting) return;

      const meta = integrationStatus(id, displayStatus);
      if (!meta.connectable) return;
      if (
        meta.connected &&
        !(id === "slack" && displayStatus.slack_connected && !displayStatus.slack_send_as_user)
      ) {
        return;
      }

      setRedirecting(true);
      dispatch(clearConnectTimedOut());
      dispatch(setConnecting(id));
      setConnectingProvider(id);

      const redirectTimer = window.setTimeout(() => {
        window.location.href =
          id === "gmail"
            ? `${API_URL}/gmail/connect?token=${encodeURIComponent(token)}`
            : id === "slack"
              ? `${API_URL}/slack/install?token=${encodeURIComponent(token)}`
              : `${API_URL}/jira/connect?token=${encodeURIComponent(token)}`;
      }, REDIRECT_DELAY_MS);

      window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.clearTimeout(redirectTimer);
          setRedirecting(false);
          dispatch(setConnecting(null));
          clearConnectingProvider();
          dispatch(setConnectTimedOut(id));
        }
      }, REDIRECT_STUCK_MS);
    },
    [connecting, dispatch, displayStatus, redirecting, token],
  );

  const buildNodes = useCallback((): Node[] => {
    const positions = loadPositions();
    const hubNode: Node = {
      id: "hub",
      type: "hub",
      position: positions.hub,
      data: {
        label: "LetsConnect",
        subtitle: user?.email ?? "Your assistant",
        active: Boolean(connecting),
      },
      draggable: !connecting,
    };

    const integrations: IntegrationId[] = ["gmail", "slack", "jira"];
    const labels: Record<IntegrationId, string> = {
      gmail: "Gmail",
      slack: "Slack",
      jira: "Jira",
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
          connected: meta.connected,
          connectable: meta.connectable,
          connecting: isConnecting,
          warning: isConnecting ? undefined : meta.warning,
          onDisconnect:
            meta.connected && !isConnecting ? () => void disconnectHandlers[id]() : undefined,
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
      edges.push({
        id: dashed ? `hub-${id}-warn` : `hub-${id}`,
        source: "hub",
        target: id,
        animated: !dashed,
        style: {
          stroke: dashed ? "#f59e0b" : INTEGRATION_STYLES[id].edge,
          strokeWidth: dashed ? 2 : 2.5,
          strokeDasharray: dashed ? "6 4" : undefined,
        },
      });
    };

    addEdge("gmail", displayStatus.gmail_connected);
    addEdge("slack", displayStatus.slack_connected && displayStatus.slack_send_as_user);
    addEdge("jira", displayStatus.jira_connected);

    if (displayStatus.slack_connected && !displayStatus.slack_send_as_user) {
      addEdge("slack", true, true);
    }

    if (connecting) {
      edges.push({
        id: `hub-${connecting}-pending`,
        source: "hub",
        target: connecting,
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
      if (integrationId !== "gmail" && integrationId !== "slack" && integrationId !== "jira") {
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
