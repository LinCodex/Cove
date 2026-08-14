// Centralized Data & Persistence Layer for Cove Master Control & Client APKs
// Powered by Supabase PostgreSQL — globally consistent, zero rate limits.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nnpvbdcslplqevfcxcuf.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucHZiZGNzbHBscWV2ZmN4Y3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTI0ODgsImV4cCI6MjEwMjI4ODQ4OH0.ufGGY30xQ5prEPH3ayJ-e4p5TzWxB2TWMWNC6_qr6u4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Helpers ────────────────────────────────────────────────

export function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

/** Convert a Supabase row into the JSON shape the API and APK expect. */
function rowToUser(row) {
  return {
    id: row.id,
    password: row.password,
    storeName: row.store_name,
    phone: row.phone || '',
    address: row.address || '',
    balance: Number.isFinite(parseFloat(row.balance)) ? parseFloat(row.balance) : 0,
    status: Boolean(row.forced_pause)
      ? 'Force Paused'
      : ((Number.isFinite(parseFloat(row.balance)) ? parseFloat(row.balance) : 0) <= 0
        ? 'Paused (Zero Balance)'
        : 'Active'),
    pricingMode: row.pricing_mode,
    fixedFeePerMessage: parseFloat(row.fixed_fee_per_message),
    customInputPrice1M: parseFloat(row.custom_input_price_1m),
    customOutputPrice1M: parseFloat(row.custom_output_price_1m),
    totalRequests: row.total_requests || 0,
    lastActive: new Date(row.last_active).getTime(),
    forcedPause: Boolean(row.forced_pause),
    businessProfile: row.business_profile || {},
    spamConfig: row.spam_config || {},
    aiConfig: row.ai_config || {},
    blacklist: row.blacklist || [],
    balanceHistory: row.balance_history || [],
    activities: [],  // loaded separately when needed
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function derivedStatus(balance, forcedPause) {
  if (forcedPause) return 'Force Paused';
  return (parseFloat(balance) || 0) <= 0 ? 'Paused (Zero Balance)' : 'Active';
}

export function isRedactedSecret(value) {
  if (value == null) return true;
  const s = String(value).trim();
  return s === '' || s.includes('•');
}

export function mergeAiConfig(existing = {}, incoming = {}) {
  const keepKey = (next, prev) => (isRedactedSecret(next) ? (prev || '') : next);
  const mergeSlot = (prevSlot, nextSlot) => {
    if (!nextSlot || typeof nextSlot !== 'object') return prevSlot;
    return {
      ...(prevSlot || {}),
      ...nextSlot,
      apiKey: keepKey(nextSlot.apiKey, prevSlot?.apiKey)
    };
  };
  return {
    ...(existing || {}),
    ...incoming,
    apiKey: keepKey(incoming.apiKey, existing?.apiKey),
    backupSlot1: mergeSlot(existing?.backupSlot1, incoming.backupSlot1),
    backupSlot2: mergeSlot(existing?.backupSlot2, incoming.backupSlot2),
    backupSlot3: mergeSlot(existing?.backupSlot3, incoming.backupSlot3),
    backupSlot4: mergeSlot(existing?.backupSlot4, incoming.backupSlot4),
    backupSlot5: mergeSlot(existing?.backupSlot5, incoming.backupSlot5)
  };
}

export function redactUserForList(user) {
  if (!user) return user;
  const hideSlot = (slot) => {
    if (!slot || typeof slot !== 'object') return slot;
    return { ...slot, apiKey: slot.apiKey ? '••••' : '' };
  };
  return {
    ...user,
    password: user.password ? '••••' : '',
    aiConfig: {
      ...(user.aiConfig || {}),
      apiKey: user.aiConfig?.apiKey ? '••••' : '',
      backupSlot1: hideSlot(user.aiConfig?.backupSlot1),
      backupSlot2: hideSlot(user.aiConfig?.backupSlot2),
      backupSlot3: hideSlot(user.aiConfig?.backupSlot3),
      backupSlot4: hideSlot(user.aiConfig?.backupSlot4),
      backupSlot5: hideSlot(user.aiConfig?.backupSlot5)
    }
  };
}

/**
 * Convert API/frontend user object into Supabase row shape.
 * Balance columns are omitted unless includeBalance is true, so config saves
 * cannot clobber a concurrent admin top-up or SMS deduction.
 */
function userToRow(user, { includeBalance = true } = {}) {
  const row = {};
  if (user.id != null) row.id = user.id;
  if (user.password != null && String(user.password).trim() !== '' && !isRedactedSecret(user.password)) {
    row.password = user.password;
  }
  if (user.storeName != null || user.store_name != null) row.store_name = user.storeName ?? user.store_name;
  if (user.phone != null) row.phone = user.phone;
  if (user.address != null) row.address = user.address;
  if (includeBalance) {
    if (user.balance != null && user.balance !== '') {
      const n = parseFloat(user.balance);
      if (Number.isFinite(n)) row.balance = n;
    }
    if (user.status != null) row.status = user.status;
    if (user.balanceHistory != null || user.balance_history != null) {
      row.balance_history = user.balanceHistory ?? user.balance_history;
    }
  }
  if (user.forcedPause != null) row.forced_pause = Boolean(user.forcedPause);
  if (user.pricingMode != null || user.pricing_mode != null) row.pricing_mode = user.pricingMode ?? user.pricing_mode;
  if (user.fixedFeePerMessage != null || user.fixed_fee_per_message != null) {
    const n = parseFloat(user.fixedFeePerMessage ?? user.fixed_fee_per_message);
    if (Number.isFinite(n)) row.fixed_fee_per_message = n;
  }
  if (user.customInputPrice1M != null || user.custom_input_price_1m != null) {
    const n = parseFloat(user.customInputPrice1M ?? user.custom_input_price_1m);
    if (Number.isFinite(n)) row.custom_input_price_1m = n;
  }
  if (user.customOutputPrice1M != null || user.custom_output_price_1m != null) {
    const n = parseFloat(user.customOutputPrice1M ?? user.custom_output_price_1m);
    if (Number.isFinite(n)) row.custom_output_price_1m = n;
  }
  if (user.totalRequests != null || user.total_requests != null) row.total_requests = parseInt(user.totalRequests ?? user.total_requests) || 0;
  if (user.businessProfile != null || user.business_profile != null) row.business_profile = user.businessProfile ?? user.business_profile;
  if (user.spamConfig != null || user.spam_config != null) row.spam_config = user.spamConfig ?? user.spam_config;
  if (user.aiConfig != null || user.ai_config != null) {
    const incoming = user.aiConfig ?? user.ai_config;
    row.ai_config = incoming;
  }
  if (user.blacklist != null) row.blacklist = user.blacklist;
  row.last_active = new Date().toISOString();
  return row;
}

function rowToListUser(row) {
  return {
    id: row.id,
    storeName: row.store_name,
    phone: row.phone || '',
    balance: Number.isFinite(parseFloat(row.balance)) ? parseFloat(row.balance) : 0,
    status: Boolean(row.forced_pause)
      ? 'Force Paused'
      : ((Number.isFinite(parseFloat(row.balance)) ? parseFloat(row.balance) : 0) <= 0
        ? 'Paused (Zero Balance)'
        : 'Active'),
    forcedPause: Boolean(row.forced_pause),
    lastActive: row.last_active ? new Date(row.last_active).getTime() : 0,
    pricingMode: row.pricing_mode,
    fixedFeePerMessage: parseFloat(row.fixed_fee_per_message),
    createdAt: row.created_at
  };
}

// ─── CRUD Operations ────────────────────────────────────────

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('getAllUsers error:', error); return []; }

  return (data || []).map(rowToUser);
}

