import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Lock, 
  Search, 
  DollarSign, 
  MessageSquare, 
  Sliders, 
  Clock, 
  Ban, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Radio
} from 'lucide-react';

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
  const [showPasswordMap, setShowPasswordMap] = useState({});
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

  // Draft States for editing
  const [storeInfoDraft, setStoreInfoDraft] = useState({ storeName: '', phone: '', address: '' });
  const [profileDraft, setProfileDraft] = useState({ businessName: '', businessInfo: '', replyTone: '', aiRules: '' });
  const [spamDraft, setSpamDraft] = useState({});
  const [editFlags, setEditFlags] = useState({ storeInfo: false, profile: false, spam: false });

  useEffect(() => {
    setEditFlags({ storeInfo: false, profile: false, spam: false });
  }, [selectedUserId]);

  useEffect(() => {
    const u = users.find(usr => usr.id === selectedUserId);
    if (u) {
      setStoreInfoDraft(prev => editFlags.storeInfo ? prev : { 
        storeName: u.storeName || u.id, 
        phone: u.phone || '', 
        address: u.address || '' 
      });
      setProfileDraft(prev => editFlags.profile ? prev : { 
        businessName: u.businessProfile?.businessName || u.storeName || '', 
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

    const envPass = import.meta.env.VITE_MASTER_ADMIN_PASSWORD;

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
            // Keep any locally created user that might still be in-flight
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
      // Real-time polling every 3 seconds for live APK synchronization
      const interval = setInterval(fetchUsers, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const selectedUser = users.find(u => u.id === selectedUserId) || null;

  const triggerToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
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
        triggerToast(`Store account "${userId}" deleted`);
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

      // Immediately insert into active UI list with 0 latency
      setUsers(prev => {
        const without = prev.filter(u => u.id !== createdUser.id);
        return [createdUser, ...without];
      });
      setSelectedUserId(createdUser.id);

      triggerToast(`Store account "${payload.id}" created successfully!`);
      setShowCreateModal(false);
      setNewUserId('');
      setNewUserPass('');
      setNewStoreName('');
      setNewPhone('');
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
    triggerToast(`Balance updated: ${delta >= 0 ? '+' : ''}$${delta.toFixed(2)} (Live Synced)`);
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
    triggerToast(`Store balance set to $0.000 (Auto-reply paused on APK)`);
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
    const updated = { ...selectedUser, businessProfile: profileDraft };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    setEditFlags(prev => ({ ...prev, profile: false }));
    triggerToast('Store Profile saved and synced!');
  };

  const handleSaveStoreInfo = () => {
    if (!selectedUser) return;
    const updated = { ...selectedUser, ...storeInfoDraft };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    setEditFlags(prev => ({ ...prev, storeInfo: false }));
    triggerToast(`Store info updated`);
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
    triggerToast(`Blocked number ${clean}`);
  };

  const handleRemoveBlockedNumber = (number) => {
    if (!selectedUser) return;
    const updated = { ...selectedUser, blacklist: (selectedUser.blacklist || []).filter(n => n !== number) };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Unblocked number ${number}`);
  };

  const filteredUsers = users.filter(u => 
    (u.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.phone || '').includes(searchQuery)
  );

  const filteredActivities = ((selectedUser && selectedUser.activities) || []).filter(a => {
    if (activityFilter === 'sent') return a.status?.startsWith('Sent');
    if (activityFilter === 'blocked') return a.status?.includes('Blocked');
    return true;
  });

  // ─── SECURITY GATE (LOGIN SCREEN) ───
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#07090e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: '#0d111a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: 'clamp(24px, 5vw, 36px)',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#1d61ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <h2 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '700', margin: 0 }}>
                Cove Master Control
              </h2>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Administrative Access</span>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.4' }}>
            Enter Master Admin Password to manage accounts and live APK sync.
          </p>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="Master Admin Password..."
              value={authPassword}
              onChange={(e) => { setAuthPassword(e.target.value); setAuthError(''); }}
              style={{
                width: '100%',
                background: '#05070b',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '11px 14px',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
              autoFocus
            />

            {authError && (
              <div style={{ color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                background: '#1d61ff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '11px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                marginTop: '4px'
              }}
            >
              {authLoading ? 'Verifying...' : 'Unlock Control Panel'}
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              ← Back to Main Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── REFINED CLEAN DASHBOARD ───
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#07090e',
      color: '#f1f5f9',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 'clamp(14px, 2.5vw, 24px)',
      boxSizing: 'border-box'
    }}>
      
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '16px',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBackToHome}
            style={secondaryBtnStyle}
          >
            <ArrowLeft size={13} style={{ marginRight: '5px' }} />
            Back to Cove
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: '#ffffff' }}>
              Master Control
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Live Server
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={primaryBtnStyle}
          >
            <Plus size={14} style={{ marginRight: '4px' }} />
            Create Store Account
          </button>

          <button
            onClick={handleAdminLogout}
            style={{
              ...secondaryBtnStyle,
              color: '#94a3b8'
            }}
          >
            <Lock size={13} style={{ marginRight: '4px' }} />
            Lock
          </button>
        </div>
      </div>

      {saveToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '10px 16px',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Check size={14} />
          {saveToast}
        </div>
      )}

      {/* Main Master-Detail Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Left Sidebar: Store Accounts List */}
        <div style={{
          background: '#0d111a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>Store Accounts</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{users.length} Total</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={13} color="#64748b" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            <input
              type="text"
              placeholder="Filter by ID, name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#05070b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 10px 8px 30px',
                color: '#f8fafc',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '30px 16px',
              color: '#64748b',
              fontSize: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              border: '1px dashed rgba(255, 255, 255, 0.08)'
            }}>
              <p style={{ margin: '0 0 10px 0' }}>No store accounts found.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  ...primaryBtnStyle,
                  fontSize: '11px',
                  padding: '6px 12px'
                }}
              >
                + Create First Store
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '520px', overflowY: 'auto' }}>
              {filteredUsers.map(user => {
                const isSelected = selectedUser && user.id === selectedUser.id;
                const isZero = (user.balance || 0) <= 0;
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    style={{
                      background: isSelected ? 'rgba(29, 97, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid #1d61ff' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: isSelected ? '#38bdf8' : '#f1f5f9' }}>
                        {user.storeName || user.id}
                      </span>
                      <span style={{
                        fontWeight: '700',
                        fontSize: '12px',
                        color: isZero ? '#ef4444' : '#10b981'
                      }}>
                        ${(user.balance || 0).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                      <span>ID: {user.id}</span>
                      <span style={{ color: isZero ? '#ef4444' : '#64748b' }}>
                        {isZero ? 'Paused' : 'Active'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Area: Selected Account Detail & Management */}
        {selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Top Store Overview Card */}
            <div style={{
              background: '#0d111a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <input
                      type="text"
                      value={storeInfoDraft.storeName || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, storeInfo: true }));
                        setStoreInfoDraft(prev => ({ ...prev, storeName: e.target.value }));
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px dashed transparent';
                        e.target.style.borderBottom = '1px dashed rgba(255, 255, 255, 0.2)';
                      }}
                      onFocus={(e) => e.target.style.border = '1px dashed #1d61ff'}
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        margin: 0,
                        color: '#ffffff',
                        background: 'transparent',
                        border: '1px dashed transparent',
                        borderBottom: '1px dashed rgba(255, 255, 255, 0.2)',
                        padding: '0 4px',
                        outline: 'none',
                        width: 'auto',
                        minWidth: '150px'
                      }}
                    />
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      background: (selectedUser.balance || 0) <= 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: (selectedUser.balance || 0) <= 0 ? '#ef4444' : '#10b981',
                      border: (selectedUser.balance || 0) <= 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      {(selectedUser.balance || 0) <= 0 ? 'PAUSED' : 'ACTIVE'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#64748b' }}>Phone:</span>
                      <input
                        type="text"
                        value={storeInfoDraft.phone || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, storeInfo: true }));
                          setStoreInfoDraft(prev => ({ ...prev, phone: e.target.value }));
                        }}
                        placeholder="Not set"
                        onBlur={(e) => {
                          e.target.style.border = '1px dashed transparent';
                          e.target.style.borderBottom = '1px dashed rgba(255, 255, 255, 0.2)';
                        }}
                        onFocus={(e) => e.target.style.border = '1px dashed #1d61ff'}
                        style={{
                          background: 'transparent',
                          border: '1px dashed transparent',
                          borderBottom: '1px dashed rgba(255, 255, 255, 0.2)',
                          color: '#94a3b8',
                          fontSize: '12px',
                          padding: '0 4px',
                          outline: 'none',
                          width: '120px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#64748b' }}>Address:</span>
                      <input
                        type="text"
                        value={storeInfoDraft.address || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, storeInfo: true }));
                          setStoreInfoDraft(prev => ({ ...prev, address: e.target.value }));
                        }}
                        placeholder="Not set"
                        onBlur={(e) => {
                          e.target.style.border = '1px dashed transparent';
                          e.target.style.borderBottom = '1px dashed rgba(255, 255, 255, 0.2)';
                        }}
                        onFocus={(e) => e.target.style.border = '1px dashed #1d61ff'}
                        style={{
                          background: 'transparent',
                          border: '1px dashed transparent',
                          borderBottom: '1px dashed rgba(255, 255, 255, 0.2)',
                          color: '#94a3b8',
                          fontSize: '12px',
                          padding: '0 4px',
                          outline: 'none',
                          width: '200px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                    <span>User ID: <code style={codeSnippetStyle}>{selectedUser.id}</code></span>
                    <span>
                      Password: <code style={codeSnippetStyle}>
                        {showPasswordMap[selectedUser.id] ? selectedUser.password : '••••••••'}
                      </code>
                      <button 
                        onClick={() => setShowPasswordMap(prev => ({ ...prev, [selectedUser.id]: !prev[selectedUser.id] }))}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginLeft: '4px', verticalAlign: 'middle' }}
                      >
                        {showPasswordMap[selectedUser.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </span>
                    {editFlags.storeInfo && (
                      <button onClick={handleSaveStoreInfo} style={{ ...primaryBtnStyle, padding: '4px 8px', fontSize: '10px', marginLeft: 'auto' }}>
                        Save Store Info
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>LIVE BALANCE</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    letterSpacing: '-0.5px',
                    color: (selectedUser.balance || 0) <= 0 ? '#ef4444' : '#10b981'
                  }}>
                    ${(selectedUser.balance || 0).toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Balance Quick Adjuster & Delete Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                background: '#05070b',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Credit Adjust:</span>
                  <button onClick={() => handleUpdateBalance(5)} style={pillBtnStyle}>+$5</button>
                  <button onClick={() => handleUpdateBalance(10)} style={pillBtnStyle}>+$10</button>
                  <button onClick={() => handleUpdateBalance(25)} style={pillBtnStyle}>+$25</button>
                  <button onClick={() => handleUpdateBalance(50)} style={pillBtnStyle}>+$50</button>
                  <button 
                    onClick={handleSetZeroBalance}
                    style={{ ...pillBtnStyle, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    Set $0.00
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 6px'
                  }}
                >
                  <Trash2 size={12} color="#ef4444" />
                  <span style={{ color: '#ef4444' }}>Delete Account</span>
                </button>
              </div>
            </div>

            {/* Clean Segmented Navigation Tabs */}
            <div style={{
              display: 'flex',
              gap: '4px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '6px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              whiteSpace: 'nowrap'
            }}>
              {[
                { id: 'activity', label: 'Live SMS Stream', icon: MessageSquare },
                { id: 'pricing', label: 'Pricing & Token Rates', icon: DollarSign },
                { id: 'profile', label: 'Store Profile & AI', icon: Sliders },
                { id: 'spam_schedule', label: 'Spam & Hours', icon: Clock },
                { id: 'blacklist', label: 'Manual Reply List', icon: Ban }
              ].map(tab => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: isActive ? 'rgba(29, 97, 255, 0.12)' : 'transparent',
                      border: isActive ? '1px solid #1d61ff' : '1px solid transparent',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0
                    }}
                  >
                    <IconComp size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: LIVE SMS ACTIVITY FEED */}
            {activeTab === 'activity' && (
              <div style={panelCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                      Live SMS Conversation Ledger
                    </h3>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Pushed directly from the client APK in real-time.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#05070b', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>
                      Total Messages: <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedUser.activities?.length || 0}</span>
                    </div>
                    <div style={{ background: '#05070b', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>
                      Total Revenue: <span style={{ color: '#10b981', fontWeight: 'bold' }}>${selectedUser.activities?.reduce((sum, a) => sum + (a.cost || 0), 0).toFixed(4) || '0.0000'}</span>
                    </div>
                    <div style={{ background: '#05070b', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>
                      Total Tokens: <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{selectedUser.activities?.reduce((sum, a) => sum + (a.tokensIn || 0) + (a.tokensOut || 0), 0) || 0}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['all', 'sent', 'blocked'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        style={{
                          background: activityFilter === f ? '#1d61ff' : 'rgba(255, 255, 255, 0.05)',
                          border: 'none',
                          color: activityFilter === f ? '#fff' : '#94a3b8',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredActivities.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '36px 16px',
                    color: '#64748b',
                    fontSize: '12px',
                    background: '#05070b',
                    borderRadius: '8px',
                    border: '1px dashed rgba(255, 255, 255, 0.06)'
                  }}>
                    <MessageSquare size={20} color="#475569" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    No SMS activity logged yet for this store.
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#475569' }}>
                      Incoming SMS processed by the on-device APK will stream here automatically.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredActivities.map((act, i) => (
                      <div
                        key={act.id || i}
                        style={{
                          background: '#05070b',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '700', fontSize: '12px', color: '#f8fafc' }}>{act.sender}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{act.time}</span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '600',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: act.status?.startsWith('Sent') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: act.status?.startsWith('Sent') ? '#10b981' : '#ef4444'
                            }}>
                              {act.status}
                            </span>
                          </div>

                          <span style={{ color: '#38bdf8', fontWeight: '700', fontSize: '11px' }}>
                            ${(act.cost || 0.005).toFixed(4)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '6px', color: '#94a3b8' }}>
                            <strong style={{ color: '#cbd5e1', marginRight: '6px' }}>Customer:</strong>
                            {act.incoming}
                          </div>
                          <div style={{ background: 'rgba(29, 97, 255, 0.08)', padding: '6px 10px', borderRadius: '6px', color: '#e2e8f0' }}>
                            <strong style={{ color: '#38bdf8', marginRight: '6px' }}>Cove AI:</strong>
                            {act.reply}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#64748b', marginTop: '8px' }}>
                          <span>In: {act.tokensIn || 0} tokens</span>
                          <span>Out: {act.tokensOut || 0} tokens</span>
                          <span>Cost: ${(act.cost || 0.005).toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRICING CONFIGURATION */}
            {activeTab === 'pricing' && (
              <div style={panelCardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: '#ffffff' }}>
                  Per-Message Pricing & Token Markups
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                  Configure the deduction rate per auto-reply. Automatically updates the APK.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  
                  {/* Mode 1: Fixed Fee */}
                  <div 
                    onClick={() => handleUpdatePricing('fixed_fee', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                    style={{
                      background: selectedUser.pricingMode === 'fixed_fee' ? 'rgba(29, 97, 255, 0.1)' : '#05070b',
                      border: selectedUser.pricingMode === 'fixed_fee' ? '1px solid #1d61ff' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px', color: selectedUser.pricingMode === 'fixed_fee' ? '#38bdf8' : '#f8fafc' }}>
                      Fixed Flat Fee
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Deduct exact fixed rate per SMS.
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>$</span>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedUser.fixedFeePerMessage || 0.005}
                        onChange={(e) => handleUpdatePricing('fixed_fee', e.target.value, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                        style={cleanInputStyle}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>/ msg</span>
                    </div>
                  </div>

                  {/* Mode 2: Custom Token Pricing */}
                  <div 
                    onClick={() => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                    style={{
                      background: selectedUser.pricingMode === 'token_custom' ? 'rgba(29, 97, 255, 0.1)' : '#05070b',
                      border: selectedUser.pricingMode === 'token_custom' ? '1px solid #1d61ff' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px', color: selectedUser.pricingMode === 'token_custom' ? '#38bdf8' : '#f8fafc' }}>
                      Custom Token Rates
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Bill actual tokens with margin.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#94a3b8' }}>In $/1M:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={selectedUser.customInputPrice1M || 0.25}
                          onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, e.target.value, selectedUser.customOutputPrice1M)}
                          style={{ ...cleanInputStyle, width: '65px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#94a3b8' }}>Out $/1M:</span>
                        <input
                          type="number"
                          step="0.10"
                          value={selectedUser.customOutputPrice1M || 1.50}
                          onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, e.target.value)}
                          style={{ ...cleanInputStyle, width: '65px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mode 3: Direct Pass-Through */}
                  <div 
                    onClick={() => handleUpdatePricing('default_ai', 0, 0, 0)}
                    style={{
                      background: selectedUser.pricingMode === 'default_ai' ? 'rgba(29, 97, 255, 0.1)' : '#05070b',
                      border: selectedUser.pricingMode === 'default_ai' ? '1px solid #1d61ff' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px', color: selectedUser.pricingMode === 'default_ai' ? '#38bdf8' : '#f8fafc' }}>
                      Direct AI Pass-Through
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Raw model supplier rate.
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Gemini 3.1 Flash Lite ($0.25 / $1.50)
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: STORE PROFILE & AI SETUP */}
            {activeTab === 'profile' && (
              <div style={panelCardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 14px 0', color: '#ffffff' }}>
                  Store Profile & Knowledge Base
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={formLabelStyle}>Business Name</label>
                    <input
                      type="text"
                      value={profileDraft.businessName || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, businessName: e.target.value }));
                      }}
                      style={formInputStyle}
                    />
                  </div>

                  <div>
                    <label style={formLabelStyle}>Business Details, Operating Hours & FAQ</label>
                    <textarea
                      rows={3}
                      value={profileDraft.businessInfo || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, businessInfo: e.target.value }));
                      }}
                      placeholder="e.g. Open Mon-Sat 9AM-7PM. Specializing in..."
                      style={{ ...formInputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={formLabelStyle}>AI Reply Tone</label>
                    <input
                      type="text"
                      value={profileDraft.replyTone || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, replyTone: e.target.value }));
                      }}
                      style={formInputStyle}
                    />
                  </div>

                  <div>
                    <label style={formLabelStyle}>Strict Rules & Limitations</label>
                    <textarea
                      rows={2}
                      value={profileDraft.aiRules || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, aiRules: e.target.value }));
                      }}
                      placeholder="e.g. Do not promise discounts without manager approval."
                      style={{ ...formInputStyle, resize: 'vertical' }}
                    />
                  </div>
                  
                  {editFlags.profile && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button onClick={handleSaveProfile} style={primaryBtnStyle}>
                        Save Profile & Sync to APK
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SPAM & SCHEDULE */}
            {activeTab === 'spam_schedule' && (
              <div style={panelCardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 14px 0', color: '#ffffff' }}>
                  Spam Protection & Hours Schedule
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                  {/* Spam Protection Section */}
                  <div style={{ background: '#05070b', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#38bdf8' }}>Spam Protection</div>
                      <div
                        onClick={() => {
                          setEditFlags(prev => ({ ...prev, spam: true }));
                          setSpamDraft(prev => ({ ...prev, spamEnabled: !prev.spamEnabled }));
                        }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                          background: spamDraft.spamEnabled !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: spamDraft.spamEnabled !== false ? '#10b981' : '#ef4444',
                          border: `1px solid ${spamDraft.spamEnabled !== false ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}
                      >
                        {spamDraft.spamEnabled !== false ? 'ON' : 'OFF'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="checkbox" 
                            checked={spamDraft.cooldownEnabled !== false} 
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, cooldownEnabled: e.target.checked }));
                            }} 
                          />
                          <span style={{ color: '#94a3b8' }}>Cooldown (s):</span>
                        </div>
                        <input
                          type="number"
                          value={spamDraft.cooldownSeconds ?? 90}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, cooldownSeconds: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...cleanInputStyle, width: '60px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="checkbox" 
                            checked={spamDraft.maxRepliesEnabled !== false} 
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, maxRepliesEnabled: e.target.checked }));
                            }} 
                          />
                          <span style={{ color: '#94a3b8' }}>Max Replies:</span>
                        </div>
                        <input
                          type="number"
                          value={spamDraft.maxReplies ?? 3}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, maxReplies: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...cleanInputStyle, width: '60px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="checkbox" 
                            checked={spamDraft.windowEnabled !== false} 
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, windowEnabled: e.target.checked }));
                            }} 
                          />
                          <span style={{ color: '#94a3b8' }}>Window (mins):</span>
                        </div>
                        <input
                          type="number"
                          value={spamDraft.windowMinutes ?? 10}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, windowMinutes: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...cleanInputStyle, width: '60px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedule Section */}
                  <div style={{ background: '#05070b', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#38bdf8' }}>Operating Hours</div>
                      <div
                        onClick={() => {
                          setEditFlags(prev => ({ ...prev, spam: true }));
                          setSpamDraft(prev => ({ ...prev, scheduleEnabled: !prev.scheduleEnabled }));
                        }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                          background: spamDraft.scheduleEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: spamDraft.scheduleEnabled ? '#10b981' : '#ef4444',
                          border: `1px solid ${spamDraft.scheduleEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}
                      >
                        {spamDraft.scheduleEnabled ? 'ON' : 'OFF'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8' }}>Mode:</span>
                        <select
                          value={spamDraft.scheduleMode || 'ONLY_DURING'}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, scheduleMode: e.target.value }));
                          }}
                          style={{ ...cleanInputStyle, width: '120px' }}
                        >
                          <option value="ONLY_DURING">Reply During Hours</option>
                          <option value="OUTSIDE_ONLY">Reply Outside Hours</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8' }}>Start:</span>
                        <input
                          type="time"
                          value={spamDraft.scheduleStart || '09:00'}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, scheduleStart: e.target.value }));
                          }}
                          style={{ ...cleanInputStyle, width: '120px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8' }}>End:</span>
                        <input
                          type="time"
                          value={spamDraft.scheduleEnd || '18:00'}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, scheduleEnd: e.target.value }));
                          }}
                          style={{ ...cleanInputStyle, width: '120px' }}
                        />
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Active Days:</span>
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
                                  background: isSelected ? '#1d61ff' : 'rgba(255, 255, 255, 0.05)',
                                  border: 'none',
                                  color: isSelected ? '#fff' : '#94a3b8',
                                  borderRadius: '4px',
                                  padding: '4px 6px',
                                  fontSize: '10px',
                                  cursor: 'pointer'
                                }}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Out of Hours Msg:</span>
                        <textarea
                          rows={2}
                          value={spamDraft.outOfHoursMsg || ''}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, outOfHoursMsg: e.target.value }));
                          }}
                          style={{ ...formInputStyle, resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {editFlags.spam && (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleSaveSpamSchedule} style={primaryBtnStyle}>
                        Save Spam & Schedule Rules
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: MANUAL REPLY LIST */}
            {activeTab === 'blacklist' && (
              <div style={panelCardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: '#ffffff' }}>
                  Manual Reply List
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
                  Numbers in this list skip AI auto-replies so staff can reply manually.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <input
                    id="newBlockInput"
                    type="text"
                    placeholder="Enter phone number for manual reply..."
                    style={{ ...formInputStyle, maxWidth: '280px' }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById('newBlockInput');
                      if (el && el.value) {
                        handleAddBlockedNumber(el.value);
                        el.value = '';
                      }
                    }}
                    style={primaryBtnStyle}
                  >
                    + Add Number
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(!selectedUser.blacklist || selectedUser.blacklist.length === 0) ? (
                    <div style={{ color: '#64748b', fontSize: '12px', padding: '12px 0' }}>
                      No numbers in manual reply list for this store.
                    </div>
                  ) : (
                    selectedUser.blacklist.map(phone => (
                      <div
                        key={phone}
                        style={{
                          background: '#05070b',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{phone}</span>
                        <button
                          onClick={() => handleRemoveBlockedNumber(phone)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '11px',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
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
        ) : (
          <div style={{
            background: '#0d111a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            Select a store account on the left or create a new one to view details.
          </div>
        )}

      </div>

      {/* CREATE NEW STORE USER MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0d111a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: 'clamp(20px, 5vw, 28px)',
            width: '100%',
            maxWidth: '420px',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', color: '#ffffff' }}>
              Create Store Account
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
              Provision client credentials for instant APK login.
            </p>

            <form onSubmit={handleCreateNewUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={formLabelStyle}>User ID (Required)</label>
                <input
                  type="text"
                  placeholder="e.g. store_downtown_01"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  style={formInputStyle}
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
                  style={formInputStyle}
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
                  style={formInputStyle}
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
                    style={formInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>Message Fee ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newFixedFee}
                    onChange={(e) => setNewFixedFee(e.target.value)}
                    style={formInputStyle}
                  />
                </div>
              </div>

              {createError && (
                <div style={{ color: '#ef4444', fontSize: '12px' }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                  style={secondaryBtnStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={primaryBtnStyle}
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

// ─── REFINED CLEAN STYLES ───

const primaryBtnStyle = {
  background: '#1d61ff',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  padding: '7px 14px',
  fontWeight: '600',
  fontSize: '12px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'background 0.15s ease'
};

const secondaryBtnStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#cbd5e1',
  borderRadius: '8px',
  padding: '7px 12px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center'
};

const pillBtnStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#f1f5f9',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '600',
  cursor: 'pointer'
};

const panelCardStyle = {
  background: '#0d111a',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '14px',
  padding: '16px'
};

const formInputStyle = {
  width: '100%',
  background: '#05070b',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#f8fafc',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box'
};

const cleanInputStyle = {
  background: '#07090e',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '6px',
  padding: '5px 8px',
  color: '#f8fafc',
  fontSize: '12px',
  outline: 'none'
};

const formLabelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: '#94a3b8',
  marginBottom: '4px'
};

const codeSnippetStyle = {
  background: '#05070b',
  padding: '2px 6px',
  borderRadius: '4px',
  color: '#38bdf8',
  fontSize: '11px'
};
