import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Menu,
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
  Receipt,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Home as HomeIcon,
  Globe,
  PauseCircle
} from 'lucide-react';
import { translate } from '../i18n';

const CONTROL_FONT = "'DM Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const PROVIDER_DEFAULTS = {
  GEMINI: {
    name: 'Google Gemini',
    model: 'gemini-2.5-flash-lite',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    placeholder: 'AIzaSy...',
    inputPrice1M: 0.10,
    outputPrice1M: 0.40
  },
  OPENAI: {
    name: 'OpenAI (ChatGPT)',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    placeholder: 'sk-proj-...',
    inputPrice1M: 0.15,
    outputPrice1M: 0.60
  },
  DEEPSEEK: {
    name: 'DeepSeek',
    model: 'deepseek-v4-flash',
    baseUrl: 'https://api.deepseek.com',
    placeholder: 'sk-...',
    inputPrice1M: 0.14,
    outputPrice1M: 0.28
  },
  CLAUDE: {
    name: 'Anthropic Claude',
    model: 'claude-3-5-haiku-20241022',
    baseUrl: 'https://api.anthropic.com/v1',
    placeholder: 'sk-ant-...',
    inputPrice1M: 0.80,
    outputPrice1M: 4.00
  },
  GROK: {
    name: 'xAI Grok',
    model: 'grok-4.1-fast',
    baseUrl: 'https://api.x.ai/v1',
    placeholder: 'xai-...',
    inputPrice1M: 3.00,
    outputPrice1M: 15.00
  }
};

const DEFAULT_MODEL_RATES = {
  GEMINI_25: { name: 'Google Gemini 2.5 Flash-Lite', model: 'gemini-2.5-flash-lite', inPrice: 0.10, outPrice: 0.40 },
  GEMINI_31: { name: 'Google Gemini 3.1 Flash-Lite', model: 'gemini-3.1-flash-lite', inPrice: 0.25, outPrice: 1.50 },
  OPENAI: { name: 'OpenAI (ChatGPT)', model: 'gpt-4o-mini', inPrice: 0.15, outPrice: 0.60 },
  DEEPSEEK: { name: 'DeepSeek', model: 'deepseek-v4-flash', inPrice: 0.14, outPrice: 0.28 },
  CLAUDE: { name: 'Anthropic Claude', model: 'claude-3-5-haiku-20241022', inPrice: 0.80, outPrice: 4.00 },
  GROK: { name: 'xAI Grok', model: 'grok-4.1-fast', inPrice: 3.00, outPrice: 15.00 }
};

