/**
 * App.tsx — Root application component
 * Defines all routes and wraps app in providers
 */
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import AppShell from "@/components/app-shell";

// Pages
import Home     from "@/pages/home";
import Predict  from "@/pages/predict";
import Compare  from "@/pages/compare";
import About    from "@/pages/about";
import Info     from "@/pages/info";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppShell>
          <Router hook={useHashLocation}>
            <Switch>
              <Route path="/"        component={Home}     />
              <Route path="/predict" component={Predict}  />
              <Route path="/compare" component={Compare}  />
              <Route path="/about"   component={About}    />
              <Route path="/info"    component={Info}     />
              <Route                 component={NotFound} />
            </Switch>
          </Router>
        </AppShell>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
