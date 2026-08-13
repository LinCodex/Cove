import React, { useState, useEffect } from 'react';

export default function MasterControlPanel({ onBackToHome }) {
  // Authentication State (Environment Variable Security)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cove_master_admin_auth') === 'true';
  });
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [saveToast, setSaveToast] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New User Form State
  const [newUserId, setNewUserId] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newInitialBal, setNewInitialBal] = useState('10.00');
  const [newFixedFee, setNewFixedFee] = useState('0.0050');
  const [createError, setCreateError] = useState('');

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Handle Master Admin Login (Verifies strictly with ENV variable)
  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const envPass = import.meta.env.VITE_MASTER_ADMIN_PASSWORD;

    // Check against backend endpoint or environment variable
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

    // Direct environment check fallback
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

  // Fetch users from real backend API
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
          if (!selectedUserId && data.users.length > 0) {
            setSelectedUserId(data.users[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Using local store fallback:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      // Real-time polling every 4 seconds to reflect live APK deductions and incoming SMS
      const interval = setInterval(fetchUsers, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0] || {
    id: 'loading',
    storeName: 'Loading...',
    balance: 0,
    activities: [],
    businessProfile: {},
    spamConfig: {},
    blacklist: []
  };

  const triggerToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3500);
  };

  // ─── API Persistence Actions ───

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

      triggerToast(`Account created! User ID: "${payload.id}" can now sign in on APK!`);
      setShowCreateModal(false);
      setNewUserId('');
      setNewUserPass('');
      setNewStoreName('');
      setNewPhone('');
      setSelectedUserId(payload.id);
      fetchUsers();
    } catch (err) {
      setCreateError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBalance = (delta) => {
    const nextBal = Math.max(0, selectedUser.balance + delta);
    const updated = {
      ...selectedUser,
      balance: nextBal,
      status: nextBal <= 0 ? 'Paused (Zero Balance)' : 'Active'
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Balance updated: ${delta >= 0 ? '+' : ''}$${delta.toFixed(2)} (Live APK Synced)`);
  };

  const handleSetZeroBalance = () => {
    const updated = {
      ...selectedUser,
      balance: 0.000,
      status: 'Paused (Zero Balance)'
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Store ${selectedUser.storeName} balance set to $0.000 (Auto-reply instantly paused on APK)`);
  };

  const handleUpdatePricing = (pricingMode, fixedFee, inPrice1M, outPrice1M) => {
    const updated = {
      ...selectedUser,
      pricingMode,
      fixedFeePerMessage: parseFloat(fixedFee) || 0.005,
      customInputPrice1M: parseFloat(inPrice1M) || 0.25,
      customOutputPrice1M: parseFloat(outPrice1M) || 1.50
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast('Custom Pricing Config pushed to client APK!');
  };

  const handleSaveProfile = (profile) => {
    const updated = { ...selectedUser, businessProfile: profile };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast('Store Profile & Rules successfully updated!');
  };

  const handleSaveSpamSchedule = (spamConfig) => {
    const updated = { ...selectedUser, spamConfig };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast('Spam Rules & Schedule successfully updated!');
  };

  const handleAddBlockedNumber = (number) => {
    if (!number.trim()) return;
    const clean = number.trim();
    if ((selectedUser.blacklist || []).includes(clean)) return;
    const updated = { ...selectedUser, blacklist: [...(selectedUser.blacklist || []), clean] };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Added ${clean} to blacklist`);
  };

  const handleRemoveBlockedNumber = (number) => {
    const updated = { ...selectedUser, blacklist: (selectedUser.blacklist || []).filter(n => n !== number) };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Removed ${number} from blacklist`);
  };

  const filteredUsers = users.filter(u => 
    (u.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.phone || '').includes(searchQuery)
  );

  const filteredActivities = (selectedUser.activities || []).filter(a => {
    if (activityFilter === 'sent') return a.status?.startsWith('Sent');
    if (activityFilter === 'blocked') return a.status?.includes('Blocked');
    return true;
  });

  // ─── IF NOT AUTHENTICATED: SHOW MASTER ADMIN PASSWORD LOCK SCREEN ───
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0d12',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '36px 32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            <span style={{ fontSize: '26px' }}>🔒</span>
          </div>

          <h2 style={{ color: '#f8fafc', fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Master Control Security Gate
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 24px 0', lineHeight: '1.4' }}>
            Restricted access. Please enter the Master Admin Password configured in your environment to continue.
          </p>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              placeholder="Enter Master Admin Password..."
              value={authPassword}
              onChange={(e) => { setAuthPassword(e.target.value); setAuthError(''); }}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
              autoFocus
            />

            {authError && (
              <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', textAlign: 'left' }}>
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                background: '#38bdf8',
                color: '#04131f',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              {authLoading ? 'Verifying...' : 'Unlock Master Admin Panel →'}
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
              ← Back to Main Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED DASHBOARD ───
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0d12',
      color: '#f1f5f9',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '24px 32px'
    }}>
      
      {/* Top Admin Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '18px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBackToHome}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← Back to Cove
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Cove Master Admin Control
              </h1>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                LIVE REAL-TIME BACKEND
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
              Real live multi-tenant accounts, live SMS activity, per-user pricing, and instant balance sync.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#38bdf8',
              color: '#04131f',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 18px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
            }}
          >
            + Create New Store User
          </button>

          <button
            onClick={handleAdminLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🔒 Lock & Logout
          </button>
        </div>
      </div>

      {saveToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
          zIndex: 999
        }}>
          ✓ {saveToast}
        </div>
      )}

      {/* Main Grid: Sidebar (Accounts) + Detail Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
        
        {/* Left Sidebar: Client Accounts */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '20px',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Client Store Accounts</h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{users.length} Active</span>
          </div>

          <input
            type="text"
            placeholder="Search stores or numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '9px 12px',
              color: '#f8fafc',
              fontSize: '13px',
              marginBottom: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredUsers.map(user => {
              const isSelected = user.id === selectedUser.id;
              const isZero = (user.balance || 0) <= 0;
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: isSelected ? '#38bdf8' : '#f1f5f9' }}>
                      {user.storeName || user.id}
                    </span>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '14px',
                      color: isZero ? '#ef4444' : '#10b981'
                    }}>
                      ${(user.balance || 0).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                    <span>ID: {user.id}</span>
                    <span style={{ color: isZero ? '#ef4444' : '#94a3b8' }}>{user.status || 'Active'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Workspace: Selected User Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Banner: Store Status, Balance & Quick Top-Up */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.6px' }}>SELECTED STORE TENANT</span>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '2px 0' }}>{selectedUser.storeName || selectedUser.id}</h2>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  User ID: <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8' }}>{selectedUser.id}</code> | Password: <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>{selectedUser.password || '******'}</code>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Account Live Balance</div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: (selectedUser.balance || 0) <= 0 ? '#ef4444' : '#10b981',
                  letterSpacing: '-1px'
                }}>
                  ${(selectedUser.balance || 0).toFixed(3)}
                </div>
                {(selectedUser.balance || 0) <= 0 ? (
                  <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>
                    ⛔ AUTO-REPLY BLOCKED ON CLIENT APK
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                    ✓ Auto-Reply Active (APK Synced)
                  </div>
                )}
              </div>
            </div>

            {/* Quick Balance Actions */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Real Balance Adjust:</span>
                <button onClick={() => handleUpdateBalance(5)} style={btnStyle}>+$5.00</button>
                <button onClick={() => handleUpdateBalance(10)} style={btnStyle}>+$10.00</button>
                <button onClick={() => handleUpdateBalance(25)} style={btnStyle}>+$25.00</button>
                <button onClick={() => handleUpdateBalance(50)} style={btnStyle}>+$50.00</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={handleSetZeroBalance} 
                  style={{
                    ...btnStyle,
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    borderColor: 'rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Set to $0.000 (Pause Client APK)
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Selected User */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '8px'
          }}>
            {[
              { id: 'activity', label: '💬 Live SMS Activity Log' },
              { id: 'pricing', label: '💲 Pricing & Token Rate' },
              { id: 'profile', label: '⚙️ Store Profile & Setup' },
              { id: 'spam_schedule', label: '🛡️ Spam Rules & Schedule' },
              { id: 'blacklist', label: '🚫 Blacklist' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid transparent',
                  color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: ALL SMS ACTIVITY LOG & LIVE THREADS */}
          {activeTab === 'activity' && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                    Live Customer Conversations & AI Auto-Replies
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Live transcript feeds pushed directly from the on-device APK in real-time.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setActivityFilter('all')}
                    style={{ ...filterBtnStyle, background: activityFilter === 'all' ? '#38bdf8' : 'rgba(255,255,255,0.06)', color: activityFilter === 'all' ? '#000' : '#fff' }}
                  >
                    All ({filteredActivities.length})
                  </button>
                  <button 
                    onClick={() => setActivityFilter('sent')}
                    style={{ ...filterBtnStyle, background: activityFilter === 'sent' ? '#38bdf8' : 'rgba(255,255,255,0.06)', color: activityFilter === 'sent' ? '#000' : '#fff' }}
                  >
                    Sent
                  </button>
                  <button 
                    onClick={() => setActivityFilter('blocked')}
                    style={{ ...filterBtnStyle, background: activityFilter === 'blocked' ? '#38bdf8' : 'rgba(255,255,255,0.06)', color: activityFilter === 'blocked' ? '#000' : '#fff' }}
                  >
                    Blocked
                  </button>
                </div>
              </div>

              {filteredActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No activity records logged for this user yet. (Incoming SMS will automatically stream here).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredActivities.map(act => (
                    <div
                      key={act.id}
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px', color: '#f8fafc' }}>{act.sender}</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{act.time}</span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: act.status?.startsWith('Sent') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: act.status?.startsWith('Sent') ? '#10b981' : '#ef4444'
                          }}>
                            {act.status}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Key: <code style={{ color: '#cbd5e1' }}>{act.keyUsed || 'AI Key'}</code></span>
                          <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>Cost: ${(act.cost || 0.005).toFixed(4)}</span>
                        </div>
                      </div>

                      {/* Chat Bubbles */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          borderLeft: '3px solid #94a3b8',
                          fontSize: '13px'
                        }}>
                          <span style={{ color: '#94a3b8', fontWeight: '600', fontSize: '11px', display: 'block', marginBottom: '2px' }}>CUSTOMER SMS</span>
                          {act.incoming}
                        </div>

                        <div style={{
                          background: 'rgba(56, 189, 248, 0.08)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          borderLeft: '3px solid #38bdf8',
                          fontSize: '13px'
                        }}>
                          <span style={{ color: '#38bdf8', fontWeight: '600', fontSize: '11px', display: 'block', marginBottom: '2px' }}>COVE AI AUTO-REPLY</span>
                          {act.reply}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRICING & TOKEN RATE CONFIGURATION */}
          {activeTab === 'pricing' && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 8px 0' }}>
                💲 Client Message Pricing & Token Markup Rate
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
                Set how much this tenant is charged per automated SMS response. Changes sync in real-time to the client APK.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                
                {/* Option 1: Fixed Flat Fee */}
                <div 
                  onClick={() => handleUpdatePricing('fixed_fee', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                  style={{
                    background: selectedUser.pricingMode === 'fixed_fee' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: selectedUser.pricingMode === 'fixed_fee' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px', color: selectedUser.pricingMode === 'fixed_fee' ? '#38bdf8' : '#f8fafc' }}>
                    Fixed Flat Fee Per Message
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                    Deduct a predictable fixed cost on every reply regardless of length.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>$</span>
                    <input
                      type="number"
                      step="0.001"
                      value={selectedUser.fixedFeePerMessage || 0.005}
                      onChange={(e) => handleUpdatePricing('fixed_fee', e.target.value, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                      style={inputNumberStyle}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>/ msg</span>
                  </div>
                </div>

                {/* Option 2: Custom Token Pricing */}
                <div 
                  onClick={() => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                  style={{
                    background: selectedUser.pricingMode === 'token_custom' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: selectedUser.pricingMode === 'token_custom' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px', color: selectedUser.pricingMode === 'token_custom' ? '#38bdf8' : '#f8fafc' }}>
                    Custom Token Rates
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                    Bill based on actual AI token usage with custom markups.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#94a3b8' }}>Input $/1M:</span>
                      <input
                        type="number"
                        step="0.05"
                        value={selectedUser.customInputPrice1M || 0.25}
                        onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, e.target.value, selectedUser.customOutputPrice1M)}
                        style={{ ...inputNumberStyle, width: '80px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#94a3b8' }}>Output $/1M:</span>
                      <input
                        type="number"
                        step="0.10"
                        value={selectedUser.customOutputPrice1M || 1.50}
                        onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, e.target.value)}
                        style={{ ...inputNumberStyle, width: '80px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Option 3: Default AI Supplier Pricing */}
                <div 
                  onClick={() => handleUpdatePricing('default_ai', 0, 0, 0)}
                  style={{
                    background: selectedUser.pricingMode === 'default_ai' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: selectedUser.pricingMode === 'default_ai' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '18px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px', color: selectedUser.pricingMode === 'default_ai' ? '#38bdf8' : '#f8fafc' }}>
                    Default AI Supplier Pricing
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                    Direct pass-through cost from the model provider.
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Gemini 3.1 Flash Lite ($0.25 in / $1.50 out)
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: STORE PROFILE & AI SETUP CONFIGURATION */}
          {activeTab === 'profile' && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 16px 0' }}>
                ⚙️ Store Knowledge Base & AI Setup
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Business Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.businessProfile?.businessName || selectedUser.storeName}
                    onBlur={(e) => handleSaveProfile({ ...selectedUser.businessProfile, businessName: e.target.value })}
                    style={inputTextStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Business Hours, Services & FAQ</label>
                  <textarea
                    rows={4}
                    defaultValue={selectedUser.businessProfile?.businessInfo || ''}
                    onBlur={(e) => handleSaveProfile({ ...selectedUser.businessProfile, businessInfo: e.target.value })}
                    style={{ ...inputTextStyle, resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Reply Tone</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.businessProfile?.replyTone || 'Professional, friendly, and concise'}
                    onBlur={(e) => handleSaveProfile({ ...selectedUser.businessProfile, replyTone: e.target.value })}
                    style={inputTextStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Strict AI Rules & Restrictions</label>
                  <textarea
                    rows={3}
                    defaultValue={selectedUser.businessProfile?.aiRules || ''}
                    onBlur={(e) => handleSaveProfile({ ...selectedUser.businessProfile, aiRules: e.target.value })}
                    style={{ ...inputTextStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SPAM RULES & BUSINESS SCHEDULE */}
          {activeTab === 'spam_schedule' && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 16px 0' }}>
                🛡️ Spam Protection & Auto-Reply Scheduling
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#38bdf8' }}>Rate Limiting</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Cooldown Seconds:</span>
                      <input
                        type="number"
                        defaultValue={selectedUser.spamConfig?.cooldownSeconds || 90}
                        onBlur={(e) => handleSaveSpamSchedule({ ...selectedUser.spamConfig, cooldownSeconds: parseInt(e.target.value) || 90 })}
                        style={{ ...inputNumberStyle, width: '80px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Max Replies in Window:</span>
                      <input
                        type="number"
                        defaultValue={selectedUser.spamConfig?.maxReplies || 3}
                        onBlur={(e) => handleSaveSpamSchedule({ ...selectedUser.spamConfig, maxReplies: parseInt(e.target.value) || 3 })}
                        style={{ ...inputNumberStyle, width: '80px' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#38bdf8' }}>Business Hours Schedule</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Start Time:</span>
                      <input
                        type="text"
                        defaultValue={selectedUser.spamConfig?.scheduleStart || '09:00'}
                        onBlur={(e) => handleSaveSpamSchedule({ ...selectedUser.spamConfig, scheduleStart: e.target.value })}
                        style={{ ...inputNumberStyle, width: '80px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>End Time:</span>
                      <input
                        type="text"
                        defaultValue={selectedUser.spamConfig?.scheduleEnd || '18:00'}
                        onBlur={(e) => handleSaveSpamSchedule({ ...selectedUser.spamConfig, scheduleEnd: e.target.value })}
                        style={{ ...inputNumberStyle, width: '80px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BLACKLIST */}
          {activeTab === 'blacklist' && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 16px 0' }}>
                🚫 Blocked Numbers & Blacklist
              </h3>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  id="newBlockInput"
                  type="text"
                  placeholder="Enter phone number to block..."
                  style={{ ...inputTextStyle, maxWidth: '280px' }}
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('newBlockInput');
                    if (el && el.value) {
                      handleAddBlockedNumber(el.value);
                      el.value = '';
                    }
                  }}
                  style={btnStyle}
                >
                  + Add Block
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(!selectedUser.blacklist || selectedUser.blacklist.length === 0) ? (
                  <div style={{ color: '#64748b', fontSize: '13px' }}>No numbers blocked for this store.</div>
                ) : (
                  selectedUser.blacklist.map(phone => (
                    <div
                      key={phone}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{phone}</span>
                      <button
                        onClick={() => handleRemoveBlockedNumber(phone)}
                        style={{ ...btnStyle, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* CREATE NEW USER MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '28px',
            width: '460px',
            maxWidth: '90vw'
          }}>
            <h2 style={{ fontSize: '19px', fontWeight: '800', margin: '0 0 8px 0' }}>
              ➕ Create New Store Tenant
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Create an official User ID and Password. The store owner can immediately log into the Cove APK using these credentials.
            </p>

            <form onSubmit={handleCreateNewUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>User ID (Required for APK Login)</label>
                <input
                  type="text"
                  placeholder="e.g. store_pizza_99"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  style={inputTextStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Password (Required for APK Login)</label>
                <input
                  type="password"
                  placeholder="e.g. secretPass123"
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  style={inputTextStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Store / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tony's Artisan Pizza"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  style={inputTextStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Initial Balance ($)</label>
                  <input
                    type="number"
                    step="1.00"
                    value={newInitialBal}
                    onChange={(e) => setNewInitialBal(e.target.value)}
                    style={inputTextStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Message Fee ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newFixedFee}
                    onChange={(e) => setNewFixedFee(e.target.value)}
                    style={inputTextStyle}
                  />
                </div>
              </div>

              {createError && (
                <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>
                  ⚠️ {createError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                  style={{ ...btnStyle, background: 'transparent' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#38bdf8',
                    color: '#04131f',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const btnStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#f8fafc',
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer'
};

const filterBtnStyle = {
  border: 'none',
  padding: '5px 12px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer'
};

const inputNumberStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  padding: '6px 10px',
  color: '#f8fafc',
  fontSize: '13px',
  outline: 'none'
};

const inputTextStyle = {
  width: '100%',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#f8fafc',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#94a3b8',
  marginBottom: '6px'
};
