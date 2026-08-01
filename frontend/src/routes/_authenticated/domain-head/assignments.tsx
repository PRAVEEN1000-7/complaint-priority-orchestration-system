import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/domain-head/assignments")({
  component: AssignmentsRedirect,
});

function AssignmentsRedirect() {
  return <Navigate to="/complaints" replace />;
}
