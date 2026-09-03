export default function SkeletonList({ rows = 4 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton skeleton-block" />
      ))}
    </div>
  )
}
