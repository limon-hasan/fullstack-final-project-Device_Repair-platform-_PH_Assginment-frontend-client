import { DashboardPageSkeleton } from "@/components/shared/loading-skeletons"

export default function Loading() {
  return <DashboardPageSkeleton stats={4} rows={4} charts />
}
