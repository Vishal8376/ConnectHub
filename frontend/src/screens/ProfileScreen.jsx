import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { searchUsers } from '../api/users'
import Avatar from '../components/Avatar'
import ConnectionActions from '../components/ConnectionActions'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import SkeletonList from '../components/SkeletonList'
import { useAuth } from '../context/AuthContext'
import { matchReasons } from '../utils/format'
import { getCachedPerson, rememberPeople } from '../utils/peopleCache'

export default function ProfileScreen() {
  const { userId } = useParams()
  const { user, logout } = useAuth()
  const isSelf = !userId || Number(userId) === user?.id
  const [person, setPerson] = useState(isSelf ? user : getCachedPerson(userId))
  const [loading, setLoading] = useState(!isSelf && !person)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isSelf) {
      setPerson(user)
      setLoading(false)
      return
    }

    const cached = getCachedPerson(userId)
    if (cached?.bio || cached?.college) {
      setPerson(cached)
      setLoading(false)
    }

    let cancelled = false
    setLoading(true)
    searchUsers()
      .then((people) => {
        rememberPeople(people)
        const found = (people || []).find((row) => row.id === Number(userId))
        if (!cancelled) {
          setPerson(found || cached || null)
          if (!found) setError('We could not find this person.')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isSelf, user, userId])

  if (loading) {
    return (
      <main className="page page--narrow">
        <SkeletonList rows={3} />
      </main>
    )
  }

  if (!person) {
    return (
      <main className="page page--narrow">
        <ErrorBanner message={error} />
        <EmptyState title="Person not found">
          There is no public profile endpoint for a single user. We looked through search results and still
          could not find them.
        </EmptyState>
      </main>
    )
  }

  const reasons = isSelf ? [] : matchReasons(user, person)

  return (
    <main className="page page--narrow">
      <ErrorBanner message={error} />
      <section className="profile-hero">
        <Avatar src={person.profilePicture} name={person.fullName} size="lg" />
        <div>
          <p className="page-kicker">{isSelf ? 'Your profile' : 'Profile'}</p>
          <h1 className="page-title">{person.fullName}</h1>
          {person.bio ? <p className="profile-bio">{person.bio}</p> : (
            <p className="profile-bio muted">No bio yet.</p>
          )}
          <div className="meta-line">
            {person.profession ? <span>{person.profession}</span> : null}
            {person.college ? <span>{person.college}</span> : null}
            {person.location ? <span>{person.location}</span> : null}
            {isSelf && person.email ? <span>{person.email}</span> : null}
          </div>
          {reasons.map((reason) => (
            <p key={reason} className="reason">
              {reason}
            </p>
          ))}
          {isSelf ? (
            <div className="action-row">
              <Link className="btn" to="/me/edit">
                Edit profile
              </Link>
              <button className="btn btn--ghost" type="button" onClick={logout}>
                Sign out
              </button>
            </div>
          ) : (
            <ConnectionActions userId={person.id ?? person.userId} />
          )}
        </div>
      </section>
      {isSelf ? (
        <p className="note">
          Interests can be saved from Edit profile. The profile API does not return them afterward, so they
          will not appear as a list here.
        </p>
      ) : null}
    </main>
  )
}
