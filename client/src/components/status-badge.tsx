import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<string, { label: string; className: string }> = {
    available: {
      label: "Available",
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    rented: {
      label: "Rented",
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    active: {
      label: "Active",
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    maintenance: {
      label: "Maintenance",
      className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    reserved: {
      label: "Reserved",
      className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    },
    completed: {
      label: "Completed",
      className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
  };

  const variant = variants[status.toLowerCase()] || variants.available;

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-3 py-1 text-xs font-medium", variant.className, className)}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      {variant.label}
    </Badge>
  );
}
