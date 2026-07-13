export const runtime = 'nodejs';

// Returns a Plaid Link token. With PLAID_CLIENT_ID/PLAID_SECRET set this calls
// Plaid's /link/token/create; without credentials it returns a sandbox token
// so the demo runs end-to-end (client falls back to a simulated Link flow).
export async function POST() {
  const configured = !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
  if (!configured) {
    return Response.json({
      link_token: 'sandbox-link-token',
      mode: 'simulated',
      note: 'Set PLAID_CLIENT_ID and PLAID_SECRET to use the real Plaid sandbox.',
    });
  }
  try {
    const env = process.env.PLAID_ENV || 'sandbox';
    const res = await fetch(`https://${env}.plaid.com/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PLAID_CLIENT_ID,
        secret: process.env.PLAID_SECRET,
        client_name: 'RAC Verify',
        user: { client_user_id: `rac-${Date.now()}` },
        products: ['auth', 'income_verification'],
        country_codes: ['US'],
        language: 'en',
      }),
    });
    const data = await res.json();
    return Response.json({ link_token: data.link_token, mode: 'plaid' });
  } catch (e) {
    return Response.json({ link_token: 'sandbox-link-token', mode: 'simulated', error: String(e) });
  }
}
