import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword, deleteAccount, errorMessage, updateCurrentUser } from '../services/api';
import { Alert, PageHeader } from '../components/common/ui';

const Section = ({ title, children }) => (
  <section className="card p-6">
    <h2 className="font-semibold mb-4">{title}</h2>
    {children}
  </section>
);

const SettingsPage = () => {
  const { user, setUser, logout } = useAuth();

  const [profile, setProfile] = useState({ email: user.email, learning_goals: user.learning_goals || '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwMsg, setPwMsg] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleteError, setDeleteError] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const { data } = await updateCurrentUser(profile);
      setUser(data);
      setProfileMsg({ kind: 'success', text: 'Profile saved.' });
    } catch (err) {
      setProfileMsg({ kind: 'error', text: errorMessage(err) });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '' });
      setPwMsg({ kind: 'success', text: 'Password changed.' });
    } catch (err) {
      setPwMsg({ kind: 'error', text: errorMessage(err) });
    }
  };

  const removeAccount = async () => {
    try {
      await deleteAccount();
      logout();
    } catch (err) {
      setDeleteError(errorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" />

      <Section title="Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" value={user.username} disabled className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="goals">Learning goals</label>
            <textarea id="goals" rows={3} value={profile.learning_goals} maxLength={2000}
              onChange={(e) => setProfile({ ...profile, learning_goals: e.target.value })} className="input"
              placeholder="e.g. Pass my Organic Chemistry midterm on Dec 12" />
            <p className="text-xs text-text-secondary mt-1">Study Chat uses this to tailor its explanations.</p>
          </div>
          {profileMsg && <Alert kind={profileMsg.kind}>{profileMsg.text}</Alert>}
          <button type="submit" disabled={savingProfile} className="btn-primary">{savingProfile ? 'Saving…' : 'Save profile'}</button>
        </form>
      </Section>

      <Section title="Change password">
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="label" htmlFor="current">Current password</label>
            <input id="current" type="password" required autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="next">New password</label>
            <input id="next" type="password" required minLength={6} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="input" />
          </div>
          {pwMsg && <Alert kind={pwMsg.kind}>{pwMsg.text}</Alert>}
          <button type="submit" className="btn-primary">Update password</button>
        </form>
      </Section>

      <Section title="Delete account">
        <p className="text-sm text-text-secondary mb-3">
          Permanently deletes your account, documents and quiz history. Type <strong className="text-text">{user.username}</strong> to confirm.
        </p>
        <div className="flex flex-wrap gap-3">
          <input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className="input max-w-xs" aria-label="Confirm username" />
          <button onClick={removeAccount} disabled={confirmDelete !== user.username} className="btn-danger">Delete account</button>
        </div>
        {deleteError && <div className="mt-3"><Alert>{deleteError}</Alert></div>}
      </Section>
    </div>
  );
};

export default SettingsPage;
