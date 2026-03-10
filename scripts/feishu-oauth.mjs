import { readFile, writeFile } from 'node:fs/promises';

export async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
      const index = line.indexOf('=');
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // optional file
  }
}

export function trimTrailingSlash(value) {
  return String(value || '').replace(/\/$/, '');
}

export function buildFeishuAuthorizeUrl({ baseUrl, appId, redirectUri, state }) {
  const url = new URL('/open-apis/authen/v1/index', trimTrailingSlash(baseUrl));
  url.searchParams.set('app_id', appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return url.toString();
}

export async function getFeishuAccessToken({ baseUrl, appId, appSecret, userRefreshToken }) {
  if (userRefreshToken) {
    const tokenSet = await exchangeUserToken({
      baseUrl,
      appId,
      appSecret,
      grantType: 'refresh_token',
      refreshToken: userRefreshToken
    });

    return {
      accessToken: tokenSet.accessToken,
      authMode: 'user',
      refreshToken: tokenSet.refreshToken || userRefreshToken
    };
  }

  return {
    accessToken: await getTenantAccessToken({ appId, appSecret, baseUrl }),
    authMode: 'app',
    refreshToken: ''
  };
}

export async function getTenantAccessToken({ appId, appSecret, baseUrl }) {
  const response = await fetch(`${trimTrailingSlash(baseUrl)}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret
    })
  });

  const payload = await readJson(response);

  if (!response.ok || payload.code !== 0 || !payload.tenant_access_token) {
    throw new Error(`Unable to get Feishu tenant access token: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload.tenant_access_token;
}

export async function getDocumentInfo({ baseUrl, accessToken, documentToken }) {
  const data = await fetchFeishuJson(`${trimTrailingSlash(baseUrl)}/open-apis/docx/v1/documents/${documentToken}`, accessToken);
  return data.document ?? {};
}

export async function exchangeUserToken({ baseUrl, appId, appSecret, grantType, code, refreshToken, redirectUri }) {
  const paths = grantType === 'refresh_token'
    ? ['/open-apis/authen/v2/oauth/token', '/open-apis/authen/v1/refresh_access_token']
    : ['/open-apis/authen/v2/oauth/token', '/open-apis/authen/v1/access_token'];

  let lastError = null;

  for (const relativePath of paths) {
    const url = `${trimTrailingSlash(baseUrl)}${relativePath}`;
    const body = {
      grant_type: grantType,
      code,
      refresh_token: refreshToken,
      redirect_uri: redirectUri,
      client_id: appId,
      client_secret: appSecret,
      app_id: appId,
      app_secret: appSecret
    };

    Object.keys(body).forEach((key) => {
      if (body[key] === undefined || body[key] === null || body[key] === '') delete body[key];
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(body)
      });

      const payload = await readJson(response);
      const normalized = normalizeUserTokenPayload(payload);

      if (response.ok && normalized.accessToken) {
        return normalized;
      }

      lastError = new Error(`User token exchange failed for ${url}: ${response.status} ${JSON.stringify(payload)}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unknown Feishu user token exchange failure.');
}

export async function upsertEnvValues(filePath, values) {
  let existing = '';
  try {
    existing = await readFile(filePath, 'utf8');
  } catch {
    existing = '';
  }

  const lines = existing ? existing.split(/\r?\n/) : [];
  const keyIndex = new Map();

  lines.forEach((line, index) => {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) return;
    const eq = line.indexOf('=');
    const key = line.slice(0, eq).trim();
    keyIndex.set(key, index);
  });

  for (const [key, rawValue] of Object.entries(values)) {
    if (rawValue === undefined || rawValue === null) continue;
    const line = `${key}=${String(rawValue)}`;
    if (keyIndex.has(key)) lines[keyIndex.get(key)] = line;
    else lines.push(line);
  }

  const output = lines.filter((line, index, list) => !(index === list.length - 1 && line === '')).join('\n') + '\n';
  await writeFile(filePath, output, 'utf8');
}

export async function fetchFeishuJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json; charset=utf-8'
    }
  });

  const payload = await readJson(response);

  if (!response.ok || payload.code !== 0) {
    throw new Error(`Feishu request failed for ${url}: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload.data ?? {};
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function normalizeUserTokenPayload(payload) {
  const data = payload?.data ?? payload ?? {};
  return {
    accessToken: data.access_token || data.user_access_token || '',
    refreshToken: data.refresh_token || '',
    expiresIn: data.expires_in || 0,
    openId: data.open_id || '',
    unionId: data.union_id || '',
    tokenType: data.token_type || ''
  };
}