import type { Metadata } from "next";

import { inviteStaffAction, updateRoleAction } from "@/app/actions/repair";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { SelectField } from "@/components/workspace/form-controls";
import { Feedback, PageHeader, Panel, PanelHeader } from "@/components/workspace/ui";
import { ROLE_LABELS } from "@/lib/repair/format";
import { getDashboardData, getStaffProfiles } from "@/lib/repair/queries";
import { getStaff } from "@/lib/repair/session";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [staff, profiles, dashboard] = await Promise.all([
    getStaff(),
    getStaffProfiles(),
    getDashboardData(),
  ]);
  const canManage = staff?.role !== "user";
  const isOwner = staff?.role === "superadmin";
  const load = new Map(dashboard.teamLoad.map((member) => [member.id, member]));

  return (
    <div>
      <PageHeader
        title="Team"
        description="Who is on the bench, what they own, and who can manage the shop."
      />
      <Feedback notice={params.notice} error={params.error} />

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.4fr_0.6fr]">
        <Panel className="self-start">
          <PanelHeader
            title="Staff"
            detail={`${profiles.length} accounts · ${dashboard.openCount} open jobs`}
          />
          <ul className="pb-2">
            {profiles.map((member) => {
              const memberLoad = load.get(member.id);
              const canEditMember = canManage && (isOwner || member.role !== "superadmin");

              return (
                <li
                  key={member.id}
                  className="grid gap-2 px-3 py-2.5 sm:grid-cols-[1.3fr_0.7fr_0.9fr_auto] sm:items-center sm:gap-3"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-overlay text-[13px] font-semibold text-ink">
                      {initials(member.full_name || member.email)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {member.full_name || member.email}
                        {member.id === staff?.id ? (
                          <span className="ml-1.5 text-[13px] text-ink-secondary">you</span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-ink-secondary">
                        {member.email}
                      </span>
                    </span>
                  </span>

                  <span className="text-[13px] text-ink-secondary">{ROLE_LABELS[member.role]}</span>

                  <span className="text-[13px] text-ink-secondary">
                    <span className="figure text-[13px] text-ink">{memberLoad?.open ?? 0}</span> open ·{" "}
                    <span className="figure text-[13px] text-ink">{memberLoad?.active ?? 0}</span>{" "}
                    in repair
                  </span>

                  <span>
                    {canEditMember ? (
                      <form action={updateRoleAction} className="flex items-center gap-1.5">
                        <input type="hidden" name="profile_id" value={member.id} />
                        <label className="sr-only" htmlFor={`role-${member.id}`}>
                          Role for {member.full_name || member.email}
                        </label>
                        <select
                          id={`role-${member.id}`}
                          name="role"
                          defaultValue={member.role}
                          className="h-7 rounded border border-hairline bg-canvas px-1.5 text-[13px] text-ink outline-none focus:border-accent"
                        >
                          {isOwner ? <option value="superadmin">Owner</option> : null}
                          <option value="admin">Manager</option>
                          <option value="user">Technician</option>
                        </select>
                        <button
                          type="submit"
                          className="h-7 rounded px-2 text-[13px] text-ink-secondary transition-colors hover:bg-overlay hover:text-ink"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <span className="text-[13px] text-ink-secondary">
                        {member.role === "superadmin" ? "Owner-managed" : "Manager-managed"}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-3">
          {canManage ? (
            <Panel className="px-4 py-4">
              <h2 className="text-[14px] font-semibold text-ink">Add staff</h2>
              <p className="mt-1 text-[13px] leading-5 text-ink-secondary">
                Creates a confirmed account. Share the temporary password privately; they can change
                it from “Forgot password”.
              </p>
              <form action={inviteStaffAction} className="mt-3 space-y-2.5">
                <FormField id="full_name" name="full_name" label="Name" placeholder="Rian Sabrido" required />
                <FormField
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="tech@patchwork.test"
                  required
                />
                <FormField
                  id="password"
                  name="password"
                  type="text"
                  label="Temporary password"
                  placeholder="At least 8 characters"
                  required
                />
                <SelectField id="role" name="role" label="Role" defaultValue="user">
                  <option value="user">Technician</option>
                  <option value="admin">Manager</option>
                  {isOwner ? <option value="superadmin">Owner</option> : null}
                </SelectField>
                <SubmitButton pendingText="Creating account...">Create staff account</SubmitButton>
              </form>
            </Panel>
          ) : (
            <Panel className="px-4 py-4">
              <h2 className="text-[14px] font-semibold text-ink">Access</h2>
              <p className="mt-1.5 text-[13px] leading-5 text-ink-secondary">
                Your account is a technician. Ask an owner or manager to change roles or add staff.
              </p>
            </Panel>
          )}

          <Panel className="px-4 py-4">
            <h2 className="text-[14px] font-semibold text-ink">Role model</h2>
            <dl className="mt-2.5 space-y-2 text-[13px] leading-5">
              <div>
                <dt className="text-ink">Owner</dt>
                <dd className="text-ink-secondary">Full access, staff, and owner roles.</dd>
              </div>
              <div>
                <dt className="text-ink">Manager</dt>
                <dd className="text-ink-secondary">Tickets, customers, inventory, invoices, staff roles.</dd>
              </div>
              <div>
                <dt className="text-ink">Technician</dt>
                <dd className="text-ink-secondary">Day-to-day tickets and customer work.</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
