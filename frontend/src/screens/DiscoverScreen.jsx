import { useEffect, useMemo, useState } from 'react'
import { getCommunities } from '../api/communities'
import { getRecommendations } from '../api/recommendations'
import CommunityCard from '../components/CommunityCard'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PersonRow from '../components/PersonRow'
import SkeletonList from '../components/SkeletonList'
import { useMembership } from '../context/MembershipContext'
import { rememberPeople } from '../utils/peopleCache'

export default function DiscoverScreen() {
  const { sessionMemberIds } = useMembership()
  const [people, setPeople] = useState([])
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [nextPeople, nextCommunities] = await Promise.all([
        getRecommendations(),
        getCommunities(),
      ])
      setPeople(nextPeople || [])
      rememberPeople(nextPeople)
      setCommunities(nextCommunities || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const discoverCommunities = useMemo(
    () => communities.filter((community) => !sessionMemberIds.includes(community.id)),
    [communities, sessionMemberIds],
  )

  return (
    <main className="page">
      <p className="page-kicker">Explore</p>
      <h1 className="page-title">Discover people and places</h1>
      <p className="page-lead">
        People are suggested from real profile overlap. Communities are simply the rest of the platform —
        not a ranked recommendation.
      </p>
      <ErrorBanner message={error} />
      {loading ? <SkeletonList rows={6} /> : null}

      {!loading ? (
        <>
          <section className="section">
            <h2>People you may know</h2>
            {people.length === 0 ? (
              <EmptyState title="No grounded matches yet">
                Add a college, profession, or location to your profile.
              </EmptyState>
            ) : (
              people.map((person) => (
                <PersonRow key={person.userId} person={person} showReasons />
              ))
            )}
          </section>
          <section className="section">
            <h2>Communities to browse</h2>
            {discoverCommunities.length === 0 ? (
              <EmptyState title="Nothing left to discover here">
                You have marked every community as joined this session, or none exist yet.
              </EmptyState>
            ) : (
              <div className="community-list">
                {discoverCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} onUpdated={load} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </main>
  )
}
