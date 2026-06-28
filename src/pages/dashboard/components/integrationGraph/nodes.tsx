import { Handle, Position, type NodeProps, type NodeTypes } from "@xyflow/react";
import { X } from "lucide-react";

import { LOGO_SRC } from "@/atoms/Logo";
import { cn } from "@/lib/utils";

import { GmailIcon, JiraIcon, SlackIcon } from "./brandIcons";
import type { HubNodeData, HubSide, IntegrationNodeData } from "./types";
import {
  hubSourceHandle,
  hubTargetHandle,
  integrationSourceHandle,
  integrationTargetHandle,
} from "./types";

const INTEGRATION_STYLES = {
  gmail: {
    ring: "ring-rose-300",
    edge: "#f43f5e",
    pulse: "shadow-[0_0_0_4px_rgba(244,63,94,0.15)]",
  },
  slack: {
    ring: "ring-violet-300",
    edge: "#8b5cf6",
    pulse: "shadow-[0_0_0_4px_rgba(139,92,246,0.15)]",
  },
  jira: {
    ring: "ring-blue-300",
    edge: "#3b82f6",
    pulse: "shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
  },
} as const;

const INTEGRATION_ICONS = {
  gmail: GmailIcon,
  slack: SlackIcon,
  jira: JiraIcon,
} as const;

const SIDES: { side: HubSide; position: Position }[] = [
  { side: "top", position: Position.Top },
  { side: "right", position: Position.Right },
  { side: "bottom", position: Position.Bottom },
  { side: "left", position: Position.Left },
];

function HubNode({ data }: NodeProps) {
  const hub = data as HubNodeData;
  const active = hub.active;

  return (
    <div
      className={cn(
        "relative w-52 rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-lg ring-4 ring-indigo-100 transition-shadow duration-300",
        active && "shadow-[0_0_0_6px_rgba(99,102,241,0.12)]",
      )}
    >
      {SIDES.map(({ side, position }) => (
        <Handle
          key={hubTargetHandle(side)}
          id={hubTargetHandle(side)}
          type="target"
          position={position}
          className="!size-3 !border-2 !border-indigo-400 !bg-white"
        />
      ))}
      {SIDES.map(({ side, position }) => (
        <Handle
          key={hubSourceHandle(side)}
          id={hubSourceHandle(side)}
          type="source"
          position={position}
          className="!size-3 !border-2 !border-indigo-500 !bg-indigo-500"
        />
      ))}

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "relative mb-2 flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-2 ring-indigo-200",
            active && "animate-pulse",
          )}
        >
          <img src={LOGO_SRC} alt="" className="size-full object-cover" />
        </div>
        <p className="font-semibold text-indigo-950">{hub.label}</p>
        {hub.username ? (
          <>
            <p className="mt-1 text-sm font-medium text-indigo-900">{hub.username}</p>
            <p className="mt-0.5 w-full break-all px-1 text-xs leading-relaxed text-muted-foreground">
              {hub.subtitle}
            </p>
          </>
        ) : (
          <p className="mt-1 w-full break-all px-1 text-xs leading-relaxed text-muted-foreground">
            {hub.subtitle}
          </p>
        )}
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
        "relative w-52 rounded-2xl border bg-card px-4 py-3 shadow-sm transition-all duration-300",
        node.connected && `ring-2 ${styles.ring}`,
        node.connecting && cn("ring-2 ring-indigo-300", styles.pulse),
        !node.connectable && !node.connecting && "opacity-60",
      )}
    >
      {SIDES.map(({ side, position }) => (
        <Handle
          key={integrationTargetHandle(side)}
          id={integrationTargetHandle(side)}
          type="target"
          position={position}
          className="!size-3 !border-2 !border-slate-300 !bg-white"
          isConnectable={!node.connecting}
        />
      ))}
      {SIDES.map(({ side, position }) => (
        <Handle
          key={integrationSourceHandle(side)}
          id={integrationSourceHandle(side)}
          type="source"
          position={position}
          className="!size-3 !border-2 !border-slate-400 !bg-slate-100"
          isConnectable={!node.connecting}
        />
      ))}

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
            "mb-2 flex size-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 transition-opacity",
            node.connecting && "opacity-80",
          )}
        >
          <Icon />
        </div>
        <p className="text-sm font-semibold">{node.label}</p>
        {node.username ? (
          <>
            <p className="mt-1 text-sm font-medium text-foreground">{node.username}</p>
            {node.detail && (
              <p className="mt-0.5 w-full break-all px-0.5 text-xs leading-relaxed text-muted-foreground">
                {node.detail}
              </p>
            )}
          </>
        ) : (
          <p className="mt-1 w-full break-all px-0.5 text-xs leading-relaxed text-muted-foreground">
            {node.subtitle}
          </p>
        )}
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
