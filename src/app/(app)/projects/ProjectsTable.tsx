"use client";

import Link from "next/link";
import DataTable, { type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui";
import { APPROVAL_TYPES, PROJECT_TYPES } from "@/lib/options";
import DeleteProjectButton from "./[id]/DeleteProjectButton";

export interface ProjectRow {
  id: string;
  name: string;
  city: string;
  district: string;
  area: string;
  approval_type: string;
  project_type: string;
  status: string;
  plots: number;
  advance_percent: number;
}

const approvalLabel = (v: string) => APPROVAL_TYPES.find((a) => a.value === v)?.label ?? v;
const typeLabel = (v: string) => PROJECT_TYPES.find((a) => a.value === v)?.label ?? v;

const STATUS_TONE: Record<string, "green" | "gray" | "amber" | "red"> = {
  active: "green",
  draft: "gray",
  on_hold: "amber",
  closed: "red",
};

export default function ProjectsTable({
  rows,
  editable = false,
}: {
  rows: ProjectRow[];
  editable?: boolean;
}) {
  const columns: Column<ProjectRow>[] = [
    {
      id: "name",
      header: "Project",
      sort: (r) => r.name.toLowerCase(),
      cell: (r) => (
        <div>
          <div className="font-medium text-[var(--text)]">{r.name}</div>
          <div className="text-xs text-[var(--muted)]">{r.district}</div>
        </div>
      ),
    },
    {
      id: "location",
      header: "Location",
      sort: (r) => r.city.toLowerCase(),
      hideBelow: "sm",
      cell: (r) => (
        <div>
          <div>{r.city}</div>
          <div className="text-xs text-[var(--muted)]">{r.district} · {r.area}</div>
        </div>
      ),
    },
    {
      id: "approval",
      header: "Approval",
      hideBelow: "md",
      cell: (r) => <Badge tone="blue">{approvalLabel(r.approval_type)}</Badge>,
    },
    {
      id: "type",
      header: "Type",
      hideBelow: "lg",
      cell: (r) => <Badge tone="purple">{typeLabel(r.project_type)}</Badge>,
    },
    {
      id: "plots",
      header: "Available",
      align: "right",
      sort: (r) => r.plots,
      cell: (r) => <span className="tabular-nums font-medium">{r.plots}</span>,
    },
    {
      id: "advance",
      header: "Advance",
      align: "right",
      hideBelow: "lg",
      sort: (r) => r.advance_percent,
      cell: (r) => <span className="tabular-nums text-[var(--muted)]">{r.advance_percent}%</span>,
    },
    {
      id: "status",
      header: "Status",
      sort: (r) => r.status,
      cell: (r) => <Badge tone={STATUS_TONE[r.status] ?? "gray"}>{r.status.replace("_", " ")}</Badge>,
    },
    {
      id: "action",
      header: "",
      align: "right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/projects/${r.id}`}
            onClick={(e) => e.stopPropagation()}
            className="btn-ghost"
            style={{ padding: "5px 12px", fontSize: 12 }}
          >
            Open
          </Link>
          {editable && <DeleteProjectButton id={r.id} name={r.name} compact />}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowHref={(r) => `/projects/${r.id}`}
      search={(r) => `${r.name} ${r.city} ${r.district} ${r.area}`}
      searchPlaceholder="Search projects, city, district…"
      filters={[
        {
          id: "status",
          label: "Status",
          options: [
            { value: "active", label: "Active" },
            { value: "draft", label: "Draft" },
            { value: "on_hold", label: "On Hold" },
            { value: "closed", label: "Closed" },
          ],
          match: (r, v) => r.status === v,
        },
        {
          id: "approval",
          label: "Approval",
          options: APPROVAL_TYPES.map((a) => ({ value: a.value, label: a.label })),
          match: (r, v) => r.approval_type === v,
        },
        {
          id: "type",
          label: "Type",
          options: PROJECT_TYPES.map((a) => ({ value: a.value, label: a.label })),
          match: (r, v) => r.project_type === v,
        },
      ]}
      emptyMessage="No projects found."
      emptyHint="Create your first project to start adding plots."
    />
  );
}
