import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Vehicle, Rental, Service } from "@shared/schema";

export default function VehicleDetail() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, params] = useRoute("/vehicles/:id");
  const [, navigate] = useLocation();
  const vehicleId = params?.id;

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

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    enabled: !!vehicleId,
    retry: false,
  });

  const { data: rentals, isLoading: rentalsLoading } = useQuery<Rental[]>({
    queryKey: ["/api/rentals", { vehicleId }],
    enabled: !!vehicleId,
    retry: false,
  });

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services", { vehicleId }],
    enabled: !!vehicleId,
    retry: false,
  });

  if (authLoading || vehicleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!vehicle) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Vehicle not found</p>
          <Button onClick={() => navigate("/vehicles")}>Back to Vehicles</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate("/vehicles")} data-testid="button-back">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Vehicles
        </Button>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold font-mono" data-testid="text-vehicle-plate">{vehicle.numberPlate}</h1>
            <p className="text-muted-foreground">{vehicle.make} {vehicle.model}</p>
          </div>
          <Button asChild data-testid="button-book-vehicle">
            <a href={`/rentals/new?vehicleId=${vehicle.id}`}>Book This Vehicle</a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
          <TabsTrigger value="rental-history" data-testid="tab-rental-history">Rental History</TabsTrigger>
          <TabsTrigger value="service-history" data-testid="tab-service-history">Service History</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Mileage:</span>
                  <span className="font-medium font-mono">{vehicle.odometer.toLocaleString()} miles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <StatusBadge status={vehicle.status} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insurance Expiry:</span>
                  <span className="font-medium">{formatDate(vehicle.insuranceExpiry)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License Expiry:</span>
                  <span className="font-medium">{formatDate(vehicle.licenseExpiry)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rental-history">
          <Card>
            <CardHeader>
              <CardTitle>Rental History</CardTitle>
            </CardHeader>
            <CardContent>
              {rentalsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rental ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentals && rentals.length > 0 ? (
                      rentals.map((rental) => (
                        <TableRow key={rental.id}>
                          <TableCell className="font-mono">{rental.id.substring(0, 8)}</TableCell>
                          <TableCell>{rental.clientId.substring(0, 8)}</TableCell>
                          <TableCell>{formatDate(rental.startDate)}</TableCell>
                          <TableCell>{formatDate(rental.endDate)}</TableCell>
                          <TableCell>{formatCurrency(rental.totalCost)}</TableCell>
                          <TableCell>
                            <StatusBadge status={rental.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No rental history yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service-history">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Odometer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services && services.length > 0 ? (
                      services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>{formatDate(service.serviceDate)}</TableCell>
                          <TableCell>{service.serviceType}</TableCell>
                          <TableCell>{service.description}</TableCell>
                          <TableCell>{formatCurrency(service.cost)}</TableCell>
                          <TableCell className="font-mono">{service.odometerReading.toLocaleString()} miles</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No service history yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
