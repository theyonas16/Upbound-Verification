'use client';

// Device Face ID via WebAuthn (platform authenticator). Real ceremony so the
// device biometric prompt fires (Face ID on iPhone Safari). The attestation is
// recorded server-side without full cryptographic verification (PoC seam).

function b64urlToBuf(s: string): ArrayBuffer {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function platformAuthAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    !!navigator.credentials
  );
}

export async function verifyWithDeviceFaceId(): Promise<{ verified: boolean; credentialId?: string }> {
  if (!platformAuthAvailable()) {
    throw new Error('This device does not support Face ID / platform biometrics.');
  }

  const chalRes = await fetch('/api/webauthn/challenge', { method: 'POST' });
  const { challenge, rp, user } = await chalRes.json();

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: b64urlToBuf(challenge),
    rp: { name: rp.name, ...(rp.id ? { id: rp.id } : {}) },
    user: {
      id: b64urlToBuf(user.id),
      name: user.name,
      displayName: user.displayName,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },
      { type: 'public-key', alg: -257 },
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  };

  const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
  if (!cred) throw new Error('Biometric verification was cancelled.');

  const response = cred.response as AuthenticatorAttestationResponse;
  const payload = {
    id: cred.id,
    rawId: bufToB64url(cred.rawId),
    type: cred.type,
    clientDataJSON: bufToB64url(response.clientDataJSON),
  };

  const verifyRes = await fetch('/api/webauthn/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const out = await verifyRes.json();
  if (!out.verified) throw new Error('Could not verify device biometric.');
  return out;
}
