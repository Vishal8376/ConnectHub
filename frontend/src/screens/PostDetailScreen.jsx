import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCommunities } from '../api/communities'
import { getPost } from '../api/posts'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import PostItem from '../components/PostItem'
import SkeletonList from '../components/SkeletonList'

export default function PostDetailScreen() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [communities, setCommunities] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPost(id), getCommunities().catch(() => [])])
      .then(([nextPost, nextCommunities]) => {
        setPost(nextPost)
        setCommunities(nextCommunities || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const lookup = useMemo(() => {
    const map = {}
    communities.forEach((community) => {
      map[community.name] = community.id
    })
    return map
  }, [communities])

  if (loading) {
    return (
      <main className="page page--narrow">
        <SkeletonList rows={3} />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="page page--narrow">
        <ErrorBanner message={error} />
        <EmptyState title="Post not found">It may have been deleted.</EmptyState>
      </main>
    )
  }

  return (
    <main className="page page--narrow">
      <p className="page-kicker">
        <Link to="/">Back to feed</Link>
      </p>
      <PostItem post={post} communityLookup={lookup} onChanged={setPost} />
    </main>
  )
}
