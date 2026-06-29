import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { PullToRefreshGuard } from "@/components/pull-to-refresh-guard";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Outlet />
      <PullToRefreshGuard />
    </ThemeProvider>
  ),
});
