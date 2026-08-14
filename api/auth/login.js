import { getUser, parseBody } from '../_db.js';

export default async function handler(req, res) {
  // CORS Headers for Android APK & Web Clients
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = parseBody(req);
    const userId = body.userId || body.id;
    const password = body.password || body.pass;

    if (!userId || !password) {
      return res.status(400).json({ error: 'User ID and Password are required' });
    }

    const cleanId = userId.trim();
    const cleanPass = password.trim();

    const user = await getUser(cleanId);

    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please contact your administrator.' });
    }

    if (user.password !== cleanPass) {
      return res.status(401).json({ error: 'Incorrect password for this User ID' });
    }

    const token = `cove_jwt_${cleanId}_${Date.now()}`;

    return res.status(200).json({
      success: true,
      token,
      userId: user.id,
      storeName: user.storeName,
      storeAddress: user.address || '',
      phone: user.phone || '',
      balance: user.balance,
      pricingMode: user.pricingMode,
      fixedFeePerMessage: user.fixedFeePerMessage,
      customInputPrice1M: user.customInputPrice1M,
      customOutputPrice1M: user.customOutputPrice1M,
      businessProfile: user.businessProfile,
      spamConfig: user.spamConfig,
      blacklist: user.blacklist || []
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
