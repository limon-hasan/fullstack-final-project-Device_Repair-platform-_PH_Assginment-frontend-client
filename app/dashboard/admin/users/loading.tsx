import { DashboardListPageSkeleton } from "@/components/shared/loading-skeletons"

export default function Loading() {
  return (
    <DashboardListPageSkeleton tabs={4} rows={4} variant="rows" />
  )
}
