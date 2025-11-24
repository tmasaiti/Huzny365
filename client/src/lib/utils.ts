import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num);
}

export function calculateDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function getVehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'compact': 'Compact',
    'sedan': 'Sedan',
    'mid-suv': 'Mid-SUV',
    'suv': 'SUV',
    'off-road-4x4': 'OFF-Road 4x4'
  };
  return labels[type] || type;
}
