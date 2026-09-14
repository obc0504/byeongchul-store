const bcrypt = require('bcryptjs');
const axios = require('axios');

const TOKEN_URL = 'https://api.commerce.naver.com/external/v1/oauth2/token';

let cachedToken = null;
let cachedTokenExpiresAt = 0;

function buildClientSecretSign(clientId, clientSecret, timestamp) {
  const password = `${clientId}_${timestamp}`;
  const hashed = bcrypt.hashSync(password, clientSecret);
  return Buffer.from(hashed, 'utf-8').toString('base64');
}

async function getAccessToken({ clientId, clientSecret, type = 'SELF' } = {}) {
  const id = clientId || process.env.NAVER_CLIENT_ID;
  const secret = clientSecret || process.env.NAVER_CLIENT_SECRET;

  if (!id || !secret) {
    throw new Error('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET가 설정되지 않았습니다 (.env 확인)');
  }

  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const timestamp = now;
  const clientSecretSign = buildClientSecretSign(id, secret, timestamp);

  const body = new URLSearchParams({
    client_id: id,
    timestamp: String(timestamp),
    client_secret_sign: clientSecretSign,
    grant_type: 'client_credentials',
    type,
  });

  const response = await axios.post(TOKEN_URL, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const { access_token: accessToken, expires_in: expiresIn } = response.data;
  cachedToken = accessToken;
  // 만료 60초 전에 미리 재발급하도록 여유를 둠
  cachedTokenExpiresAt = now + (expiresIn - 60) * 1000;

  return cachedToken;
}

module.exports = { getAccessToken };
