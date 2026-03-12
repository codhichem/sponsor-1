const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { init, getToken, setToken, clearToken } = require('./db');

init();

const app = express();
app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: 'lax' },
    store: new SQLiteStore({ db: 'meta_sessions.sqlite', dir: __dirname }),
  })
);

function getRedirectUri(req) {
  return (
    process.env.META_REDIRECT_URI ||
    `${req.protocol}://${req.get('host')}/api/meta/callback`
  );
}

function getMetaConfigStatus() {
  const missing = [];
  if (!process.env.META_APP_ID) missing.push('META_APP_ID');
  if (!process.env.META_APP_SECRET) missing.push('META_APP_SECRET');
  return { configOk: missing.length === 0, missing };
}

function requireMetaEnv(req, res) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    const cfg = getMetaConfigStatus();
    res.status(500).json({
      error: 'META_APP_ID/META_APP_SECRET manquants',
      missing: cfg.missing,
      hint: 'Crée meta-ads/.env (copie meta-ads/.env.example) puis redémarre le serveur',
    });
    return null;
  }
  return { appId, appSecret };
}

async function exchangeCodeForToken({ code, redirectUri, appId, appSecret }) {
  const u = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
  u.searchParams.set('client_id', appId);
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('client_secret', appSecret);
  u.searchParams.set('code', code);
  const res = await fetch(u.toString());
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Token exchange failed');
  return json;
}

async function metaGet({ pathName, params }) {
  const token = await getToken();
  if (!token || !token.access_token) {
    const err = new Error('Meta non connecté');
    err.status = 401;
    throw err;
  }

  const u = new URL(`https://graph.facebook.com/v19.0/${pathName}`);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    u.searchParams.set(k, String(v));
  });
  u.searchParams.set('access_token', token.access_token);
  const res = await fetch(u.toString());
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Meta API error');
    err.status = res.status;
    throw err;
  }
  return json;
}

app.get('/api/meta/status', async (req, res) => {
  const token = await getToken();
  const connected = !!(token && token.access_token);
  const cfg = getMetaConfigStatus();
  res.json({
    connected,
    configOk: cfg.configOk,
    missing: cfg.missing,
    expiresAt: token?.expires_at || null,
    updatedAt: token?.updated_at || null,
  });
});

app.get('/api/meta/login', async (req, res) => {
  const env = requireMetaEnv(req, res);
  if (!env) return;

  const state = crypto.randomBytes(16).toString('hex');
  req.session.metaState = state;
  const redirectUri = getRedirectUri(req);

  const scope =
    process.env.META_SCOPES ||
    'ads_read,read_insights,business_management';

  const u = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  u.searchParams.set('client_id', env.appId);
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('state', state);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', scope);

  res.redirect(u.toString());
});

app.get('/api/meta/callback', async (req, res) => {
  const env = requireMetaEnv(req, res);
  if (!env) return;

  const { code, state } = req.query || {};
  const expected = req.session.metaState;
  if (!code || !state || !expected || String(state) !== String(expected)) {
    return res.status(400).send('OAuth state invalide');
  }
  req.session.metaState = null;

  try {
    const redirectUri = getRedirectUri(req);
    const tokenRes = await exchangeCodeForToken({
      code: String(code),
      redirectUri,
      appId: env.appId,
      appSecret: env.appSecret,
    });
    const expiresAt = tokenRes.expires_in ? Date.now() + Number(tokenRes.expires_in) * 1000 : null;
    await setToken({
      accessToken: tokenRes.access_token,
      tokenType: tokenRes.token_type || 'bearer',
      expiresAt,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`
      <html>
        <head><meta http-equiv="refresh" content="1;url=/" /></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h2>Connexion Meta réussie</h2>
          <p>Retour à l'application…</p>
        </body>
      </html>
    `);
  } catch (e) {
    res.status(500).send(`Erreur OAuth: ${e.message}`);
  }
});

app.post('/api/meta/disconnect', async (req, res) => {
  await clearToken();
  res.json({ ok: true });
});

app.get('/api/meta/adaccounts', async (req, res) => {
  try {
    const data = await metaGet({
      pathName: 'me/adaccounts',
      params: { fields: 'id,name,account_status,currency' },
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get('/api/meta/insights', async (req, res) => {
  const accountId = String(req.query.accountId || '');
  if (!accountId) return res.status(400).json({ error: 'accountId requis' });
  const since = String(req.query.since || '');
  const until = String(req.query.until || '');
  const timeRange = since && until ? JSON.stringify({ since, until }) : null;
  try {
    const data = await metaGet({
      pathName: `${accountId}/insights`,
      params: {
        fields:
          'date_start,date_stop,spend,impressions,clicks,reach,frequency,cpm,ctr,cpc,actions,action_values',
        level: 'account',
        time_range: timeRange,
      },
    });
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.use(express.static(path.join(__dirname, '..', 'sponsor-v2')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'sponsor-v2', 'index.html'));
});

const port = Number(process.env.PORT || 8082);
app.listen(port, () => {
  process.stdout.write(`Meta Ads server running on http://127.0.0.1:${port}/\n`);
});
