import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCommunities } from '../api/communities'
import { getPosts } from '../api/posts'
import { getRecommendations } from '../api/recommendations'
import CommunityCard from '../components/CommunityCard'
import Composer from '../components/Composer'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PersonRow from '../components/PersonRow'
import PostItem from '../components/PostItem'
import SkeletonList from '../components/SkeletonList'
import { useAuth } from '../context/AuthContext'
import { useConnections } from '../context/ConnectionsContext'
import { useMembership } from '../context/MembershipContext'

export default function HomeScreen() {
  const { user } = useAuth()
  const { accepted, received } = useConnections()
  const { sessionMemberCount, sessionMemberIds } = useMembership()
  const [posts, setPosts] = useState([])
  const [communities, setCommunities] = useState([])
  const [people, setPeople] = useState([])
  const [filterCommunityId, setFilterCommunityId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [nextPosts, nextCommunities, nextPeople] = await Promise.all([
        getPosts(),
        getCommunities(),
        getRecommendations().catch(() => []),
      ])
      setPosts(nextPosts || [])
      setCommunities(nextCommunities || [])
      setPeople((nextPeople || []).slice(0, 4))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const lookup = useMemo(() => {
    const map = {}
    communities.forEach((community) => {
      map[community.name] = community.id
    })
    return map
  }, [communities])

  const visiblePosts = useMemo(() => {
    if (!filterCommunityId) return posts
    const name = communities.find((c) => String(c.id) === String(filterCommunityId))?.name
    if (!name) return posts
    return posts.filter((post) => post.community === name)
  }, [posts, filterCommunityId, communities])

  const discoverCommunities = useMemo(
    () =>
      communities
        .filter((community) => !sessionMemberIds.includes(community.id))
        .slice(0, 4),
    [communities, sessionMemberIds],
  )

  const onChanged = (update) => {
    if (update?.deleted) {
      setPosts((prev) => prev.filter((post) => post.id !== update.id))
      return
    }
    if (update?.id) {
      setPosts((prev) => {
        const exists = prev.some((post) => post.id === update.id)
        return exists
          ? prev.map((post) => (post.id === update.id ? update : post))
          : [update, ...prev]
      })
    }
  }

  const firstName = user?.fullName?.split(' ')[0] || 'there'

  return (
    <main className="page">
      <div className="feed-layout">
        <section>
          <p className="page-kicker">Home</p>
          <h1 className="page-title">Good to see you, {firstName}</h1>
          <p className="page-lead">
            A single global feed — not filtered by who you know. Share into a community, then read what
            everyone is posting.
          </p>

          <div className="stat-row">
            <div className="stat">
              <strong>{accepted.length}</strong>
              <span>Connections</span>
            </div>
            {received.length > 0 ? (
              <div className="stat">
                <strong>{received.length}</strong>
                <span>Requests waiting</span>
              </div>
            ) : null}
            {sessionMemberCount > 0 ? (
              <div className="stat">
                <strong>{sessionMemberCount}</strong>
                <span>Joined this session</span>
              </div>
            ) : null}
          </div>
          {sessionMemberCount > 0 ? (
            <p className="note">
              The communities number only counts places you joined or created in this browser tab. The API
              does not return “my communities.”
            </p>
          ) : null}

          <Composer onPosted={onChanged} />

          {communities.length > 0 ? (
            <div className="feed-filters" role="tablist" aria-label="Filter feed by community">
              <button
                type="button"
                className={!filterCommunityId ? 'is-on' : ''}
                onClick={() => setFilterCommunityId('')}
              >
                All posts
              </button>
              {communities.slice(0, 8).map((community) => (
                <button
                  key={community.id}
                  type="button"
                  className={String(filterCommunityId) === String(community.id) ? 'is-on' : ''}
                  onClick={() => setFilterCommunityId(community.id)}
                >
                  {community.name}
                </button>
              ))}
            </div>
          ) : null}

          <ErrorBanner message={error} />
          {loading ? (
            <SkeletonList rows={5} />
          ) : visiblePosts.length === 0 ? (
            <EmptyState title="Nothing in this view yet">
              {filterCommunityId
                ? 'This community has no posts in the global feed yet.'
                : 'There are no posts yet. Choose a community above and share the first one.'}
            </EmptyState>
          ) : (
            visiblePosts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                communityLookup={lookup}
                onChanged={onChanged}
              />
            ))
          )}
        </section>

        <aside className="aside">
          <div className="rail-block">
            <h2>People you may know</h2>
            {people.length === 0 ? (
              <p className="muted">
                Add college, profession, or location on your profile to see grounded suggestions.
              </p>
            ) : (
              people.map((person) => (
                <PersonRow key={person.userId} person={person} showReasons compactActions />
              ))
            )}
            <p style={{ marginTop: 12 }}>
              <Link to="/explore">Explore more</Link>
            </p>
          </div>
          <div className="rail-block">
            <h2>Discover communities</h2>
            <p className="muted" style={{ marginBottom: 12 }}>
              Platform-wide list — not a personalized recommendation.
            </p>
            {discoverCommunities.length === 0 ? (
              <p className="muted">No other communities to browse right now.</p>
            ) : (
              discoverCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} onUpdated={load} />
              ))
            )}
            <p style={{ marginTop: 12 }}>
              <Link to="/communities">All communities</Link>
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
