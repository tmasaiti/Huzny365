import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Vehicles from "@/pages/vehicles";
import VehicleWizard from "@/pages/vehicle-wizard";
import VehicleDetail from "@/pages/vehicle-detail";
import Clients from "@/pages/clients";
import ClientWizard from "@/pages/client-wizard";
import ClientDetail from "@/pages/client-detail";
import Rentals from "@/pages/rentals";
import RentalWizard from "@/pages/rental-wizard";
import RentalDetail from "@/pages/rental-detail";
import Staff from "@/pages/staff";
import StaffWizard from "@/pages/staff-wizard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/vehicles" component={Vehicles} />
          <Route path="/vehicles/new" component={VehicleWizard} />
          <Route path="/vehicles/:id" component={VehicleDetail} />
          <Route path="/clients" component={Clients} />
          <Route path="/clients/new" component={ClientWizard} />
          <Route path="/clients/:id" component={ClientDetail} />
          <Route path="/rentals" component={Rentals} />
          <Route path="/rentals/new" component={RentalWizard} />
          <Route path="/rentals/:id" component={RentalDetail} />
          <Route path="/staff" component={Staff} />
          <Route path="/staff/new" component={StaffWizard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isLoading || !isAuthenticated ? (
          <>
            <Router />
            <Toaster />
          </>
        ) : (
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    data-testid="button-logout"
                  >
                    <a href="/api/logout">Log Out</a>
                  </Button>
                </header>
                <main className="flex-1 overflow-y-auto">
                  <Router />
                </main>
              </div>
            </div>
            <Toaster />
          </SidebarProvider>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
