import React, { useState, useEffect } from 'react';
import { X, Image, Building2 } from 'lucide-react';
import client from '../../api/client';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, preselectedCommunityId = null }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [communityId, setCommunityId] = useState(preselectedCommunityId || '');
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchCommunities = async () => {
        setLoadingCommunities(true);
        try {
          const res = await client.get('/communities');
          setCommunities(res.data || []);
          if (!communityId && res.data && res.data.length > 0) {
            setCommunityId(preselectedCommunityId || res.data[0].id);
          }
        } catch (err) {
          console.error('Failed to load communities:', err);
        } finally {
          setLoadingCommunities(false);
        }
      };
      fetchCommunities();
    }
  }, [isOpen, preselectedCommunityId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !communityId) {
      setError('Please fill in title, content, and select a community');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await client.post('/posts', {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
        communityId: Number(communityId),
      });

      setTitle('');
      setContent('');
      setImageUrl('');
      if (onPostCreated) onPostCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-surface-elevated border border-hairline rounded-card w-full max-w-lg shadow-modal space-y-5 p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <h2 className="font-headline-sm font-bold text-ink-primary">Share a thought</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-control text-ink-muted hover:bg-surface-recessed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-control bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Community Picker */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-clay" />
              Community (Required)
            </label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary text-sm font-medium border border-hairline focus:outline-none focus:border-clay"
              required
            >
              {loadingCommunities ? (
                <option value="">Loading communities...</option>
              ) : communities.length === 0 ? (
                <option value="">No communities found — please create one first</option>
              ) : (
                communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.visibility})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Headline / Title"
              className="w-full px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary text-base font-semibold placeholder-ink-subtle border border-hairline focus:outline-none focus:border-clay"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What is on your mind today? Write in clear editorial voice..."
              rows={5}
              className="w-full px-3.5 py-2.5 rounded-control bg-surface-recessed text-ink-primary font-body-editorial text-base placeholder-ink-subtle border border-hairline focus:outline-none focus:border-clay leading-relaxed"
              required
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-control bg-surface-recessed border border-hairline focus-within:border-clay">
              <Image className="w-4 h-4 text-ink-subtle shrink-0" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (optional)"
                className="w-full bg-transparent text-ink-primary text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-control text-sm font-medium text-ink-muted hover:bg-surface-recessed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || communities.length === 0}
              className="px-5 py-2 rounded-control bg-clay text-white font-semibold text-sm hover:bg-clay-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