/** Sidebar/list poll — skips secrets, FAQ, keys, and ledger JSON. */
export async function getAllUsersLite() {
  const { data, error } = await supabase
    .from('stores')
    .select('id, store_name, phone, balance, forced_pause, last_active, created_at, pricing_mode, fixed_fee_per_message')
    .order('created_at', { ascending: false });

  if (error) { console.error('getAllUsersLite error:', error); return []; }

  return (data || []).map(rowToListUser);
}

export async function getUser(userId) {
  if (!userId) return null;
  const cleanId = userId.trim();

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', cleanId)
    .single();

  if (error || !data) return null;
  return rowToUser(data);
}

export async function saveUser(user, oldId = null) {
  if (!user || (!user.id && !oldId)) return false;
  const targetId = (oldId || user.id).trim();
  const newId = user.id ? user.id.trim() : targetId;
  // Config-only: never write balance/ledger from a full-row snapshot.
  // Admin top-ups and SMS deductions go through patchUser/applyBalanceChange.
  const row = userToRow(user, { includeBalance: false });

  if (oldId && oldId.trim() !== newId) {
    // ID rename
    const existing = await getUser(newId);
    if (existing && existing.id !== oldId.trim()) {
      console.error('Cannot rename store: ID already taken:', newId);
      return false;
    }
    row.id = newId;
    const { error } = await supabase
      .from('stores')
      .update(row)
      .eq('id', oldId.trim());
    if (error) {
      console.error('renameUser update error, attempting fallback:', error);
      const { error: insErr } = await supabase.from('stores').insert({ ...row, id: newId });
      if (insErr) { console.error('insert fallback error:', insErr); return false; }
      await supabase.from('activities').update({ store_id: newId }).eq('store_id', oldId.trim());
      await supabase.from('stores').delete().eq('id', oldId.trim());
      return true;
    }
    await supabase.from('activities').update({ store_id: newId }).eq('store_id', oldId.trim());
    return true;
  }

  delete row.id; // don't update PK if unchanged
  const { data, error } = await supabase
    .from('stores')
    .update(row)
    .eq('id', targetId)
    .select('id');

  if (error) { console.error('saveUser error:', error); return false; }
  if (!data || data.length === 0) {
    console.error('saveUser updated 0 rows for', targetId);
    return false;
  }
  return true;
}

