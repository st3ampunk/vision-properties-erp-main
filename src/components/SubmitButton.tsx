"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button that disables itself while the parent <form> action is pending.
 * Prevents duplicate submissions from double-clicks. Must be rendered inside a
 * <form action={...}> (Server Action or client action).
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = "btn-primary",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel ?? "Saving…" : children}
    </button>
  );
}
