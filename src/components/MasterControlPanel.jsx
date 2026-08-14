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
  Radio,
  Zap,
  Sparkles,
  Phone,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  User,
  Activity
} from 'lucide-react';

export default function MasterControlPanel({ onBackToHome }) {
  // Authentication State (Master Admin Security)
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

  // Stores State & Polling
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Draft States for editing (prevents background polling overwrites)
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
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('cove_master_admin_auth', 'true');
        fetchUsers();
      } else {
        const expectedMasterPass = import.meta.env.VITE_MASTER_ADMIN_PASSWORD || 'Aa7185095888!';
        if (authPassword === expectedMasterPass) {
          setIsAuthenticated(true);
          sessionStorage.setItem('cove_master_admin_auth', 'true');
          fetchUsers();
        } else {
          setAuthError(data.error || 'Invalid Admin Password');
        }
      }
    } catch {
      const expectedMasterPass = import.meta.env.VITE_MASTER_ADMIN_PASSWORD || 'Aa7185095888!';
      if (authPassword === expectedMasterPass) {
        setIsAuthenticated(true);
        sessionStorage.setItem('cove_master_admin_auth', 'true');
        fetchUsers();
      } else {
        setAuthError('Connection error or invalid password');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('cove_master_admin_auth');
    setIsAuthenticated(false);
  };

  // Fetch real users from backend API (Supabase)
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
              if (!serverMap.has(p.id)) merged.push(p);
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

      setUsers(prev => [createdUser, ...prev.filter(u => u.id !== createdUser.id)]);
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
    triggerToast(`Balance updated: ${delta >= 0 ? '+' : ''}$${delta.toFixed(2)} (Synced)`);
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

  const handleSaveStoreInfo = () => {
    if (!selectedUser) return;
    const updated = {
      ...selectedUser,
      storeName: storeInfoDraft.storeName || selectedUser.storeName,
      phone: storeInfoDraft.phone,
      address: storeInfoDraft.address
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    setEditFlags(prev => ({ ...prev, storeInfo: false }));
    triggerToast('Store details saved and synced!');
  };

  const handleSaveProfile = () => {
    if (!selectedUser) return;
    const updated = { 
      ...selectedUser, 
      businessProfile: profileDraft,
      storeName: profileDraft.businessName || selectedUser.storeName
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    setEditFlags(prev => ({ ...prev, profile: false }));
    triggerToast('Store Profile saved & synced to APK!');
  };

  const handleSaveSpamSchedule = () => {
    if (!selectedUser) return;
    const updated = { ...selectedUser, spamConfig: spamDraft };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    setEditFlags(prev => ({ ...prev, spam: false }));
    triggerToast('Spam & Schedule rules saved & synced!');
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
    triggerToast(`Removed ${number} from manual list`);
  };

  const filteredUsers = users.filter(u => 
    (u.storeName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.phone || '').includes(searchQuery)
  );

  // ─── AUTH SCREEN (Slack Clean Style) ───
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '32px 28px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#4a154b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 12px rgba(74, 21, 75, 0.2)'
            }}>
              <Zap size={24} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1d1c1d', margin: '0 0 6px 0' }}>
              Cove Master Console
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              Enter Master Administrator password to manage store accounts and live APK sync.
            </p>
          </div>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Master Admin Password
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: '#1d1c1d',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            {authError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#b91c1c',
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
              style={{
                background: '#007a5a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '11px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s ease'
              }}
            >
              {authLoading ? 'Verifying...' : 'Sign In to Master Console'}
              <ChevronRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onBackToHome}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={14} /> Back to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED SLACK CONSOLE ───
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#1d1c1d',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>

      {/* TOP SLACK-STYLE HEADER */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#4a154b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(74, 21, 75, 0.25)'
          }}>
            <Zap size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#1d1c1d', letterSpacing: '-0.02em' }}>COVE</span>
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Master Console
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e6f4ea',
            color: '#137333',
            fontSize: '12px',
            fontWeight: '600',
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34a853' }}></span>
            Supabase Live
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#007a5a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 14px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={15} /> Add Store Account
          </button>

          <button
            onClick={onBackToHome}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Exit Console
          </button>

          <button
            onClick={handleAdminLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              cursor: 'pointer',
              padding: '7px 8px'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* SAVE CONFIRMATION TOAST */}
      {saveToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#007a5a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 100
        }}>
          <Check size={16} />
          <span>{saveToast}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '20px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        boxSizing: 'border-box'
      }}>

        {/* ─── LEFT COLUMN: STORE ACCOUNTS LIST ─── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1d1c1d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Store Accounts ({users.length})
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: '#1264a3',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              + New Store
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '7px 10px 7px 32px',
                fontSize: '13px',
                color: '#1d1c1d',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Store List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '580px', overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '13px' }}>
                No stores found.
              </div>
            ) : (
              filteredUsers.map(u => {
                const isSelected = u.id === selectedUserId;
                const isPaused = (u.balance || 0) <= 0;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    style={{
                      background: isSelected ? '#e8f5fa' : 'transparent',
                      borderLeft: isSelected ? '3px solid #1264a3' : '3px solid transparent',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.1s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#1264a3' : '#1d1c1d' }}>
                        {u.storeName || u.id}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        ID: {u.id}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: isPaused ? '#c5221f' : '#007a5a'
                      }}>
                        ${(u.balance || 0).toFixed(2)}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: isPaused ? '#c5221f' : '#137333'
                      }}>
                        {isPaused ? 'PAUSED' : 'ACTIVE'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: STORE CONTROL & TABS ─── */}
        {selectedUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* TOP STORE OVERVIEW CARD */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={storeInfoDraft.storeName || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, storeInfo: true }));
                        setStoreInfoDraft(prev => ({ ...prev, storeName: e.target.value }));
                      }}
                      style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: '#1d1c1d',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        outline: 'none',
                        background: '#f8fafc',
                        width: 'auto',
                        minWidth: '200px'
                      }}
                    />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: (selectedUser.balance || 0) <= 0 ? '#fce8e6' : '#e6f4ea',
                      color: (selectedUser.balance || 0) <= 0 ? '#c5221f' : '#137333'
                    }}>
                      {(selectedUser.balance || 0) <= 0 ? 'PAUSED' : 'ACTIVE'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      <span>Phone:</span>
                      <input
                        type="text"
                        value={storeInfoDraft.phone || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, storeInfo: true }));
                          setStoreInfoDraft(prev => ({ ...prev, phone: e.target.value }));
                        }}
                        placeholder="Not set"
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '12px',
                          color: '#1d1c1d',
                          width: '120px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      <span>Address:</span>
                      <input
                        type="text"
                        value={storeInfoDraft.address || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, storeInfo: true }));
                          setStoreInfoDraft(prev => ({ ...prev, address: e.target.value }));
                        }}
                        placeholder="Not set"
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '12px',
                          color: '#1d1c1d',
                          width: '150px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} />
                      <span>Pass:</span>
                      <span style={{ fontFamily: 'monospace', color: '#1d1c1d', fontWeight: '600' }}>
                        {showPasswordMap[selectedUser.id] ? selectedUser.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => setShowPasswordMap(prev => ({ ...prev, [selectedUser.id]: !prev[selectedUser.id] }))}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                      >
                        {showPasswordMap[selectedUser.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>

                    {editFlags.storeInfo && (
                      <button
                        onClick={handleSaveStoreInfo}
                        style={{
                          background: '#007a5a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Save Store Info
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Balance & Actions */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  textAlign: 'right',
                  minWidth: '180px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '2px' }}>Current Balance</div>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: (selectedUser.balance || 0) <= 0 ? '#c5221f' : '#007a5a',
                    marginBottom: '8px'
                  }}>
                    ${(selectedUser.balance || 0).toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button onClick={() => handleUpdateBalance(5.00)} style={slackSmallBtnStyle}>+$5</button>
                    <button onClick={() => handleUpdateBalance(20.00)} style={slackSmallBtnStyle}>+$20</button>
                    <button onClick={() => handleUpdateBalance(-1.00)} style={slackSmallBtnStyle}>-$1</button>
                    <button onClick={handleSetZeroBalance} style={{ ...slackSmallBtnStyle, color: '#c5221f' }}>Set $0</button>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Total SMS Processed: <strong style={{ color: '#1d1c1d' }}>{selectedUser.totalRequests || selectedUser.activities?.length || 0}</strong>
                </div>
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#e01e5a',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} /> Delete Store Account
                </button>
              </div>
            </div>

            {/* ─── SLACK-STYLE TABS NAVIGATION ─── */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              background: '#ffffff',
              borderRadius: '10px 10px 0 0',
              padding: '0 12px',
              overflowX: 'auto'
            }}>
              {[
                { id: 'activity', label: 'Live SMS Activity', icon: Activity },
                { id: 'pricing', label: 'Pricing & Rates', icon: DollarSign },
                { id: 'profile', label: 'Store Profile & AI', icon: Sparkles },
                { id: 'spam_schedule', label: 'Spam & Hours', icon: Clock },
                { id: 'blacklist', label: 'Manual Reply List', icon: Ban }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #1264a3' : '2px solid transparent',
                      color: isActive ? '#1264a3' : '#64748b',
                      fontWeight: isActive ? '700' : '600',
                      fontSize: '13px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <IconComp size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ─── TAB 1: LIVE SMS ACTIVITY ─── */}
            {activeTab === 'activity' && (
              <div style={slackCardStyle}>
                {/* Summary Stats Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={slackMetricCardStyle}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Total Messages</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1d1c1d' }}>
                      {selectedUser.activities?.length || 0}
                    </div>
                  </div>
                  <div style={slackMetricCardStyle}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Total Revenue</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#007a5a' }}>
                      ${selectedUser.activities?.reduce((sum, a) => sum + (a.cost || 0), 0).toFixed(4) || '0.0000'}
                    </div>
                  </div>
                  <div style={slackMetricCardStyle}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Tokens Used</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1264a3' }}>
                      {selectedUser.activities?.reduce((sum, a) => sum + (a.tokensIn || 0) + (a.tokensOut || 0), 0) || 0}
                    </div>
                  </div>
                </div>

                {/* Filter Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#1d1c1d' }}>
                    Live Activity Ledger
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'sent', 'blocked'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        style={{
                          background: activityFilter === f ? '#1264a3' : '#f1f5f9',
                          color: activityFilter === f ? '#ffffff' : '#64748b',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
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

                {/* Activity Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '480px', overflowY: 'auto' }}>
                  {(!selectedUser.activities || selectedUser.activities.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '13px' }}>
                      No SMS activity recorded yet. Inbound SMS will stream here automatically.
                    </div>
                  ) : (
                    selectedUser.activities
                      .filter(a => {
                        if (activityFilter === 'sent') return a.status?.toLowerCase().includes('sent');
                        if (activityFilter === 'blocked') return a.status?.toLowerCase().includes('block') || a.status?.toLowerCase().includes('pause');
                        return true;
                      })
                      .map((act, idx) => (
                        <div
                          key={act.id || idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <span style={{ fontWeight: '700', color: '#1d1c1d' }}>{act.sender}</span>
                            <span style={{ color: '#94a3b8' }}>{act.time}</span>
                          </div>

                          <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            color: '#334155'
                          }}>
                            <strong>In:</strong> {act.incoming}
                          </div>

                          {act.reply && (
                            <div style={{
                              background: '#e8f5fa',
                              border: '1px solid #bae6fd',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              color: '#0369a1'
                            }}>
                              <strong>Cove AI:</strong> {act.reply}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            <span>In: {act.tokensIn || 0} tokens</span>
                            <span>Out: {act.tokensOut || 0} tokens</span>
                            <span>Cost: ${(act.cost || 0.005).toFixed(4)}</span>
                            <span style={{ marginLeft: 'auto', fontWeight: '600', color: '#007a5a' }}>{act.status}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 2: PRICING & TOKEN RATES ─── */}
            {activeTab === 'pricing' && (
              <div style={slackCardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px 0', color: '#1d1c1d' }}>
                  Billing & Token Pricing Models
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                  Configure how deductions are calculated per SMS auto-reply for this store.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {/* Flat Fee */}
                  <div
                    onClick={() => handleUpdatePricing('fixed_fee', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                    style={{
                      background: selectedUser.pricingMode === 'fixed_fee' ? '#e8f5fa' : '#ffffff',
                      border: selectedUser.pricingMode === 'fixed_fee' ? '2px solid #1264a3' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#1d1c1d', marginBottom: '4px' }}>
                      Fixed Flat Fee
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Deduct an exact flat rate per message.
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>$</span>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedUser.fixedFeePerMessage || 0.005}
                        onChange={(e) => handleUpdatePricing('fixed_fee', e.target.value, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                        style={slackInputStyle}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>/ msg</span>
                    </div>
                  </div>

                  {/* Custom Token Rates */}
                  <div
                    onClick={() => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                    style={{
                      background: selectedUser.pricingMode === 'token_custom' ? '#e8f5fa' : '#ffffff',
                      border: selectedUser.pricingMode === 'token_custom' ? '2px solid #1264a3' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#1d1c1d', marginBottom: '4px' }}>
                      Custom Token Rates
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Bill actual prompt and completion tokens.
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ color: '#64748b' }}>In $/1M:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={selectedUser.customInputPrice1M || 0.25}
                          onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, e.target.value, selectedUser.customOutputPrice1M)}
                          style={{ ...slackInputStyle, width: '70px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ color: '#64748b' }}>Out $/1M:</span>
                        <input
                          type="number"
                          step="0.10"
                          value={selectedUser.customOutputPrice1M || 1.50}
                          onChange={(e) => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, e.target.value)}
                          style={{ ...slackInputStyle, width: '70px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Direct Pass-Through */}
                  <div
                    onClick={() => handleUpdatePricing('default_ai', 0, 0, 0)}
                    style={{
                      background: selectedUser.pricingMode === 'default_ai' ? '#e8f5fa' : '#ffffff',
                      border: selectedUser.pricingMode === 'default_ai' ? '2px solid #1264a3' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#1d1c1d', marginBottom: '4px' }}>
                      Direct AI Pass-Through
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                      Standard provider supplier rates.
                    </div>
                    <div style={{ fontSize: '11px', color: '#007a5a', fontWeight: '600' }}>
                      Gemini 3.1 Flash Lite ($0.25 / $1.50)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 3: STORE PROFILE & AI SETUP ─── */}
            {activeTab === 'profile' && (
              <div style={slackCardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: '#1d1c1d' }}>
                  Store Profile & Knowledge Base
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                  Updating these details immediately flushes the on-device AI briefing cache and pushes the latest facts.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={slackLabelStyle}>Business / Store Name</label>
                    <input
                      type="text"
                      value={profileDraft.businessName || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, businessName: e.target.value }));
                      }}
                      style={slackInputStyle}
                    />
                  </div>

                  <div>
                    <label style={slackLabelStyle}>Business Details, Services & FAQ</label>
                    <textarea
                      rows={4}
                      value={profileDraft.businessInfo || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, businessInfo: e.target.value }));
                      }}
                      placeholder="e.g. Open Mon-Sat 9AM-7PM. Specializing in..."
                      style={{ ...slackInputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={slackLabelStyle}>AI Reply Tone</label>
                    <input
                      type="text"
                      value={profileDraft.replyTone || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, replyTone: e.target.value }));
                      }}
                      style={slackInputStyle}
                    />
                  </div>

                  <div>
                    <label style={slackLabelStyle}>Strict Rules & Limitations</label>
                    <textarea
                      rows={2}
                      value={profileDraft.aiRules || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, profile: true }));
                        setProfileDraft(prev => ({ ...prev, aiRules: e.target.value }));
                      }}
                      placeholder="e.g. Do not promise discounts without manager approval."
                      style={{ ...slackInputStyle, resize: 'vertical' }}
                    />
                  </div>

                  {editFlags.profile && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button onClick={handleSaveProfile} style={slackPrimaryBtnStyle}>
                        Save Profile & Sync to APK
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 4: SPAM & HOURS SCHEDULE ─── */}
            {activeTab === 'spam_schedule' && (
              <div style={slackCardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: '#1d1c1d' }}>
                  Spam Protection & Hours Schedule
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                  Configure rate limiting, message window caps, and operational hours.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {/* Spam Controls */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#1d1c1d' }}>Spam Protection</span>
                      <div
                        onClick={() => {
                          setEditFlags(prev => ({ ...prev, spam: true }));
                          setSpamDraft(prev => ({ ...prev, spamEnabled: !prev.spamEnabled }));
                        }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                          background: spamDraft.spamEnabled !== false ? '#e6f4ea' : '#fce8e6',
                          color: spamDraft.spamEnabled !== false ? '#137333' : '#c5221f'
                        }}
                      >
                        {spamDraft.spamEnabled !== false ? 'ENABLED' : 'DISABLED'}
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
                          <span style={{ color: '#475569' }}>Cooldown (seconds):</span>
                        </div>
                        <input
                          type="number"
                          value={spamDraft.cooldownSeconds ?? 90}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, cooldownSeconds: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...slackInputStyle, width: '70px' }}
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
                          <span style={{ color: '#475569' }}>Max Replies:</span>
                        </div>
                        <input
                          type="number"
                          value={spamDraft.maxReplies ?? 3}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, maxReplies: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...slackInputStyle, width: '70px' }}
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
                          <span style={{ color: '#475569' }}>Window (minutes):</span>
                        </div>
                        <input
                          type="number"
                          value={spamDraft.windowMinutes ?? 10}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, windowMinutes: parseInt(e.target.value) || 0 }));
                          }}
                          style={{ ...slackInputStyle, width: '70px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedule Controls */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#1d1c1d' }}>Operating Hours</span>
                      <div
                        onClick={() => {
                          setEditFlags(prev => ({ ...prev, spam: true }));
                          setSpamDraft(prev => ({ ...prev, scheduleEnabled: !prev.scheduleEnabled }));
                        }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                          background: spamDraft.scheduleEnabled ? '#e6f4ea' : '#fce8e6',
                          color: spamDraft.scheduleEnabled ? '#137333' : '#c5221f'
                        }}
                      >
                        {spamDraft.scheduleEnabled ? 'ENABLED' : 'DISABLED'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#475569' }}>Mode:</span>
                        <select
                          value={spamDraft.scheduleMode || 'ONLY_DURING'}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, scheduleMode: e.target.value }));
                          }}
                          style={{ ...slackInputStyle, width: '140px' }}
                        >
                          <option value="ONLY_DURING">Reply During Hours</option>
                          <option value="OUTSIDE_ONLY">Reply Outside Hours</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#475569' }}>Start / End Time:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="time"
                            value={spamDraft.scheduleStart || '09:00'}
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, scheduleStart: e.target.value }));
                            }}
                            style={{ ...slackInputStyle, width: '85px' }}
                          />
                          <input
                            type="time"
                            value={spamDraft.scheduleEnd || '18:00'}
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, scheduleEnd: e.target.value }));
                            }}
                            style={{ ...slackInputStyle, width: '85px' }}
                          />
                        </div>
                      </div>

                      <div>
                        <span style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Active Days:</span>
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
                                  background: isSelected ? '#1264a3' : '#ffffff',
                                  border: isSelected ? '1px solid #1264a3' : '1px solid #cbd5e1',
                                  color: isSelected ? '#ffffff' : '#475569',
                                  borderRadius: '4px',
                                  padding: '4px 6px',
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Out of Hours Message:</span>
                        <textarea
                          rows={2}
                          value={spamDraft.outOfHoursMsg || ''}
                          onChange={(e) => {
                            setEditFlags(prev => ({ ...prev, spam: true }));
                            setSpamDraft(prev => ({ ...prev, outOfHoursMsg: e.target.value }));
                          }}
                          style={{ ...slackInputStyle, resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {editFlags.spam && (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleSaveSpamSchedule} style={slackPrimaryBtnStyle}>
                        Save Spam & Schedule Rules
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 5: MANUAL REPLY LIST ─── */}
            {activeTab === 'blacklist' && (
              <div style={slackCardStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', color: '#1d1c1d' }}>
                  Manual Reply List (Bypass AI)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
                  Numbers in this list skip automatic AI responses so human staff can answer manually.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    id="newBlockInput"
                    type="text"
                    placeholder="Enter phone number (+1...)"
                    style={{ ...slackInputStyle, maxWidth: '280px' }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById('newBlockInput');
                      if (el && el.value) {
                        handleAddBlockedNumber(el.value);
                        el.value = '';
                      }
                    }}
                    style={slackPrimaryBtnStyle}
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
                    selectedUser.blacklist.map(phone => (
                      <div
                        key={phone}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1d1c1d' }}>{phone}</span>
                        <button
                          onClick={() => handleRemoveBlockedNumber(phone)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#e01e5a',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
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
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '48px 20px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            Select a store account on the left or create a new store to view configuration.
          </div>
        )}

      </div>

      {/* CREATE NEW STORE USER MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0', color: '#1d1c1d' }}>
              Create Store Account
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
              Provision client credentials for instant on-device APK login.
            </p>

            <form onSubmit={handleCreateNewUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={slackLabelStyle}>User ID (Required for APK Login)</label>
                <input
                  type="text"
                  placeholder="e.g. store_downtown_01"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  style={slackInputStyle}
                  required
                />
              </div>

              <div>
                <label style={slackLabelStyle}>Password (Required)</label>
                <input
                  type="password"
                  placeholder="Password..."
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  style={slackInputStyle}
                  required
                />
              </div>

              <div>
                <label style={slackLabelStyle}>Store / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Bakery"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  style={slackInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={slackLabelStyle}>Initial Balance ($)</label>
                  <input
                    type="number"
                    step="1.00"
                    value={newInitialBal}
                    onChange={(e) => setNewInitialBal(e.target.value)}
                    style={slackInputStyle}
                  />
                </div>
                <div>
                  <label style={slackLabelStyle}>Message Fee ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newFixedFee}
                    onChange={(e) => setNewFixedFee(e.target.value)}
                    style={slackInputStyle}
                  />
                </div>
              </div>

              {createError && (
                <div style={{ color: '#b91c1c', fontSize: '12px', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={slackPrimaryBtnStyle}
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

// ─── SLACK ENTERPRISE DESIGN STYLES ───

const slackPrimaryBtnStyle = {
  background: '#007a5a',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  fontWeight: '700',
  fontSize: '13px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px'
};

const slackSmallBtnStyle = {
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  color: '#1d1c1d',
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '700',
  cursor: 'pointer'
};

const slackCardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '0 0 12px 12px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
};

const slackMetricCardStyle = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '12px'
};

const slackInputStyle = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '8px 10px',
  color: '#1d1c1d',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box'
};

const slackLabelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '4px'
};
