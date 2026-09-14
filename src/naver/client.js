const axios = require('axios');
const { getAccessToken } = require('./auth');

const BASE_URL = 'https://api.commerce.naver.com/external';

async function naverRequest({ method, path, params, data }) {
  const accessToken = await getAccessToken();

  return axios.request({
    method,
    url: `${BASE_URL}${path}`,
    params,
    data,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}

module.exports = { naverRequest };
