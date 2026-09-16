import React, { useState } from 'react';
import Modal from '../common/Modal';
import { createCommunity } from '../../api/communities';

export default function CreateCommunityModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [communityImage, setCommunityImage] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const created = await createCommunity({
        name: name.trim(),
        description: description.trim(),
        communityImage: communityImage.trim() || null,
        visibility: visibility,
      });
      setName('');
      setDescription('');
      setCommunityImage('');
      setVisibility('PUBLIC');
      onClose();
      if (onCreated) onCreated(created);
    } catch (err) {
      setError(err.message || 'Failed to create community');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Community">
      {error && (
        <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-on-surface">Community Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Software Architecture Hub"
            className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Visibility *</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary cursor-pointer"
            >
              <option value="PUBLIC">Public Group (Open Join)</option>
              <option value="PRIVATE">Private Group (Restricted)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Image Banner URL</label>
            <input
              type="url"
              value={communityImage}
              onChange={(e) => setCommunityImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-on-surface">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what members will share and discuss in this community..."
            className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 text-sm text-on-surface outline-none focus:border-primary resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs"
          >
            {submitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
