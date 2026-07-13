export const runtime = 'nodejs';

// Simulated Decision Engine. Production calls the real DE with the hard
// dependencies (name, address, SSN/EIN, phone). Here we return a weighted-
// random approval level for the demo: 20% L0, 30% L1, 30% L2, 20% L3.
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* tolerate empty body */
  }

  const missing: string[] = [];
  if (!body.firstName) missing.push('firstName');
  if (!body.lastName) missing.push('lastName');
  if (!body.address) missing.push('address');
  if (!body.ssnPresent) missing.push('ssn');
  if (!body.phone) missing.push('phone');
  if (missing.length) {
    return Response.json({ error: 'missing_dependencies', missing }, { status: 422 });
  }

  const r = Math.random();
  let level: number;
  if (r < 0.2) level = 0;
  else if (r < 0.5) level = 1;
  else if (r < 0.8) level = 2;
  else level = 3;

  return Response.json({
    decision: 'approved',
    level,
    reference: `DE-${Math.floor(Math.random() * 1e9).toString(36).toUpperCase()}`,
  });
}