export default function MasterControlPanel({ onBackToHome }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(sessionStorage.getItem('cove_master_admin_token'));
  });
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation and UI State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'ai_keys', 'activity', 'spam_schedule', 'pricing', 'blacklist'
  const [sidebarPage, setSidebarPage] = useState('home'); // 'home' | 'store' | 'settings'
  const [locale, setLocale] = useState(() => {
    try {
      return localStorage.getItem('cove_control_locale') === 'zh' ? 'zh' : 'en';
    } catch {
      return 'en';
    }
  });
  const t = (key, params) => translate(locale, key, params);
  const persistLocale = (next) => {
    setLocale(next);
    try { localStorage.setItem('cove_control_locale', next); } catch { /* ignore */ }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
    }
  };
  const [platformStats, setPlatformStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );
  const [storeDrawerOpen, setStoreDrawerOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [saveToast, setSaveToast] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState({});
  const [showKeyMap, setShowKeyMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [customBalInput, setCustomBalInput] = useState('10.00');
  const [masterAiRule, setMasterAiRule] = useState('');
  const [masterRuleSaving, setMasterRuleSaving] = useState(false);

  // Model Pricing Customizer Modal State
  const [modelRates, setModelRates] = useState(() => {
    try {
      const saved = localStorage.getItem('cove_master_model_rates');
      return saved ? { ...DEFAULT_MODEL_RATES, ...JSON.parse(saved) } : DEFAULT_MODEL_RATES;
    } catch {
      return DEFAULT_MODEL_RATES;
    }
  });
  const [showModelPricingModal, setShowModelPricingModal] = useState(false);
  const [tempModelRates, setTempModelRates] = useState(null);
  const [rawUsageFilter, setRawUsageFilter] = useState('all'); // 'all', 'primary', 'backup'

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

  const [pricingDraft, setPricingDraft] = useState({
    pricingMode: 'fixed_fee',
    fixedFeePerMessage: '0.0050'
  });

  const [editFlags, setEditFlags] = useState({ profile: false, spam: false, ai: false, pricing: false });

  useEffect(() => {
    setEditFlags({ profile: false, spam: false, ai: false, pricing: false });
  }, [selectedUserId]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setStoreDrawerOpen(false);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const u = users.find(usr => usr.id === selectedUserId);
    if (u) {
      setProfileDraft(prev => editFlags.profile ? prev : { 
        storeName: u.storeName || u.id, 
        businessInfo: u.businessProfile?.businessInfo || '', 
        replyTone: u.businessProfile?.replyTone || 'Professional, friendly, and concise', 
        aiRules: u.businessProfile?.aiRules || '' 
      });

      const DAY_MAP = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
      const rawDays = u.spamConfig?.scheduleDays || u.spamConfig?.scheduleActiveDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const normalizedDays = Array.isArray(rawDays) ? rawDays.map(d => typeof d === 'number' ? (DAY_MAP[d] || d) : d) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

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
        scheduleDays: normalizedDays,
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

      setPricingDraft(prev => editFlags.pricing ? prev : {
        pricingMode: u.pricingMode || 'fixed_fee',
        fixedFeePerMessage: String(u.fixedFeePerMessage != null ? u.fixedFeePerMessage : '0.0050')
      });
    }
  }, [selectedUserId, users, editFlags]);

  const adminFetch = (url, options = {}) => {
    const token = sessionStorage.getItem('cove_master_admin_token') || '';
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  };

  const clearAdminSession = () => {
    sessionStorage.removeItem('cove_master_admin_token');
    sessionStorage.removeItem('cove_master_admin_auth');
    setIsAuthenticated(false);
  };

  // Handle Master Admin Login
  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword.trim() })
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.token) {
        sessionStorage.setItem('cove_master_admin_token', resData.token);
        sessionStorage.setItem('cove_master_admin_auth', 'true');
        setIsAuthenticated(true);
        setAuthPassword('');
        setAuthLoading(false);
        fetchUsers();
        return;
      }
      setAuthError('Incorrect Master Admin Password. Access Denied.');
    } catch (err) {
      console.warn('API verify failed:', err);
      setAuthError('Unable to verify admin password. Try again.');
    }
    setAuthLoading(false);
  };

  const handleAdminLogout = () => {
    clearAdminSession();
  };

  // Fetch real users from backend API
  const fetchUserDetail = async (userId) => {
    if (!userId) return;
    try {
      const res = await adminFetch(`/api/admin/users?id=${encodeURIComponent(userId)}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.status === 401) {
        clearAdminSession();
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data.user?.id) {
        setUsers(prev => prev.map(u => u.id === data.user.id ? { ...u, ...data.user } : u));
      }
    } catch (err) {
      console.warn('Failed to fetch store detail:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminFetch(`/api/admin/users?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.status === 401) {
        clearAdminSession();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(prev => {
            const prevMap = new Map(prev.map(u => [u.id, u]));
            return data.users.map(u => {
              const old = prevMap.get(u.id);
              // List payload is lightweight — keep secrets/profile/activity from the last detail fetch.
              return old ? { ...old, ...u } : u;
            });
          });
          setSelectedUserId(prev => {
            if (prev && data.users.some(u => u.id === prev)) return prev;
            return prev || '';
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    }
  };

  const fetchMasterRule = async () => {
    try {
      const res = await adminFetch('/api/admin/system');
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.masterAiRule === 'string') setMasterAiRule(data.masterAiRule);
    } catch (err) {
      console.warn('Failed to load system master rule:', err);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const res = await adminFetch(`/api/admin/users?stats=1&_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.status === 401) {
        clearAdminSession();
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data.stats) setPlatformStats(data.stats);
    } catch (err) {
      console.warn('Failed to load platform stats:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchMasterRule();
      fetchPlatformStats();
      const interval = setInterval(fetchUsers, 4000);
      const statsInterval = setInterval(fetchPlatformStats, 8000);
      return () => {
        clearInterval(interval);
        clearInterval(statsInterval);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedUserId || sidebarPage !== 'store') return;
    fetchUserDetail(selectedUserId);
    const interval = setInterval(() => fetchUserDetail(selectedUserId), 2500);
    return () => clearInterval(interval);
  }, [selectedUserId, isAuthenticated, sidebarPage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    }
  }, [locale]);

  const selectedUser = users.find(u => u.id === selectedUserId) || null;

  const triggerToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleSaveMasterRule = async () => {
    setMasterRuleSaving(true);
    try {
      const res = await adminFetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterAiRule })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        if (typeof data.masterAiRule === 'string') setMasterAiRule(data.masterAiRule);
        triggerToast(t('savedMasterRule'));
      } else {
        triggerToast(t('failedMasterRule'));
      }
    } catch (err) {
      triggerToast(t('failedMasterRule'));
    } finally {
      setMasterRuleSaving(false);
    }
  };

  const syncUserToServer = async (updatedUserData) => {
    try {
      const { balance, balanceHistory, status, ...configData } = updatedUserData || {};
      const res = await adminFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_user', data: configData })
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success !== false) {
        if (resData.user?.id) {
          applyServerUser(resData.user);
        } else if (updatedUserData?.id) {
          fetchUserDetail(updatedUserData.id);
        }
        return true;
      }
      console.error('Failed to sync to server:', resData.error || res.statusText);
      return false;
    } catch (e) {
      console.error('Failed to sync to server:', e);
      return false;
    }
  };

  const applyServerUser = (serverUser) => {
    if (!serverUser?.id) return;
    setUsers(prev => prev.map(u => u.id === serverUser.id ? { ...u, ...serverUser } : u));
  };

  const handleUpdateBalance = async (delta, customReason = '') => {
    if (!selectedUser) return;
    const numericDelta = parseFloat(delta);
    if (!Number.isFinite(numericDelta) || numericDelta === 0) return;

    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_balance',
          data: { id: selectedUser.id, delta: numericDelta, reason: customReason }
        })
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.user) {
        triggerToast(resData.error || 'Failed to update balance');
        return;
      }
      applyServerUser(resData.user);
      const nextBal = parseFloat(resData.user.balance) || 0;
      triggerToast(`Balance: ${numericDelta >= 0 ? '+' : ''}$${numericDelta.toFixed(2)} (New: $${nextBal.toFixed(2)})`);
    } catch (e) {
      console.error('Failed to update balance:', e);
      triggerToast('Failed to update balance');
    }
  };

  const handleSetZeroBalance = async () => {
    if (!selectedUser) return;
    await handleSetExactBalance(0, 'Reset balance to $0.00');
  };

  const handleSetExactBalance = async (amount, customReason = '') => {
    if (!selectedUser) return;
    const val = parseFloat(amount);
    if (!Number.isFinite(val) || val < 0) return;

    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_balance',
          data: {
            id: selectedUser.id,
            balance: val,
            reason: customReason || `Balance set to $${val.toFixed(2)}`
          }
        })
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.user) {
        triggerToast(resData.error || 'Failed to set balance');
        return;
      }
      applyServerUser(resData.user);
      triggerToast(val <= 0
        ? 'Store balance reset to $0.00 (Auto-reply paused)'
        : `Balance set to $${val.toFixed(2)}`
      );
    } catch (e) {
      console.error('Failed to set balance:', e);
      triggerToast('Failed to set balance');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete store account "${userId}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await adminFetch('/api/admin/users', {
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

      const res = await adminFetch('/api/admin/users', {
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
      setSidebarPage('store');

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

  const handleOpenPricingModal = () => {
    setTempModelRates(JSON.parse(JSON.stringify(modelRates)));
    setShowModelPricingModal(true);
  };

  const handleSaveModelRates = (e) => {
    e?.preventDefault();
    if (!tempModelRates) return;
    setModelRates(tempModelRates);
    localStorage.setItem('cove_master_model_rates', JSON.stringify(tempModelRates));
    setShowModelPricingModal(false);
    triggerToast('Supplier model pricing updated successfully');
  };

  const handleResetDefaultModelRates = () => {
    setTempModelRates(JSON.parse(JSON.stringify(DEFAULT_MODEL_RATES)));
    setModelRates(DEFAULT_MODEL_RATES);
    localStorage.removeItem('cove_master_model_rates');
    triggerToast('Reset to 2026 official default rates');
  };

  const getModelRateForActivity = (act, user) => {
    const statusLower = (act.status || '').toLowerCase();
    const isBackup1 = statusLower.includes('backup 1');
    const isBackup2 = statusLower.includes('backup 2');
    const isBackup3 = statusLower.includes('backup 3');
    const isBackup4 = statusLower.includes('backup 4');
    const isBackup5 = statusLower.includes('backup 5');

    // 1. If explicit backup slot is recorded
    if (isBackup1 || isBackup2 || isBackup3 || isBackup4 || isBackup5) {
      const slotIdx = isBackup1 ? 1 : isBackup2 ? 2 : isBackup3 ? 3 : isBackup4 ? 4 : 5;
      const slotConfig = user?.aiConfig?.[`backupSlot${slotIdx}`];
      const slotProv = (slotConfig?.provider || '').toUpperCase();
      const slotModel = slotConfig?.model || '';

      if (slotProv === 'OPENAI' || statusLower.includes('openai') || statusLower.includes('gpt')) {
        return { inPrice: modelRates.OPENAI.inPrice, outPrice: modelRates.OPENAI.outPrice, label: `Backup ${slotIdx} • OpenAI (${slotModel || 'gpt-4o-mini'})`, isBackup: true, slotIdx };
      }
      if (slotProv === 'DEEPSEEK' || statusLower.includes('deepseek')) {
        return { inPrice: modelRates.DEEPSEEK.inPrice, outPrice: modelRates.DEEPSEEK.outPrice, label: `Backup ${slotIdx} • DeepSeek (${slotModel || 'deepseek-v4-flash'})`, isBackup: true, slotIdx };
      }
      if (slotProv === 'CLAUDE' || statusLower.includes('claude') || statusLower.includes('anthropic')) {
        return { inPrice: modelRates.CLAUDE.inPrice, outPrice: modelRates.CLAUDE.outPrice, label: `Backup ${slotIdx} • Claude (${slotModel || 'claude-3-5-haiku'})`, isBackup: true, slotIdx };
      }
      if (slotProv === 'GROK' || statusLower.includes('grok') || statusLower.includes('xai')) {
        return { inPrice: modelRates.GROK.inPrice, outPrice: modelRates.GROK.outPrice, label: `Backup ${slotIdx} • Grok (${slotModel || 'grok-4.1-fast'})`, isBackup: true, slotIdx };
      }
      if (slotProv === 'GEMINI' || statusLower.includes('gemini')) {
        const is31 = slotModel.includes('3.1');
        return is31 
          ? { inPrice: modelRates.GEMINI_31.inPrice, outPrice: modelRates.GEMINI_31.outPrice, label: `Backup ${slotIdx} • Gemini 3.1 Flash-Lite`, isBackup: true, slotIdx }
          : { inPrice: modelRates.GEMINI_25.inPrice, outPrice: modelRates.GEMINI_25.outPrice, label: `Backup ${slotIdx} • Gemini 2.5 Flash-Lite`, isBackup: true, slotIdx };
      }
      return { inPrice: modelRates.GEMINI_25.inPrice, outPrice: modelRates.GEMINI_25.outPrice, label: `Backup ${slotIdx} AI`, isBackup: true, slotIdx };
    }

    // 2. If status mentions a specific provider directly
    if (statusLower.includes('openai') || statusLower.includes('gpt')) {
      return { inPrice: modelRates.OPENAI.inPrice, outPrice: modelRates.OPENAI.outPrice, label: 'OpenAI (gpt-4o-mini)', isBackup: false };
    }
    if (statusLower.includes('deepseek')) {
      return { inPrice: modelRates.DEEPSEEK.inPrice, outPrice: modelRates.DEEPSEEK.outPrice, label: 'DeepSeek (deepseek-v4-flash)', isBackup: false };
    }
    if (statusLower.includes('claude') || statusLower.includes('anthropic')) {
      return { inPrice: modelRates.CLAUDE.inPrice, outPrice: modelRates.CLAUDE.outPrice, label: 'Claude (claude-3-5-haiku)', isBackup: false };
    }
    if (statusLower.includes('grok') || statusLower.includes('xai')) {
      return { inPrice: modelRates.GROK.inPrice, outPrice: modelRates.GROK.outPrice, label: 'Grok (grok-4.1-fast)', isBackup: false };
    }

    // 3. Fallback to store's Primary AI Model configuration
    const primProv = (user?.aiConfig?.provider || 'GEMINI').toUpperCase();
    const primModel = user?.aiConfig?.model || '';

    if (primProv === 'OPENAI') return { inPrice: modelRates.OPENAI.inPrice, outPrice: modelRates.OPENAI.outPrice, label: `Primary • OpenAI (${primModel || 'gpt-4o-mini'})`, isBackup: false };
    if (primProv === 'DEEPSEEK') return { inPrice: modelRates.DEEPSEEK.inPrice, outPrice: modelRates.DEEPSEEK.outPrice, label: `Primary • DeepSeek (${primModel || 'deepseek-v4-flash'})`, isBackup: false };
    if (primProv === 'CLAUDE') return { inPrice: modelRates.CLAUDE.inPrice, outPrice: modelRates.CLAUDE.outPrice, label: `Primary • Claude (${primModel || 'claude-3-5-haiku'})`, isBackup: false };
    if (primProv === 'GROK') return { inPrice: modelRates.GROK.inPrice, outPrice: modelRates.GROK.outPrice, label: `Primary • Grok (${primModel || 'grok-4.1-fast'})`, isBackup: false };

    // Default: Gemini
    if (primModel.includes('3.1')) {
      return { inPrice: modelRates.GEMINI_31.inPrice, outPrice: modelRates.GEMINI_31.outPrice, label: 'Primary • Gemini 3.1 Flash-Lite', isBackup: false };
    }
    return { inPrice: modelRates.GEMINI_25.inPrice, outPrice: modelRates.GEMINI_25.outPrice, label: 'Primary • Gemini 2.5 Flash-Lite', isBackup: false };
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

  const [profileSaving, setProfileSaving] = useState(false);
  const [spamSaving, setSpamSaving] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    setProfileSaving(true);
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
    const ok = await syncUserToServer(updated);
    setProfileSaving(false);
    setEditFlags(prev => ({ ...prev, profile: false }));
    if (ok) {
      triggerToast('Store Profile & AI FAQ saved and synced to APK!');
    } else {
      triggerToast('⚠️ Profile saved locally (Syncing with server...)');
    }
  };

  const handleSaveSpamSchedule = async () => {
    if (!selectedUser) return;
    setSpamSaving(true);
    const updated = { ...selectedUser, spamConfig: spamDraft };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    const ok = await syncUserToServer(updated);
    setSpamSaving(false);
    setEditFlags(prev => ({ ...prev, spam: false }));
    if (ok) {
      triggerToast('Spam & Schedule rules synced to APK!');
    } else {
      triggerToast('⚠️ Rules saved locally (Syncing with server...)');
    }
  };

  const handleSaveAiConfig = async () => {
    if (!selectedUser) return;
    setAiSaving(true);
    const updated = {
      ...selectedUser,
      aiConfig: {
        provider: aiDraft.provider,
        apiKey: aiDraft.apiKey,
        model: aiDraft.model,
        baseUrl: aiDraft.baseUrl,
        fallbackMessage: aiDraft.fallbackMessage,
        backupEnabled: aiDraft.backupEnabled,
        backupSlot1: aiDraft.backupSlot1,
        backupSlot2: aiDraft.backupSlot2,
        backupSlot3: aiDraft.backupSlot3,
        backupSlot4: aiDraft.backupSlot4,
        backupSlot5: aiDraft.backupSlot5
      }
    };

    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    const ok = await syncUserToServer(updated);
    setAiSaving(false);
    setEditFlags(prev => ({ ...prev, ai: false }));
    if (ok) {
      triggerToast('AI provider & backup chain keys synced to APK!');
    } else {
      triggerToast('⚠️ AI keys saved locally (Syncing with server...)');
    }
  };

  const handleSavePricing = async () => {
    if (!selectedUser) return;
    setPricingSaving(true);
    const fee = parseFloat(pricingDraft.fixedFeePerMessage);
    const validFee = isNaN(fee) || fee < 0 ? 0.0050 : fee;
    const mode = pricingDraft.pricingMode || 'fixed_fee';
    const updated = {
      ...selectedUser,
      pricingMode: mode,
      fixedFeePerMessage: validFee
    };
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
    const ok = await syncUserToServer(updated);
    setPricingSaving(false);
    setEditFlags(prev => ({ ...prev, pricing: false }));
    if (ok) {
      triggerToast(`Pricing saved: ${mode === 'fixed_fee' ? `$${validFee.toFixed(4)}/msg` : 'Direct AI Pass-Through'}`);
    } else {
      triggerToast('⚠️ Pricing saved locally (Syncing with server...)');
    }
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

  const colGrid = (minPx, gap = 12) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : `repeat(auto-fit, minmax(${minPx}px, 1fr))`,
    gap: isMobile ? Math.min(gap, 10) : gap,
    minWidth: 0,
    width: '100%'
  });

  const tapBtn = {
    minHeight: isMobile ? '44px' : undefined,
    WebkitTapHighlightColor: 'transparent'
  };

  // ─── AUTH SCREEN ───
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px' : '20px',
        fontFamily: CONTROL_FONT,
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: isMobile ? '18px' : '24px',
          padding: isMobile ? '28px 20px' : '40px 32px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
            {t('coveMasterControl')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
            {t('loginSubtitle')}
          </p>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder={t('adminPassword')}
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
              {authLoading ? t('verifying') : t('signInConsole')}
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
              ← {t('backToWebsite')}
            </button>
          </form>
          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
              <button type="button" onClick={() => persistLocale('en')} style={{ border: 'none', background: locale === 'en' ? '#fff' : 'transparent', color: '#0f172a', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{t('english')}</button>
              <button type="button" onClick={() => persistLocale('zh')} style={{ border: 'none', background: locale === 'zh' ? '#fff' : 'transparent', color: '#0f172a', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{t('chineseMandarin')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN MASTER CONTROL PANEL ───
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: CONTROL_FONT,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
        <style>{`
        html, body, #root { max-width: 100%; overflow-x: hidden; }
        input, textarea, button, select, table {
          font-family: inherit !important;
        }
        @media (max-width: 768px) {
          html, body { overflow-x: hidden; }
        }
      `}</style>

      {/* Toast Notification */}
      {saveToast && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          left: isMobile ? '12px' : 'auto',
          right: isMobile ? '12px' : '24px',
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
          zIndex: 1400,
          maxWidth: isMobile ? 'calc(100vw - 24px)' : '420px',
          wordBreak: 'break-word'
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{saveToast}</span>
        </div>
      )}

      {isMobile && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          minHeight: '56px',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          <button
            type="button"
            onClick={() => setStoreDrawerOpen(true)}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              ...tapBtn
            }}
            aria-label={t('openStoreList')}
          >
            <Menu size={18} color="#0f172a" />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('coveControl')}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sidebarPage === 'home'
                ? t('home')
                : sidebarPage === 'settings'
                  ? t('settings')
                  : (selectedUser ? (selectedUser.storeName || selectedUser.id) : t('selectStore'))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
            aria-label="Create store account"
          >
            <Plus size={18} />
          </button>
        </div>
      )}

      {isMobile && storeDrawerOpen && (
        <div
          onClick={() => setStoreDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            zIndex: 1100
          }}
        />
      )}

      {/* ─── SIDEBAR: STORE ACCOUNTS LIST ─── */}
      <aside style={isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'min(88vw, 340px)',
        maxWidth: '100vw',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
        transform: storeDrawerOpen ? 'translateX(0)' : 'translateX(-110%)',
        transition: 'transform 0.22s ease',
        boxShadow: storeDrawerOpen ? '8px 0 32px rgba(15,23,42,0.18)' : 'none',
        boxSizing: 'border-box'
      } : {
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
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
              {t('coveControl')}
            </span>
            {isMobile && (
              <button
                type="button"
                onClick={() => setStoreDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                aria-label={t('closeStoreList')}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            {[
              { id: 'home', label: t('home'), icon: HomeIcon },
              { id: 'settings', label: t('settings'), icon: Settings }
            ].map((item) => {
              const Icon = item.icon;
              const active = sidebarPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSidebarPage(item.id);
                    if (isMobile) setStoreDrawerOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: active ? '1px solid #e2e8f0' : '1px solid transparent',
                    background: active ? '#f1f5f9' : 'transparent',
                    color: '#0f172a',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={15} color={active ? '#0f172a' : '#64748b'} />
                  {item.label}
                </button>
              );
            })}
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
              placeholder={t('searchStores')}
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
            onClick={() => {
              setShowCreateModal(true);
              if (isMobile) setStoreDrawerOpen(false);
            }}
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
            <span>{t('createStoreAccount')}</span>
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
            {t('storeAccounts')} ({filteredUsers.length})
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{ padding: '24px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              {t('noStoresFound')}
            </div>
          ) : (
            filteredUsers.map(user => {
              const isSelected = sidebarPage === 'store' && selectedUser && user.id === selectedUser.id;
              const isDepleted = (user.balance || 0) <= 0;
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSidebarPage('store');
                    setActiveTab('profile');
                    if (isMobile) setStoreDrawerOpen(false);
                  }}
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
                      <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            <ArrowLeft size={13} /> {t('backToSite')}
          </button>
          <button
            onClick={handleAdminLogout}
            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT: STORE CONTROLS ON EACH PAGE ─── */}
      <main style={{
        flex: 1,
        padding: isMobile ? '14px 12px 28px 12px' : '24px',
        overflowY: 'auto',
        overflowX: 'hidden',
        maxWidth: isMobile ? '100%' : '1200px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>

        {sidebarPage === 'home' && (() => {
          const stats = platformStats || {
            storeCount: users.length,
            activeCount: users.filter((u) => !u.forcedPause && (u.balance || 0) > 0).length,
            pausedCount: users.filter((u) => u.forcedPause || (u.balance || 0) <= 0).length,
            totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
            totalSms: users.reduce((sum, u) => sum + (u.totalRequests || (u.activities || []).length), 0),
            totalRevenue: users.reduce((sum, u) => sum + (u.activities || []).reduce((s, a) => s + (a.cost || 0), 0), 0),
            tokensIn: 0,
            tokensOut: 0,
            storeBreakdown: users.map((u) => ({
              id: u.id,
              storeName: u.storeName || u.id,
              balance: u.balance || 0,
              revenue: (u.activities || []).reduce((s, a) => s + (a.cost || 0), 0),
              sms: u.totalRequests || (u.activities || []).length,
              status: u.status || ((u.balance || 0) <= 0 ? 'Paused (Zero Balance)' : 'Active')
            }))
          };
          const kpis = [
            { label: t('kpiRevenue'), value: `$${(stats.totalRevenue || 0).toFixed(2)}`, hint: t('billedToStores'), icon: DollarSign, color: '#059669' },
            { label: t('kpiSms'), value: Number(stats.totalSms || 0).toLocaleString(), hint: t('autoRepliesSent'), icon: MessageSquare, color: '#1d61ff' },
            { label: t('kpiStores'), value: String(stats.storeCount || 0), hint: t('allStores'), icon: Users, color: '#0f172a' },
            { label: t('kpiBalance'), value: `$${(stats.totalBalance || 0).toFixed(2)}`, hint: t('availableCredit'), icon: Wallet, color: '#7c3aed' },
            { label: t('kpiActive'), value: String(stats.activeCount || 0), hint: t('liveNow'), icon: Activity, color: '#059669' },
            { label: t('kpiPaused'), value: String(stats.pausedCount || 0), hint: t('zeroOrForcePaused'), icon: PauseCircle, color: '#dc2626' },
            { label: t('kpiTokens'), value: Number((stats.tokensIn || 0) + (stats.tokensOut || 0)).toLocaleString(), hint: t('inPlusOut'), icon: Zap, color: '#d97706' }
          ];
          return (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>{t('overviewTitle')}</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>{t('overviewSubtitle')}</p>
              </div>
              <div style={colGrid(200, 12)}>
                {kpis.map((k) => {
                  const Icon = k.icon;
                  return (
                    <div key={k.label} style={{ ...kpiCardStyle, minHeight: '108px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{k.label}</div>
                        <Icon size={15} color={k.color} />
                      </div>
                      <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>{k.value}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{k.hint}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ ...cardSectionStyle, marginTop: '16px', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {t('storeBreakdown')}
                </div>
                {(stats.storeBreakdown || []).length === 0 ? (
                  <div style={{ padding: '28px 18px', color: '#94a3b8', fontSize: '13px' }}>{t('noStoreData')}</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 16px', fontWeight: 700 }}>{t('storeCol')}</th>
                          <th style={{ padding: '10px 16px', fontWeight: 700 }}>{t('revenueCol')}</th>
                          <th style={{ padding: '10px 16px', fontWeight: 700 }}>{t('smsCol')}</th>
                          <th style={{ padding: '10px 16px', fontWeight: 700 }}>{t('balanceCol')}</th>
                          <th style={{ padding: '10px 16px', fontWeight: 700 }}>{t('statusCol')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.storeBreakdown.map((row) => (
                          <tr
                            key={row.id}
                            onClick={() => {
                              setSelectedUserId(row.id);
                              setSidebarPage('store');
                            }}
                            style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer' }}
                          >
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.storeName}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {row.id}</div>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669' }}>${(row.revenue || 0).toFixed(2)}</td>
                            <td style={{ padding: '12px 16px', color: '#334155' }}>{Number(row.sms || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: (row.balance || 0) <= 0 ? '#dc2626' : '#0f172a' }}>${(row.balance || 0).toFixed(2)}</td>
                            <td style={{ padding: '12px 16px', color: row.status === 'Active' ? '#059669' : '#dc2626', fontWeight: 600 }}>{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {sidebarPage === 'settings' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>{t('settings')}</h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0' }}>{t('settingsIntro')}</p>
            </div>

            <div style={{ ...cardSectionStyle, marginBottom: '16px', padding: isMobile ? '14px' : '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Globe size={16} color="#0f172a" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{t('language')}</h3>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.45 }}>{t('languageHint')}</p>
              <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
                <button
                  type="button"
                  onClick={() => persistLocale('en')}
                  style={{
                    border: 'none',
                    background: locale === 'en' ? '#ffffff' : 'transparent',
                    boxShadow: locale === 'en' ? '0 1px 4px rgba(15,23,42,0.08)' : 'none',
                    color: '#0f172a',
                    borderRadius: '9px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {t('english')}
                </button>
                <button
                  type="button"
                  onClick={() => persistLocale('zh')}
                  style={{
                    border: 'none',
                    background: locale === 'zh' ? '#ffffff' : 'transparent',
                    boxShadow: locale === 'zh' ? '0 1px 4px rgba(15,23,42,0.08)' : 'none',
                    color: '#0f172a',
                    borderRadius: '9px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {t('chineseMandarin')}
                </button>
              </div>
            </div>

            <div style={{ ...cardSectionStyle, padding: isMobile ? '14px' : '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {t('masterRuleTitle')}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                    {t('masterRuleDesc')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveMasterRule}
                  disabled={masterRuleSaving}
                  style={{ ...solidPrimaryBtnStyle, opacity: masterRuleSaving ? 0.7 : 1, ...tapBtn }}
                >
                  {masterRuleSaving ? t('saving') : t('saveSystemRule')}
                </button>
              </div>
              <textarea
                rows={isMobile ? 6 : 5}
                value={masterAiRule}
                onChange={(e) => setMasterAiRule(e.target.value)}
                placeholder={t('masterRulePlaceholder')}
                style={{ ...customInputStyle, resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        )}

        {sidebarPage === 'store' && selectedUser ? (
          <div>
            {/* Top Store Header Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
                <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>
                    {selectedUser.storeName || selectedUser.id}
                  </h1>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: selectedUser.forcedPause ? 'rgba(220, 38, 38, 0.15)' : ((selectedUser.balance || 0) <= 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                    color: selectedUser.forcedPause ? '#dc2626' : ((selectedUser.balance || 0) <= 0 ? '#dc2626' : '#059669'),
                    border: `1px solid ${selectedUser.forcedPause ? '#fca5a5' : ((selectedUser.balance || 0) <= 0 ? '#fca5a5' : '#86efac')}`
                  }}>
                    {selectedUser.forcedPause ? t('forcePaused') : ((selectedUser.balance || 0) <= 0 ? t('pausedZero') : t('liveActive'))}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '14px', flexWrap: 'wrap', wordBreak: 'break-word' }}>
                  <span>{t('userId')}: <strong>{selectedUser.id}</strong></span>
                  <span>{t('apkPassword')}: <strong>{showPasswordMap[selectedUser.id] ? selectedUser.password : '••••••••'}</strong>
                    <button 
                      onClick={() => setShowPasswordMap(prev => ({ ...prev, [selectedUser.id]: !prev[selectedUser.id] }))}
                      style={{ background: 'none', border: 'none', color: '#1d61ff', cursor: 'pointer', marginLeft: '6px', fontSize: '11px' }}
                    >
                      {showPasswordMap[selectedUser.id] ? t('hide') : t('show')}
                    </button>
                  </span>
                  <span>{t('activeAi')}: <strong>{selectedUser.aiConfig?.provider || 'Gemini'}</strong></span>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
                {/* Force Pause / Resume Auto-Reply Toggle */}
                <button
                  onClick={() => {
                    const nextForced = !selectedUser.forcedPause;
                    const updated = {
                      ...selectedUser,
                      forcedPause: nextForced,
                      status: nextForced ? 'Force Paused' : ((selectedUser.balance || 0) <= 0 ? 'Paused (Zero Balance)' : 'Active')
                    };
                    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
                    syncUserToServer(updated);
                    triggerToast(nextForced ? 'Store auto-reply FORCE PAUSED' : 'Store auto-reply RESUMED');
                  }}
                  style={{
                    background: selectedUser.forcedPause ? '#fee2e2' : '#f8fafc',
                    border: selectedUser.forcedPause ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: isMobile ? '10px 12px' : '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    color: selectedUser.forcedPause ? '#dc2626' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    flex: isMobile ? '1 1 calc(50% - 8px)' : undefined,
                    justifyContent: 'center',
                    ...tapBtn
                  }}
                >
                  {selectedUser.forcedPause ? t('resumeAutoReply') : t('forcePauseApk')}
                </button>

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
                    padding: isMobile ? '10px 12px' : '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#0f172a',
                    flex: isMobile ? '1 1 calc(50% - 8px)' : undefined,
                    justifyContent: 'center',
                    ...tapBtn
                  }}
                >
                  <Key size={13} color="#0f172a" />
                  <span>{t('changeCredentials')}</span>
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
                    padding: isMobile ? '10px 12px' : '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: isMobile ? '1 1 calc(50% - 8px)' : undefined,
                    justifyContent: 'center',
                    ...tapBtn
                  }}
                >
                  <RefreshCw size={13} />
                  <span>{t('syncApk')}</span>
                </button>

                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '8px',
                    padding: isMobile ? '10px 12px' : '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flex: isMobile ? '1 1 calc(50% - 8px)' : undefined,
                    justifyContent: 'center',
                    ...tapBtn
                  }}
                >
                  <Trash2 size={13} />
                  <span>{t('deleteStore')}</span>
                </button>
              </div>
            </div>

            {/* 3 Real Telemetry Summary Cards */}
            <div style={{
              ...colGrid(240, 14),
              marginBottom: '20px'
            }}>
              {/* Card 1: Balance Controls with Custom Amount Input */}
              <div style={kpiCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                    {t('accountBalance')}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleUpdateBalance(5.00)} style={pillBtnStyle}>+$5</button>
                    <button onClick={() => handleUpdateBalance(20.00)} style={pillBtnStyle}>+$20</button>
                    <button onClick={handleSetZeroBalance} style={{ ...pillBtnStyle, color: '#dc2626' }}>{t('setZero')}</button>
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
                <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 90px' }}>
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
                    style={{ ...solidPrimaryBtnStyle, padding: '7px 10px', fontSize: '11px', background: '#059669', flex: isMobile ? 1 : undefined, ...tapBtn }}
                    title={t('titleAddAmount')}
                  >
                    {t('addBtn')}
                  </button>
                  <button
                    onClick={() => {
                      const val = parseFloat(customBalInput);
                      if (!isNaN(val) && val > 0) handleUpdateBalance(-val);
                    }}
                    style={{ ...solidPrimaryBtnStyle, padding: '7px 10px', fontSize: '11px', background: '#dc2626', flex: isMobile ? 1 : undefined, ...tapBtn }}
                    title={t('titleDeductAmount')}
                  >
                    {t('deductBtn')}
                  </button>
                  <button
                    onClick={() => {
                      const val = parseFloat(customBalInput);
                      if (!isNaN(val) && val >= 0) handleSetExactBalance(val);
                    }}
                    style={{ ...solidPrimaryBtnStyle, padding: '7px 10px', fontSize: '11px', background: '#0f172a', flex: isMobile ? 1 : undefined, ...tapBtn }}
                    title={t('titleSetExact')}
                  >
                    {t('setExact')}
                  </button>
                </div>
              </div>

              {/* Card 2: Total SMS Handled */}
              <div style={kpiCardStyle}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {t('totalSmsHandled')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  {selectedUser.activities?.length || 0}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {t('primaryProviderLabel')}: <strong>{selectedUser.aiConfig?.provider || 'Gemini'}</strong>
                </div>
              </div>

              {/* Card 3: Total Cost & Tokens */}
              <div style={kpiCardStyle}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {t('revenueTokenUsage')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  ${(selectedUser.activities?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0).toFixed(4)}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {t('totalTokensLabel')}: {selectedUser.activities?.reduce((sum, a) => sum + (a.tokensIn || 0) + (a.tokensOut || 0), 0) || 0}
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
                { id: 'profile', label: t('tabProfile'), short: t('tabProfileShort'), icon: FileText },
                { id: 'ai_keys', label: t('tabAiKeys'), short: t('tabAiKeysShort'), icon: Key },
                { id: 'balance_history', label: t('tabBalance'), short: t('tabBalance'), icon: Receipt },
                { id: 'activity', label: t('tabActivity'), short: t('tabActivityShort'), icon: MessageSquare },
                { id: 'spam_schedule', label: t('tabHours'), short: t('tabHoursShort'), icon: Clock },
                { id: 'pricing', label: t('tabPricing'), short: t('tabPricingShort'), icon: DollarSign },
                { id: 'blacklist', label: t('tabManual'), short: t('tabManualShort'), icon: Ban }
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
                      padding: isMobile ? '10px 12px' : '8px 14px',
                      fontSize: isMobile ? '11px' : '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                      flex: isMobile ? '1 1 calc(50% - 6px)' : undefined,
                      minWidth: 0,
                      ...tapBtn
                    }}
                  >
                    <IconComp size={13} />
                    <span>{isMobile ? tab.short : tab.label}</span>
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
                      {t('profileTitle')}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      {t('profileDesc')}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={formLabelStyle}>{t('storeBusinessName')}</label>
                  <input
                    type="text"
                    value={profileDraft.storeName || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, storeName: e.target.value }));
                    }}
                    placeholder={t('phStoreName')}
                    style={customInputStyle}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={formLabelStyle}>{t('businessFaqLabel')}</label>
                  <textarea
                    rows={4}
                    value={profileDraft.businessInfo || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, businessInfo: e.target.value }));
                    }}
                    placeholder={t('phBusinessFaq')}
                    style={{ ...customInputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={formLabelStyle}>{t('aiToneLabel')}</label>
                  <textarea
                    rows={3}
                    value={profileDraft.replyTone || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, replyTone: e.target.value }));
                    }}
                    placeholder={t('phAiTone')}
                    style={{ ...customInputStyle, resize: 'vertical', minHeight: '84px' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={formLabelStyle}>{t('strictRulesLabel')}</label>
                  <textarea
                    rows={2}
                    value={profileDraft.aiRules || ''}
                    onChange={(e) => {
                      setEditFlags(prev => ({ ...prev, profile: true }));
                      setProfileDraft(prev => ({ ...prev, aiRules: e.target.value }));
                    }}
                    placeholder={t('phStrictRules')}
                    style={{ ...customInputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', marginTop: '16px' }}>
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={profileSaving} 
                    style={{ ...solidPrimaryBtnStyle, opacity: profileSaving ? 0.7 : 1, width: isMobile ? '100%' : undefined, ...tapBtn }}
                  >
                    {profileSaving ? t('savingSync') : t('saveProfile')}
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
                      {t('aiKeysTitle')}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      {t('aiKeysDesc')}
                    </p>
                  </div>
                </div>

                {/* Primary AI Engine Card */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#1d61ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={14} color="#ffffff" />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      {t('primaryProvider')}
                    </span>
                  </div>

                  {/* Provider Selector Chips */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={formLabelStyle}>{t('selectPrimaryEngine')}</label>
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
                    <label style={formLabelStyle}>{t('primaryApiKey')} ({aiDraft.provider})</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showKeyMap['primary'] ? 'text' : 'password'}
                        placeholder={PROVIDER_DEFAULTS[aiDraft.provider]?.placeholder || t('enterApiKey')}
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
                  <div style={{ ...colGrid(220, 12), marginBottom: '14px' }}>
                    <div>
                      <label style={formLabelStyle}>{t('modelName')}</label>
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
                      <label style={formLabelStyle}>{t('apiBaseUrl')}</label>
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
                    <label style={formLabelStyle}>{t('fallbackMessageLabel')}</label>
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
                          {t('backupChainTitle')}
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {t('backupChainDesc')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{t('enableBackupChain')}</span>
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
                                {t('backupSlot', { n: slotNum })}: {PROVIDER_DEFAULTS[slotData.provider || 'GEMINI']?.name}
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
                                <label style={formLabelStyle}>{t('backupProvider')}</label>
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
                                <label style={formLabelStyle}>{t('backupApiKey')}</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type={showKeyMap[slotKey] ? 'text' : 'password'}
                                    placeholder={PROVIDER_DEFAULTS[slotData.provider || 'GEMINI']?.placeholder || t('enterApiKey')}
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
                              <div style={colGrid(200, 10)}>
                                <div>
                                  <label style={formLabelStyle}>{t('backupModelName')}</label>
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
                                  <label style={formLabelStyle}>{t('apiBaseUrl')}</label>
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

                <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', marginTop: '16px' }}>
                  <button 
                    onClick={handleSaveAiConfig} 
                    disabled={aiSaving} 
                    style={{ ...solidPrimaryBtnStyle, opacity: aiSaving ? 0.7 : 1, width: isMobile ? '100%' : undefined, ...tapBtn }}
                  >
                    {aiSaving ? t('savingSync') : t('saveAiKeys')}
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
                      {t('balanceLedgerTitle')}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      {t('balanceLedgerDesc')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        fetchUsers();
                        triggerToast(t('syncingLedger'));
                      }}
                      style={{ ...pillBtnStyle, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={12} />
                      <span>{t('refreshLedger')}</span>
                    </button>
                  </div>
                </div>

                {/* Top Summary KPI Cards */}
                <div style={{ ...colGrid(200, 12), marginBottom: '18px' }}>
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {t('currentAvailableBalance')}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: (selectedUser.balance || 0) <= 0 ? '#dc2626' : '#059669' }}>
                      ${(selectedUser.balance || 0).toFixed(4)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {(selectedUser.balance || 0) <= 0 ? t('zeroBalancePaused') : t('activeForSms')}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {t('totalDeposits')}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                      ${((selectedUser.balanceHistory || [])
                        .filter(t => (parseFloat(t.amount) || 0) > 0)
                        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)).toFixed(2)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {t('depositEntries', { n: (selectedUser.balanceHistory || []).filter(tx => (parseFloat(tx.amount) || 0) > 0).length })}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {t('totalSmsSpend')}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                      ${Math.abs((selectedUser.balanceHistory || [])
                        .filter(t => (parseFloat(t.amount) || 0) < 0 && (t.type?.toLowerCase().includes('sms') || t.description?.toLowerCase().includes('reply')))
                        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || (selectedUser.activities?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0)).toFixed(4)}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {t('automatedMessages', { n: selectedUser.activities?.length || 0 })}
                    </span>
                  </div>
                </div>

                {/* Quick Balance Controls & Deposit Form */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wallet size={14} color="#0f172a" />
                    <span>{t('manageStoreFunds')}</span>
                  </div>

                  {/* Custom Amount Form */}
                  <div style={{ ...colGrid(180, 10), alignItems: 'flex-end' }}>
                    <div>
                      <label style={formLabelStyle}>{t('customAmount')}</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={t('phCustomAmount')}
                        value={customBalInput}
                        onChange={(e) => setCustomBalInput(e.target.value)}
                        style={customInputStyle}
                      />
                    </div>
                    <div>
                      <label style={formLabelStyle}>{t('referenceNote')}</label>
                      <input
                        type="text"
                        placeholder={t('phReferenceNote')}
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
                        {t('addFunds')}
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
                        {t('deductBtn')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ledger Table & Filters */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>
                      {t('txHistory', { n: (selectedUser.balanceHistory || []).length })}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {['all', 'topup', 'sms', 'adjustment'].map(f => (
                        <button
                          key={f}
                          onClick={() => setBalanceFilter(f)}
                          style={{
                            background: balanceFilter === f ? '#0f172a' : '#f8fafc',
                            color: balanceFilter === f ? '#ffffff' : '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: isMobile ? '8px 10px' : '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            flex: isMobile ? '1 1 calc(50% - 4px)' : undefined,
                            ...tapBtn
                          }}
                        >
                          {f === 'topup' ? t('filterTopUps') : f === 'sms' ? t('filterSmsReplies') : f === 'adjustment' ? t('filterAdjustments') : t('filterAllSimple')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ledger Table */}
                  {(() => {
                    const ledgerRows = (!selectedUser.balanceHistory || selectedUser.balanceHistory.length === 0)
                      ? []
                      : selectedUser.balanceHistory.filter(t => {
                          const amt = parseFloat(t.amount) || 0;
                          const type = (t.type || '').toLowerCase();
                          if (balanceFilter === 'topup') return amt > 0 || type.includes('deposit') || type.includes('top');
                          if (balanceFilter === 'sms') return amt < 0 && (type.includes('sms') || type.includes('reply'));
                          if (balanceFilter === 'adjustment') return type.includes('adjustment') || (amt < 0 && !type.includes('sms'));
                          return true;
                        });
                    const emptyMsg = t('emptyLedger');
                    if (isMobile) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {ledgerRows.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                              {emptyMsg}
                            </div>
                          ) : ledgerRows.map((tx, idx) => {
                            const amt = parseFloat(tx.amount) || 0;
                            const isPositive = amt > 0;
                            return (
                              <div key={tx.id || idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    background: isPositive ? '#ecfdf5' : '#fef2f2',
                                    color: isPositive ? '#059669' : '#dc2626',
                                    border: `1px solid ${isPositive ? '#a7f3d0' : '#fecaca'}`
                                  }}>
                                    {isPositive ? t('topUp') : tx.type || t('deduction')}
                                  </span>
                                  <span style={{ fontWeight: '800', color: isPositive ? '#059669' : '#dc2626', fontSize: '13px', flexShrink: 0 }}>
                                    {isPositive ? `+$${amt.toFixed(4)}` : `-$${Math.abs(amt).toFixed(4)}`}
                                  </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', wordBreak: 'break-word', marginBottom: '8px' }}>
                                  {tx.description || tx.recipientNumber || 'Balance change'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '11px', color: '#94a3b8', flexWrap: 'wrap' }}>
                                  <span>{tx.date || new Date(tx.timestampMillis || Date.now()).toLocaleDateString()} {tx.time || new Date(tx.timestampMillis || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span style={{ color: '#0f172a', fontWeight: '600' }}>{tx.balanceAfter != null ? t('afterAmount', { n: parseFloat(tx.balanceAfter).toFixed(4) }) : '—'}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return (
                  <div style={{ overflowX: 'hidden', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', fontSize: '11px' }}>
                          <th style={{ padding: '10px 14px' }}>{t('dateTimeCol')}</th>
                          <th style={{ padding: '10px 14px' }}>{t('typeCol')}</th>
                          <th style={{ padding: '10px 14px' }}>{t('amountCol')}</th>
                          <th style={{ padding: '10px 14px' }}>{t('balanceAfter')}</th>
                          <th style={{ padding: '10px 14px' }}>{t('detailsNote')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerRows.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                              {emptyMsg}
                            </td>
                          </tr>
                        ) : (
                          ledgerRows.map((tx, idx) => {
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
                                      {isPositive ? t('topUp') : tx.type || t('deduction')}
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
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ─── TAB 3: LIVE SMS ACTIVITY ─── */}
            {activeTab === 'activity' && (
              <div style={cardSectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {t('liveSmsLog', { n: selectedUser.activities?.length || 0 })}
                  </h3>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['all', 'sent', 'blocked'].map(f => (
                      <button
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        style={{
                          background: activityFilter === f ? '#0f172a' : '#f8fafc',
                          color: activityFilter === f ? '#ffffff' : '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: isMobile ? '8px 10px' : '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          flex: isMobile ? 1 : undefined,
                          ...tapBtn
                        }}
                      >
                        {f === 'sent' ? t('filterSent') : f === 'blocked' ? t('filterBlocked') : t('filterAllSimple')}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
                  {(!selectedUser.activities || selectedUser.activities.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px' }}>
                      {t('noSmsActivity')}
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', gap: '8px' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a', wordBreak: 'break-word' }}>{act.sender}</span>
                            <span style={{ color: '#94a3b8', flexShrink: 0 }}>{act.time}</span>
                          </div>
                          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', wordBreak: 'break-word' }}>
                            <strong>{t('incomingLabel')}</strong> {act.incoming}
                          </div>
                          {act.reply && (
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: '#1d4ed8', wordBreak: 'break-word' }}>
                              <strong>{t('aiReplyLabel')}</strong> {act.reply}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap' }}>
                            <span>{t('tokensInLine', { n: act.tokensIn || 0 })}</span>
                            <span>{t('tokensOutLine', { n: act.tokensOut || 0 })}</span>
                            <span>{t('costLine', { n: (act.cost || 0.005).toFixed(4) })}</span>
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
                      {t('spamTitle')}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      {t('spamDesc')}
                    </p>
                  </div>
                </div>

                <div style={{ ...colGrid(280, 16), marginBottom: '16px' }}>
                  {/* Spam Rules Card */}
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a', marginBottom: '14px' }}>
                      {t('rateLimitTitle')}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                      {/* Rule 1: Cooldown */}
                      <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: spamDraft.cooldownEnabled !== false ? '8px' : '0' }}>
                          <div>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{t('cooldownTitle')}</span>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{t('cooldownDesc')}</div>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{ color: '#64748b' }}>{t('cooldownSeconds')}</span>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: spamDraft.maxRepliesEnabled !== false ? '8px' : '0' }}>
                          <div>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{t('maxRepliesTitle')}</span>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{t('maxRepliesDesc')}</div>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{ color: '#64748b' }}>{t('maxRepliesLabel')}</span>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: spamDraft.windowEnabled !== false ? '8px' : '0' }}>
                          <div>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{t('windowTitle')}</span>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{t('windowDesc')}</div>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span style={{ color: '#64748b' }}>{t('windowMinutes')}</span>
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
                        <div style={{ fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>{t('hoursFilterTitle')}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{t('hoursFilterDesc')}</div>
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
                          <span style={{ color: '#475569', fontWeight: '700', display: 'block', marginBottom: '6px' }}>{t('scheduleMode')}</span>
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
                              {t('duringHoursOnly')}
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
                              {t('afterHoursReceptionist')}
                            </button>
                          </div>
                        </div>

                        {/* Start & End Time */}
                        <div>
                          <span style={{ color: '#475569', fontWeight: '700', display: 'block', marginBottom: '6px' }}>{t('hoursRange')}</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              type="time"
                              value={spamDraft.scheduleStart || '09:00'}
                              onChange={(e) => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, scheduleStart: e.target.value }));
                              }}
                              style={{ ...customInputStyle, width: isMobile ? '100%' : '100px' }}
                            />
                            <span style={{ color: '#94a3b8' }}>{t('toWord')}</span>
                            <input
                              type="time"
                              value={spamDraft.scheduleEnd || '18:00'}
                              onChange={(e) => {
                                setEditFlags(prev => ({ ...prev, spam: true }));
                                setSpamDraft(prev => ({ ...prev, scheduleEnd: e.target.value }));
                              }}
                              style={{ ...customInputStyle, width: isMobile ? '100%' : '100px' }}
                            />
                          </div>
                        </div>

                        {/* Active Days */}
                        <div>
                          <span style={{ color: '#475569', fontWeight: '700', display: 'block', marginBottom: '6px' }}>{t('activeDays')}</span>
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
                                  {t(`day${day}`)}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Out of Hours Message */}
                        <div>
                          <span style={{ color: '#475569', fontWeight: '700', display: 'block', marginBottom: '6px' }}>{t('outOfHoursMsg')}</span>
                          <textarea
                            rows={2}
                            value={spamDraft.outOfHoursMsg || ''}
                            onChange={(e) => {
                              setEditFlags(prev => ({ ...prev, spam: true }));
                              setSpamDraft(prev => ({ ...prev, outOfHoursMsg: e.target.value }));
                            }}
                            placeholder={t('phOutOfHours')}
                            style={{ ...customInputStyle, resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', marginTop: '16px' }}>
                  <button 
                    onClick={handleSaveSpamSchedule} 
                    disabled={spamSaving} 
                    style={{ ...solidPrimaryBtnStyle, opacity: spamSaving ? 0.7 : 1, width: isMobile ? '100%' : undefined, ...tapBtn }}
                  >
                    {spamSaving ? t('savingSync') : t('saveSpamHours')}
                  </button>
                </div>
              </div>
            )}

            {/* ─── TAB 5: PRICING & TOKEN RATES ─── */}
            {activeTab === 'pricing' && (() => {
              const activities = selectedUser?.activities || [];
              const totalUserRequests = activities.length || selectedUser?.totalRequests || 0;
              const totalTokensIn = activities.reduce((sum, a) => sum + (parseInt(a.tokensIn) || 0), 0);
              const totalTokensOut = activities.reduce((sum, a) => sum + (parseInt(a.tokensOut) || 0), 0);
              const totalTokens = totalTokensIn + totalTokensOut;

              // Compute exact multi-model raw cost by calculating each message against the specific model that replied
              let totalActualRawCost = 0;
              let primaryCount = 0;
              let backupCount = 0;

              const enrichedActivities = activities.map(act => {
                const rateInfo = getModelRateForActivity(act, selectedUser);
                const inT = parseInt(act.tokensIn) || 0;
                const outT = parseInt(act.tokensOut) || 0;
                const rawMsgCost = ((inT / 1000000) * rateInfo.inPrice) + ((outT / 1000000) * rateInfo.outPrice);
                const billedCost = parseFloat(act.cost) || 0;
                const margin = billedCost - rawMsgCost;

                if (rateInfo.isBackup) backupCount++; else primaryCount++;
                totalActualRawCost += rawMsgCost;

                return {
                  ...act,
                  rateInfo,
                  inT,
                  outT,
                  totalT: inT + outT,
                  rawMsgCost,
                  billedCost,
                  margin
                };
              });

              const avgRawCostPerMsg = totalUserRequests > 0 ? (totalActualRawCost / totalUserRequests) : 0;
              const totalCustomerBilled = activities.reduce((sum, a) => sum + (parseFloat(a.cost) || 0), 0);
              const netMargin = totalCustomerBilled - totalActualRawCost;
              const marginPercent = totalCustomerBilled > 0 ? ((netMargin / totalCustomerBilled) * 100).toFixed(1) : '0.0';

              const filteredRawActivities = enrichedActivities.filter(a => {
                if (rawUsageFilter === 'primary') return !a.rateInfo.isBackup;
                if (rawUsageFilter === 'backup') return a.rateInfo.isBackup;
                return true;
              });

              return (
                <div style={cardSectionStyle}>
                  {/* Section 1: Customer Retail Pricing Mode */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {t('pricingTitle')}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                        {t('pricingDesc')}
                      </p>
                    </div>
                  </div>

                  <div style={{ ...colGrid(280, 14), marginBottom: '20px' }}>
                    <div
                      onClick={() => {
                        setPricingDraft(prev => ({ ...prev, pricingMode: 'fixed_fee' }));
                        setEditFlags(prev => ({ ...prev, pricing: true }));
                      }}
                      style={{
                        background: pricingDraft.pricingMode === 'fixed_fee' ? '#ffffff' : '#f8fafc',
                        border: pricingDraft.pricingMode === 'fixed_fee' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                          {t('fixedFlatFee')}
                        </span>
                        {pricingDraft.pricingMode === 'fixed_fee' && (
                          <span style={{ fontSize: '10px', background: '#0f172a', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>{t('active')}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                        {t('fixedFeeDesc')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>$</span>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={pricingDraft.fixedFeePerMessage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            setPricingDraft(prev => ({ ...prev, fixedFeePerMessage: e.target.value }));
                            setEditFlags(prev => ({ ...prev, pricing: true }));
                          }}
                          style={{ ...customInputStyle, width: isMobile ? '100%' : '100px', fontWeight: '700' }}
                        />
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{t('perReply')}</span>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setPricingDraft(prev => ({ ...prev, pricingMode: 'default_ai' }));
                        setEditFlags(prev => ({ ...prev, pricing: true }));
                      }}
                      style={{
                        background: pricingDraft.pricingMode === 'default_ai' ? '#ffffff' : '#f8fafc',
                        border: pricingDraft.pricingMode === 'default_ai' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                          {t('directPassThrough')}
                        </span>
                        {pricingDraft.pricingMode === 'default_ai' && (
                          <span style={{ fontSize: '10px', background: '#0f172a', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>{t('active')}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                        {t('directPassDesc')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                        {t('geminiFlashLite', { in: modelRates.GEMINI_25.inPrice, out: modelRates.GEMINI_25.outPrice })}
                      </div>
                    </div>
                  </div>

                  {/* Save Button for Pricing */}
                  <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-start', marginBottom: '24px' }}>
                    <button
                      onClick={handleSavePricing}
                      disabled={pricingSaving}
                      style={{ ...solidPrimaryBtnStyle, opacity: pricingSaving ? 0.7 : 1, width: isMobile ? '100%' : undefined, ...tapBtn }}
                    >
                      {pricingSaving ? t('savingSync') : t('savePricing')}
                    </button>
                  </div>

                  {/* Section 2: Actual Raw API Usage & Multi-Model Real Cost */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {t('rawUsageTitle')}
                          </h3>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                          {t('rawUsageDesc')}
                        </p>
                      </div>

                      {/* Button to open Model Pricing Editor Popup */}
                      <button
                        onClick={handleOpenPricingModal}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          color: '#0f172a',
                          borderRadius: '8px',
                          padding: '7px 14px',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <Settings size={14} color="#1d4ed8" />
                        <span>{t('updateModelRates')}</span>
                      </button>
                    </div>

                    {/* 4 Analytics KPI Cards */}
                    <div style={{ ...colGrid(200, 12), marginBottom: '16px' }}>
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {t('totalApiRequests')}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                          {totalUserRequests.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {t('primaryBackupLine', { primary: primaryCount, backup: backupCount })}
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {t('totalTokenVolume')}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                          {totalTokens.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {t('tokensInOut', { in: totalTokensIn.toLocaleString(), out: totalTokensOut.toLocaleString() })}
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {t('actualRawCost')}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626' }}>
                          ${totalActualRawCost.toFixed(5)}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {t('calcAcrossModels')}
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {t('estRawCost')}
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>
                          ${avgRawCostPerMsg.toFixed(5)}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {t('blendedAvg')}
                        </span>
                      </div>
                    </div>

                    {/* Economics & Gross Spread Banner */}
                    <div style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                          {t('customerVsRaw')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {t('totalCustomerSpend')}: <strong style={{ color: '#0f172a' }}>${totalCustomerBilled.toFixed(4)}</strong> • {t('actualApiCostLabel')}: <strong style={{ color: '#dc2626' }}>${totalActualRawCost.toFixed(5)}</strong>
                        </div>
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: netMargin >= 0 ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${netMargin >= 0 ? '#a7f3d0' : '#fecaca'}`,
                        padding: '8px 14px',
                        borderRadius: '8px'
                      }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{t('grossMargin')}</span>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: netMargin >= 0 ? '#059669' : '#dc2626' }}>
                          {netMargin >= 0 ? `+$${netMargin.toFixed(4)} (+${marginPercent}%)` : `-$${Math.abs(netMargin).toFixed(4)} (${marginPercent}%)`}
                        </span>
                      </div>
                    </div>

                    {/* Section 3: Per-Message Token Usage & Cost History Log */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {t('tokenLogTitle', { n: filteredRawActivities.length })}
                          </h4>
                          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                            {t('tokenLogDesc')}
                          </p>
                        </div>

                        {/* Filter Tabs */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {[
                            { key: 'all', label: t('filterAll', { n: enrichedActivities.length }) },
                            { key: 'primary', label: t('filterPrimary', { n: primaryCount }) },
                            { key: 'backup', label: t('filterBackup', { n: backupCount }) }
                          ].map(tab => (
                            <button
                              key={tab.key}
                              onClick={() => setRawUsageFilter(tab.key)}
                              style={{
                                background: rawUsageFilter === tab.key ? '#0f172a' : '#f8fafc',
                                color: rawUsageFilter === tab.key ? '#ffffff' : '#64748b',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: isMobile ? '8px 10px' : '4px 10px',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                flex: isMobile ? '1 1 auto' : undefined,
                                ...tapBtn
                              }}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ overflowX: 'hidden' }}>
                        {isMobile ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {filteredRawActivities.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                                {t('noExecutions')}
                              </div>
                            ) : filteredRawActivities.map((act, i) => (
                              <div key={act.id || i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px', wordBreak: 'break-word' }}>{act.sender}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{act.time || t('justNow')}</div>
                                  </div>
                                  <span style={{
                                    display: 'inline-flex',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    background: act.rateInfo.isBackup ? '#eff6ff' : '#ecfdf5',
                                    color: act.rateInfo.isBackup ? '#1d4ed8' : '#059669',
                                    border: `1px solid ${act.rateInfo.isBackup ? '#bfdbfe' : '#a7f3d0'}`,
                                    flexShrink: 0
                                  }}>
                                    {act.rateInfo.label}
                                  </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#0f172a', marginBottom: '8px' }}>
                                  {t('tokensInOut', { in: act.inT, out: act.outT })} <span style={{ color: '#94a3b8', fontSize: '10px' }}>({act.totalT})</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', fontSize: '11px' }}>
                                  <span style={{ color: '#dc2626', fontWeight: '700' }}>{t('costShort')} ${act.rawMsgCost.toFixed(6)}</span>
                                  <span style={{ color: '#0f172a', fontWeight: '700' }}>{t('billedShort')} ${act.billedCost.toFixed(4)}</span>
                                  <span style={{ fontWeight: '700', color: act.margin >= 0 ? '#059669' : '#dc2626' }}>
                                    {act.margin >= 0 ? `+$${act.margin.toFixed(4)}` : `-$${Math.abs(act.margin).toFixed(4)}`}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '700', fontSize: '11px' }}>
                              <th style={{ padding: '10px 14px' }}>{t('timeCol')}</th>
                              <th style={{ padding: '10px 14px' }}>{t('senderCol')}</th>
                              <th style={{ padding: '10px 14px' }}>{t('modelEngineCol')}</th>
                              <th style={{ padding: '10px 14px' }}>{t('tokensInOutCol')}</th>
                              <th style={{ padding: '10px 14px' }}>{t('rawSupplierCol')}</th>
                              <th style={{ padding: '10px 14px' }}>{t('customerBilledCol')}</th>
                              <th style={{ padding: '10px 14px' }}>{t('grossMarginCol')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRawActivities.length === 0 ? (
                              <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                  {t('noExecutions')}
                                </td>
                              </tr>
                            ) : (
                              filteredRawActivities.map((act, i) => (
                                <tr key={act.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '10px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                    {act.time || t('justNow')}
                                  </td>
                                  <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0f172a' }}>
                                    {act.sender}
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
                                      background: act.rateInfo.isBackup ? '#eff6ff' : '#ecfdf5',
                                      color: act.rateInfo.isBackup ? '#1d4ed8' : '#059669',
                                      border: `1px solid ${act.rateInfo.isBackup ? '#bfdbfe' : '#a7f3d0'}`
                                    }}>
                                      {act.rateInfo.label}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: '600' }}>
                                    <span>{t('tokensInOut', { in: act.inT, out: act.outT })}</span> <span style={{ color: '#94a3b8', fontSize: '10px' }}>({act.totalT})</span>
                                  </td>
                                  <td style={{ padding: '10px 14px', fontWeight: '700', color: '#dc2626' }}>
                                    ${act.rawMsgCost.toFixed(6)}
                                  </td>
                                  <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0f172a' }}>
                                    ${act.billedCost.toFixed(4)}
                                  </td>
                                  <td style={{ padding: '10px 14px', fontWeight: '700', color: act.margin >= 0 ? '#059669' : '#dc2626' }}>
                                    {act.margin >= 0 ? `+$${act.margin.toFixed(4)}` : `-$${Math.abs(act.margin).toFixed(4)}`}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                        </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* ─── TAB 6: MANUAL REPLY LIST ─── */}
            {activeTab === 'blacklist' && (
              <div style={cardSectionStyle}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
                  {t('manualListTitle')}
                </h3>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center' }}>
                  <input
                    id="newBlockInput"
                    type="text"
                    placeholder={t('phPhoneNumber')}
                    style={{ ...customInputStyle, maxWidth: isMobile ? '100%' : '260px' }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById('newBlockInput');
                      if (el && el.value) {
                        handleAddBlockedNumber(el.value);
                        el.value = '';
                      }
                    }}
                    style={{ ...solidPrimaryBtnStyle, ...tapBtn, width: isMobile ? '100%' : undefined }}
                  >
                    {t('addNumber')}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(!selectedUser.blacklist || selectedUser.blacklist.length === 0) ? (
                    <div style={{ color: '#94a3b8', fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
                      {t('noManualNumbers')}
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
                          {t('remove')}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        ) : sidebarPage === 'store' ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 12px' : '60px 0', color: '#94a3b8' }}>
            {isMobile ? t('tapMenuSelect') : t('selectStoreSidebar')}
          </div>
        ) : null}

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
          zIndex: 1300,
          padding: isMobile ? '12px' : '16px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: isMobile ? '16px' : '20px',
            padding: isMobile ? '20px 16px' : '28px',
            width: '100%',
            maxWidth: '440px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {t('createStoreAccount')}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              {t('createStoreDesc')}
            </p>

            <form onSubmit={handleCreateNewUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={formLabelStyle}>{t('userIdRequired')}</label>
                <input
                  type="text"
                  placeholder={t('phUserId')}
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  style={customInputStyle}
                  required
                />
              </div>

              <div>
                <label style={formLabelStyle}>{t('passwordRequired')}</label>
                <input
                  type="password"
                  placeholder={t('phPassword')}
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  style={customInputStyle}
                  required
                />
              </div>

              <div>
                <label style={formLabelStyle}>{t('storeBusinessName')}</label>
                <input
                  type="text"
                  placeholder={t('phStoreName')}
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  style={customInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={formLabelStyle}>{t('initialBalance')}</label>
                  <input
                    type="number"
                    step="1.00"
                    value={newInitialBal}
                    onChange={(e) => setNewInitialBal(e.target.value)}
                    style={customInputStyle}
                  />
                </div>
                <div>
                  <label style={formLabelStyle}>{t('messageFee')}</label>
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

              <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row', gap: '10px', marginTop: '10px' }}>
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
                    cursor: 'pointer',
                    width: isMobile ? '100%' : undefined,
                    ...tapBtn
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...solidPrimaryBtnStyle, width: isMobile ? '100%' : undefined, ...tapBtn }}
                >
                  {loading ? t('creating') : t('createAccount')}
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
          zIndex: 1300,
          padding: isMobile ? '12px' : '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: isMobile ? '18px 16px' : '24px',
            width: '100%',
            maxWidth: '440px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {t('changeCredsTitle')}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  {t('changeCredsDesc', { name: selectedUser.storeName || selectedUser.id })}
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
                <label style={formLabelStyle}>{t('storeUserId')}</label>
                <input
                  type="text"
                  value={credUserId}
                  onChange={(e) => setCredUserId(e.target.value)}
                  style={customInputStyle}
                  required
                  autoFocus
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  {t('apkUsernameHint')}
                </span>
              </div>

              <div>
                <label style={formLabelStyle}>{t('apkPassword')}</label>
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
                  {t('apkPasswordHint')}
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

              <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row', gap: '8px', marginTop: '8px' }}>
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
                    cursor: 'pointer',
                    width: isMobile ? '100%' : undefined,
                    ...tapBtn
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={credLoading}
                  style={{ ...solidPrimaryBtnStyle, padding: '8px 16px', width: isMobile ? '100%' : undefined, ...tapBtn }}
                >
                  {credLoading ? t('saving') : t('saveSyncCredentials')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: UPDATE SUPPLIER MODEL PRICING ─── */}
      {showModelPricingModal && tempModelRates && (
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
          zIndex: 1300,
          padding: isMobile ? '12px' : '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: isMobile ? '18px 16px' : '24px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={18} color="#1d4ed8" />
                  {t('updateSupplierPricing')}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
                  {t('supplierPricingDesc')}
                </p>
              </div>
              <button
                onClick={() => setShowModelPricingModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModelRates} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(tempModelRates).map(mKey => {
                  const m = tempModelRates[mKey];
                  return (
                    <div key={mKey} style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: isMobile ? 'stretch' : 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{m.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>{m.model}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            {t('inputPer1M')}
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={m.inPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setTempModelRates(prev => ({
                                ...prev,
                                [mKey]: { ...prev[mKey], inPrice: val }
                              }));
                            }}
                            style={{ ...customInputStyle, width: isMobile ? '100%' : '90px', padding: '6px 8px', fontSize: '12px' }}
                            required
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            {t('outputPer1M')}
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            value={m.outPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setTempModelRates(prev => ({
                                ...prev,
                                [mKey]: { ...prev[mKey], outPrice: val }
                              }));
                            }}
                            style={{ ...customInputStyle, width: isMobile ? '100%' : '90px', padding: '6px 8px', fontSize: '12px' }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginTop: '14px', flexWrap: 'wrap', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button
                  type="button"
                  onClick={handleResetDefaultModelRates}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#64748b',
                    cursor: 'pointer',
                    width: isMobile ? '100%' : undefined,
                    ...tapBtn
                  }}
                >
                  {t('reset2026Defaults')}
                </button>

                <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setShowModelPricingModal(false)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#475569',
                      cursor: 'pointer',
                      flex: isMobile ? 1 : undefined,
                      ...tapBtn
                    }}
                    >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    style={{ ...solidPrimaryBtnStyle, padding: '8px 18px', flex: isMobile ? 1 : undefined, ...tapBtn }}
                  >
                    {t('saveCustomRates')}
                  </button>
                </div>
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
  boxSizing: 'border-box',
  maxWidth: '100%',
  overflow: 'hidden',
  wordBreak: 'break-word'
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
  fontFamily: 'inherit',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  maxWidth: '100%'
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
