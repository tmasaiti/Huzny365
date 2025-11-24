import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Rental } from "@shared/schema";

export default function Rentals() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const { data: rentals, isLoading } = useQuery<Rental[]>({
    queryKey: ["/api/rentals"],
    retry: false,
  });

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

  const filteredRentals = rentals?.filter(rental => {
    const matchesStatus = statusFilter === "all" || rental.status === statusFilter;
    return matchesStatus;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Rentals</h1>
        <Button asChild data-testid="button-create-rental">
          <Link href="/rentals/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Rental
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-60" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rental ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRentals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    {rentals?.length === 0 ? (
                      <div>
                        <p className="mb-4">No rentals yet</p>
                        <Button asChild variant="outline" data-testid="button-create-first-rental">
                          <Link href="/rentals/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Rental
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      "No rentals match your filter"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRentals.map((rental) => (
                  <TableRow key={rental.id} className="hover-elevate" data-testid={`row-rental-${rental.id}`}>
                    <TableCell className="font-mono">{rental.id.substring(0, 8)}</TableCell>
                    <TableCell className="font-mono">{rental.vehicleId.substring(0, 8)}</TableCell>
                    <TableCell>{rental.clientId.substring(0, 8)}</TableCell>
                    <TableCell>{formatDate(rental.startDate)}</TableCell>
                    <TableCell>{formatDate(rental.endDate)}</TableCell>
                    <TableCell>{formatCurrency(rental.totalCost)}</TableCell>
                    <TableCell>
                      <StatusBadge status={rental.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" data-testid={`button-view-${rental.id}`}>
                        <Link href={`/rentals/${rental.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
