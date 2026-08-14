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
  Key,
  Layers,
  Eye,
  EyeOff,
  Bot,
  Receipt,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  History
} from 'lucide-react';

const PROVIDER_DEFAULTS = {
  GEMINI: {
    name: 'Google Gemini',
    model: 'gemini-3.1-flash-lite',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    placeholder: 'AIzaSy...'
  },
  OPENAI: {
    name: 'OpenAI (ChatGPT)',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    placeholder: 'sk-proj-...'
  },
  GROK: {
    name: 'xAI Grok',
    model: 'grok-4.1-fast',
    baseUrl: 'https://api.x.ai/v1',
    placeholder: 'xai-...'
  },
  DEEPSEEK: {
    name: 'DeepSeek',
    model: 'deepseek-v4-flash',
    baseUrl: 'https://api.deepseek.com',
    placeholder: 'sk-...'
  },
  CLAUDE: {
    name: 'Anthropic Claude',
    model: 'claude-3-5-haiku-20241022',
    baseUrl: 'https://api.anthropic.com/v1',
    placeholder: 'sk-ant-...'
  }
};

export default function MasterControlPanel({ onBackToHome }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cove_master_admin_auth') === 'true';
  });
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation and UI State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'ai_keys', 'activity', 'spam_schedule', 'pricing', 'blacklist'
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [saveToast, setSaveToast] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [showKeyMap, setShowKeyMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [customBalInput, setCustomBalInput] = useState('10.00');

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

  // Change Credentials Modal State
  const [showCredModal, setShowCredModal] = useState(false);
  const [credUserId, setCredUserId] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credError, setCredError] = useState('');
  const [credLoading, setCredLoading] = useState(false);

  // Balance History & Ledger State
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [customNote, setCustomNote] = useState('');

  // Draft States for current store
  const [profileDraft, setProfileDraft] = useState({ 
    storeName: '', 
    businessInfo: '', 
    replyTone: '', 
    aiRules: '' 
  });
  const [spamDraft, setSpamDraft] = useState({});
  const [aiDraft, setAiDraft] = useState({
    provider: 'GEMINI',
    apiKey: '',
    model: 'gemini-3.1-flash-lite',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    fallbackMessage: 'Thank you for reaching out! We received your message and will reply shortly.',
    backupEnabled: true,
    backupSlot1: { enabled: false, provider: 'OPENAI', apiKey: '', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
    backupSlot2: { enabled: false, provider: 'GROK', apiKey: '', model: 'grok-4.1-fast', baseUrl: 'https://api.x.ai/v1' },
    backupSlot3: { enabled: false, provider: 'DEEPSEEK', apiKey: '', model: 'deepseek-v4-flash', baseUrl: 'https://api.deepseek.com' },
    backupSlot4: { enabled: false, provider: 'CLAUDE', apiKey: '', model: 'claude-3-5-haiku-20241022', baseUrl: 'https://api.anthropic.com/v1' },
    backupSlot5: { enabled: false, provider: 'GEMINI', apiKey: '', model: 'gemini-3.1-flash-lite', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' }
  });

  const [editFlags, setEditFlags] = useState({ profile: false, spam: false, ai: false });

  useEffect(() => {
    setEditFlags({ profile: false, spam: false, ai: false });
  }, [selectedUserId]);

  useEffect(() => {
    const u = users.find(usr => usr.id === selectedUserId);
    if (u) {
      setProfileDraft(prev => editFlags.profile ? prev : { 
        storeName: u.storeName || u.id, 
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

      setAiDraft(prev => editFlags.ai ? prev : {
        provider: u.aiConfig?.provider || 'GEMINI',
        apiKey: u.aiConfig?.apiKey || '',
        model: u.aiConfig?.model || PROVIDER_DEFAULTS[u.aiConfig?.provider || 'GEMINI'].model,
        baseUrl: u.aiConfig?.baseUrl || PROVIDER_DEFAULTS[u.aiConfig?.provider || 'GEMINI'].baseUrl,
        fallbackMessage: u.aiConfig?.fallbackMessage || 'Thank you for reaching out! We received your message and will reply shortly.',
        backupEnabled: u.aiConfig?.backupEnabled ?? true,
        backupSlot1: u.aiConfig?.backupSlot1 || { enabled: false, provider: 'OPENAI', apiKey: '', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
        backupSlot2: u.aiConfig?.backupSlot2 || { enabled: false, provider: 'GROK', apiKey: '', model: 'grok-4.1-fast', baseUrl: 'https://api.x.ai/v1' },
        backupSlot3: u.aiConfig?.backupSlot3 || { enabled: false, provider: 'DEEPSEEK', apiKey: '', model: 'deepseek-v4-flash', baseUrl: 'https://api.deepseek.com' },
        backupSlot4: u.aiConfig?.backupSlot4 || { enabled: false, provider: 'CLAUDE', apiKey: '', model: 'claude-3-5-haiku-20241022', baseUrl: 'https://api.anthropic.com/v1' },
        backupSlot5: u.aiConfig?.backupSlot5 || { enabled: false, provider: 'GEMINI', apiKey: '', model: 'gemini-3.1-flash-lite', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' }
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
        aiConfig: {
          provider: 'GEMINI',
          apiKey: '',
          model: 'gemini-3.1-flash-lite',
          baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
          fallbackMessage: 'Thank you for reaching out! We received your message and will reply shortly.',
          backupEnabled: true,
          backupSlot1: { enabled: false, provider: 'OPENAI', apiKey: '', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
          backupSlot2: { enabled: false, provider: 'GROK', apiKey: '', model: 'grok-4.1-fast', baseUrl: 'https://api.x.ai/v1' },
          backupSlot3: { enabled: false, provider: 'DEEPSEEK', apiKey: '', model: 'deepseek-v4-flash', baseUrl: 'https://api.deepseek.com' },
          backupSlot4: { enabled: false, provider: 'CLAUDE', apiKey: '', model: 'claude-3-5-haiku-20241022', baseUrl: 'https://api.anthropic.com/v1' },
          backupSlot5: { enabled: false, provider: 'GEMINI', apiKey: '', model: 'gemini-3.1-flash-lite', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' }
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

  const handleUpdateBalance = (delta, customReason = '') => {
    if (!selectedUser) return;
    const currentBal = parseFloat(selectedUser.balance) || 0;
    const nextBal = Math.max(0, currentBal + delta);
    const newTx = {
      id: Date.now(),
      timestampMillis: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString(),
      type: delta > 0 ? 'Top-Up' : 'Manual Adjustment',
      amount: delta,
      balanceAfter: nextBal,
      description: customReason || (delta > 0 ? `Admin Top-Up +$${delta.toFixed(2)}` : `Admin Deduction -$${Math.abs(delta).toFixed(2)}`)
    };

    const updatedHistory = [newTx, ...(selectedUser.balanceHistory || [])].slice(0, 200);
    const updated = {
      ...selectedUser,
      balance: nextBal,
      status: nextBal <= 0 ? 'Paused (Zero Balance)' : 'Active',
      balanceHistory: updatedHistory
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Balance: ${delta >= 0 ? '+' : ''}$${delta.toFixed(2)} (New: $${nextBal.toFixed(2)})`);
  };

  const handleSetZeroBalance = () => {
    if (!selectedUser) return;
    const currentBal = parseFloat(selectedUser.balance) || 0;
    const delta = -currentBal;
    const newTx = {
      id: Date.now(),
      timestampMillis: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString(),
      type: 'Manual Adjustment',
      amount: delta,
      balanceAfter: 0.00,
      description: 'Reset balance to $0.00'
    };
    const updatedHistory = [newTx, ...(selectedUser.balanceHistory || [])].slice(0, 200);
    const updated = {
      ...selectedUser,
      balance: 0.000,
      status: 'Paused (Zero Balance)',
      balanceHistory: updatedHistory
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    triggerToast(`Store balance reset to $0.00 (Auto-reply paused)`);
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

  const handleSaveCredentials = async (e) => {
    e?.preventDefault();
    if (!selectedUser) return;
    const oldId = selectedUser.id;
    const newId = credUserId.trim();
    const newPass = credPassword.trim();

    if (!newId || !newPass) {
      setCredError('Store User ID and APK Password cannot be empty');
      return;
    }

    setCredLoading(true);
    setCredError('');

    try {
      const updated = {
        ...selectedUser,
        id: newId,
        password: newPass
      };
      if (newId !== oldId) {
        updated.oldId = oldId;
      }

      const ok = await syncUserToServer(updated);
      if (!ok) {
        throw new Error('Failed to update credentials on server');
      }

      setUsers(prev => prev.map(u => u.id === oldId ? updated : u));
      if (newId !== oldId) {
        setSelectedUserId(newId);
      }
      setShowCredModal(false);
      triggerToast('Store credentials updated and synced to APK!');
      fetchUsers();
    } catch (err) {
      setCredError(err.message || 'Failed to save credentials');
    } finally {
      setCredLoading(false);
    }
  };

  const handleSaveProfile = () => {
    if (!selectedUser) return;
    const updated = { 
      ...selectedUser, 
      storeName: profileDraft.storeName,
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

  const handleSaveAiConfig = () => {
    if (!selectedUser) return;
    const updated = { ...selectedUser, aiConfig: aiDraft };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    syncUserToServer(updated);
    setEditFlags(prev => ({ ...prev, ai: false }));
    triggerToast('AI Models & Backup API Keys saved and pushed to APK!');
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
          <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
            Cove Master Control
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
            Enter Master Administrator password to configure store accounts, API keys & sync.
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
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
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

          {/* New Store Button */}
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
            <span>Create Store Account</span>
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
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <span>User ID: <strong>{selectedUser.id}</strong></span>
                  <span>APK Password: <strong>{showPasswordMap[selectedUser.id] ? selectedUser.password : '••••••••'}</strong>
                    <button 
                      onClick={() => setShowPasswordMap(prev => ({ ...prev, [selectedUser.id]: !prev[selectedUser.id] }))}
                      style={{ background: 'none', border: 'none', color: '#1d61ff', cursor: 'pointer', marginLeft: '6px', fontSize: '11px' }}
                    >
                      {showPasswordMap[selectedUser.id] ? 'Hide' : 'Show'}
                    </button>
                  </span>
                  <span>Active AI: <strong>{selectedUser.aiConfig?.provider || 'Gemini'}</strong></span>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setCredUserId(selectedUser.id);
                    setCredPassword(selectedUser.password || '');
                    setCredError('');
                    setShowCredModal(true);
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#0f172a'
                  }}
                >
                  <Key size={13} color="#0f172a" />
                  <span>Change Credentials</span>
                </button>

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
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              marginBottom: '20px'
            }}>
              {/* Card 1: Balance Controls with Custom Amount Input */}
              <div style={kpiCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Account Balance
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => handleUpdateBalance(5.00)} style={pillBtnStyle}>+$5</button>
                    <button onClick={() => handleUpdateBalance(20.00)} style={pillBtnStyle}>+$20</button>
                    <button onClick={handleSetZeroBalance} style={{ ...pillBtnStyle, color: '#dc2626' }}>Set $0</button>
                  </div>
                </div>

                <div style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: (selectedUser.balance || 0) <= 0 ? '#dc2626' : '#10b981',
                  margin: '4px 0 10px 0'
                }}>
                  ${(selectedUser.balance || 0).toFixed(2)}
                </div>

                {/* Custom Dollar Amount Add/Deduct/Set Controls */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: '1 1 90px' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '8px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>$</span>
                    <input
                      type="number"
                      step="1.00"
                      value={customBalInput}
                      onChange={(e) => setCustomBalInput(e.target.value)}
                      placeholder="0.00"
                      style={{ ...customInputStyle, paddingLeft: '22px', paddingRight: '6px', padding: '6px 6px 6px 20px', fontSize: '12px' }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const val = parseFloat(customBalInput);
                      if (!isNaN(val) && val > 0) handleUpdateBalance(val);
                    }}
                    style={{ ...solidPrimaryBtnStyle, padding: '7px 10px', fontSize: '11px', background: '#059669' }}
                    title="Add amount to balance"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => {
                      const val = parseFloat(customBalInput);
                      if (!isNaN(val) && val > 0) handleUpdateBalance(-val);
                    }}
                    style={{ ...solidPrimaryBtnStyle, padding: '7px 10px', fontSize: '11px', background: '#dc2626' }}
                    title="Deduct amount from balance"
                  >
                    - Deduct
                  </button>
                  <button
                    onClick={() => {
                      const val = parseFloat(customBalInput);
                      if (!isNaN(val) && val >= 0) {
                        const updated = {
                          ...selectedUser,
                          balance: val,
                          status: val <= 0 ? 'Paused (Zero Balance)' : 'Active'
                        };
                        setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
                        syncUserToServer(updated);
                        triggerToast(`Balance set to $${val.toFixed(2)}`);
                      }
                    }}
                    style={{ ...solidPrimaryBtnStyle, padding: '7px 10px', fontSize: '11px', background: '#0f172a' }}
                    title="Set balance to exact amount"
                  >
                    Set Exact
                  </button>
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
                  Primary Provider: <strong>{selectedUser.aiConfig?.provider || 'Gemini'}</strong>
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
                { id: 'profile', label: 'Store Profile & FAQ', icon: FileText },
                { id: 'ai_keys', label: 'AI Keys & Backups', icon: Key },
                { id: 'balance_history', label: 'Balance & Ledger', icon: Receipt },
                { id: 'activity', label: 'Live SMS Activity', icon: MessageSquare },
                { id: 'spam_schedule', label: 'Spam & Hours', icon: Clock },
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Store Identity & AI FAQ Knowledge
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Configure business profile, services, and FAQ rules for automated customer replies.
                    </p>
                  </div>
                  <button onClick={handleSaveProfile} style={solidPrimaryBtnStyle}>
                    Save Store Profile & FAQ
                  </button>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={formLabelStyle}>Store / Business Name</label>
                  <input
                    type="text"
                    value={profileDraft.storeName || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, storeName: e.target.value }));
                    }}
                    placeholder="e.g. Downtown Bakery"
                    style={customInputStyle}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={formLabelStyle}>Business Details, Services & FAQ Knowledge Base</label>
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
                    placeholder="e.g. Never guarantee discounts without manager approval."
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

            {/* ─── TAB 2: AI KEYS & BACKUP CHAIN CONFIGURATION ─── */}
            {activeTab === 'ai_keys' && (
              <div style={cardSectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      AI Provider & Backup API Key Chain
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Configure this store's primary AI engine and up to 5 automatic fallback keys.
                    </p>
                  </div>
                  <button onClick={handleSaveAiConfig} style={solidPrimaryBtnStyle}>
                    Save AI & Backup Keys to APK
                  </button>
                </div>

                {/* Primary AI Engine Card */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1d61ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={14} color="#ffffff" />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      Primary AI Provider
                    </span>
                  </div>

                  {/* Provider Selector Chips */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={formLabelStyle}>Select Primary Engine</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Object.keys(PROVIDER_DEFAULTS).map(provKey => {
                        const isSelected = aiDraft.provider === provKey;
                        const pInfo = PROVIDER_DEFAULTS[provKey];
                        return (
                          <button
                            key={provKey}
                            type="button"
                            onClick={() => {
                              setEditFlags(prev => ({ ...prev, ai: true }));
                              setAiDraft(prev => ({
                                ...prev,
                                provider: provKey,
                                model: pInfo.model,
                                baseUrl: pInfo.baseUrl
                              }));
                            }}
                            style={{
                              background: isSelected ? '#0f172a' : '#ffffff',
                              border: isSelected ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0',
                              color: isSelected ? '#ffffff' : '#475569',
                              borderRadius: '8px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {pInfo.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary API Key */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={formLabelStyle}>Primary API Key ({aiDraft.provider})</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showKeyMap['primary'] ? 'text' : 'password'}
                        placeholder={PROVIDER_DEFAULTS[aiDraft.provider]?.placeholder || 'Enter API Key...'}
                        value={aiDraft.apiKey || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, ai: true }));
                          setAiDraft(prev => ({ ...prev, apiKey: e.target.value }));
                        }}
                        style={{ ...customInputStyle, paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeyMap(prev => ({ ...prev, primary: !prev['primary'] }))}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8'
                        }}
                      >
                        {showKeyMap['primary'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Model & Base URL Overrides */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={formLabelStyle}>Model Name</label>
                      <input
                        type="text"
                        value={aiDraft.model || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, ai: true }));
                          setAiDraft(prev => ({ ...prev, model: e.target.value }));
                        }}
                        style={customInputStyle}
                      />
                    </div>
                    <div>
                      <label style={formLabelStyle}>API Base URL (Optional Override)</label>
                      <input
                        type="text"
                        value={aiDraft.baseUrl || ''}
                        onChange={(e) => {
                          setEditFlags(prev => ({ ...prev, ai: true }));
                          setAiDraft(prev => ({ ...prev, baseUrl: e.target.value }));
                        }}
                        style={customInputStyle}
                      />
                    </div>
                  </div>

                  {/* Fallback Static Message */}
                  <div>
                    <label style={formLabelStyle}>Static Fallback Message (If AI fails or balance depleted)</label>
                    <textarea
                      rows={2}
                      value={aiDraft.fallbackMessage || ''}
                      onChange={(e) => {
                        setEditFlags(prev => ({ ...prev, ai: true }));
                        setAiDraft(prev => ({ ...prev, fallbackMessage: e.target.value }));
                      }}
                      style={{ ...customInputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Backup API Key Fallback Chain (Slots 1 to 5) */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={14} color="#ffffff" />
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                          Backup API Fallback Chain (5 Slots)
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          If the primary key hits a rate limit or 500 error, APK automatically tries enabled backup slots sequentially.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Enable Backup Chain:</span>
                      <CustomSwitch
                        checked={aiDraft.backupEnabled !== false}
                        onChange={(checked) => {
                          setEditFlags(prev => ({ ...prev, ai: true }));
                          setAiDraft(prev => ({ ...prev, backupEnabled: checked }));
                        }}
                      />
                    </div>
                  </div>

                  {/* 5 Backup Slots */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1, 2, 3, 4, 5].map(slotNum => {
                      const slotKey = `backupSlot${slotNum}`;
                      const slotData = aiDraft[slotKey] || { enabled: false, provider: 'GEMINI', apiKey: '', model: '', baseUrl: '' };
                      const isEnabled = slotData.enabled === true;

                      return (
                        <div
                          key={slotNum}
                          style={{
                            background: '#ffffff',
                            border: isEnabled ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '14px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEnabled ? '12px' : '0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: isEnabled ? '#0f172a' : '#e2e8f0',
                                color: isEnabled ? '#ffffff' : '#64748b',
                                fontSize: '11px',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {slotNum}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                                Backup Slot {slotNum}: {PROVIDER_DEFAULTS[slotData.provider || 'GEMINI']?.name}
                              </span>
                            </div>

                            <CustomSwitch
                              checked={isEnabled}
                              onChange={(checked) => {
                                setEditFlags(prev => ({ ...prev, ai: true }));
                                setAiDraft(prev => ({
                                  ...prev,
                                  [slotKey]: { ...slotData, enabled: checked }
                                }));
                              }}
                            />
                          </div>

                          {isEnabled && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                              {/* Provider Chips for Slot */}
                              <div>
                                <label style={formLabelStyle}>Backup Provider</label>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {Object.keys(PROVIDER_DEFAULTS).map(provKey => (
                                    <button
                                      key={provKey}
                                      type="button"
                                      onClick={() => {
                                        setEditFlags(prev => ({ ...prev, ai: true }));
                                        const pInfo = PROVIDER_DEFAULTS[provKey];
                                        setAiDraft(prev => ({
                                          ...prev,
                                          [slotKey]: {
                                            ...slotData,
                                            provider: provKey,
                                            model: pInfo.model,
                                            baseUrl: pInfo.baseUrl
                                          }
                                        }));
                                      }}
                                      style={{
                                        background: slotData.provider === provKey ? '#0f172a' : '#f8fafc',
                                        border: slotData.provider === provKey ? '1px solid #0f172a' : '1px solid #e2e8f0',
                                        color: slotData.provider === provKey ? '#ffffff' : '#475569',
                                        borderRadius: '6px',
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {PROVIDER_DEFAULTS[provKey].name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Backup API Key */}
                              <div>
                                <label style={formLabelStyle}>Backup API Key</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type={showKeyMap[slotKey] ? 'text' : 'password'}
                                    placeholder={PROVIDER_DEFAULTS[slotData.provider || 'GEMINI']?.placeholder || 'Enter API Key...'}
                                    value={slotData.apiKey || ''}
                                    onChange={(e) => {
                                      setEditFlags(prev => ({ ...prev, ai: true }));
                                      setAiDraft(prev => ({
                                        ...prev,
                                        [slotKey]: { ...slotData, apiKey: e.target.value }
                                      }));
                                    }}
                                    style={{ ...customInputStyle, paddingRight: '40px' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowKeyMap(prev => ({ ...prev, [slotKey]: !prev[slotKey] }))}
                                    style={{
                                      position: 'absolute',
                                      right: '10px',
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#94a3b8'
                                    }}
                                  >
                                    {showKeyMap[slotKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>

                              {/* Backup Slot Model & API Base URL */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                <div>
                                  <label style={formLabelStyle}>Backup Model Name</label>
                                  <input
                                    type="text"
                                    placeholder={PROVIDER_DEFAULTS[slotData.provider || 'GEMINI']?.model || 'Model name...'}
                                    value={slotData.model || ''}
                                    onChange={(e) => {
                                      setEditFlags(prev => ({ ...prev, ai: true }));
                                      setAiDraft(prev => ({
                                        ...prev,
                                        [slotKey]: { ...slotData, model: e.target.value }
                                      }));
                                    }}
                                    style={{ ...customInputStyle, fontSize: '12px', padding: '7px 10px' }}
                                  />
                                </div>

                                <div>
                                  <label style={formLabelStyle}>API Base URL (Optional Override)</label>
                                  <input
                                    type="text"
                                    placeholder={PROVIDER_DEFAULTS[slotData.provider || 'GEMINI']?.baseUrl || 'https://...'}
                                    value={slotData.baseUrl || ''}
                                    onChange={(e) => {
                                      setEditFlags(prev => ({ ...prev, ai: true }));
                                      setAiDraft(prev => ({
                                        ...prev,
                                        [slotKey]: { ...slotData, baseUrl: e.target.value }
                                      }));
                                    }}
                                    style={{ ...customInputStyle, fontSize: '12px', padding: '7px 10px' }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button onClick={handleSaveAiConfig} style={solidPrimaryBtnStyle}>
                    Save AI & Backup Keys to APK
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB: ACCOUNT BALANCE & BILLING HISTORY ─── */}
            {activeTab === 'balance_history' && (
              <div style={cardSectionStyle}>
                {/* Section Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Account Balance & Transaction Ledger
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Complete deposit history, per-message token deductions, and manual credit adjustments.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        fetchUsers();
                        triggerToast('Syncing balance ledger from database...');
                      }}
                      style={{ ...pillBtnStyle, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={12} />
                      <span>Refresh Ledger</span>
                    </button>
                  </div>
                </div>

                {/* Top Summary KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Current Available Balance
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: (selectedUser.balance || 0) <= 0 ? '#dc2626' : '#059669' }}>
                      ${(selectedUser.balance || 0).toFixed(4)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {(selectedUser.balance || 0) <= 0 ? '⚠️ Zero Balance • APK Paused' : '✅ Active For SMS Auto-Replies'}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Total Deposits / Top-Ups
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                      ${((selectedUser.balanceHistory || [])
                        .filter(t => (parseFloat(t.amount) || 0) > 0)
                        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)).toFixed(2)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {(selectedUser.balanceHistory || []).filter(t => (parseFloat(t.amount) || 0) > 0).length} deposit entries
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Total SMS Auto-Reply Spend
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                      ${Math.abs((selectedUser.balanceHistory || [])
                        .filter(t => (parseFloat(t.amount) || 0) < 0 && (t.type?.toLowerCase().includes('sms') || t.description?.toLowerCase().includes('reply')))
                        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || (selectedUser.activities?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0)).toFixed(4)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {selectedUser.activities?.length || 0} automated messages
                    </span>
                  </div>
                </div>

                {/* Quick Balance Controls & Deposit Form */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wallet size={14} color="#0f172a" />
                    <span>Manage Store Funds</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {[5, 10, 20, 50, 100].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleUpdateBalance(amt, `Admin Quick Top-Up +$${amt}.00`)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#059669',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={12} />
                        <span>${amt}.00</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Form */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
                    <div>
                      <label style={formLabelStyle}>Custom Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 25.00"
                        value={customBalInput}
                        onChange={(e) => setCustomBalInput(e.target.value)}
                        style={customInputStyle}
                      />
                    </div>
                    <div>
                      <label style={formLabelStyle}>Reference Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Stripe checkout, Manual adjustment"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        style={customInputStyle}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const val = parseFloat(customBalInput);
                          if (!isNaN(val) && val > 0) {
                            handleUpdateBalance(val, customNote || `Admin Top-Up +$${val.toFixed(2)}`);
                            setCustomBalInput('');
                            setCustomNote('');
                          }
                        }}
                        style={{ ...solidPrimaryBtnStyle, background: '#059669', flex: 1, padding: '9px 12px', fontSize: '12px' }}
                      >
                        + Add Funds
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const val = parseFloat(customBalInput);
                          if (!isNaN(val) && val > 0) {
                            handleUpdateBalance(-val, customNote || `Admin Deduction -$${val.toFixed(2)}`);
                            setCustomBalInput('');
                            setCustomNote('');
                          }
                        }}
                        style={{ ...solidPrimaryBtnStyle, background: '#dc2626', flex: 1, padding: '9px 12px', fontSize: '12px' }}
                      >
                        - Deduct
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ledger Table & Filters */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>
                      Transaction History ({((selectedUser.balanceHistory || []).length)})
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['all', 'topup', 'sms', 'adjustment'].map(f => (
                        <button
                          key={f}
                          onClick={() => setBalanceFilter(f)}
                          style={{
                            background: balanceFilter === f ? '#0f172a' : '#f8fafc',
                            color: balanceFilter === f ? '#ffffff' : '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {f === 'topup' ? 'Top-Ups' : f === 'sms' ? 'SMS Replies' : f === 'adjustment' ? 'Adjustments' : 'All'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ledger Table */}
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '550px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', fontSize: '11px' }}>
                          <th style={{ padding: '10px 14px' }}>Date & Time</th>
                          <th style={{ padding: '10px 14px' }}>Type</th>
                          <th style={{ padding: '10px 14px' }}>Amount</th>
                          <th style={{ padding: '10px 14px' }}>Balance After</th>
                          <th style={{ padding: '10px 14px' }}>Details / Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!selectedUser.balanceHistory || selectedUser.balanceHistory.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                              No balance transactions recorded yet. Deposits and SMS deductions will appear here automatically.
                            </td>
                          </tr>
                        ) : (
                          selectedUser.balanceHistory
                            .filter(t => {
                              const amt = parseFloat(t.amount) || 0;
                              const type = (t.type || '').toLowerCase();
                              if (balanceFilter === 'topup') return amt > 0 || type.includes('deposit') || type.includes('top');
                              if (balanceFilter === 'sms') return amt < 0 && (type.includes('sms') || type.includes('reply'));
                              if (balanceFilter === 'adjustment') return type.includes('adjustment') || (amt < 0 && !type.includes('sms'));
                              return true;
                            })
                            .map((tx, idx) => {
                              const amt = parseFloat(tx.amount) || 0;
                              const isPositive = amt > 0;
                              return (
                                <tr key={tx.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '10px 14px', color: '#64748b' }}>
                                    <div>{tx.date || new Date(tx.timestampMillis || Date.now()).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{tx.time || new Date(tx.timestampMillis || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                  </td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      background: isPositive ? '#ecfdf5' : '#fef2f2',
                                      color: isPositive ? '#059669' : '#dc2626',
                                      border: `1px solid ${isPositive ? '#a7f3d0' : '#fecaca'}`
                                    }}>
                                      {isPositive ? 'Top-Up' : tx.type || 'Deduction'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 14px', fontWeight: '800', color: isPositive ? '#059669' : '#dc2626' }}>
                                    {isPositive ? `+$${amt.toFixed(4)}` : `-$${Math.abs(amt).toFixed(4)}`}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: '600' }}>
                                    {tx.balanceAfter != null ? `$${parseFloat(tx.balanceAfter).toFixed(4)}` : '—'}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: '#475569' }}>
                                    {tx.description || tx.recipientNumber || 'Balance change'}
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 3: LIVE SMS ACTIVITY ─── */}
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

            {/* ─── TAB 4: SPAM & BUSINESS HOURS ─── */}
            {activeTab === 'spam_schedule' && (
              <div style={cardSectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Spam Protection & Operating Hours
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Configure individual rate limits, message limits, and auto-reply business hours.
                    </p>
                  </div>
                  <button onClick={handleSaveSpamSchedule} style={solidPrimaryBtnStyle}>
                    Save Spam & Hours Rules
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* Spam Rules Card */}
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginBottom: '14px' }}>
                      Rate Limiting & Anti-Spam Rules
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                      {/* Rule 1: Cooldown */}
                      <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spamDraft.cooldownEnabled !== false ? '8px' : '0' }}>
                          <div>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>Per-Contact Cooldown</span>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Ignore rapid incoming texts from same number</div>
                          </div>
                          <CustomSwitch
                            checked={spamDraft.cooldownEnabled !== false}
                            onChange={(checked) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, cooldownEnabled: checked }));
                            }}
                          />
                        </div>
                        {spamDraft.cooldownEnabled !== false && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <span style={{ color: '#64748b' }}>Cooldown Seconds:</span>
                            <input
                              type="number"
                              value={spamDraft.cooldownSeconds ?? 90}
                              onChange={(e) => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, cooldownSeconds: parseInt(e.target.value) || 0 }));
                              }}
                              style={{ ...customInputStyle, width: '80px', padding: '4px 8px' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Rule 2: Max Replies */}
                      <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spamDraft.maxRepliesEnabled !== false ? '8px' : '0' }}>
                          <div>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>Max Replies Cap</span>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Limit consecutive auto-replies to one contact</div>
                          </div>
                          <CustomSwitch
                            checked={spamDraft.maxRepliesEnabled !== false}
                            onChange={(checked) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, maxRepliesEnabled: checked }));
                            }}
                          />
                        </div>
                        {spamDraft.maxRepliesEnabled !== false && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <span style={{ color: '#64748b' }}>Max Replies:</span>
                            <input
                              type="number"
                              value={spamDraft.maxReplies ?? 3}
                              onChange={(e) => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, maxReplies: parseInt(e.target.value) || 0 }));
                              }}
                              style={{ ...customInputStyle, width: '80px', padding: '4px 8px' }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Rule 3: Rolling Window */}
                      <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spamDraft.windowEnabled !== false ? '8px' : '0' }}>
                          <div>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>Rolling Time Window</span>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Reset conversation counter after time passes</div>
                          </div>
                          <CustomSwitch
                            checked={spamDraft.windowEnabled !== false}
                            onChange={(checked) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, windowEnabled: checked }));
                            }}
                          />
                        </div>
                        {spamDraft.windowEnabled !== false && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <span style={{ color: '#64748b' }}>Window (Minutes):</span>
                            <input
                              type="number"
                              value={spamDraft.windowMinutes ?? 10}
                              onChange={(e) => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, windowMinutes: parseInt(e.target.value) || 0 }));
                              }}
                              style={{ ...customInputStyle, width: '80px', padding: '4px 8px' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business Hours & Schedule Card */}
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>Operating Hours Filter</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Restrict auto-reply to specific hours or after-hours</div>
                      </div>
                      <CustomSwitch
                        checked={spamDraft.scheduleEnabled === true}
                        onChange={(checked) => {
                          setEditFlags(prev => ({ ...prev, spam: true }));
                          setSpamDraft(prev => ({ ...prev, scheduleEnabled: checked }));
                        }}
                      />
                    </div>

                    {spamDraft.scheduleEnabled === true && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                        {/* Mode Chips */}
                        <div>
                          <span style={{ color: '#475569', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Schedule Mode:</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, scheduleMode: 'ONLY_DURING' }));
                              }}
                              style={{
                                background: (spamDraft.scheduleMode || 'ONLY_DURING') === 'ONLY_DURING' ? '#0f172a' : '#ffffff',
                                border: (spamDraft.scheduleMode || 'ONLY_DURING') === 'ONLY_DURING' ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                                color: (spamDraft.scheduleMode || 'ONLY_DURING') === 'ONLY_DURING' ? '#ffffff' : '#475569',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              During Hours Only
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, scheduleMode: 'ONLY_OUTSIDE' }));
                              }}
                              style={{
                                background: spamDraft.scheduleMode === 'ONLY_OUTSIDE' ? '#0f172a' : '#ffffff',
                                border: spamDraft.scheduleMode === 'ONLY_OUTSIDE' ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                                color: spamDraft.scheduleMode === 'ONLY_OUTSIDE' ? '#ffffff' : '#475569',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              After-Hours Receptionist
                            </button>
                          </div>
                        </div>

                        {/* Start & End Time */}
                        <div>
                          <span style={{ color: '#475569', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Hours Range:</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="time"
                              value={spamDraft.scheduleStart || '09:00'}
                              onChange={(e) => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, scheduleStart: e.target.value }));
                              }}
                              style={{ ...customInputStyle, width: '100px' }}
                            />
                            <span style={{ color: '#94a3b8' }}>to</span>
                            <input
                              type="time"
                              value={spamDraft.scheduleEnd || '18:00'}
                              onChange={(e) => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, scheduleEnd: e.target.value }));
                              }}
                              style={{ ...customInputStyle, width: '100px' }}
                            />
                          </div>
                        </div>

                        {/* Active Days */}
                        <div>
                          <span style={{ color: '#475569', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Active Days:</span>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                              const days = spamDraft.scheduleDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                              const isSelected = days.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
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

                        {/* Out of Hours Message */}
                        <div>
                          <span style={{ color: '#475569', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Out-of-Hours Reply Message:</span>
                          <textarea
                            rows={2}
                            value={spamDraft.outOfHoursMsg || ''}
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, outOfHoursMsg: e.target.value }));
                            }}
                            placeholder="Thanks for contacting us! We are currently closed."
                            style={{ ...customInputStyle, resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSaveSpamSchedule} style={solidPrimaryBtnStyle}>
                    Save Spam & Hours Rules
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 5: PRICING & TOKEN RATES ─── */}
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

            {/* ─── TAB 6: MANUAL REPLY LIST ─── */}
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
            Select a store account from the left sidebar to manage controls, API keys, and live activity.
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

      {/* ─── MODAL: CHANGE STORE CREDENTIALS ─── */}
      {showCredModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Change Store Credentials
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Update User ID and APK login password for <strong>{selectedUser.storeName || selectedUser.id}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowCredModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={formLabelStyle}>Store User ID (Username)</label>
                <input
                  type="text"
                  value={credUserId}
                  onChange={(e) => setCredUserId(e.target.value)}
                  style={customInputStyle}
                  required
                  autoFocus
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  Login username used in the Android APK
                </span>
              </div>

              <div>
                <label style={formLabelStyle}>APK Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPasswordMap['cred_modal_pass'] ? 'text' : 'password'}
                    value={credPassword}
                    onChange={(e) => setCredPassword(e.target.value)}
                    style={{ ...customInputStyle, paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordMap(prev => ({ ...prev, cred_modal_pass: !prev['cred_modal_pass'] }))}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8'
                    }}
                  >
                    {showPasswordMap['cred_modal_pass'] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  Password used for store authentication
                </span>
              </div>

              {credError && (
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
                  <span>{credError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCredModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={credLoading}
                  style={{ ...solidPrimaryBtnStyle, padding: '8px 16px' }}
                >
                  {credLoading ? 'Saving...' : 'Save & Sync Credentials'}
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
