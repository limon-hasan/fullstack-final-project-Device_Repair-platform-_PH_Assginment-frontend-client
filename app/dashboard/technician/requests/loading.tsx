import { DashboardListPageSkeleton } from "@/components/shared/loading-skeletons"

export default function Loading() {
  return (
    <DashboardListPageSkeleton tabs={6} rows={3} variant="cards" />
  )
}
