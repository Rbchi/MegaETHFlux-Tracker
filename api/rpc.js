export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const errors = [];

  // Try 1: Blockscout v2 GraphQL / internal RPC
  const attempts = [
    {
      url: 'https://megaeth.blockscout.com/api/eth-rpc',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'eth_call',
        params: [{ to: '0x42bfAAA203B8259270A1b5EF4576dB6b8359Daa1', data: '0x88fe2be8' }, 'latest']
      }),
    },
    {
      url: 'https://megaeth.blockscout.com/api/v2/smart-contracts/0x42bfAAA203B8259270A1b5EF4576dB6b8359Daa1/methods-read',
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      body: null,
    },
  ];

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, {
        method: attempt.method,
        headers: attempt.headers,
        ...(attempt.body ? { body: attempt.body } : {}),
      });
      const text = await res.text();
      if (res.ok || text.includes('result') || text.includes('0x')) {
        return new Response(JSON.stringify({ _src: attempt.url, _raw: text }), {
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
      }
      errors.push({ url: attempt.url, status: res.status, body: text.slice(0, 120) });
    } catch (e) {
      errors.push({ url: attempt.url, error: e.message });
    }
  }

  return new Response(JSON.stringify({ error: 'all failed', details: errors }), {
    status: 502,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
  });
}
