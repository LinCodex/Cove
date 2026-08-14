import React, { useState, useEffect, useRef } from 'react';
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
  Hash,
  Sparkles,
  Phone,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  User,
  Activity,
  LayoutDashboard,
  Inbox,
  Calendar,
  BarChart2,
  BookOpen,
  Headphones,
  Users,
  TrendingUp,
  Settings,
  Download,
  Filter,
  MoreVertical,
  Mail,
  ExternalLink,
  ChevronLeft,
  Flame,
  CheckCircle2,
  X,
  Menu
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
  const [navSection, setNavSection] = useState('leads'); // 'leads', 'dashboard', 'inbox', 'analytics', 'settings'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'activity', 'pricing', 'profile', 'spam_schedule', 'blacklist'
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [saveToast, setSaveToast] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      triggerToast(`Store "${payload.id}" created successfully!`);
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

  // Overall Statistics for KPI Cards
  const totalStoresCount = users.length;
  const activeStoresCount = users.filter(u => (u.balance || 0) > 0).length;
  const totalSmsCount = users.reduce((sum, u) => sum + (u.activities?.length || 0), 0);
  const totalRevenue = users.reduce((sum, u) => sum + (u.activities?.reduce((s, a) => s + (a.cost || 0), 0) || 0), 0);

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
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
          textAlign: 'center'
        }}>
          {/* AI Manager Blue Spark Icon */}
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1d61ff 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 8px 24px rgba(29, 97, 255, 0.25)'
          }}>
            <Sparkles size={26} color="#ffffff" />
          </div>

          <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            AI Manager Console
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            Sign in with Master Administrator password to manage store leads and live APK sync.
          </p>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Enter password..."
                value={authPassword}
                onChange={(e) => { setAuthPassword(e.target.value); setAuthError(''); }}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#0f172a',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease'
                }}
                required
                autoFocus
              />
            </div>

            {authError && (
              <div style={{
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '10px',
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
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                transition: 'transform 0.15s ease, background 0.15s ease'
              }}
            >
              {authLoading ? 'Signing in...' : 'Sign In to Console'}
              <ChevronRight size={16} />
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
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={14} /> Back to Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED DASHBOARD (EXACT REFERENCE UI) ───
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

      {/* ─── TOAST NOTIFICATION ─── */}
      {saveToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '14px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ─── LEFT SIDEBAR (EXACT MATCH TO REFERENCE IMAGE) ─── */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #f1f5f9',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxSizing: 'border-box',
        minHeight: '100vh'
      }} className="hidden-mobile-sidebar">

        <div>
          {/* Logo Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingLeft: '4px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1d61ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(29, 97, 255, 0.3)'
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>
              AI Manager
            </span>
          </div>

          {/* Quick Search Pill Bar (⌘ S) */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '24px'
          }}>
            <Search size={14} color="#94a3b8" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#0f172a',
                width: '100%'
              }}
            />
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#94a3b8',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '2px 5px',
              borderRadius: '4px'
            }}>
              ⌘ S
            </span>
          </div>

          {/* Nav Section: OVERVIEW */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0 8px 8px 8px'
            }}>
              <span>Overview</span>
              <ChevronDown size={14} color="#94a3b8" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SidebarNavItem 
                icon={LayoutDashboard} 
                label="Dashboard" 
                active={navSection === 'dashboard'} 
                onClick={() => setNavSection('dashboard')} 
              />
              <SidebarNavItem 
                icon={Inbox} 
                label="Inbox" 
                active={navSection === 'inbox'} 
                onClick={() => setNavSection('inbox')} 
              />
              <SidebarNavItem 
                icon={Users} 
                label="Manage Leads" 
                active={navSection === 'leads'} 
                onClick={() => setNavSection('leads')} 
              />
              <SidebarNavItem 
                icon={Calendar} 
                label="Multi-calendar" 
                active={navSection === 'calendar'} 
                onClick={() => setNavSection('calendar')} 
              />
            </div>
          </div>

          {/* Nav Section: TOOLS */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0 8px 8px 8px'
            }}>
              <span>Tools</span>
              <ChevronDown size={14} color="#94a3b8" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SidebarNavItem 
                icon={BarChart2} 
                label="Analytics" 
                active={navSection === 'analytics'} 
                onClick={() => setNavSection('analytics')} 
              />
              <SidebarNavItem 
                icon={BookOpen} 
                label="Formation" 
                active={navSection === 'formation'} 
                onClick={() => setNavSection('formation')} 
              />
              <SidebarNavItem 
                icon={Headphones} 
                label="Support" 
                active={navSection === 'support'} 
                onClick={() => setNavSection('support')} 
              />
            </div>
          </div>

          {/* Nav Section: MANAGER */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0 8px 8px 8px'
            }}>
              <span>Manager</span>
              <ChevronDown size={14} color="#94a3b8" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SidebarNavItem 
                icon={User} 
                label="User" 
                active={navSection === 'user'} 
                onClick={() => setNavSection('user')} 
              />
              <SidebarNavItem 
                icon={TrendingUp} 
                label="Performance" 
                active={navSection === 'performance'} 
                onClick={() => setNavSection('performance')} 
              />
              <SidebarNavItem 
                icon={Settings} 
                label="Settings" 
                active={navSection === 'settings'} 
                onClick={() => setNavSection('settings')} 
              />
            </div>
          </div>

        </div>

        {/* Bottom Area: Upgrade Card & User Profile */}
        <div>
          {/* Upgrade to Pro Card */}
          <div style={{
            background: '#fafafa',
            border: '1px solid #f1f5f9',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span>Upgrade to Pro</span>
              <Flame size={14} color="#f97316" />
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              Get 3 month free and unlock all Pro features
            </p>
            <button
              onClick={() => triggerToast('Pro plan is already enabled for Master Admin!')}
              style={{
                width: '100%',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 0',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Upgrade
            </button>
          </div>

          {/* User Profile Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 4px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '13px',
                color: '#475569'
              }}>
                D
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>David</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Admin</div>
              </div>
            </div>
            <button
              onClick={handleAdminLogout}
              title="Sign Out"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main style={{
        flex: 1,
        padding: '24px 32px',
        overflowY: 'auto',
        maxWidth: '1400px',
        boxSizing: 'border-box'
      }}>

        {/* Top Breadcrumbs & Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
            <button 
              onClick={onBackToHome} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span>Overview</span>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: '600' }}>Manage Leads</span>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                fetchUsers();
                triggerToast('Syncing all stores with Supabase...');
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0f172a',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <Download size={14} />
              <span>Export</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
              }}
            >
              <Plus size={14} />
              <span>+ New Lead</span>
            </button>
          </div>
        </div>

        {/* Page Title */}
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0', letterSpacing: '-0.03em' }}>
          All Leads
        </h1>

        {/* ─── 4 TOP KPI METRIC CARDS (EXACT MATCH TO SCREENSHOT) ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Card 1: Total lead */}
          <KpiCard
            icon={Users}
            delta="+ 12%"
            deltaPositive={true}
            title="Total lead"
            value={totalStoresCount > 0 ? (3420 + totalStoresCount).toLocaleString() : '3,421'}
            subtitle="VS. Last period"
          />

          {/* Card 2: In progress */}
          <KpiCard
            icon={Activity}
            delta="+ 8%"
            deltaPositive={true}
            title="In progress"
            value={activeStoresCount > 0 ? (80 + activeStoresCount).toString() : '87'}
            subtitle="VS. Last period"
          />

          {/* Card 3: New Today */}
          <KpiCard
            icon={MessageSquare}
            delta="- 18%"
            deltaPositive={false}
            title="New Today"
            value={totalSmsCount > 0 ? totalSmsCount.toString() : '42'}
            subtitle="VS. Last period"
          />

          {/* Card 4: Meetings Booked */}
          <KpiCard
            icon={Calendar}
            delta="+ 15%"
            deltaPositive={true}
            title="Meetings Booked"
            value="124"
            subtitle="VS. Last period"
          />
        </div>

        {/* ─── MAIN TABLE CONTAINER CARD ("Lead list") ─── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #f1f5f9',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          marginBottom: '24px'
        }}>

          {/* Header of Table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Lead list
            </h3>

            {/* Table Action Icon Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TableIconButton icon={Search} onClick={() => {}} />
              <TableIconButton icon={Filter} onClick={() => {}} />
              <TableIconButton icon={Download} onClick={() => triggerToast('Exporting table records...')} />
              <TableIconButton icon={MoreVertical} onClick={() => {}} />
            </div>
          </div>

          {/* Custom Responsive Table (Zero Horizontal Scroll) */}
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px', width: '30px' }}>
                    <CustomCheckbox checked={false} onChange={() => {}} />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: '600' }}>Lead / Store</th>
                  <th style={{ padding: '12px 14px', fontWeight: '600' }}>Service</th>
                  <th style={{ padding: '12px 14px', fontWeight: '600' }}>Stage</th>
                  <th style={{ padding: '12px 14px', fontWeight: '600' }}>Company</th>
                  <th style={{ padding: '12px 14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: '600' }}>Last Contact</th>
                  <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                      No store leads found. Click "+ New Lead" to provision an account.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const isSelected = selectedUser && user.id === selectedUser.id;
                    const isPaused = (user.balance || 0) <= 0;
                    
                    // Demo values matching screenshot style
                    const services = ['Consulting', 'Training', 'Basic', 'Premium', 'Standard'];
                    const serviceName = user.pricingMode === 'fixed_fee' ? 'Premium' : services[idx % services.length];
                    const progressPercent = isPaused ? 0 : 35;
                    const statuses = isPaused ? 'Paused' : (idx === 0 ? 'New' : idx === 1 ? 'Meeting' : idx === 4 ? 'Qualified' : idx === 8 ? 'Follow Up' : 'Open');

                    return (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        style={{
                          borderBottom: '1px solid #f8fafc',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(29, 97, 255, 0.03)' : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '12px 14px' }} onClick={(e) => e.stopPropagation()}>
                          <CustomCheckbox checked={isSelected} onChange={() => setSelectedUserId(user.id)} />
                        </td>

                        {/* Lead / Store with Avatar */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              fontWeight: '700',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {(user.storeName || user.id).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#0f172a' }}>
                                {user.storeName || user.id}
                              </div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                Balance: ${(user.balance || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Service */}
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          {serviceName}
                        </td>

                        {/* Stage with Segmented Progress Bar */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '80px' }}>
                              <div style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', marginBottom: '3px' }}>
                                {isPaused ? 'Paused' : (idx % 2 === 0 ? 'Contacted' : 'Qualified')}
                              </div>
                              <SegmentedBar filled={isPaused ? 0 : 3} total={5} />
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{progressPercent}%</span>
                          </div>
                        </td>

                        {/* Company / Store Address */}
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{user.address || `${user.id}.corp`}</span>
                            <ExternalLink size={11} color="#94a3b8" />
                          </div>
                        </td>

                        {/* Status Pill */}
                        <td style={{ padding: '12px 14px' }}>
                          <StatusPill status={statuses} />
                        </td>

                        {/* Last Contact */}
                        <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '12px' }}>
                          {idx === 0 ? '5 min ago' : idx === 1 ? '12 min ago' : `${idx + 1} hr ago`}
                        </td>

                        {/* Action Icons */}
                        <td style={{ padding: '12px 14px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <ActionIconButton icon={Phone} onClick={() => triggerToast(`Dialing ${user.phone || user.id}...`)} />
                            <ActionIconButton icon={MessageSquare} onClick={() => { setSelectedUserId(user.id); setActiveTab('activity'); }} />
                            <ActionIconButton icon={Trash2} danger={true} onClick={() => handleDeleteUser(user.id)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* ─── SELECTED STORE DETAILED MANAGEMENT TABS ─── */}
        {selectedUser && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
          }}>

            {/* Store Title & Quick Balance Refill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {selectedUser.storeName || selectedUser.id}
                  </h2>
                  <StatusPill status={(selectedUser.balance || 0) <= 0 ? 'Paused' : 'Active'} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>User ID: <strong>{selectedUser.id}</strong></span>
                  <span>Phone: <strong>{selectedUser.phone || 'Not set'}</strong></span>
                  <span>Password: <strong>{showPasswordMap[selectedUser.id] ? selectedUser.password : '••••••••'}</strong>
                    <button 
                      onClick={() => setShowPasswordMap(prev => ({ ...prev, [selectedUser.id]: !prev[selectedUser.id] }))}
                      style={{ background: 'none', border: 'none', color: '#1d61ff', cursor: 'pointer', marginLeft: '6px', fontSize: '11px', fontWeight: '600' }}
                    >
                      {showPasswordMap[selectedUser.id] ? 'Hide' : 'Show'}
                    </button>
                  </span>
                </div>
              </div>

              {/* Balance Card with Quick Refill Buttons */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                padding: '12px 18px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Current Balance</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: (selectedUser.balance || 0) <= 0 ? '#dc2626' : '#10b981',
                  marginBottom: '8px'
                }}>
                  ${(selectedUser.balance || 0).toFixed(2)}
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => handleUpdateBalance(5.00)} style={pillBtnStyle}>+$5</button>
                  <button onClick={() => handleUpdateBalance(20.00)} style={pillBtnStyle}>+$20</button>
                  <button onClick={() => handleUpdateBalance(-1.00)} style={pillBtnStyle}>-$1</button>
                  <button onClick={handleSetZeroBalance} style={{ ...pillBtnStyle, color: '#dc2626' }}>Set $0</button>
                </div>
              </div>
            </div>

            {/* Custom Tab Switcher */}
            <div style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              {[
                { id: 'overview', label: 'Store Info & Address', icon: StoreIcon },
                { id: 'activity', label: 'Live SMS Activity', icon: MessageSquare },
                { id: 'pricing', label: 'Pricing & Token Rates', icon: DollarSign },
                { id: 'profile', label: 'AI Knowledge & FAQ', icon: Sparkles },
                { id: 'spam_schedule', label: 'Spam & Hours', icon: Clock },
                { id: 'blacklist', label: 'Manual Reply List', icon: Ban }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                const IconComp = tab.icon || Sparkles;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: isActive ? '#0f172a' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#64748b',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComp size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB: STORE INFO */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={formLabelStyle}>Store / Business Name</label>
                  <input
                    type="text"
                    value={storeInfoDraft.storeName || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, storeInfo: true }));
                      setStoreInfoDraft(prev => ({ ...prev, storeName: e.target.value }));
                    }}
                    style={customInputStyle}
                  />
                </div>

                <div>
                  <label style={formLabelStyle}>Phone Number</label>
                  <input
                    type="text"
                    value={storeInfoDraft.phone || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, storeInfo: true }));
                      setStoreInfoDraft(prev => ({ ...prev, phone: e.target.value }));
                    }}
                    placeholder="+1 (555) 000-0000"
                    style={customInputStyle}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={formLabelStyle}>Store Address</label>
                  <input
                    type="text"
                    value={storeInfoDraft.address || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, storeInfo: true }));
                      setStoreInfoDraft(prev => ({ ...prev, address: e.target.value }));
                    }}
                    placeholder="e.g. 123 Main St, Suite 400"
                    style={customInputStyle}
                  />
                </div>

                {editFlags.storeInfo && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSaveStoreInfo} style={solidPrimaryBtnStyle}>
                      Save Store Info
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LIVE SMS ACTIVITY */}
            {activeTab === 'activity' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                    Activity Ledger ({selectedUser.activities?.length || 0} messages)
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'sent', 'blocked'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        style={{
                          background: activityFilter === f ? '#0f172a' : '#f8fafc',
                          color: activityFilter === f ? '#ffffff' : '#64748b',
                          border: 'none',
                          borderRadius: '12px',
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                  {(!selectedUser.activities || selectedUser.activities.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '13px' }}>
                      No SMS activity recorded yet. Incoming customer SMS will appear here in real time.
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
                          border: '1px solid #f1f5f9',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{act.sender}</span>
                            <span style={{ color: '#94a3b8' }}>{act.time}</span>
                          </div>
                          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', fontSize: '12px' }}>
                            <strong>In:</strong> {act.incoming}
                          </div>
                          {act.reply && (
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', color: '#1d4ed8' }}>
                              <strong>AI:</strong> {act.reply}
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

            {/* TAB: PRICING & TOKEN RATES */}
            {activeTab === 'pricing' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <PricingModeCard
                  title="Fixed Flat Fee"
                  desc="Deduct a fixed dollar amount per auto-reply."
                  active={selectedUser.pricingMode === 'fixed_fee'}
                  onClick={() => handleUpdatePricing('fixed_fee', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>$</span>
                    <input
                      type="number"
                      step="0.001"
                      value={selectedUser.fixedFeePerMessage || 0.005}
                      onChange={(e) => handleUpdatePricing('fixed_fee', e.target.value, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                      style={{ ...customInputStyle, width: '90px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>/ message</span>
                  </div>
                </PricingModeCard>

                <PricingModeCard
                  title="Custom Token Rates"
                  desc="Bill real input and output token counts."
                  active={selectedUser.pricingMode === 'token_custom'}
                  onClick={() => handleUpdatePricing('token_custom', selectedUser.fixedFeePerMessage, selectedUser.customInputPrice1M, selectedUser.customOutputPrice1M)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '12px' }}>
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
                </PricingModeCard>

                <PricingModeCard
                  title="Direct AI Pass-Through"
                  desc="Standard supplier token pricing."
                  active={selectedUser.pricingMode === 'default_ai'}
                  onClick={() => handleUpdatePricing('default_ai', 0, 0, 0)}
                >
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                    Gemini 3.1 Flash Lite ($0.25 / $1.50)
                  </div>
                </PricingModeCard>
              </div>
            )}

            {/* TAB: STORE PROFILE & AI SETUP */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={formLabelStyle}>Business / Brand Name</label>
                  <input
                    type="text"
                    value={profileDraft.businessName || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, businessName: e.target.value }));
                    }}
                    style={customInputStyle}
                  />
                </div>

                <div>
                  <label style={formLabelStyle}>Business Details, Services & FAQ</label>
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

                <div>
                  <label style={formLabelStyle}>AI Reply Tone</label>
                  <input
                    type="text"
                    value={profileDraft.replyTone || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, replyTone: e.target.value }));
                    }}
                    style={customInputStyle}
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
                    style={{ ...customInputStyle, resize: 'vertical' }}
                  />
                </div>

                {editFlags.profile && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button onClick={handleSaveProfile} style={solidPrimaryBtnStyle}>
                      Save Profile & Sync to APK
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SPAM & HOURS */}
            {activeTab === 'spam_schedule' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>Spam Protection</span>
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
                      <span style={{ color: '#64748b' }}>Cooldown (seconds):</span>
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
                      <span style={{ color: '#64748b' }}>Max Replies:</span>
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
                      <span style={{ color: '#64748b' }}>Window (minutes):</span>
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

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>Operating Hours</span>
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
                                padding: '4px 8px',
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

                {editFlags.spam && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSaveSpamSchedule} style={solidPrimaryBtnStyle}>
                      Save Spam & Schedule Rules
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MANUAL REPLY LIST */}
            {activeTab === 'blacklist' && (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    id="newBlockInput"
                    type="text"
                    placeholder="Enter phone number (+1...)"
                    style={{ ...customInputStyle, maxWidth: '280px' }}
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
                      No numbers in manual reply list.
                    </div>
                  ) : (
                    selectedUser.blacklist.map(num => (
                      <div key={num} style={{
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        padding: '10px 16px',
                        borderRadius: '10px',
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
            borderRadius: '24px',
            padding: '32px',
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
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              Provision client credentials for instant on-device APK login.
            </p>

            <form onSubmit={handleCreateNewUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    borderRadius: '20px',
                    padding: '8px 18px',
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

// ─── REUSABLE CUSTOM UI COMPONENTS ───

function SidebarNavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '9px 12px',
        borderRadius: '10px',
        border: 'none',
        background: active ? '#f1f5f9' : 'transparent',
        color: active ? '#0f172a' : '#64748b',
        fontWeight: active ? '700' : '500',
        fontSize: '13px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease'
      }}
    >
      <Icon size={16} color={active ? '#0f172a' : '#94a3b8'} />
      <span>{label}</span>
    </button>
  );
}

function KpiCard({ icon: Icon, delta, deltaPositive, title, value, subtitle }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #f1f5f9',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={16} color="#64748b" />
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '3px 8px',
          borderRadius: '20px',
          background: deltaPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: deltaPositive ? '#059669' : '#dc2626'
        }}>
          {delta}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          {value}
        </div>
        <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function SegmentedBar({ filled, total = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '12px',
            height: '4px',
            borderRadius: '2px',
            background: i < filled ? '#10b981' : '#f1f5f9',
            transition: 'background 0.2s ease'
          }}
        />
      ))}
    </div>
  );
}

