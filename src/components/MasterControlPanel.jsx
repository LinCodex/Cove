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
  Hash
} from 'lucide-react';

export default function MasterControlPanel({ onBackToHome }) {
  // Authentication State
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
      // Real-time polling every 3 seconds
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

  // Common Slack Styles
  const primaryBtnStyle = {
    background: '#007a5a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'background 0.15s ease'
  };

  const secondaryBtnStyle = {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#334155',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'background 0.15s ease'
  };

  const formInputStyle = {
    width: '100%',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#1d1c1d',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const panelCardStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  // ─── SECURITY GATE (LOGIN SCREEN) ───
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: 'clamp(24px, 5vw, 36px)',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#4a154b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ color: '#1d1c1d', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                Cove Master Control
              </h2>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Administrative Access</span>
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
            Sign in with the Master Admin password to manage store accounts and view live activity.
          </p>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => { setAuthPassword(e.target.value); setAuthError(''); }}
              style={formInputStyle}
              required
              autoFocus
            />

            {authError && (
              <div style={{ color: '#c5221f', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button type="submit" disabled={authLoading} style={primaryBtnStyle}>
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <button type="button" onClick={onBackToHome} style={{ ...secondaryBtnStyle, marginTop: '4px', border: 'none', background: 'transparent', boxShadow: 'none' }}>
              ← Back to Cove
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
      backgroundColor: '#f8fafc',
      color: '#1d1c1d',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      
      {/* Top Header Bar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: '#4a154b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={16} color="#ffffff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1d1c1d' }}>
            Cove Admin
          </h1>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e6f4ea',
            color: '#137333',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34a853' }} />
            System Live
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setShowCreateModal(true)} style={primaryBtnStyle}>
            <Plus size={14} style={{ marginRight: '6px' }} />
            New Store
          </button>
          <button onClick={handleAdminLogout} style={{ ...secondaryBtnStyle, color: '#475569' }}>
            <Lock size={14} style={{ marginRight: '6px' }} />
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        
        {/* Left Sidebar: Store Accounts List */}
        <div style={{ ...panelCardStyle, padding: '0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#1d1c1d' }}>Stores</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                {users.length} Total
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...formInputStyle, paddingLeft: '34px', background: '#f8fafc' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No store accounts found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredUsers.map(user => {
                  const isSelected = selectedUser && user.id === selectedUser.id;
                  const isZero = (user.balance || 0) <= 0;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        background: isSelected ? '#e8f5fa' : '#ffffff',
                        borderLeft: isSelected ? '4px solid #1264a3' : '4px solid transparent',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f1f5f9' }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#ffffff' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#1d1c1d' }}>
                          {user.storeName || user.id}
                        </span>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: isZero ? '#c5221f' : '#137333' }}>
                          ${(user.balance || 0).toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                        <span><Hash size={10} style={{ display: 'inline', marginRight: '2px' }}/>{user.id}</span>
                        <span style={{ color: isZero ? '#c5221f' : '#64748b' }}>
                          {isZero ? 'Paused' : 'Active'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Selected Account Detail */}
        {selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '4px' }}>
            
            {/* Store Overview Card */}
            <div style={panelCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={storeInfoDraft.storeName || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, storeInfo: true }));
                        setStoreInfoDraft(prev => ({ ...prev, storeName: e.target.value }));
                      }}
                      onBlur={(e) => { e.target.style.background = 'transparent'; e.target.style.border = '1px solid transparent'; }}
                      onFocus={(e) => { e.target.style.background = '#ffffff'; e.target.style.border = '1px solid #cbd5e1'; }}
                      style={{
                        fontSize: '22px',
                        fontWeight: '800',
                        color: '#1d1c1d',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        outline: 'none',
                        width: 'auto',
                        minWidth: '200px',
                        marginLeft: '-8px'
                      }}
                    />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      background: (selectedUser.balance || 0) <= 0 ? '#fce8e6' : '#e6f4ea',
                      color: (selectedUser.balance || 0) <= 0 ? '#c5221f' : '#137333',
                    }}>
                      {(selectedUser.balance || 0) <= 0 ? 'PAUSED' : 'ACTIVE'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#475569', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '600' }}>Phone:</span>
                      <input
                        type="text"
                        value={storeInfoDraft.phone || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, storeInfo: true }));
                          setStoreInfoDraft(prev => ({ ...prev, phone: e.target.value }));
                        }}
                        placeholder="Add phone..."
                        style={{ ...formInputStyle, padding: '4px 8px', width: '140px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '600' }}>Address:</span>
                      <input
                        type="text"
                        value={storeInfoDraft.address || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, storeInfo: true }));
                          setStoreInfoDraft(prev => ({ ...prev, address: e.target.value }));
                        }}
                        placeholder="Add address..."
                        style={{ ...formInputStyle, padding: '4px 8px', width: '220px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>ID: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#1d1c1d' }}>{selectedUser.id}</code></span>
                    <span style={{ color: '#64748b' }}>
                      Password: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#1d1c1d' }}>
                        {showPasswordMap[selectedUser.id] ? selectedUser.password : '••••••••'}
                      </code>
                      <button 
                        onClick={() => setShowPasswordMap(prev => ({ ...prev, [selectedUser.id]: !prev[selectedUser.id] }))}
                        style={{ background: 'none', border: 'none', color: '#1264a3', cursor: 'pointer', marginLeft: '6px' }}
                      >
                        {showPasswordMap[selectedUser.id] ? 'Hide' : 'Show'}
                      </button>
                    </span>
                    {editFlags.storeInfo && (
                      <button onClick={handleSaveStoreInfo} style={{ ...primaryBtnStyle, padding: '4px 12px', fontSize: '11px', marginLeft: 'auto' }}>
                        Save Info
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '220px', textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>CURRENT BALANCE</div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: (selectedUser.balance || 0) <= 0 ? '#c5221f' : '#137333',
                    marginBottom: '12px'
                  }}>
                    ${(selectedUser.balance || 0).toFixed(3)}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button onClick={() => handleUpdateBalance(10)} style={{ ...secondaryBtnStyle, padding: '4px 8px', fontSize: '11px' }}>+$10</button>
                    <button onClick={() => handleUpdateBalance(25)} style={{ ...secondaryBtnStyle, padding: '4px 8px', fontSize: '11px' }}>+$25</button>
                    <button onClick={() => handleUpdateBalance(50)} style={{ ...secondaryBtnStyle, padding: '4px 8px', fontSize: '11px' }}>+$50</button>
                    <button onClick={handleSetZeroBalance} style={{ ...secondaryBtnStyle, padding: '4px 8px', fontSize: '11px', color: '#c5221f', borderColor: '#fce8e6', background: '#fce8e6' }}>Set $0</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div style={{
              display: 'flex',
              gap: '24px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0',
              marginBottom: '4px'
            }}>
              {[
                { id: 'activity', label: 'Live Activity' },
                { id: 'pricing', label: 'Pricing Setup' },
                { id: 'profile', label: 'Store Profile' },
                { id: 'spam_schedule', label: 'Spam & Schedule' },
                { id: 'blacklist', label: 'Manual Reply' }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isActive ? '#1264a3' : '#64748b',
                      padding: '8px 4px 12px 4px',
                      fontSize: '14px',
                      fontWeight: isActive ? '700' : '500',
                      borderBottom: isActive ? '3px solid #1264a3' : '3px solid transparent',
                      cursor: 'pointer',
                      marginBottom: '-1px',
                      transition: 'all 0.1s'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: LIVE ACTIVITY */}
            {activeTab === 'activity' && (
              <div style={panelCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1d1c1d' }}>SMS Conversation Ledger</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#475569', border: '1px solid #e2e8f0' }}>
                      Messages: <strong>{selectedUser.activities?.length || 0}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#475569', border: '1px solid #e2e8f0' }}>
                      Revenue: <strong style={{ color: '#137333' }}>${selectedUser.activities?.reduce((sum, a) => sum + (a.cost || 0), 0).toFixed(4) || '0.0000'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {['all', 'sent', 'blocked'].map(f => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      style={{
                        background: activityFilter === f ? '#e8f5fa' : '#ffffff',
                        border: activityFilter === f ? '1px solid #1264a3' : '1px solid #cbd5e1',
                        color: activityFilter === f ? '#1264a3' : '#475569',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {filteredActivities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <MessageSquare size={24} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>No SMS activity logged yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredActivities.map((act, i) => (
                      <div key={act.id || i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1d1c1d' }}>{act.sender}</span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{act.time}</span>
                            <span style={{
                              fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                              background: act.status?.startsWith('Sent') ? '#e6f4ea' : '#fce8e6',
                              color: act.status?.startsWith('Sent') ? '#137333' : '#c5221f'
                            }}>
                              {act.status}
                            </span>
                          </div>
                          <span style={{ color: '#1264a3', fontWeight: '700', fontSize: '13px' }}>
                            ${(act.cost || 0.005).toFixed(4)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', lineHeight: '1.5' }}>
                          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#475569', marginRight: '8px' }}>Customer:</strong>
                            <span style={{ color: '#1d1c1d' }}>{act.incoming}</span>
                          </div>
                          <div style={{ background: '#e8f5fa', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                            <strong style={{ color: '#1264a3', marginRight: '8px' }}>Cove AI:</strong>
                            <span style={{ color: '#1d1c1d' }}>{act.reply}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRICING */}
            {activeTab === 'pricing' && (
              <div style={panelCardStyle}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: '#1d1c1d' }}>Pricing Models</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  
                  {/* Fixed Fee */}
                  <div 
                    onClick={() => handleUpdatePricing('fixed_fee', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                    style={{
                      background: selectedUser.pricingMode === 'fixed_fee' ? '#e8f5fa' : '#ffffff',
                      border: selectedUser.pricingMode === 'fixed_fee' ? '2px solid #1264a3' : '1px solid #e2e8f0',
                      borderRadius: '12px', padding: '20px', cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1d1c1d', marginBottom: '8px' }}>Fixed Flat Fee</div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>Deduct exact rate per SMS.</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#475569', fontWeight: '600' }}>$</span>
                      <input
                        type="number" step="0.001"
                        value={selectedUser.fixedFeePerMessage || 0.005}
                        onChange={(e) => handleUpdatePricing('fixed_fee', e.target.value, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                        style={{ ...formInputStyle, width: '90px' }}
                      />
                    </div>
                  </div>

                  {/* Token Custom */}
                  <div 
                    onClick={() => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                    style={{
                      background: selectedUser.pricingMode === 'token_custom' ? '#e8f5fa' : '#ffffff',
                      border: selectedUser.pricingMode === 'token_custom' ? '2px solid #1264a3' : '1px solid #e2e8f0',
                      borderRadius: '12px', padding: '20px', cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1d1c1d', marginBottom: '8px' }}>Custom Token Rates</div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>Bill tokens with margin.</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>In $/1M:</span>
                        <input type="number" step="0.05" value={selectedUser.customInputPrice1M || 0.25} onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, e.target.value, selectedUser.customOutputPrice1M)} style={{ ...formInputStyle, width: '80px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Out $/1M:</span>
                        <input type="number" step="0.10" value={selectedUser.customOutputPrice1M || 1.50} onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, e.target.value)} style={{ ...formInputStyle, width: '80px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Direct Pass-Through */}
                  <div 
                    onClick={() => handleUpdatePricing('default_ai', 0, 0, 0)}
                    style={{
                      background: selectedUser.pricingMode === 'default_ai' ? '#e8f5fa' : '#ffffff',
                      border: selectedUser.pricingMode === 'default_ai' ? '2px solid #1264a3' : '1px solid #e2e8f0',
                      borderRadius: '12px', padding: '20px', cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1d1c1d', marginBottom: '8px' }}>Direct AI Pass-Through</div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>Raw model supplier rate.</div>
                    <div style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '8px', borderRadius: '6px' }}>
                      Gemini Flash ($0.25 / $1.50)
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === 'profile' && (
              <div style={panelCardStyle}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 20px 0', color: '#1d1c1d' }}>Store Profile & Knowledge</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1c1d', marginBottom: '6px' }}>Business Name</label>
                    <input type="text" value={profileDraft.businessName || ''} onChange={(e) => { setEditFlags(prev => ({ ...prev, profile: true })); setProfileDraft(prev => ({ ...prev, businessName: e.target.value })); }} style={formInputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1c1d', marginBottom: '6px' }}>Business Details & FAQ</label>
                    <textarea rows={4} value={profileDraft.businessInfo || ''} onChange={(e) => { setEditFlags(prev => ({ ...prev, profile: true })); setProfileDraft(prev => ({ ...prev, businessInfo: e.target.value })); }} style={{ ...formInputStyle, resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1c1d', marginBottom: '6px' }}>Reply Tone</label>
                    <input type="text" value={profileDraft.replyTone || ''} onChange={(e) => { setEditFlags(prev => ({ ...prev, profile: true })); setProfileDraft(prev => ({ ...prev, replyTone: e.target.value })); }} style={formInputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1c1d', marginBottom: '6px' }}>Strict Rules</label>
                    <textarea rows={3} value={profileDraft.aiRules || ''} onChange={(e) => { setEditFlags(prev => ({ ...prev, profile: true })); setProfileDraft(prev => ({ ...prev, aiRules: e.target.value })); }} style={{ ...formInputStyle, resize: 'vertical' }} />
                  </div>
                  
                  {editFlags.profile && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button onClick={handleSaveProfile} style={primaryBtnStyle}>Save Profile Sync</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SPAM & SCHEDULE */}
            {activeTab === 'spam_schedule' && (
              <div style={panelCardStyle}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 20px 0', color: '#1d1c1d' }}>Spam & Schedule Rules</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#1d1c1d' }}>Spam Protection</div>
                      <button onClick={() => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, spamEnabled: !prev.spamEnabled })); }} style={{ ...secondaryBtnStyle, padding: '4px 12px', background: spamDraft.spamEnabled !== false ? '#e6f4ea' : '#fce8e6', color: spamDraft.spamEnabled !== false ? '#137333' : '#c5221f', borderColor: 'transparent' }}>
                        {spamDraft.spamEnabled !== false ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#475569' }}>Cooldown (sec):</span>
                        <input type="number" value={spamDraft.cooldownSeconds ?? 90} onChange={(e) => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, cooldownSeconds: parseInt(e.target.value) || 0 })); }} style={{ ...formInputStyle, width: '80px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#475569' }}>Max Replies:</span>
                        <input type="number" value={spamDraft.maxReplies ?? 3} onChange={(e) => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, maxReplies: parseInt(e.target.value) || 0 })); }} style={{ ...formInputStyle, width: '80px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#475569' }}>Window (mins):</span>
                        <input type="number" value={spamDraft.windowMinutes ?? 10} onChange={(e) => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, windowMinutes: parseInt(e.target.value) || 0 })); }} style={{ ...formInputStyle, width: '80px' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#1d1c1d' }}>Operating Hours</div>
                      <button onClick={() => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, scheduleEnabled: !prev.scheduleEnabled })); }} style={{ ...secondaryBtnStyle, padding: '4px 12px', background: spamDraft.scheduleEnabled ? '#e6f4ea' : '#fce8e6', color: spamDraft.scheduleEnabled ? '#137333' : '#c5221f', borderColor: 'transparent' }}>
                        {spamDraft.scheduleEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#475569' }}>Mode:</span>
                        <select value={spamDraft.scheduleMode || 'ONLY_DURING'} onChange={(e) => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, scheduleMode: e.target.value })); }} style={{ ...formInputStyle, width: '140px' }}>
                          <option value="ONLY_DURING">During Hours</option>
                          <option value="OUTSIDE_ONLY">Outside Hours</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="time" value={spamDraft.scheduleStart || '09:00'} onChange={(e) => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, scheduleStart: e.target.value })); }} style={formInputStyle} />
                        <input type="time" value={spamDraft.scheduleEnd || '18:00'} onChange={(e) => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, scheduleEnd: e.target.value })); }} style={formInputStyle} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                            const days = spamDraft.scheduleDays || [];
                            const isSelected = days.includes(day);
                            return (
                              <button key={day} onClick={() => { const newDays = isSelected ? days.filter(d => d !== day) : [...days, day]; setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, scheduleDays: newDays })); }} style={{ padding: '6px 10px', fontSize: '12px', fontWeight: '600', borderRadius: '6px', border: isSelected ? 'none' : '1px solid #cbd5e1', background: isSelected ? '#1264a3' : '#ffffff', color: isSelected ? '#ffffff' : '#475569', cursor: 'pointer' }}>{day}</button>
                            );
                          })}
                        </div>
                      </div>
                      <textarea rows={2} placeholder="Out of hours message" value={spamDraft.outOfHoursMsg || ''} onChange={(e) => { setEditFlags(prev => ({ ...prev, spam: true })); setSpamDraft(prev => ({ ...prev, outOfHoursMsg: e.target.value })); }} style={{ ...formInputStyle, resize: 'vertical' }} />
                    </div>
                  </div>

                  {editFlags.spam && (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleSaveSpamSchedule} style={primaryBtnStyle}>Save Rules Sync</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: BLACKLIST */}
            {activeTab === 'blacklist' && (
              <div style={panelCardStyle}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: '#1d1c1d' }}>Manual Reply List</h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 20px 0' }}>Numbers here bypass AI for human response.</p>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <input id="newBlockInput" type="text" placeholder="Phone number..." style={{ ...formInputStyle, maxWidth: '300px' }} />
                  <button onClick={() => { const el = document.getElementById('newBlockInput'); if (el && el.value) { handleAddBlockedNumber(el.value); el.value = ''; } }} style={primaryBtnStyle}>+ Add</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(!selectedUser.blacklist || selectedUser.blacklist.length === 0) ? (
                    <div style={{ color: '#64748b', fontSize: '13px' }}>No numbers blocked.</div>
                  ) : (
                    selectedUser.blacklist.map(phone => (
                      <div key={phone} style={{ border: '1px solid #e2e8f0', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1d1c1d' }}>{phone}</span>
                        <button onClick={() => handleRemoveBlockedNumber(phone)} style={{ ...secondaryBtnStyle, color: '#c5221f', padding: '4px 12px' }}>Remove</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', color: '#64748b', fontSize: '15px' }}>
            Select a store to view details
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(29, 28, 29, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: '#1d1c1d' }}>New Store Account</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#475569' }}>Provision a new tenant space.</p>
            
            <form onSubmit={handleCreateNewUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>User ID</label>
                <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} style={formInputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
                <input type="password" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} style={formInputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Store Name</label>
                <input type="text" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} style={formInputStyle} />
              </div>
              
              {createError && <div style={{ color: '#c5221f', fontSize: '13px' }}>{createError}</div>}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={secondaryBtnStyle}>Cancel</button>
                <button type="submit" disabled={loading} style={primaryBtnStyle}>{loading ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* TOAST */}
      {saveToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#1d1c1d', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999 }}>
          <Check size={16} color="#34a853" />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{saveToast}</span>
        </div>
      )}
      
    </div>
  );
}
