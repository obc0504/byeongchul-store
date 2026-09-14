const axios = require('axios');
const { getAccessToken } = require('./auth');

const BASE_URL = 'https://api.commerce.naver.com/external';
const MAX_RETRIES = 5;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err) {
  return err.response?.data?.code === 'GW.RATE_LIMIT';
}

async function naverRequest({ method, path, params, data }) {
  const accessToken = await getAccessToken();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await axios.request({
        method,
        url: `${BASE_URL}${path}`,
        params,
        data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      if (isRateLimitError(err) && attempt < MAX_RETRIES) {
        const waitMs = 1000 * 2 ** attempt;
        console.log(`요청 제한(Rate limit) 감지, ${waitMs}ms 후 재시도 (${attempt + 1}/${MAX_RETRIES})`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }
}

module.exports = { naverRequest, sleep };