function StatusPill({ status }) {
  let bg = 'rgba(100, 116, 139, 0.08)';
  let color = '#475569';
  let border = '1px solid #cbd5e1';

  if (status === 'New') {
    bg = 'rgba(6, 182, 212, 0.08)';
    color = '#0891b2';
    border = '1px solid #06b6d4';
  } else if (status === 'Meeting') {
    bg = 'rgba(249, 115, 22, 0.08)';
    color = '#ea580c';
    border = '1px solid #f97316';
  } else if (status === 'Qualified' || status === 'Active') {
    bg = 'rgba(16, 185, 129, 0.08)';
    color = '#059669';
    border = '1px solid #10b981';
  } else if (status === 'Follow Up') {
    bg = 'rgba(217, 70, 239, 0.08)';
    color = '#c026d3';
    border = '1px solid #d946ef';
  } else if (status === 'Paused') {
    bg = 'rgba(239, 68, 68, 0.08)';
    color = '#dc2626';
    border = '1px solid #ef4444';
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      background: bg,
      color: color,
      border: border
    }}>
      {status}
    </span>
  );
}

function CustomCheckbox({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '5px',
        border: checked ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
        background: checked ? '#0f172a' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      {checked && <Check size={11} color="#ffffff" strokeWidth={3} />}
    </div>
  );
}

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

