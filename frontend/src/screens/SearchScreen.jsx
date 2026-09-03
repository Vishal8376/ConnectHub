import { useEffect, useState } from 'react'
import { getInterests } from '../api/interests'
import { searchUsers } from '../api/users'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PersonRow from '../components/PersonRow'
import SkeletonList from '../components/SkeletonList'
import { rememberPeople } from '../utils/peopleCache'

export default function SearchScreen() {
  const [filters, setFilters] = useState({
    name: '',
    college: '',
    profession: '',
    location: '',
    interestId: '',
  })
  const [interests, setInterests] = useState([])
  const [people, setPeople] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getInterests()
      .then((data) => setInterests(data || []))
      .catch(() => {})
  }, [])

  const set = (key) => (event) => setFilters({ ...filters, [key]: event.target.value })

  const runSearch = async (event) => {
    event?.preventDefault()
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const results = await searchUsers({
        name: filters.name,
        college: filters.college,
        profession: filters.profession,
        location: filters.location,
        interestId: filters.interestId ? Number(filters.interestId) : undefined,
      })
      setPeople(results || [])
      rememberPeople(results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page page--narrow">
      <p className="page-kicker">Discover</p>
      <h1 className="page-title">Find people</h1>
      <p className="page-lead">Search by name, school, work, place, or a single interest.</p>
      <form className="search-bar" onSubmit={runSearch}>
        <div className="search-main">
          <input
            value={filters.name}
            onChange={set('name')}
            placeholder="Who are you looking for?"
          />
          <button className="btn">Search</button>
        </div>
        <div className="filter-row">
          <div className="field">
            <label>College</label>
            <input value={filters.college} onChange={set('college')} />
          </div>
          <div className="field">
            <label>Profession</label>
            <input value={filters.profession} onChange={set('profession')} />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={filters.location} onChange={set('location')} />
          </div>
        </div>
        <div className="field">
          <label>Interest</label>
          <select value={filters.interestId} onChange={set('interestId')}>
            <option value="">Any</option>
            {interests.map((interest) => (
              <option key={interest.id} value={interest.id}>
                {interest.name}
              </option>
            ))}
          </select>
        </div>
      </form>
      <ErrorBanner message={error} />
      {loading ? (
        <SkeletonList rows={5} />
      ) : !searched ? (
        <EmptyState title="Start with a name, or just search">
          Leave the fields blank to browse everyone on ConnectHub.
        </EmptyState>
      ) : people.length === 0 ? (
        <EmptyState title="No one matched">
          Try a shorter name, or drop a filter. You can search by one interest at a time.
        </EmptyState>
      ) : (
        people.map((person) => <PersonRow key={person.id} person={person} />)
      )}
    </main>
  )
}
