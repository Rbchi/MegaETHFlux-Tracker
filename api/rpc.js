export const config = { runtime: 'edge' };
 
const ENDPOINTS = [
  'https://carrot.megaeth.com',
  'https://mainnet.megaeth.com/rpc',
  'https://megaeth.drpc.org',
];
 
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
 
  const body = await req.text();
  const errors = [];
 
  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://flux.megaeth.com',
          'Referer': 'https://flux.megaeth.com/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        body,
      });
 
      const text = await response.text();
 
      // If response looks like valid JSON RPC, return it
      if (text.includes('result') || text.includes('jsonrpc')) {
        return new Response(text, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'X-Used-Endpoint': endpoint,
          },
        });
      }
 
      errors.push({ endpoint, status: response.status, body: text.slice(0, 100) });
    } catch (err) {
      errors.push({ endpoint, error: err.message });
    }
  }
 
  return new Response(JSON.stringify({ error: 'All endpoints failed', details: errors }), {
    status: 502,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
 
