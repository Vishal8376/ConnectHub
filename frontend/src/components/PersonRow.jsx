import { Link } from 'react-router-dom'
import { matchReasons } from '../utils/format'
import { rememberPerson } from '../utils/peopleCache'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import ConnectionActions from './ConnectionActions'

export default function PersonRow({ person, showReasons = false, compactActions = true }) {
  const { user } = useAuth()
  const id = person.id ?? person.userId
  rememberPerson(person)
  const reasons = showReasons ? matchReasons(user, person) : []

  return (
    <article className="person">
      <Link to={`/people/${id}`}>
        <Avatar src={person.profilePicture} name={person.fullName} />
      </Link>
      <div className="person-body">
        <Link to={`/people/${id}`} className="person-name">
          {person.fullName}
        </Link>
        {person.profession || person.college || person.location ? (
          <p className="person-meta">
            {[person.profession, person.college, person.location].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        {person.bio ? <p className="muted">{person.bio}</p> : null}
        {reasons.map((reason) => (
          <p key={reason} className="reason">
            {reason}
          </p>
        ))}
        <ConnectionActions userId={id} compact={compactActions} />
      </div>
    </article>
  )
}
