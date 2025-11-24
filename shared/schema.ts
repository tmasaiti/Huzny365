import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Extended for Replit Auth with RBAC
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("staff"), // "admin" or "staff"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Vehicle Management
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numberPlate: varchar("number_plate").notNull().unique(),
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  color: varchar("color").notNull(),
  type: varchar("type").notNull(), // "Compact", "Sedan", "Mid-SUV", "SUV", "OFF-Road 4x4"
  dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }).notNull(),
  odometer: integer("odometer").notNull(), // Current mileage
  status: varchar("status").notNull().default("available"), // "available", "rented", "maintenance"
  insuranceExpiry: timestamp("insurance_expiry").notNull(),
  licenseExpiry: timestamp("license_expiry").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  status: true,
}).extend({
  dailyRate: z.string().min(1, "Daily rate is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  odometer: z.coerce.number().min(0),
  insuranceExpiry: z.date(),
  licenseExpiry: z.date(),
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Client Management
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  address: text("address"),
  driverLicenseNumber: varchar("driver_license_number").notNull(),
  licenseImagePath: varchar("license_image_path"),
  passportImagePath: varchar("passport_image_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Rental Management
export const rentals = pgTable("rentals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  clientId: varchar("client_id").notNull().references(() => clients.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  startMileage: integer("start_mileage"),
  endMileage: integer("end_mileage"),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("reserved"), // "reserved", "active", "completed", "cancelled"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRentalSchema = createInsertSchema(rentals).omit({
  id: true,
  createdAt: true,
  status: true,
}).extend({
  startDate: z.date(),
  endDate: z.date(),
  totalCost: z.string().min(1, "Total cost is required"),
  startMileage: z.coerce.number().min(0).optional(),
  endMileage: z.coerce.number().min(0).optional(),
});

export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Rental = typeof rentals.$inferSelect;

// Service History
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  serviceDate: timestamp("service_date").notNull(),
  serviceType: varchar("service_type").notNull(), // "Oil Change", "Tire Rotation", etc.
  description: text("description"),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  odometerReading: integer("odometer_reading").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
}).extend({
  serviceDate: z.date(),
  cost: z.string().min(1, "Cost is required"),
  odometerReading: z.coerce.number().min(0),
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
