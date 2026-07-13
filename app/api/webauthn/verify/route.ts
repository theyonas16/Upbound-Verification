export const runtime = 'nodejs';

// PoC verification: confirms the ceremony produced a platform credential and
// that client data parses. Production would verify the attestation signature,
// challenge, origin, and RP ID hash against a stored credential.
export async function POST(req: Request) {
  let body: { type?: string; rawId?: string; clientDataJSON?: string; id?: string } | null = null;
  try {
    body = await req.json();
  } catch {
    return Response.json({ verified: false, error: 'bad request' }, { status: 400 });
  }

  const ok = body && body.type === 'public-key' && body.rawId && body.clientDataJSON;
  if (!ok) return Response.json({ verified: false }, { status: 400 });

  let origin: string | null = null;
  try {
    const json = JSON.parse(Buffer.from(body!.clientDataJSON!, 'base64').toString('utf8'));
    origin = json.origin;
  } catch {
    /* non-fatal in PoC */
  }

  return Response.json({ verified: true, method: 'device', credentialId: body!.id, origin });
}
