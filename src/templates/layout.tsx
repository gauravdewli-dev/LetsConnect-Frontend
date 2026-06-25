import type { ReactNode } from "react";

interface LayoutProps {
  component: ReactNode;
}

export default function Layout({ component }: LayoutProps) {
  return <>{component}</>;
}
