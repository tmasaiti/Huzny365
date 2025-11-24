import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { cn, formatCurrency, calculateDays } from "@/lib/utils";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { insertRentalSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { InsertRental, Vehicle, Client } from "@shared/schema";

const steps = [
  { number: 1, title: "Vehicle & Dates" },
  { number: 2, title: "Select Client" },
  { number: 3, title: "Review & Confirm" },
];

export default function RentalWizard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatedCost, setCalculatedCost] = useState<string>("0");
  const queryClient = useQueryClient();

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

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    retry: false,
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const form = useForm<InsertRental>({
    resolver: zodResolver(insertRentalSchema),
    defaultValues: {
      vehicleId: "",
      clientId: "",
      startDate: new Date(),
      endDate: new Date(),
      totalCost: "0",
      startMileage: 0,
      endMileage: 0,
    },
  });

  const selectedVehicleId = form.watch("vehicleId");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  useEffect(() => {
    if (selectedVehicleId && startDate && endDate) {
      const vehicle = vehicles?.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        const days = calculateDays(startDate, endDate);
        const dailyRate = typeof vehicle.dailyRate === 'string' ? parseFloat(vehicle.dailyRate) : vehicle.dailyRate;
        const total = (days * dailyRate).toFixed(2);
        setCalculatedCost(total);
        form.setValue("totalCost", total);
      }
    }
  }, [selectedVehicleId, startDate, endDate, vehicles, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertRental) => {
      await apiRequest("POST", "/api/rentals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Success",
        description: "Rental created successfully",
      });
      navigate("/rentals");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create rental",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertRental) => {
    createMutation.mutate(data);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof InsertRental)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["vehicleId", "startDate", "endDate"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["clientId"];
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const availableVehicles = vehicles?.filter(v => v.status === 'available') || [];
  const selectedVehicle = vehicles?.find(v => v.id === selectedVehicleId);
  const selectedClient = clients?.find(c => c.id === form.getValues("clientId"));
  const days = calculateDays(form.getValues("startDate"), form.getValues("endDate"));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate("/rentals")} data-testid="button-back">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Rentals
        </Button>
        <h1 className="text-3xl font-bold mt-4">Create New Rental</h1>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold",
                  currentStep === step.number
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep > step.number
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
                data-testid={`step-indicator-${step.number}`}
              >
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span className="text-xs mt-2 font-medium">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn("w-24 h-0.5 mx-4 mt-[-24px]", currentStep > step.number ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Vehicle & Dates</CardTitle>
                <CardDescription>Choose an available vehicle and rental period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle">
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableVehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.numberPlate} - {vehicle.make} {vehicle.model} ({formatCurrency(vehicle.dailyRate)}/day)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-start-date"
                              >
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-end-date"
                              >
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < startDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedVehicle && days > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Daily Rate:</span>
                          <span className="font-medium">{formatCurrency(selectedVehicle.dailyRate)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                          <span>Total Cost:</span>
                          <span className="text-primary">{formatCurrency(calculatedCost)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Client</CardTitle>
                <CardDescription>Choose the client for this rental</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.fullName} - {client.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Confirm</CardTitle>
                <CardDescription>Please review all details before confirming</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Vehicle Details</h3>
                  {selectedVehicle && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Number Plate:</span>{" "}
                        <span className="font-mono font-medium">{selectedVehicle.numberPlate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Make/Model:</span>{" "}
                        <span className="font-medium">{selectedVehicle.make} {selectedVehicle.model}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Rental Period</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>{" "}
                      <span className="font-medium">{format(form.getValues("startDate"), "PPP")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>{" "}
                      <span className="font-medium">{format(form.getValues("endDate"), "PPP")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>{" "}
                      <span className="font-medium">{days} days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Client Information</h3>
                  {selectedClient && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        <span className="font-medium">{selectedClient.fullName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium">{selectedClient.email}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Cost</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(calculatedCost)}</span>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} data-testid="button-previous">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep} className="ml-auto" data-testid="button-next">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={createMutation.isPending} className="ml-auto" data-testid="button-submit">
                {createMutation.isPending ? "Creating..." : "Confirm Rental"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
