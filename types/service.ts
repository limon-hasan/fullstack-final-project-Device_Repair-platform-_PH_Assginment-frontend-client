export interface RepairService {
    _id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    basePrice: number;
    estimatedDuration: string;
    serviceMode: "Home Visit" | "Shop Drop-off" | string;
    serviceArea: string;
    technicianName: string;
    technicianEmail: string;
    approvalStatus: "pending" | "approved" | "rejected";
    isAvailable: boolean;
    createdAt: string;
}