/**
 * Partial update. Pass includeBalance: true only when the caller is intentionally
 * changing funds (admin top-up / SMS deduction). Config sync must leave balance alone.
 */
export async function patchUser(userId, partial, { includeBalance = false } = {}) {
  if (!userId || !partial) return null;
  const row = userToRow(partial, { includeBalance });
  delete row.id;

  const { data, error } = await supabase
    .from('stores')
    .update(row)
    .eq('id', String(userId).trim())
    .select('*')
    .single();

  if (error) {
    console.error('patchUser error:', error);
    return null;
  }
  return data ? rowToUser(data) : null;
}

export async function applyBalanceChange(userId, { delta = null, absolute = null, reason = '' } = {}) {
  const user = await getUser(userId);
  if (!user) return null;

  const current = Number.isFinite(parseFloat(user.balance)) ? parseFloat(user.balance) : 0;
  let nextBal;
  let appliedDelta;

  if (absolute != null && absolute !== '') {
    nextBal = Math.max(0, parseFloat(absolute));
    if (!Number.isFinite(nextBal)) return null;
    appliedDelta = nextBal - current;
  } else {
    appliedDelta = parseFloat(delta);
    if (!Number.isFinite(appliedDelta)) return null;
    nextBal = Math.max(0, current + appliedDelta);
  }

  const description = reason || (
    appliedDelta > 0
      ? `Admin Top-Up +$${appliedDelta.toFixed(2)}`
      : appliedDelta < 0
        ? `Admin Deduction -$${Math.abs(appliedDelta).toFixed(2)}`
        : `Balance set to $${nextBal.toFixed(2)}`
  );

  const newTx = {
    id: Date.now(),
    timestampMillis: Date.now(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: new Date().toLocaleDateString(),
    type: appliedDelta > 0 ? 'Top-Up' : 'Manual Adjustment',
    amount: appliedDelta,
    balanceAfter: nextBal,
    description
  };

  return patchUser(user.id, {
    balance: nextBal,
    status: derivedStatus(nextBal, user.forcedPause),
    balanceHistory: [newTx, ...(user.balanceHistory || [])].slice(0, 200)
  }, { includeBalance: true });
}

export async function createUser(userData) {
  const userId = userData.id.trim();
  const parsedBal = parseFloat(userData.balance);
  const initialBal = Number.isFinite(parsedBal) ? parsedBal : 10.00;
  const parsedFee = parseFloat(userData.fixedFeePerMessage);
  const initialFee = Number.isFinite(parsedFee) ? parsedFee : 0.0050;
  const newUser = {
    id: userId,
    password: userData.password.trim(),
    storeName: userData.storeName?.trim() || userId,
    phone: userData.phone?.trim() || '',
    address: userData.address?.trim() || '',
    balance: initialBal,
    status: initialBal <= 0 ? 'Paused (Zero Balance)' : 'Active',
    pricingMode: userData.pricingMode || 'fixed_fee',
    fixedFeePerMessage: initialFee,
    customInputPrice1M: parseFloat(userData.customInputPrice1M) || 0.25,
    customOutputPrice1M: parseFloat(userData.customOutputPrice1M) || 1.50,
    totalRequests: 0,
    businessProfile: {
      businessName: userData.storeName?.trim() || userId,
      businessInfo: userData.businessInfo || '',
      replyTone: userData.replyTone || 'Professional, friendly, and concise',
      aiRules: userData.aiRules || ''
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
    blacklist: [],
    balanceHistory: [
      {
        id: Date.now(),
        timestampMillis: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        type: 'Deposit',
        amount: initialBal,
        balanceAfter: initialBal,
        description: 'Initial store signup balance'
      }
    ]
  };

  const row = userToRow(newUser);
  const { data, error } = await supabase
    .from('stores')
    .insert(row)
    .select()
    .single();

  if (error) { console.error('createUser error:', error); throw new Error(error.message); }
  return rowToUser(data);
}

export async function deleteUser(userId) {
  if (!userId) return false;
  const cleanId = userId.trim();

  // Activities cascade-deleted via FK
  const { error } = await supabase
    .from('stores')
    .delete()
    .eq('id', cleanId);

  if (error) { console.error('deleteUser error:', error); return false; }
  return true;
}

// ─── Activity Log Operations ────────────────────────────────

export async function addActivities(storeId, logs) {
  if (!storeId || !Array.isArray(logs) || logs.length === 0) return;

  const rows = logs.slice(0, 50).map(l => ({
    id: String(l.id || `act_${Date.now()}_${Math.random().toString(36).slice(2)}`),
    store_id: storeId,
    sender: l.sender || 'Customer',
    incoming: l.incoming || '',
    reply: l.reply || '',
    status: l.status || 'Sent',
    tokens_in: parseInt(l.inputTokens ?? l.tokensIn ?? l.tokens_in ?? 0) || 0,
    tokens_out: parseInt(l.outputTokens ?? l.tokensOut ?? l.tokens_out ?? 0) || 0,
    cost: parseFloat(l.cost ?? 0) || 0
  }));

  // Upsert to avoid duplicate key errors
  const { error } = await supabase
    .from('activities')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });

  if (error) console.error('addActivities error:', error);
}

export async function getActivities(storeId, limit = 100) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('getActivities error:', error); return []; }
  return (data || []).map(a => ({
    id: a.id,
    time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sender: a.sender,
    incoming: a.incoming,
    reply: a.reply,
    status: a.status,
    tokensIn: a.tokens_in,
    tokensOut: a.tokens_out,
    cost: parseFloat(a.cost)
  }));
}
