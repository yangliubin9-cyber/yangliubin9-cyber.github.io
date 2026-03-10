import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { buildFeishuAuthorizeUrl, exchangeUserToken, loadEnvFile, trimTrailingSlash, upsertEnvValues } from './feishu-oauth.mjs';

const rootDir = process.cwd();
const localEnvPath = path.join(rootDir, '.env.local');

await loadEnvFile(localEnvPath);
await loadEnvFile(path.join(rootDir, '.env'));

const appId = process.env.FEISHU_APP_ID ?? '';
const appSecret = process.env.FEISHU_APP_SECRET ?? '';
const baseUrl = trimTrailingSlash(process.env.FEISHU_OPEN_BASE_URL || 'https://open.feishu.cn');
const redirectUri = process.env.FEISHU_AUTH_REDIRECT_URI || 'http://127.0.0.1:4390/feishu/callback';

if (!appId || !appSecret) {
  throw new Error('Missing FEISHU_APP_ID or FEISHU_APP_SECRET in .env.local or .env.');
}

const redirect = new URL(redirectUri);
if (!redirect.hostname || !redirect.port) {
  throw new Error(`FEISHU_AUTH_REDIRECT_URI must include a host and port, current value: ${redirectUri}`);
}

const state = randomUUID();
const authUrl = buildFeishuAuthorizeUrl({
  baseUrl,
  appId,
  redirectUri,
  state
});

const result = await waitForAuthorization({
  hostname: redirect.hostname,
  port: Number(redirect.port),
  pathname: redirect.pathname,
  authUrl,
  state,
  timeoutMs: 5 * 60 * 1000
});

const tokenSet = await exchangeUserToken({
  baseUrl,
  appId,
  appSecret,
  grantType: 'authorization_code',
  code: result.code,
  redirectUri
});

if (!tokenSet.refreshToken) {
  throw new Error('Feishu did not return a refresh token. Please verify your user identity auth settings and try again.');
}

await upsertEnvValues(localEnvPath, {
  FEISHU_OPEN_BASE_URL: baseUrl,
  FEISHU_APP_ID: appId,
  FEISHU_APP_SECRET: appSecret,
  FEISHU_AUTH_REDIRECT_URI: redirectUri,
  FEISHU_USER_REFRESH_TOKEN: tokenSet.refreshToken
});

console.log('Feishu user authorization succeeded.');
console.log('Stored FEISHU_USER_REFRESH_TOKEN in .env.local');
console.log('Next step: add FEISHU_USER_REFRESH_TOKEN to GitHub Actions Secrets, then rerun Sync Feishu Posts.');

async function waitForAuthorization({ hostname, port, pathname, authUrl, state, timeoutMs }) {
  console.log('Open this URL in your browser and complete the Feishu authorization:');
  console.log(authUrl);
  console.log('');
  console.log(`Waiting for callback on ${hostname}:${port}${pathname} ...`);

  return await new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      try {
        const requestUrl = new URL(request.url || '/', `http://${hostname}:${port}`);
        if (requestUrl.pathname !== pathname) {
          response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          response.end('Not found');
          return;
        }

        const error = requestUrl.searchParams.get('error');
        const code = requestUrl.searchParams.get('code');
        const returnedState = requestUrl.searchParams.get('state');

        if (error) {
          response.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
          response.end('<h1>Feishu authorization failed</h1><p>You can close this window and retry.</p>');
          cleanup(() => reject(new Error(`Feishu authorization error: ${error}`)));
          return;
        }

        if (!code) {
          response.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
          response.end('<h1>Missing code</h1><p>You can close this window and retry.</p>');
          cleanup(() => reject(new Error('Feishu callback did not contain a code.')));
          return;
        }

        if (returnedState !== state) {
          response.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
          response.end('<h1>State mismatch</h1><p>You can close this window and retry.</p>');
          cleanup(() => reject(new Error('Feishu callback state mismatch.')));
          return;
        }

        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end('<h1>Feishu authorization completed</h1><p>You can close this window and return to the terminal.</p>');
        cleanup(() => resolve({ code }));
      } catch (error) {
        cleanup(() => reject(error));
      }
    });

    const timeout = setTimeout(() => {
      cleanup(() => reject(new Error('Timed out waiting for Feishu authorization callback.')));
    }, timeoutMs);

    server.listen(port, hostname);

    function cleanup(done) {
      clearTimeout(timeout);
      server.close(() => done());
    }
  });
}