import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import CommentSection from './CommentSection';
import PostLikeButton from './PostLikeButton';
import { deletePost, updatePost } from '../../api/posts';

export default function PostCard({ post, onPostDeleted, onPostUpdated }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [submitting, setSubmitting] = useState(false);

  // Author check: compare post.author with user.fullName or user.email
  const isAuthor = user && (post.author === user.fullName || post.author === user.email);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setSubmitting(true);
    try {
      const updated = await updatePost(post.id, {
        title: editTitle.trim() || editContent.trim().substring(0, 30),
        content: editContent.trim(),
        imageUrl: editImageUrl.trim() || null,
        communityId: post.communityId || 1,
      });
      setIsEditing(false);
      if (onPostUpdated) onPostUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  return (
    <article className="bg-surface border border-outline-variant/30 rounded-3xl p-5 shadow-xs mb-5 transition-all hover:shadow-sm">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={post.author || 'User'} size="md" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-on-surface">
                {post.author || 'Anonymous Member'}
              </span>
              {post.community && (
                <Badge variant="tertiary" className="text-[10px]">
                  {post.community}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="material-symbols-outlined text-[13px]">public</span>
            </div>
          </div>
        </div>

        {/* Options for Author */}
        {isAuthor && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
              title="Edit Post"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
              title="Delete Post"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Editing Mode */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-3 my-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Post Title"
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-1.5 text-xs font-bold text-on-surface outline-none"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full bg-surface-container-low border border-primary rounded-xl p-3 text-sm text-on-surface outline-none"
          />
          <input
            type="url"
            value={editImageUrl}
            onChange={(e) => setEditImageUrl(e.target.value)}
            placeholder="Image URL"
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* Content View */
        <div className="flex flex-col gap-2.5">
          {post.title && (
            <h3 className="font-headline-sm text-base font-bold text-on-surface">
              {post.title}
            </h3>
          )}
          <p className="font-body-md text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Optional Attached Image */}
          {post.imageUrl && (
            <div className="relative rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 max-h-96 my-1">
              <img
                src={post.imageUrl}
                alt="Post attachment"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer Actions Strip */}
      <div className="flex items-center justify-start gap-3 pt-3 mt-3 border-t border-outline-variant/20">
        <PostLikeButton
          postId={post.id}
          initialLikeCount={post.likeCount}
          initialLikedByCurrentUser={post.likedByCurrentUser}
          onPostUpdated={onPostUpdated}
        />

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            showComments
              ? 'bg-primary/10 text-primary'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
          <span>{showComments ? 'Hide Comments' : 'Comments'}</span>
        </button>
      </div>

      {/* Inline Comments Section */}
      {showComments && <CommentSection postId={post.id} />}
    </article>
  );
}
