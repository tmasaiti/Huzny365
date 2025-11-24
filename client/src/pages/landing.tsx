import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, FileText, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Car Rental Management</h1>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Log In</a>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Professional Car Rental Management Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your fleet operations, manage clients, and track rentals all in one powerful system
          </p>
          <Button size="lg" asChild data-testid="button-get-started">
            <a href="/api/login">Get Started</a>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Car className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Vehicle Management</CardTitle>
              <CardDescription>
                Track your entire fleet with detailed records and maintenance history
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                Manage customer information and documents securely
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Rental Tracking</CardTitle>
              <CardDescription>
                Handle bookings, contracts, and returns efficiently
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Business Insights</CardTitle>
              <CardDescription>
                Dashboard with key metrics and upcoming rentals
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Car Rental Management System - Professional Fleet Operations
        </div>
      </footer>
    </div>
  );
}
