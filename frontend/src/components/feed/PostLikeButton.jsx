import React, { useState, useEffect } from 'react';
import { likePost, unlikePost } from '../../api/posts';

export default function PostLikeButton({
  postId,
  initialLikeCount = 0,
  initialLikedByCurrentUser = false,
  onPostUpdated,
}) {
  const [liked, setLiked] = useState(Boolean(initialLikedByCurrentUser));
  const [likeCount, setLikeCount] = useState(Number(initialLikeCount) || 0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state if props change
  useEffect(() => {
    setLiked(Boolean(initialLikedByCurrentUser));
    setLikeCount(Number(initialLikeCount) || 0);
  }, [initialLikedByCurrentUser, initialLikeCount]);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent rapid repeated clicks
    if (loading) return;

    setErrorMsg('');
    const prevLiked = liked;
    const prevCount = likeCount;

    // Optimistic UI update
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setLiked(nextLiked);
    setLikeCount(nextCount);
    setLoading(true);

    try {
      let updatedPost;
      if (nextLiked) {
        updatedPost = await likePost(postId);
      } else {
        updatedPost = await unlikePost(postId);
      }

      // Synchronize with backend response
      if (updatedPost) {
        if (typeof updatedPost.likedByCurrentUser === 'boolean') {
          setLiked(updatedPost.likedByCurrentUser);
        }
        if (typeof updatedPost.likeCount === 'number') {
          setLikeCount(updatedPost.likeCount);
        }
        if (onPostUpdated) {
          onPostUpdated(updatedPost);
        }
      }
    } catch (err) {
      // Rollback on failure
      setLiked(prevLiked);
      setLikeCount(prevCount);
      setErrorMsg(err.message || 'Failed to update like status');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start relative">
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
          liked
            ? 'bg-error-container/60 text-error'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
        } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
        title={liked ? 'Unlike Post' : 'Like Post'}
      >
        <span
          className={`material-symbols-outlined text-[18px] transition-transform ${
            liked ? 'font-fill text-error scale-110' : ''
          }`}
        >
          {liked ? 'favorite' : 'favorite_border'}
        </span>
        <span>{likeCount}</span>
      </button>

      {errorMsg && (
        <span className="absolute top-full left-0 mt-1 px-2.5 py-1 bg-error-container text-on-error-container text-[11px] rounded-lg shadow-sm whitespace-nowrap z-10">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
