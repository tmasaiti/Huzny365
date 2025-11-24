import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertVehicleSchema,
  insertClientSchema,
  insertRentalSchema,
  insertServiceSchema,
} from "@shared/schema";

const isAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied - Admin only" });
    }

    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Authorization check failed" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/vehicles", isAuthenticated, async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", isAuthenticated, async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      res.status(400).json({ message: error.message || "Failed to create vehicle" });
    }
  });

  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error: any) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: error.message || "Failed to create client" });
    }
  });

  app.get("/api/rentals", isAuthenticated, async (req, res) => {
    try {
      const { vehicleId, clientId } = req.query;

      if (vehicleId && typeof vehicleId === 'string') {
        const rentals = await storage.getRentalsByVehicle(vehicleId);
        return res.json(rentals);
      }

      if (clientId && typeof clientId === 'string') {
        const rentals = await storage.getRentalsByClient(clientId);
        return res.json(rentals);
      }

      const rentals = await storage.getAllRentals();
      res.json(rentals);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      res.status(500).json({ message: "Failed to fetch rentals" });
    }
  });

  app.get("/api/rentals/:id", isAuthenticated, async (req, res) => {
    try {
      const rental = await storage.getRental(req.params.id);
      if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
      }
      res.json(rental);
    } catch (error) {
      console.error("Error fetching rental:", error);
      res.status(500).json({ message: "Failed to fetch rental" });
    }
  });

  app.post("/api/rentals", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRentalSchema.parse(req.body);

      const vehicle = await storage.getVehicle(validatedData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      if (vehicle.status !== 'available') {
        return res.status(400).json({ message: "Vehicle is not available" });
      }

      const overlappingRentals = await storage.checkOverlappingRentals(
        validatedData.vehicleId,
        validatedData.startDate,
        validatedData.endDate
      );

      if (overlappingRentals.length > 0) {
        return res.status(400).json({ message: "Vehicle has overlapping rental bookings" });
      }

      const rental = await storage.createRental(validatedData);
      res.status(201).json(rental);
    } catch (error: any) {
      console.error("Error creating rental:", error);
      res.status(400).json({ message: error.message || "Failed to create rental" });
    }
  });

  app.get("/api/services", isAuthenticated, async (req, res) => {
    try {
      const { vehicleId } = req.query;

      if (vehicleId && typeof vehicleId === 'string') {
        const services = await storage.getServicesByVehicle(vehicleId);
        return res.json(services);
      }

      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/services", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      
      const vehicle = await storage.getVehicle(validatedData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error: any) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: error.message || "Failed to create service" });
    }
  });

  app.get("/api/staff", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email, firstName, lastName, role } = req.body;

      if (!email || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (role !== 'admin' && role !== 'staff') {
        return res.status(400).json({ message: "Invalid role - must be admin or staff" });
      }

      const staffId = `staff-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const staff = await storage.upsertUser({
        id: staffId,
        email,
        firstName,
        lastName,
        role,
      });
      res.status(201).json(staff);
    } catch (error: any) {
      console.error("Error creating staff:", error);
      res.status(400).json({ message: error.message || "Failed to create staff" });
    }
  });

  app.patch("/api/staff/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { role } = req.body;

      if (role && role !== 'admin' && role !== 'staff') {
        return res.status(400).json({ message: "Invalid role - must be admin or staff" });
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      const updated = await storage.upsertUser({
        ...user,
        ...req.body,
      });
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating staff:", error);
      res.status(500).json({ message: "Failed to update staff" });
    }
  });

  app.delete("/api/staff/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (userId === req.params.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      res.status(500).json({ message: "Failed to delete staff" });
    }
  });

  app.patch("/api/vehicles/:id", isAuthenticated, async (req, res) => {
    try {
      const validStatuses = ['available', 'rented', 'maintenance', 'retired'];
      
      if (req.body.status && !validStatuses.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid vehicle status" });
      }

      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      res.json(vehicle);
    } catch (error: any) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  app.patch("/api/rentals/:id", isAuthenticated, async (req, res) => {
    try {
      const { status, endMileage } = req.body;
      const validStatuses = ['active', 'completed', 'cancelled'];
      
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid rental status - must be active, completed, or cancelled" });
      }

      const rental = await storage.updateRental(req.params.id, { status, endMileage });
      if (!rental) {
        return res.status(404).json({ message: "Rental not found" });
      }

      if (status === 'completed' || status === 'cancelled') {
        await storage.updateVehicleStatus(rental.vehicleId, 'available');
      }

      res.json(rental);
    } catch (error: any) {
      console.error("Error updating rental:", error);
      res.status(500).json({ message: "Failed to update rental" });
    }
  });

  app.patch("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.patch("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      const validTypes = ['maintenance', 'repair', 'inspection', 'cleaning'];
      
      if (req.body.type && !validTypes.includes(req.body.type)) {
        return res.status(400).json({ message: "Invalid service type" });
      }

      const service = await storage.updateService(req.params.id, req.body);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
