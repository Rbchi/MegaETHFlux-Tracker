export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Use Blockscout's eth_call proxy — open CORS, no IP whitelist
  const url = `https://megaeth.blockscout.com/api?module=proxy&action=eth_call&to=0x42bfAAA203B8259270A1b5EF4576dB6b8359Daa1&data=0x88fe2be8&tag=latest`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const text = await response.text();
    return new Response(text, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
