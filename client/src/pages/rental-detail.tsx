import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatCurrency, calculateDays } from "@/lib/utils";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Rental, Vehicle, Client } from "@shared/schema";

export default function RentalDetail() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, params] = useRoute("/rentals/:id");
  const [, navigate] = useLocation();
  const rentalId = params?.id;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: rental, isLoading: rentalLoading } = useQuery<Rental>({
    queryKey: ["/api/rentals", rentalId],
    enabled: !!rentalId,
    retry: false,
  });

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", rental?.vehicleId],
    enabled: !!rental?.vehicleId,
    retry: false,
  });

  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: ["/api/clients", rental?.clientId],
    enabled: !!rental?.clientId,
    retry: false,
  });

  if (authLoading || rentalLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!rental) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Rental not found</p>
          <Button onClick={() => navigate("/rentals")}>Back to Rentals</Button>
        </div>
      </div>
    );
  }

  const days = calculateDays(rental.startDate, rental.endDate);

  return (
    <div className="p-6 space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate("/rentals")} data-testid="button-back">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Rentals
        </Button>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold font-mono" data-testid="text-rental-id">Rental {rental.id.substring(0, 8)}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={rental.status} />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
          <TabsTrigger value="vehicle" data-testid="tab-vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="client" data-testid="tab-client">Client</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rental Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental ID:</span>
                  <span className="font-mono font-medium">{rental.id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">{formatDate(rental.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">{formatDate(rental.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost:</span>
                  <span className="font-medium text-lg">{formatCurrency(rental.totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={rental.status} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mileage Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {rental.startMileage !== null && rental.startMileage !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Mileage:</span>
                    <span className="font-mono font-medium">{rental.startMileage.toLocaleString()} miles</span>
                  </div>
                )}
                {rental.endMileage !== null && rental.endMileage !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Mileage:</span>
                    <span className="font-mono font-medium">{rental.endMileage.toLocaleString()} miles</span>
                  </div>
                )}
                {!rental.startMileage && !rental.endMileage && (
                  <p className="text-muted-foreground">Mileage information not recorded yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicle">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicleLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : vehicle ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number Plate:</span>
                    <span className="font-mono font-medium">{vehicle.numberPlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Make / Model:</span>
                    <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year:</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{vehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate:</span>
                    <span className="font-medium">{formatCurrency(vehicle.dailyRate)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Vehicle information not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              {clientLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : client ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-medium">{client.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{client.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{client.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver's License:</span>
                    <span className="font-mono font-medium">{client.driverLicenseNumber}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Client information not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
