import {
  users,
  vehicles,
  clients,
  rentals,
  services,
  type User,
  type UpsertUser,
  type Vehicle,
  type InsertVehicle,
  type Client,
  type InsertClient,
  type Rental,
  type InsertRental,
  type Service,
  type InsertService,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllStaff(): Promise<User[]>;
  createStaff(staff: { email: string; firstName: string; lastName: string; role: string }): Promise<User>;
  deleteUser(id: string): Promise<void>;

  getAllVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  updateVehicleStatus(id: string, status: string): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<void>;

  getAllClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<void>;

  getAllRentals(): Promise<Rental[]>;
  getRental(id: string): Promise<Rental | undefined>;
  getRentalsByVehicle(vehicleId: string): Promise<Rental[]>;
  getRentalsByClient(clientId: string): Promise<Rental[]>;
  checkOverlappingRentals(vehicleId: string, startDate: Date, endDate: Date): Promise<Rental[]>;
  createRental(rental: InsertRental): Promise<Rental>;
  updateRental(id: string, updates: { status?: string; endMileage?: number }): Promise<Rental | undefined>;

  getAllServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  getServicesByVehicle(vehicleId: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllStaff(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createStaff(staff: { email: string; firstName: string; lastName: string; role: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
      })
      .returning();
    return user;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(vehicleData).returning();
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async updateVehicleStatus(id: string, status: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set({ status })
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(clientData).returning();
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async getAllRentals(): Promise<Rental[]> {
    return await db.select().from(rentals);
  }

  async getRental(id: string): Promise<Rental | undefined> {
    const [rental] = await db.select().from(rentals).where(eq(rentals.id, id));
    return rental;
  }

  async getRentalsByVehicle(vehicleId: string): Promise<Rental[]> {
    return await db.select().from(rentals).where(eq(rentals.vehicleId, vehicleId));
  }

  async getRentalsByClient(clientId: string): Promise<Rental[]> {
    return await db.select().from(rentals).where(eq(rentals.clientId, clientId));
  }

  async checkOverlappingRentals(vehicleId: string, startDate: Date, endDate: Date): Promise<Rental[]> {
    const allRentals = await db
      .select()
      .from(rentals)
      .where(eq(rentals.vehicleId, vehicleId));

    return allRentals.filter(rental => {
      if (rental.status === 'cancelled' || rental.status === 'completed') {
        return false;
      }

      const rentalStart = new Date(rental.startDate);
      const rentalEnd = new Date(rental.endDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      return (newStart < rentalEnd && newEnd > rentalStart);
    });
  }

  async createRental(rentalData: InsertRental): Promise<Rental> {
    const [rental] = await db.insert(rentals).values(rentalData).returning();
    await this.updateVehicleStatus(rentalData.vehicleId, "rented");
    return rental;
  }

  async updateRental(id: string, updates: { status?: string; endMileage?: number }): Promise<Rental | undefined> {
    const [rental] = await db
      .update(rentals)
      .set(updates)
      .where(eq(rentals.id, id))
      .returning();
    return rental;
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServicesByVehicle(vehicleId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.vehicleId, vehicleId));
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(serviceData).returning();
    return service;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();
