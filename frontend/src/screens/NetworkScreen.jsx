import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PersonRow from '../components/PersonRow'
import SkeletonList from '../components/SkeletonList'
import { useConnections } from '../context/ConnectionsContext'

export default function NetworkScreen() {
  const { accepted, received, sent, loading, error } = useConnections()

  return (
    <main className="page page--narrow">
      <p className="page-kicker">Your network</p>
      <h1 className="page-title">People you know</h1>
      <p className="page-lead">Incoming requests stay at the top so nothing waits unnoticed.</p>
      <ErrorBanner message={error} />
      {loading ? <SkeletonList rows={4} /> : null}

      <section className="network-alert">
        <h2>Incoming requests</h2>
        {received.length === 0 ? (
          <p className="muted">No one is waiting on you right now.</p>
        ) : (
          received.map((person) => <PersonRow key={person.connectionId} person={person} />)
        )}
      </section>

      <section className="section">
        <h2>Connections</h2>
        {accepted.length === 0 ? (
          <EmptyState title="Your network is just getting started">
            Search for classmates or colleagues, or check People you may want to know.
          </EmptyState>
        ) : (
          accepted.map((person) => <PersonRow key={person.connectionId} person={person} />)
        )}
      </section>

      <section className="section">
        <h2>Sent requests</h2>
        {sent.length === 0 ? (
          <p className="muted">You have not sent any pending requests.</p>
        ) : (
          sent.map((person) => <PersonRow key={person.connectionId} person={person} />)
        )}
      </section>
    </main>
  )
}
