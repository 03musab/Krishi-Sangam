/* Trust tiers — members earn better terms with every successful (completed) rental.
   New user        → Full deposit
   5 rentals       → 50% deposit
   20 rentals      → Priority bookings
   The depositFactor is applied to the owner-set deposit on equipment listings. */

export const TRUST_TIERS = [
  {
    level: 'new',
    min: 0,
    labelKey: 'trust.new',
    benefitKey: 'trust.newBenefit',
    depositFactor: 1
  },
  {
    level: 'trusted',
    min: 5,
    labelKey: 'trust.trusted',
    benefitKey: 'trust.trustedBenefit',
    depositFactor: 0.5
  },
  {
    level: 'priority',
    min: 20,
    labelKey: 'trust.priority',
    benefitKey: 'trust.priorityBenefit',
    depositFactor: 0.5
  }
];

// Highest tier the member has reached
export function getTrustTier(completedCount = 0) {
  return [...TRUST_TIERS].reverse().find((tier) => completedCount >= tier.min) || TRUST_TIERS[0];
}

// The next tier above the current one (or null if already at the top)
export function getNextTier(tier) {
  const idx = TRUST_TIERS.findIndex((t) => t.level === tier.level);
  return idx >= 0 && idx < TRUST_TIERS.length - 1 ? TRUST_TIERS[idx + 1] : null;
}

// Amount the member actually pays toward a deposit, given the listing deposit
export function memberDeposit(deposit, tier) {
  const base = Number(deposit) || 0;
  return Math.round(base * (tier ? tier.depositFactor : 1));
}
