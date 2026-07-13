export const runtime = 'nodejs';

// Exchanges a Link result for the verified data we need. In simulated mode we
// synthesize plausible residence/income data. `want` indicates which fields
// the caller needs based on the approval level.
export async function POST(req: Request) {
  let body: { want?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    /* tolerate empty body */
  }
  const want = body.want || ['residence'];

  const out: Record<string, unknown> = { verified: true, mode: 'simulated', institution: 'Simulated Bank' };
  if (want.includes('residence')) {
    out.residence = { addressOnFile: true, matches: true, account: 'Checking ••1234' };
  }
  if (want.includes('income')) {
    out.income = {
      verified: true,
      monthlyNet: 3200 + Math.floor(Math.random() * 1800),
      source: 'Direct deposit (last 90 days)',
    };
  }
  return Response.json(out);
}
