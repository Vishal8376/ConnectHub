import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCommunities } from '../api/communities'
import CommunityCard from '../components/CommunityCard'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import SkeletonList from '../components/SkeletonList'

export default function CommunitiesScreen() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    getCommunities()
      .then((data) => setCommunities(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <main className="page">
      <p className="page-kicker">Communities</p>
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Places to belong</h1>
          <p className="page-lead">
            This is every community on ConnectHub — the API does not filter to “yours.”
          </p>
        </div>
        <Link className="btn" to="/communities/new">
          Start one
        </Link>
      </div>
      <ErrorBanner message={error} />
      {loading ? (
        <SkeletonList rows={5} />
      ) : communities.length === 0 ? (
        <EmptyState title="No communities yet">
          Create the first one. You will be added as a member automatically.
        </EmptyState>
      ) : (
        <div className="community-list">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} onUpdated={load} />
          ))}
        </div>
      )}
    </main>
  )
}
