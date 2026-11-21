export const SERVICE_CATEGORIES = [
    "Smartphone",
    "Laptop & PC",
    "AC",
    "Refrigerator",
    "TV",
    "Washing Machine",
    "Electrical",
] as const;

export const SERVICE_MODES = ["Home Visit", "Shop Drop-off"] as const;

export type UserRole = "customer" | "technician" | "admin";

export function getDashboardPath(role?: string | null): string {
    switch (role?.toLowerCase()) {
        case "admin":
            return "/dashboard/admin";
        case "technician":
            return "/dashboard/technician";
        default:
            return "/dashboard/customer";
    }
}

export function formatRoleLabel(role?: string | null): string {
    switch (role?.toLowerCase()) {
        case "admin":
            return "Admin";
        case "technician":
            return "Technician";
        default:
            return "Customer";
    }
}