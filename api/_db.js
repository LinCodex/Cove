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
    balance: parseFloat(row.balance),
    status: row.status,
    pricingMode: row.pricing_mode,
    fixedFeePerMessage: parseFloat(row.fixed_fee_per_message),
    customInputPrice1M: parseFloat(row.custom_input_price_1m),
    customOutputPrice1M: parseFloat(row.custom_output_price_1m),
    totalRequests: row.total_requests || 0,
    lastActive: new Date(row.last_active).getTime(),
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

/** Convert API/frontend user object into Supabase row shape. */
function userToRow(user) {
  const row = {};
  if (user.id != null) row.id = user.id;
  if (user.password != null) row.password = user.password;
  if (user.storeName != null || user.store_name != null) row.store_name = user.storeName ?? user.store_name;
  if (user.phone != null) row.phone = user.phone;
  if (user.address != null) row.address = user.address;
  if (user.balance != null) row.balance = parseFloat(user.balance) || 0;
  if (user.status != null) row.status = user.status;
  if (user.pricingMode != null || user.pricing_mode != null) row.pricing_mode = user.pricingMode ?? user.pricing_mode;
  if (user.fixedFeePerMessage != null || user.fixed_fee_per_message != null) row.fixed_fee_per_message = parseFloat(user.fixedFeePerMessage ?? user.fixed_fee_per_message) || 0.0050;
  if (user.customInputPrice1M != null || user.custom_input_price_1m != null) row.custom_input_price_1m = parseFloat(user.customInputPrice1M ?? user.custom_input_price_1m) || 0.25;
  if (user.customOutputPrice1M != null || user.custom_output_price_1m != null) row.custom_output_price_1m = parseFloat(user.customOutputPrice1M ?? user.custom_output_price_1m) || 1.50;
  if (user.totalRequests != null || user.total_requests != null) row.total_requests = parseInt(user.totalRequests ?? user.total_requests) || 0;
  if (user.businessProfile != null || user.business_profile != null) row.business_profile = user.businessProfile ?? user.business_profile;
  if (user.spamConfig != null || user.spam_config != null) row.spam_config = user.spamConfig ?? user.spam_config;
  if (user.aiConfig != null || user.ai_config != null) row.ai_config = user.aiConfig ?? user.ai_config;
  if (user.blacklist != null) row.blacklist = user.blacklist;
  if (user.balanceHistory != null || user.balance_history != null) row.balance_history = user.balanceHistory ?? user.balance_history;
  row.last_active = new Date().toISOString();
  return row;
}

// ─── CRUD Operations ────────────────────────────────────────

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('getAllUsers error:', error); return []; }

  // For each store, load recent activities (latest 100)
  const users = (data || []).map(rowToUser);
  for (const u of users) {
    const { data: acts } = await supabase
      .from('activities')
      .select('*')
      .eq('store_id', u.id)
      .order('created_at', { ascending: false })
      .limit(100);

    u.activities = (acts || []).map(a => ({
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
  return users;
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
  const row = userToRow(user);

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
  const { error } = await supabase
    .from('stores')
    .update(row)
    .eq('id', targetId);

  if (error) { console.error('saveUser error:', error); return false; }
  return true;
}

export async function createUser(userData) {
  const userId = userData.id.trim();
  const newUser = {
    id: userId,
    password: userData.password.trim(),
    storeName: userData.storeName?.trim() || userId,
    phone: userData.phone?.trim() || '',
    address: userData.address?.trim() || '',
    balance: parseFloat(userData.balance) || 10.00,
    status: (parseFloat(userData.balance) || 10.00) <= 0 ? 'Paused (Zero Balance)' : 'Active',
    pricingMode: userData.pricingMode || 'fixed_fee',
    fixedFeePerMessage: parseFloat(userData.fixedFeePerMessage) || 0.0050,
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
        amount: parseFloat(userData.balance) || 10.00,
        balanceAfter: parseFloat(userData.balance) || 10.00,
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

  const rows = logs.map(l => ({
    id: String(l.id || `act_${Date.now()}_${Math.random().toString(36).slice(2)}`),
    store_id: storeId,
    sender: l.sender || 'Customer',
    incoming: l.incoming || '',
    reply: l.reply || '',
    status: l.status || 'Sent',
    tokens_in: l.inputTokens || l.tokensIn || 0,
    tokens_out: l.outputTokens || l.tokensOut || 0,
    cost: l.cost || 0
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
