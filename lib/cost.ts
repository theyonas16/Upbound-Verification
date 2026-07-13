// Cost model, split into pre-DE identity and post-DE document collection.

export const IDENTITY_COST = {
  device: 0.0, // WebAuthn / device Face ID / wallet — no third-party call
  openkyc: 0.05, // OpenKYC document + face match
};

export const PLAID_COST = 0.1; // replaces manual paystub / lease uploads
export const LEGACY_COST = 1.0; // traditional vendor baseline per applicant

export type IdentityMethod = 'device' | 'openkyc';

export function identityCost(method: IdentityMethod | null): number {
  return method === 'openkyc' ? IDENTITY_COST.openkyc : IDENTITY_COST.device;
}

// One Plaid connection covers residence (+income when the level needs it).
export function postDeCost(): number {
  return PLAID_COST;
}

export function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}
