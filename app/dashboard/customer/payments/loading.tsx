import {
  PageHeaderSkeleton,
  StatCardsSkeleton,
  TableCardSkeleton,
} from "@/components/shared/loading-skeletons"

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={3} columns="sm:grid-cols-3" />
      <TableCardSkeleton rows={5} />
    </div>
  )
}
