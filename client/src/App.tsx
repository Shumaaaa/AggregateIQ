/**
 * App.tsx — Root application component
 * Routes:
 *   /          → Splash (video intro page, no nav shell)
 *   /home      → Home (with nav shell)
 *   /predict   → Predict
 *   /compare   → Compare
 *   /info      → Raw Information
 *   /about     → redirects to /home (About is now a panel, not a page)
 */
import { Switch, Route, Router, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import AppShell from "@/components/app-shell";

// Pages
import Splash   from "@/pages/splash";
import Home     from "@/pages/home";
import Predict  from "@/pages/predict";
import Compare  from "@/pages/compare";
import Info     from "@/pages/info";
import NotFound from "@/pages/not-found";

/** Pages wrapped in AppShell (nav + footer) */
function ShellRoutes() {
  return (
    <AppShell>
      <Switch>
        <Route path="/home"    component={Home}    />
        <Route path="/predict" component={Predict} />
        <Route path="/compare" component={Compare} />
        <Route path="/info"    component={Info}    />
        {/* About is now a panel — redirect anyone hitting /about to /home */}
        <Route path="/about">
          <Redirect to="/home" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router hook={useHashLocation}>
          <Switch>
            {/* Splash — no nav shell, full screen */}
            <Route path="/" component={Splash} />
            {/* All other pages — wrapped in AppShell */}
            <Route component={ShellRoutes} />
          </Switch>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
