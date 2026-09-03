import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createComment, deleteComment, getComments, updateComment } from '../api/comments'
import { deletePost, updatePost } from '../api/posts'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Avatar from './Avatar'
import { formatTime, relativeTime } from '../utils/format'

export default function PostItem({ post, onChanged, communityLookup = {} }) {
  const { user } = useAuth()
  const { notify } = useToast()
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    title: post.title,
    content: post.content,
    imageUrl: post.imageUrl || '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isAuthor = user && post.author === user.fullName
  const communityId = communityLookup[post.community]

  useEffect(() => {
    setDraft({
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || '',
    })
  }, [post])

  const loadComments = async () => {
    try {
      const data = await getComments(post.id)
      setComments(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleComments = async () => {
    const next = !showComments
    setShowComments(next)
    if (next) await loadComments()
  }

  const submitComment = async (event) => {
    event.preventDefault()
    if (!commentText.trim()) return
    setBusy(true)
    setError('')
    try {
      const created = await createComment(post.id, commentText.trim())
      setComments((prev) => [...prev, created])
      setCommentText('')
      notify('Comment posted')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const savePost = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const updated = await updatePost(post.id, draft)
      notify('Post updated')
      setEditing(false)
      onChanged?.(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removePost = async () => {
    if (!window.confirm('Delete this post?')) return
    setBusy(true)
    try {
      await deletePost(post.id)
      notify('Post deleted')
      onChanged?.({ deleted: true, id: post.id })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const saveComment = async (comment) => {
    const next = window.prompt('Edit comment', comment.content)
    if (next == null || !next.trim()) return
    try {
      const updated = await updateComment(comment.id, next.trim())
      setComments((prev) => prev.map((row) => (row.id === comment.id ? updated : row)))
      notify('Comment updated')
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  const removeComment = async (comment) => {
    try {
      await deleteComment(comment.id)
      setComments((prev) => prev.filter((row) => row.id !== comment.id))
      notify('Comment deleted')
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  return (
    <article className="post feed-card">
      <div className="post-head">
        <Avatar name={post.author} />
        <div>
          <div className="post-author">{post.author}</div>
          <div className="post-meta">
            {post.community ? (
              communityId ? (
                <Link to={`/communities/${communityId}`}>{post.community}</Link>
              ) : (
                post.community
              )
            ) : null}
            <span aria-hidden="true">·</span>
            <time dateTime={post.createdAt}>{relativeTime(post.createdAt)}</time>
          </div>
        </div>
      </div>

      {editing ? (
        <form onSubmit={savePost} className="fields">
          <div className="field">
            <label>Title</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Content</label>
            <textarea
              rows={5}
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Image URL</label>
            <input
              value={draft.imageUrl}
              onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
            />
          </div>
          <div className="action-row">
            <button className="btn" disabled={busy}>
              Save
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="post-title">
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </h2>
          <p className="post-body">{post.content}</p>
          {post.imageUrl ? <img className="post-image" src={post.imageUrl} alt="" /> : null}
        </>
      )}

      {error ? <p className="banner">{error}</p> : null}

      <div className="post-actions">
        <button className="btn btn--quiet btn--small" type="button" onClick={toggleComments}>
          {showComments ? 'Hide conversation' : 'Conversation'}
        </button>
        {isAuthor && !editing ? (
          <>
            <button className="btn btn--quiet btn--small" type="button" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn btn--quiet btn--small" type="button" disabled={busy} onClick={removePost}>
              Delete
            </button>
          </>
        ) : null}
      </div>

      {showComments ? (
        <div className="comments">
          {comments.length === 0 ? (
            <p className="muted">No comments yet. Start the conversation.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <strong>{comment.author}</strong>
                <p>{comment.content}</p>
                <p className="muted">{formatTime(comment.createdAt)}</p>
                {user && comment.author === user.fullName ? (
                  <div className="action-row">
                    <button className="btn btn--quiet btn--small" type="button" onClick={() => saveComment(comment)}>
                      Edit
                    </button>
                    <button className="btn btn--quiet btn--small" type="button" onClick={() => removeComment(comment)}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
          <form onSubmit={submitComment} className="composer-chat">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment"
            />
            <button className="btn" disabled={busy || !commentText.trim()}>
              Reply
            </button>
          </form>
        </div>
      ) : null}
    </article>
  )
}
