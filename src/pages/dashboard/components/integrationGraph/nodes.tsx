import { Handle, Position, type NodeProps, type NodeTypes } from "@xyflow/react";
import { Bot, Mail, MessageSquare, Ticket, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { HubNodeData, IntegrationNodeData } from "./types";

const INTEGRATION_STYLES = {
  gmail: {
    ring: "ring-rose-300",
    icon: "bg-rose-100 text-rose-700",
    edge: "#f43f5e",
    pulse: "shadow-[0_0_0_4px_rgba(244,63,94,0.15)]",
  },
  slack: {
    ring: "ring-violet-300",
    icon: "bg-violet-100 text-violet-700",
    edge: "#8b5cf6",
    pulse: "shadow-[0_0_0_4px_rgba(139,92,246,0.15)]",
  },
  jira: {
    ring: "ring-blue-300",
    icon: "bg-blue-100 text-blue-700",
    edge: "#3b82f6",
    pulse: "shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
  },
} as const;

const INTEGRATION_ICONS = {
  gmail: Mail,
  slack: MessageSquare,
  jira: Ticket,
} as const;

function HubNode({ data }: NodeProps) {
  const hub = data as HubNodeData;
  const active = hub.active;

  return (
    <div
      className={cn(
        "relative w-44 rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-lg ring-4 ring-indigo-100 transition-shadow duration-300",
        active && "shadow-[0_0_0_6px_rgba(99,102,241,0.12)]",
      )}
    >
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-indigo-400 !bg-white" />
      <Handle type="target" position={Position.Left} className="!size-2.5 !border-indigo-400 !bg-white" />
      <Handle type="target" position={Position.Right} className="!size-2.5 !border-indigo-400 !bg-white" />
      <Handle type="target" position={Position.Bottom} className="!size-2.5 !border-indigo-400 !bg-white" />
      <Handle type="source" position={Position.Top} className="!size-2.5 !border-indigo-400 !bg-indigo-500" />
      <Handle type="source" position={Position.Left} className="!size-2.5 !border-indigo-400 !bg-indigo-500" />
      <Handle type="source" position={Position.Right} className="!size-2.5 !border-indigo-400 !bg-indigo-500" />
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-indigo-400 !bg-indigo-500" />

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "relative mb-2 flex size-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md",
            active && "animate-pulse",
          )}
        >
          <Bot className="size-7" />
        </div>
        <p className="font-semibold text-indigo-950">{hub.label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hub.subtitle}</p>
      </div>
    </div>
  );
}

function IntegrationNode({ data }: NodeProps) {
  const node = data as IntegrationNodeData;
  const styles = INTEGRATION_STYLES[node.kind];
  const Icon = INTEGRATION_ICONS[node.kind];

  return (
    <div
      className={cn(
        "relative w-40 rounded-2xl border bg-card p-3 shadow-sm transition-all duration-300",
        node.connected && `ring-2 ${styles.ring}`,
        node.connecting && cn("ring-2 ring-indigo-300", styles.pulse),
        !node.connectable && !node.connecting && "opacity-60",
      )}
    >
      <Handle
        type="source"
        position={Position.Top}
        className="!size-2.5 !bg-white"
        isConnectable={!node.connecting}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2.5 !bg-white"
        isConnectable={!node.connecting}
      />

      {node.connected && !node.connecting && node.onDisconnect && (
        <button
          type="button"
          aria-label={`Disconnect ${node.label}`}
          onClick={(e) => {
            e.stopPropagation();
            node.onDisconnect?.();
          }}
          className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <X className="size-3.5" />
        </button>
      )}

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-2 flex size-11 items-center justify-center rounded-xl transition-opacity",
            styles.icon,
            node.connecting && "opacity-80",
          )}
        >
          <Icon className="size-5" />
        </div>
        <p className="text-sm font-semibold">{node.label}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{node.subtitle}</p>
        {node.warning && !node.connecting && (
          <span className="mt-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200/60">
            {node.warning}
          </span>
        )}
      </div>
    </div>
  );
}

export const graphNodeTypes: NodeTypes = {
  hub: HubNode,
  integration: IntegrationNode,
};

export { INTEGRATION_STYLES };
