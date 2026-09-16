import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { createPost } from '../../api/posts';

export default function CreatePostCard({ communities = [], onPostCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default to first community if available when dropdown mounts
  useEffect(() => {
    if (communities.length > 0 && !selectedCommunityId) {
      setSelectedCommunityId(communities[0].id.toString());
    }
  }, [communities, selectedCommunityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (communities.length > 0 && !selectedCommunityId) {
      setError('Please select a community to post into.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const derivedTitle = title.trim() || content.trim().substring(0, 40) + (content.length > 40 ? '...' : '');

      const payload = {
        title: derivedTitle,
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
        communityId: selectedCommunityId ? Number(selectedCommunityId) : (communities[0] ? communities[0].id : 1),
      };

      const newPost = await createPost(payload);
      setTitle('');
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-surface border border-outline-variant/30 rounded-3xl p-5 shadow-xs mb-6">
      {error && (
        <div className="mb-3 p-3 bg-error-container text-on-error-container text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
          <Avatar src={user.profilePicture} name={user.fullName} size="md" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">{user.fullName}</span>
            <span className="text-xs text-on-surface-variant font-medium">
              {user.profession || user.college || 'Community Member'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Headline / Title (optional)"
            className="w-full bg-surface-container-low focus:bg-surface-container-lowest border border-transparent focus:border-primary rounded-xl px-3.5 py-2 text-xs font-bold text-on-surface placeholder:text-on-surface-variant/60 outline-none transition-colors"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an insight, question, or thought with your network..."
            rows={3}
            className="w-full bg-surface-container-low focus:bg-surface-container-lowest border border-transparent focus:border-primary rounded-xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 resize-none transition-colors outline-none leading-relaxed"
          />

          {showImageInput && (
            <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">link</span>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                className="w-full bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant outline-none"
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs text-on-surface-variant hover:text-error"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/20">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                showImageInput || imageUrl
                  ? 'bg-primary/10 text-primary'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              <span>{imageUrl ? 'Photo Included' : 'Add Photo'}</span>
            </button>

            {communities.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-on-surface-variant">Group:</span>
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold px-3 py-1.5 rounded-full outline-none cursor-pointer border border-outline-variant/30"
                >
                  {communities.map((comm) => (
                    <option key={comm.id} value={comm.id}>
                      {comm.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-95"
          >
            <span>{submitting ? 'Publishing...' : 'Publish'}</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
