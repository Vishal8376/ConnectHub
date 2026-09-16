import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  getAllInterests,
  createAdminInterest,
  updateAdminInterest,
  deleteAdminInterest,
} from '../api/interests';

export default function AdminInterestsPage() {
  const { isAdmin } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingInterest, setEditingInterest] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInterests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllInterests();
      setInterests(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load interests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  const handleOpenCreate = () => {
    setEditingInterest(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (int) => {
    setEditingInterest(int);
    setName(int.name);
    setDescription(int.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interest tag?')) return;
    try {
      await deleteAdminInterest(id);
      fetchInterests();
    } catch (err) {
      alert(err.message || 'Failed to delete interest');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingInterest) {
        await updateAdminInterest(editingInterest.id, { name: name.trim(), description: description.trim() });
      } else {
        await createAdminInterest({ name: name.trim(), description: description.trim() });
      }
      setShowModal(false);
      fetchInterests();
    } catch (err) {
      alert(err.message || 'Failed to save interest tag');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-8 text-center bg-error-container/30 text-on-error-container rounded-2xl">
          <h2 className="font-headline-sm text-lg font-bold">Access Denied</h2>
          <p className="text-xs mt-1">You must be logged in as an Administrator to manage platform interest tags.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30">
          <div>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface">Admin Interest Management</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Create, update, or remove system-wide interest tags used for recommendation matching.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:bg-primary transition-all active:scale-95 shadow-sm self-start"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Interest Tag</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading interest tags..." />
        ) : error ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20 text-xs font-bold text-on-surface-variant">
                  <th className="p-4">ID</th>
                  <th className="p-4">Interest Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs">
                {interests.map((int) => (
                  <tr key={int.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="p-4 font-mono text-on-surface-variant">{int.id}</td>
                    <td className="p-4 font-bold text-on-surface">{int.name}</td>
                    <td className="p-4 text-on-surface-variant max-w-md truncate">{int.description || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(int)}
                          className="px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(int.id)}
                          className="px-3 py-1 rounded-full bg-error-container/40 text-on-error-container hover:bg-error-container font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingInterest ? 'Edit Interest Tag' : 'Create New Interest Tag'}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Tag Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface outline-none focus:border-primary-container"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-on-surface">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this interest area..."
                className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-xs text-on-surface outline-none focus:border-primary-container resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="px-5 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:bg-primary disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? 'Saving...' : editingInterest ? 'Update Tag' : 'Create Tag'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
