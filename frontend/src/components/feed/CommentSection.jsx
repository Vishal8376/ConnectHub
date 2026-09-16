import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { getCommentsByPost, createComment, deleteComment } from '../../api/comments';

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCommentsByPost(postId);
      setComments(data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const added = await createComment(postId, { content: newComment.trim() });
      setComments((prev) => [...prev, added]);
      setNewComment('');
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-col gap-3">
      {error && <div className="text-xs text-error font-medium">{error}</div>}

      {/* Comment Input */}
      {user && (
        <form onSubmit={handleAddComment} className="flex items-center gap-2">
          <Avatar src={user.profilePicture} name={user.fullName} size="sm" />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-surface-container-low focus:bg-surface-container-lowest border border-transparent focus:border-primary rounded-full px-4 py-2 text-xs text-on-surface outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? '...' : 'Reply'}
          </button>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-xs text-on-surface-variant text-center py-2">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-on-surface-variant text-center py-2">No comments yet. Be the first to join the discourse!</div>
      ) : (
        <div className="flex flex-col gap-2.5 mt-1">
          {comments.map((comment) => {
            const isAuthor = user && (comment.author === user.fullName || comment.author === user.email);
            return (
              <div
                key={comment.id}
                className="flex items-start justify-between bg-surface-container-low/70 rounded-2xl p-3 text-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Avatar name={comment.author || 'User'} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{comment.author || 'Anonymous'}</span>
                      <span className="text-[10px] text-on-surface-variant">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-on-surface mt-1 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                  </div>
                </div>

                {isAuthor && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-on-surface-variant hover:text-error transition-colors p-1"
                    title="Delete comment"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
