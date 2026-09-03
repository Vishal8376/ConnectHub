import React, { useState } from 'react';
import { MessageCircle, MoreVertical, Trash2, Edit3, Send, CornerDownRight } from 'lucide-react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit post state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const isAuthor = currentUser && post.author === currentUser.fullName;

  // Format relative timestamp
  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const diff = Math.floor((new Date() - d) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Toggle comment section & fetch comments
  const handleToggleComments = async () => {
    if (!showComments) {
      setShowComments(true);
      setLoadingComments(true);
      try {
        const res = await client.get(`/posts/${post.id}/comments`);
        setComments(res.data || []);
        setCommentsCount(res.data ? res.data.length : 0);
      } catch (err) {
        console.error('Failed to load comments:', err.message);
      } finally {
        setLoadingComments(false);
      }
    } else {
      setShowComments(false);
    }
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await client.post(`/posts/${post.id}/comments`, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setCommentsCount((prev) => (prev !== null ? prev + 1 : 1));
      setNewComment('');
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await client.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsCount((prev) => (prev !== null ? Math.max(0, prev - 1) : 0));
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await client.delete(`/posts/${post.id}`);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  // Update post
  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim() || submittingEdit) return;

    setSubmittingEdit(true);
    try {
      const res = await client.put(`/posts/${post.id}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
        imageUrl: editImageUrl.trim() || null,
      });
      setIsEditingPost(false);
      if (onPostUpdated) onPostUpdated(res.data);
    } catch (err) {
      alert(err.message || 'Failed to update post');
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <article className="bg-surface-elevated border border-hairline rounded-card p-5 md:p-6 transition-all hover:border-hairline/80 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={post.author} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-ink-primary font-semibold text-base">
                {post.author}
              </span>
              {post.community && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-recessed text-clay font-medium">
                  {post.community}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted">{formatTimestamp(post.createdAt)}</p>
          </div>
        </div>

        {/* Post Actions (Author edit/delete) */}
        {isAuthor && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditingPost(!isEditingPost)}
              className="p-1.5 rounded-control text-ink-subtle hover:text-ink-primary hover:bg-surface-recessed transition-colors"
              title="Edit Post"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeletePost}
              className="p-1.5 rounded-control text-ink-subtle hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Mode vs Display Mode */}
      {isEditingPost ? (
        <form onSubmit={handleUpdatePost} className="space-y-3 pt-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary font-semibold border border-hairline focus:outline-none focus:border-clay"
            placeholder="Post Title"
            required
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary font-body-editorial border border-hairline focus:outline-none focus:border-clay"
            placeholder="Post Content"
            required
          />
          <input
            type="url"
            value={editImageUrl}
            onChange={(e) => setEditImageUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-control bg-surface-recessed text-ink-primary text-xs border border-hairline focus:outline-none focus:border-clay"
            placeholder="Image URL (optional)"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingPost(false)}
              className="px-3 py-1.5 rounded-control text-xs font-medium text-ink-muted hover:bg-surface-recessed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingEdit}
              className="px-4 py-1.5 rounded-control text-xs font-semibold bg-clay text-white hover:bg-clay-hover"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {post.title && (
            <h2 className="font-headline-sm text-ink-primary font-bold text-lg leading-snug">
              {post.title}
            </h2>
          )}
          <p className="font-body-editorial text-ink-primary text-lg leading-relaxed whitespace-pre-line">
            {post.content}
          </p>

          {post.imageUrl && (
            <div className="rounded-control overflow-hidden border border-hairline max-h-96 bg-surface-recessed">
              <img
                src={post.imageUrl}
                alt={post.title || 'Post attachment'}
                className="w-full h-full object-cover max-h-96"
                onError={(e) => {
                  e.currentTarget.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer interaction bar (Comments toggle) */}
      <div className="pt-3 border-t border-hairline flex items-center justify-between text-ink-muted text-xs">
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-2 px-3 py-1.5 rounded-control hover:bg-surface-recessed transition-colors text-ink-muted hover:text-ink-primary font-medium"
        >
          <MessageCircle className="w-4 h-4 text-clay" />
          <span>
            {commentsCount !== null
              ? `${commentsCount} ${commentsCount === 1 ? 'Comment' : 'Comments'}`
              : 'Comments'}
          </span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="pt-3 space-y-4 border-t border-hairline/60">
          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a thoughtful comment..."
              className="flex-1 px-3.5 py-2 rounded-control bg-surface-recessed text-ink-primary text-sm placeholder-ink-subtle border border-transparent focus:outline-none focus:bg-canvas focus:border-clay"
            />
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="p-2 rounded-control bg-clay text-white disabled:opacity-40 hover:bg-clay-hover transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-4 text-xs text-ink-muted animate-pulse">
              Loading discussion...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-ink-subtle italic py-2">
              No comments yet. Be the first to share a thought.
            </p>
          ) : (
            <div className="space-y-3 pl-2 border-l-2 border-hairline">
              {comments.map((comment) => {
                const isCommentAuthor =
                  currentUser && comment.author === currentUser.fullName;
                return (
                  <div key={comment.id} className="space-y-1 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-primary">
                          {comment.author}
                        </span>
                        <span className="text-[10px] text-ink-subtle">
                          {formatTimestamp(comment.createdAt)}
                        </span>
                      </div>
                      {isCommentAuthor && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-ink-subtle hover:text-red-600 transition-opacity"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-ink-primary bg-surface-recessed px-3 py-2 rounded-control">
                      {comment.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default PostCard;