function TableIconButton({ icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#64748b'
      }}
    >
      <Icon size={14} />
    </button>
  );
}

function ActionIconButton({ icon: Icon, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        background: '#f8fafc',
        border: '1px solid #f1f5f9',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: danger ? '#dc2626' : '#64748b'
      }}
    >
      <Icon size={12} />
    </button>
  );
}

function PricingModeCard({ title, desc, active, onClick, children }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? '#ffffff' : '#f8fafc',
        border: active ? '2px solid #0f172a' : '1px solid #f1f5f9',
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
        {desc}
      </div>
      {children}
    </div>
  );
}

function StoreIcon(props) {
  return <Users {...props} />;
}

// ─── STYLES ───

const customInputStyle = {
  width: '100%',
  background: '#f8fafc',
  border: '1.5px solid #f1f5f9',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '13px',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease'
};

const formLabelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '700',
  color: '#475569',
  marginBottom: '6px'
};

const solidPrimaryBtnStyle = {
  background: '#0f172a',
  color: '#ffffff',
  border: 'none',
  borderRadius: '20px',
  padding: '8px 20px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
};

const pillBtnStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  color: '#0f172a',
  padding: '4px 10px',
  borderRadius: '14px',
  fontSize: '11px',
  fontWeight: '700',
  cursor: 'pointer'
};
