import Link from "next/link";
import { requireCapability } from "@/lib/auth";
import { LAND_TYPES, APPROVAL_TYPES, PROJECT_TYPES } from "@/lib/options";
import { PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import PolicyFields from "../PolicyFields";
import { createProject } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireCapability("manage_projects");

  return (
    <>
      <PageHeader
        title="New Project"
        subtitle="Set up a new development and configure its booking rules."
        action={<Link href="/projects" className="btn-ghost">Cancel</Link>}
      />

      <form action={createProject} className="max-w-3xl space-y-6">
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold">Project Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">1. Project Name *</label>
              <input name="name" className="input" required />
            </div>
            <div>
              <label className="label">2. District *</label>
              <input name="district" className="input" required />
            </div>
            <div>
              <label className="label">3. City *</label>
              <input name="city" className="input" required />
            </div>
            <div>
              <label className="label">5. Area *</label>
              <input name="area" className="input" placeholder="e.g. 12 acres" required />
            </div>
            <div>
              <label className="label">6. Land Type *</label>
              <select name="land_type" className="select" required defaultValue="">
                <option value="" disabled>Select land type</option>
                {LAND_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">7. Approval Type *</label>
              <select name="approval_type" className="select" required defaultValue="">
                <option value="" disabled>Select approval</option>
                {APPROVAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">8. Project Type *</label>
              <select name="project_type" className="select" required defaultValue="">
                <option value="" disabled>Select type</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">4. Remarks</label>
              <textarea name="remarks" className="textarea" rows={2} />
            </div>
          </div>
        </div>

        <PolicyFields />
        <input type="hidden" name="status" value="active" />

        <div className="flex justify-end gap-3">
          <Link href="/projects" className="btn-ghost">Cancel</Link>
          <SubmitButton pendingLabel="Creating…">Create Project</SubmitButton>
        </div>
      </form>
    </>
  );
}
