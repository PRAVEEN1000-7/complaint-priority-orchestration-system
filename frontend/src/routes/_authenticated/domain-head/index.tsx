import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/domain-head/")({
  component: DomainHeadRedirect,
});

function DomainHeadRedirect() {
  return <Navigate to="/dashboard" replace />;
}
