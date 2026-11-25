import { DashboardListPageSkeleton } from "@/components/shared/loading-skeletons"

export default function Loading() {
  return (
    <DashboardListPageSkeleton tabs={4} rows={3} variant="rows" />
  )
}
