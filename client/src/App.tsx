import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Home from "@/pages/home";
import Inbox from "@/pages/inbox";
import Team from "@/pages/team";
import Data from "@/pages/data";
import Analysis from "@/pages/analysis";
import CreateTask from "@/pages/create-task";
import WorkspaceBoard from "@/pages/workspace-board";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminUsers from "@/pages/admin-users";
import AdminWorkspaces from "@/pages/admin-workspaces";
import BrainPage from "@/pages/brain";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/inbox" component={Inbox} />
          <Route path="/team" component={Team} />
          <Route path="/data" component={Data} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/brain" component={BrainPage} />
          <Route path="/create-task" component={CreateTask} />
          <Route path="/workspace/:id" component={WorkspaceBoard} />
          <Route path="/admin/analytics" component={AdminAnalytics} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/workspaces" component={AdminWorkspaces} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
