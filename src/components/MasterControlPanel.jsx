import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  DollarSign, 
  MessageSquare, 
  Clock, 
  Ban, 
  Trash2, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Sparkles,
  Phone,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  User,
  Activity,
  Users,
  Settings,
  Download,
  MoreVertical,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';

export default function MasterControlPanel({ onBackToHome }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cove_master_admin_auth') === 'true';
  });
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation and UI State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'activity', 'spam_schedule', 'pricing', 'blacklist'
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [saveToast, setSaveToast] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [loading, setLoading] = useState(false);

  // New User Form State
  const [newUserId, setNewUserId] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newInitialBal, setNewInitialBal] = useState('10.00');
  const [newFixedFee, setNewFixedFee] = useState('0.0050');
  const [createError, setCreateError] = useState('');

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Draft States for current store
  const [profileDraft, setProfileDraft] = useState({ 
    storeName: '', 
    phone: '', 
    address: '', 
    businessInfo: '', 
    replyTone: '', 
    aiRules: '' 
  });
  const [spamDraft, setSpamDraft] = useState({});
  const [editFlags, setEditFlags] = useState({ profile: false, spam: false });

  useEffect(() => {
    setEditFlags({ profile: false, spam: false });
  }, [selectedUserId]);

  useEffect(() => {
    const u = users.find(usr => usr.id === selectedUserId);
    if (u) {
      setProfileDraft(prev => editFlags.profile ? prev : { 
        storeName: u.storeName || u.id, 
        phone: u.phone || '', 
        address: u.address || '',
        businessInfo: u.businessProfile?.businessInfo || '', 
        replyTone: u.businessProfile?.replyTone || 'Professional, friendly, and concise', 
        aiRules: u.businessProfile?.aiRules || '' 
      });
      setSpamDraft(prev => editFlags.spam ? prev : { 
        spamEnabled: u.spamConfig?.spamEnabled ?? true,
        cooldownEnabled: u.spamConfig?.cooldownEnabled ?? true,
        cooldownSeconds: u.spamConfig?.cooldownSeconds ?? 90,
        maxRepliesEnabled: u.spamConfig?.maxRepliesEnabled ?? true,
        maxReplies: u.spamConfig?.maxReplies ?? 3,
        windowEnabled: u.spamConfig?.windowEnabled ?? true,
        windowMinutes: u.spamConfig?.windowMinutes ?? 10,
        scheduleEnabled: u.spamConfig?.scheduleEnabled ?? false,
        scheduleMode: u.spamConfig?.scheduleMode || 'ONLY_DURING',
        scheduleStart: u.spamConfig?.scheduleStart || '09:00',
        scheduleEnd: u.spamConfig?.scheduleEnd || '18:00',
        scheduleDays: u.spamConfig?.scheduleDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        outOfHoursMsg: u.spamConfig?.outOfHoursMsg || 'Thanks for contacting us! We are currently closed.'
      });
    }
  }, [selectedUserId, users, editFlags]);

  // Handle Master Admin Login
  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const envPass = import.meta.env.VITE_MASTER_ADMIN_PASSWORD || 'Aa7185095888!';

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword.trim() })
      });

      if (res.ok) {
        sessionStorage.setItem('cove_master_admin_auth', 'true');
        setIsAuthenticated(true);
        setAuthPassword('');
        setAuthLoading(false);
        fetchUsers();
        return;
      }
    } catch (err) {
      console.warn('API verify fallback to env:', err);
    }

    if (envPass && authPassword.trim() === envPass.trim()) {
      sessionStorage.setItem('cove_master_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthPassword('');
      fetchUsers();
    } else {
      setAuthError('Incorrect Master Admin Password. Access Denied.');
    }
    setAuthLoading(false);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('cove_master_admin_auth');
    setIsAuthenticated(false);
  };

  // Fetch real users from backend API
  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(prev => {
            const serverMap = new Map(data.users.map(u => [u.id, u]));
            const merged = [...data.users];
            prev.forEach(p => {
              if (!serverMap.has(p.id)) {
                merged.push(p);
              }
            });
            return merged;
          });
          if (data.users.length > 0) {
            setSelectedUserId(prev => (prev && data.users.some(u => u.id === prev)) ? prev : data.users[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      const interval = setInterval(fetchUsers, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const selectedUser = users.find(u => u.id === selectedUserId) || null;

  const triggerToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const syncUserToServer = async (updatedUserData) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_user', data: updatedUserData })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to sync to server:', e);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete store account "${userId}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', data: { id: userId } })
      });
      if (res.ok) {
        triggerToast(`Store "${userId}" deleted`);
        const remaining = users.filter(u => u.id !== userId);
        setUsers(remaining);
        setSelectedUserId(remaining.length > 0 ? remaining[0].id : '');
      }
    } catch (e) {
      console.error('Failed to delete user:', e);
    }
  };

  const handleCreateNewUser = async (e) => {
    e.preventDefault();
    if (!newUserId.trim() || !newUserPass.trim()) {
      setCreateError('User ID and Password are required');
      return;
    }
    setLoading(true);
    setCreateError('');

    try {
      const payload = {
        id: newUserId.trim(),
        password: newUserPass.trim(),
        storeName: newStoreName.trim() || newUserId.trim(),
        phone: newPhone.trim(),
        address: newAddress.trim(),
        balance: parseFloat(newInitialBal) || 10.00,
        fixedFeePerMessage: parseFloat(newFixedFee) || 0.0050,
        pricingMode: 'fixed_fee'
      };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_user', data: payload })
      });

      const resData = await res.json();
      if (!res.ok) {
        setCreateError(resData.error || 'Failed to create user');
        setLoading(false);
        return;
      }

      const createdUser = resData.user || {
        id: payload.id,
        password: payload.password,
        storeName: payload.storeName,
        phone: payload.phone,
        address: payload.address,
        balance: payload.balance,
        status: payload.balance <= 0 ? 'Paused (Zero Balance)' : 'Active',
        fixedFeePerMessage: payload.fixedFeePerMessage,
        pricingMode: 'fixed_fee',
        totalRequests: 0,
        activities: [],
        businessProfile: {
          businessName: payload.storeName,
          businessInfo: '',
          replyTone: 'Professional, friendly, and concise',
          aiRules: ''
        },
        spamConfig: {
          spamEnabled: true,
          cooldownEnabled: true,
          cooldownSeconds: 90,
          maxRepliesEnabled: true,
          maxReplies: 3,
          windowEnabled: true,
          windowMinutes: 10,
          scheduleEnabled: false,
          scheduleMode: 'ONLY_DURING',
          scheduleStart: '09:00',
          scheduleEnd: '18:00',
          scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          outOfHoursMsg: 'Thanks for contacting us! We are currently closed.'
        },
        blacklist: []
      };

      setUsers(prev => [createdUser, ...prev.filter(u => u.id !== createdUser.id)]);
      setSelectedUserId(createdUser.id);

      triggerToast(`Store "${payload.id}" created successfully!`);
      setShowCreateModal(false);
      setNewUserId('');
      setNewUserPass('');
      setNewStoreName('');
      setNewPhone('');
      setNewAddress('');
      fetchUsers();
    } catch (err) {
      setCreateError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = (delta) => {
    if (!selectedUser) return;
    const nextBal = Math.max(0, selectedUser.balance + delta);
    const updated = {
      ...selectedUser,
      balance: nextBal,
      status: nextBal <= 0 ? 'Paused (Zero Balance)' : 'Active'
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Balance: ${delta >= 0 ? '+' : ''}$${delta.toFixed(2)} (Live Synced)`);
  };

  const handleSetZeroBalance = () => {
    if (!selectedUser) return;
    const updated = {
      ...selectedUser,
      balance: 0.000,
      status: 'Paused (Zero Balance)'
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Store balance set to $0.000 (Auto-reply paused)`);
  };

  const handleUpdatePricing = (pricingMode, fixedFee, inPrice1M, outPrice1M) => {
    if (!selectedUser) return;
    const updated = {
      ...selectedUser,
      pricingMode,
      fixedFeePerMessage: parseFloat(fixedFee) || 0.005,
      customInputPrice1M: parseFloat(inPrice1M) || 0.25,
      customOutputPrice1M: parseFloat(outPrice1M) || 1.50
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast('Pricing overrides pushed to client APK!');
  };

  const handleSaveProfile = () => {
    if (!selectedUser) return;
    const updated = { 
      ...selectedUser, 
      storeName: profileDraft.storeName,
      phone: profileDraft.phone,
      address: profileDraft.address,
      businessProfile: {
        businessName: profileDraft.storeName,
        businessInfo: profileDraft.businessInfo,
        replyTone: profileDraft.replyTone,
        aiRules: profileDraft.aiRules
      }
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    setEditFlags(prev => ({ ...prev, profile: false }));
    triggerToast('Store Profile & AI FAQ saved and synced!');
  };

  const handleSaveSpamSchedule = () => {
    if (!selectedUser) return;
    const updated = { ...selectedUser, spamConfig: spamDraft };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    setEditFlags(prev => ({ ...prev, spam: false }));
    triggerToast('Spam & Schedule rules synced!');
  };

  const handleAddBlockedNumber = (number) => {
    if (!selectedUser || !number.trim()) return;
    const clean = number.trim();
    if ((selectedUser.blacklist || []).includes(clean)) return;
    const updated = { ...selectedUser, blacklist: [...(selectedUser.blacklist || []), clean] };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Added ${clean} to manual reply list`);
  };

  const handleRemoveBlockedNumber = (number) => {
    if (!selectedUser) return;
    const updated = { ...selectedUser, blacklist: (selectedUser.blacklist || []).filter(n => n !== number) };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Removed ${number} from manual reply list`);
  };

  const filteredUsers = users.filter(u => 
    (u.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.phone || '').includes(searchQuery)
  );

  // ─── AUTH SCREEN ───
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '24px',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #1d61ff 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 20px rgba(29, 97, 255, 0.2)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>

          <h2 style={{ color: '#0f172a', fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0' }}>
            Cove Master Control
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
            Enter Master Administrator password to manage store accounts and live APK sync.
          </p>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="Admin password..."
              value={authPassword}
              onChange={(e) => { setAuthPassword(e.target.value); setAuthError(''); }}
              style={customInputStyle}
              required
              autoFocus
            />

            {authError && (
              <div style={{
                color: '#dc2626',
                background: '#fef2f2',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{ ...solidPrimaryBtnStyle, width: '100%', padding: '12px 0' }}
            >
              {authLoading ? 'Verifying...' : 'Sign In to Console'}
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              ← Back to Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── MAIN MASTER CONTROL PANEL ───
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>

      {/* Toast Notification */}
      {saveToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ─── SIDEBAR: STORE ACCOUNTS LIST ─── */}
      <aside style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '20px 16px 14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1d61ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="#ffffff" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Cove Control
            </span>
          </div>

          {/* Quick Search Store Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '6px 10px',
            marginBottom: '10px'
          }}>
            <Search size={13} color="#94a3b8" style={{ marginRight: '6px' }} />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                color: '#0f172a',
                width: '100%'
              }}
            />
          </div>

          {/* + New Store Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              width: '100%',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 0',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} />
            <span>+ Create Store Account</span>
          </button>
        </div>

        {/* Store Accounts List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', padding: '6px 8px', textTransform: 'uppercase' }}>
            Store Accounts ({filteredUsers.length})
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{ padding: '24px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              No stores found.
            </div>
          ) : (
            filteredUsers.map(user => {
              const isSelected = selectedUser && user.id === selectedUser.id;
              const isDepleted = (user.balance || 0) <= 0;
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? '#f1f5f9' : 'transparent',
                    border: isSelected ? '1px solid #e2e8f0' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isSelected ? '#0f172a' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {(user.storeName || user.id).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {user.storeName || user.id}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        ID: {user.id}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: isDepleted ? '#dc2626' : '#10b981'
                    }}>
                      ${(user.balance || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: Admin & Back */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onBackToHome}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ArrowLeft size={13} /> Back to Site
          </button>
          <button
            onClick={handleAdminLogout}
            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT: STORE CONTROLS ON EACH PAGE ─── */}
      <main style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        maxWidth: '1200px',
        boxSizing: 'border-box'
      }}>

        {selectedUser ? (
          <div>
            {/* Top Store Header Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {selectedUser.storeName || selectedUser.id}
                  </h1>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: (selectedUser.balance || 0) <= 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: (selectedUser.balance || 0) <= 0 ? '#dc2626' : '#059669',
                    border: `1px solid ${(selectedUser.balance || 0) <= 0 ? '#fca5a5' : '#86efac'}`
                  }}>
                    {(selectedUser.balance || 0) <= 0 ? 'Paused (Zero Balance)' : 'Live Active'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '14px' }}>
                  <span>User ID: <strong>{selectedUser.id}</strong></span>
                  <span>APK Password: <strong>{showPasswordMap[selectedUser.id] ? selectedUser.password : '••••••••'}</strong>
                    <button 
                      onClick={() => setShowPasswordMap(prev => ({ ...prev, [selectedUser.id]: !prev[selectedUser.id] }))}
                      style={{ background: 'none', border: 'none', color: '#1d61ff', cursor: 'pointer', marginLeft: '6px', fontSize: '11px' }}
                    >
                      {showPasswordMap[selectedUser.id] ? 'Hide' : 'Show'}
                    </button>
                  </span>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    fetchUsers();
                    triggerToast('Syncing store with live database...');
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Sync APK</span>
                </button>

                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete Store</span>
                </button>
              </div>
            </div>

            {/* 3 Real Telemetry Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '20px'
            }}>
              {/* Card 1: Balance Controls */}
              <div style={kpiCardStyle}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Account Balance
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: (selectedUser.balance || 0) <= 0 ? '#dc2626' : '#10b981',
                  marginBottom: '10px'
                }}>
                  ${(selectedUser.balance || 0).toFixed(2)}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleUpdateBalance(5.00)} style={pillBtnStyle}>+$5</button>
                  <button onClick={() => handleUpdateBalance(20.00)} style={pillBtnStyle}>+$20</button>
                  <button onClick={() => handleUpdateBalance(-1.00)} style={pillBtnStyle}>-$1</button>
                  <button onClick={handleSetZeroBalance} style={{ ...pillBtnStyle, color: '#dc2626' }}>Set $0</button>
                </div>
              </div>

              {/* Card 2: Total SMS Handled */}
              <div style={kpiCardStyle}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Total SMS Handled
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  {selectedUser.activities?.length || 0}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Model: <strong>Gemini 3.1 Flash Lite</strong>
                </div>
              </div>

              {/* Card 3: Total Cost & Tokens */}
              <div style={kpiCardStyle}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Revenue & Token Usage
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  ${(selectedUser.activities?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0).toFixed(4)}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Total Tokens: {selectedUser.activities?.reduce((sum, a) => sum + (a.tokensIn || 0) + (a.tokensOut || 0), 0) || 0}
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Zero Horizontal Scroll) */}
            <div style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '10px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'profile', label: 'Store Profile & AI FAQ', icon: FileText },
                { id: 'activity', label: 'Live SMS Activity', icon: MessageSquare },
                { id: 'spam_schedule', label: 'Spam & Business Hours', icon: Clock },
                { id: 'pricing', label: 'Pricing & Token Rates', icon: DollarSign },
                { id: 'blacklist', label: 'Manual Reply List', icon: Ban }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: isActive ? '#0f172a' : '#ffffff',
                      color: isActive ? '#ffffff' : '#64748b',
                      border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComp size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ─── TAB 1: STORE PROFILE & AI FAQ ─── */}
            {activeTab === 'profile' && (
              <div style={cardSectionStyle}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
                  Store Profile & AI Instructions
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={formLabelStyle}>Store / Business Name</label>
                    <input
                      type="text"
                      value={profileDraft.storeName || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, storeName: e.target.value }));
                      }}
                      style={customInputStyle}
                    />
                  </div>

                  <div>
                    <label style={formLabelStyle}>Phone Number</label>
                    <input
                      type="text"
                      value={profileDraft.phone || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, phone: e.target.value }));
                      }}
                      placeholder="+1 (555) 000-0000"
                      style={customInputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={formLabelStyle}>Physical Store Address</label>
                  <input
                    type="text"
                    value={profileDraft.address || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, address: e.target.value }));
                    }}
                    placeholder="e.g. 123 Market St, San Francisco, CA"
                    style={customInputStyle}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={formLabelStyle}>Business Details, Services & FAQ Knowledge</label>
                  <textarea
                    rows={4}
                    value={profileDraft.businessInfo || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, businessInfo: e.target.value }));
                    }}
                    placeholder="e.g. Open Mon-Sat 9AM-7PM. Specializing in organic artisan sourdough..."
                    style={{ ...customInputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={formLabelStyle}>AI Reply Tone</label>
                  <input
                    type="text"
                    value={profileDraft.replyTone || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, replyTone: e.target.value }));
                    }}
                    placeholder="Professional, friendly, and concise"
                    style={customInputStyle}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={formLabelStyle}>Strict Rules & Limitations</label>
                  <textarea
                    rows={2}
                    value={profileDraft.aiRules || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, aiRules: e.target.value }));
                    }}
                    placeholder="e.g. Never guarantee same-day delivery without manager approval."
                    style={{ ...customInputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSaveProfile} style={solidPrimaryBtnStyle}>
                    Save Store Profile & Sync to APK
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 2: LIVE SMS ACTIVITY ─── */}
            {activeTab === 'activity' && (
              <div style={cardSectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Live SMS Log ({selectedUser.activities?.length || 0})
                  </h3>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['all', 'sent', 'blocked'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        style={{
                          background: activityFilter === f ? '#0f172a' : '#f8fafc',
                          color: activityFilter === f ? '#ffffff' : '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
                  {(!selectedUser.activities || selectedUser.activities.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px' }}>
                      No SMS activity recorded yet. Incoming customer texts will appear here in real time.
                    </div>
                  ) : (
                    selectedUser.activities
                      .filter(a => {
                        if (activityFilter === 'sent') return a.status?.toLowerCase().includes('sent');
                        if (activityFilter === 'blocked') return a.status?.toLowerCase().includes('block') || a.status?.toLowerCase().includes('pause');
                        return true;
                      })
                      .map((act, i) => (
                        <div key={act.id || i} style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{act.sender}</span>
                            <span style={{ color: '#94a3b8' }}>{act.time}</span>
                          </div>
                          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}>
                            <strong>In:</strong> {act.incoming}
                          </div>
                          {act.reply && (
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: '#1d4ed8' }}>
                              <strong>AI Reply:</strong> {act.reply}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b' }}>
                            <span>In: {act.tokensIn || 0} tokens</span>
                            <span>Out: {act.tokensOut || 0} tokens</span>
                            <span>Cost: ${(act.cost || 0.005).toFixed(4)}</span>
                            <span style={{ marginLeft: 'auto', fontWeight: '700', color: '#10b981' }}>{act.status}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 3: SPAM & BUSINESS HOURS ─── */}
            {activeTab === 'spam_schedule' && (
              <div style={cardSectionStyle}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
                  Spam Protection & Operating Hours
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* Spam Settings */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>Spam Protection Switch</span>
                      <CustomSwitch
                        checked={spamDraft.spamEnabled !== false}
                        onChange={(checked) => {
                          setEditFlags(prev => ({ ...prev, spam: true }));
                          setSpamDraft(prev => ({ ...prev, spamEnabled: checked }));
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Cooldown Seconds:</span>
                        <input
                          type="number"
                          value={spamDraft.cooldownSeconds ?? 90}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, cooldownSeconds: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...customInputStyle, width: '80px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Max Replies in Window:</span>
                        <input
                          type="number"
                          value={spamDraft.maxReplies ?? 3}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, maxReplies: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...customInputStyle, width: '80px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Window (Minutes):</span>
                        <input
                          type="number"
                          value={spamDraft.windowMinutes ?? 10}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, windowMinutes: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...customInputStyle, width: '80px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>Operating Hours Filter</span>
                      <CustomSwitch
                        checked={spamDraft.scheduleEnabled === true}
                        onChange={(checked) => {
                          setEditFlags(prev => ({ ...prev, spam: true }));
                          setSpamDraft(prev => ({ ...prev, scheduleEnabled: checked }));
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Start / End Time:</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="time"
                            value={spamDraft.scheduleStart || '09:00'}
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, scheduleStart: e.target.value }));
                            }}
                            style={{ ...customInputStyle, width: '90px' }}
                          />
                          <input
                            type="time"
                            value={spamDraft.scheduleEnd || '18:00'}
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, scheduleEnd: e.target.value }));
                            }}
                            style={{ ...customInputStyle, width: '90px' }}
                          />
                        </div>
                      </div>

                      <div>
                        <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Active Days:</span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const days = spamDraft.scheduleDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                            const isSelected = days.includes(day);
                            return (
                              <button
                                key={day}
                                onClick={() => {
                                  const newDays = isSelected ? days.filter(d => d !== day) : [...days, day];
                                  setEditFlags(prev => ({ ...prev, spam: true }));
                                  setSpamDraft(prev => ({ ...prev, scheduleDays: newDays }));
                                }}
                                style={{
                                  background: isSelected ? '#0f172a' : '#ffffff',
                                  border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                                  color: isSelected ? '#ffffff' : '#64748b',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSaveSpamSchedule} style={solidPrimaryBtnStyle}>
                    Save Spam & Hours Rules
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 4: PRICING & TOKEN RATES ─── */}
            {activeTab === 'pricing' && (
              <div style={cardSectionStyle}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
                  Store Pricing Mode
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div
                    onClick={() => handleUpdatePricing('fixed_fee', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                    style={{
                      background: selectedUser.pricingMode === 'fixed_fee' ? '#ffffff' : '#f8fafc',
                      border: selectedUser.pricingMode === 'fixed_fee' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>
                      Fixed Flat Fee
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Deduct a fixed dollar rate per auto-reply.
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>$</span>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedUser.fixedFeePerMessage || 0.005}
                        onChange={(e) => handleUpdatePricing('fixed_fee', e.target.value, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                        style={{ ...customInputStyle, width: '90px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>/ msg</span>
                    </div>
                  </div>

                  <div
                    onClick={() => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                    style={{
                      background: selectedUser.pricingMode === 'token_custom' ? '#ffffff' : '#f8fafc',
                      border: selectedUser.pricingMode === 'token_custom' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>
                      Custom Token Rates
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Bill actual prompt and reply token usage.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>In $/1M:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={selectedUser.customInputPrice1M || 0.25}
                          onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, e.target.value, selectedUser.customOutputPrice1M)}
                          style={{ ...customInputStyle, width: '80px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Out $/1M:</span>
                        <input
                          type="number"
                          step="0.10"
                          value={selectedUser.customOutputPrice1M || 1.50}
                          onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, e.target.value)}
                          style={{ ...customInputStyle, width: '80px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleUpdatePricing('default_ai', 0, 0, 0)}
                    style={{
                      background: selectedUser.pricingMode === 'default_ai' ? '#ffffff' : '#f8fafc',
                      border: selectedUser.pricingMode === 'default_ai' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>
                      Direct AI Pass-Through
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Standard supplier token rate.
                    </div>
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                      Gemini 3.1 Flash Lite ($0.25 / $1.50)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 5: MANUAL REPLY LIST ─── */}
            {activeTab === 'blacklist' && (
              <div style={cardSectionStyle}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
                  Manual Reply List (Do Not Auto-Reply)
                </h3>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    id="newBlockInput"
                    type="text"
                    placeholder="Enter phone number (+1...)"
                    style={{ ...customInputStyle, maxWidth: '260px' }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById('newBlockInput');
                      if (el && el.value) {
                        handleAddBlockedNumber(el.value);
                        el.value = '';
                      }
                    }}
                    style={solidPrimaryBtnStyle}
                  >
                    + Add Number
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(!selectedUser.blacklist || selectedUser.blacklist.length === 0) ? (
                    <div style={{ color: '#94a3b8', fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
                      No phone numbers in manual reply list.
                    </div>
                  ) : (
                    selectedUser.blacklist.map(num => (
                      <div key={num} style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{num}</span>
                        <button
                          onClick={() => handleRemoveBlockedNumber(num)}
                          style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            Select a store account from the left sidebar to manage controls and live activity.
          </div>
        )}

      </main>

      {/* ─── CREATE STORE ACCOUNT MODAL ─── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '28px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Create Store Account
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Provision client credentials for instant on-device APK login.
            </p>

            <form onSubmit={handleCreateNewUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={formLabelStyle}>User ID (Required)</label>
                <input
                  type="text"
                  placeholder="e.g. store_downtown_01"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  style={customInputStyle}
                  required
                />
              </div>

              <div>
                <label style={formLabelStyle}>Password (Required)</label>
                <input
                  type="password"
                  placeholder="Password..."
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  style={customInputStyle}
                  required
                />
              </div>

              <div>
                <label style={formLabelStyle}>Store / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Bakery"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  style={customInputStyle}
                />
              </div>

              <div>
                <label style={formLabelStyle}>Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  style={customInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>Initial Balance ($)</label>
                  <input
                    type="number"
                    step="1.00"
                    value={newInitialBal}
                    onChange={(e) => setNewInitialBal(e.target.value)}
                    style={customInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Message Fee ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newFixedFee}
                    onChange={(e) => setNewFixedFee(e.target.value)}
                    style={customInputStyle}
                  />
                </div>
              </div>

              {createError && (
                <div style={{ color: '#dc2626', fontSize: '12px', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px' }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={solidPrimaryBtnStyle}
                >
                  {loading ? 'Creating...' : '+ Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── CUSTOM COMPONENTS & STYLES ───

function CustomSwitch({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '12px',
        background: checked ? '#10b981' : '#e2e8f0',
        padding: '2px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.2s ease',
        boxSizing: 'border-box'
      }}
    >
      <div style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        transform: checked ? 'translateX(16px)' : 'translateX(0px)',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }} />
    </div>
  );
}

const cardSectionStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  boxSizing: 'border-box'
};

const kpiCardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const customInputStyle = {
  width: '100%',
  background: '#ffffff',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  padding: '9px 12px',
  fontSize: '13px',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box'
};

const formLabelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#475569',
  marginBottom: '5px'
};

const solidPrimaryBtnStyle = {
  background: '#0f172a',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 18px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)'
};

const pillBtnStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  color: '#0f172a',
  padding: '4px 10px',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: '700',
  cursor: 'pointer'
};
