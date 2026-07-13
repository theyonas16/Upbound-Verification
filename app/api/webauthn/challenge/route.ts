import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// One-time challenge for the device Face ID ceremony.
export async function POST() {
  const challenge = b64url(randomBytes(32));
  const userId = b64url(randomBytes(16));
  return Response.json({
    challenge,
    rp: { name: 'RAC Verify', id: process.env.WEBAUTHN_RP_ID || undefined },
    user: {
      id: userId,
      name: `applicant-${userId.slice(0, 6)}`,
      displayName: 'RAC Applicant',
    },
  });
}
