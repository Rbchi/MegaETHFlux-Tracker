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
 
  // getTotalStakedAmount() = 0x38adb6f0
  // Call via proxy contract address (ERC1967 proxy delegates to implementation)
  const body = JSON.stringify({
    jsonrpc: '2.0', id: 1,
    method: 'eth_call',
    params: [
      { to: '0x42bfAAA203B8259270A1b5EF4576dB6b8359Daa1', data: '0x38adb6f0' },
      'latest'
    ]
  });
 
  try {
    const response = await fetch('https://megaeth.blockscout.com/api/eth-rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
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
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    });
  }
}
 
