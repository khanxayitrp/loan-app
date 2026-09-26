export interface CampaignProductCheck {
  product_name?: string;
  name?: string;
}

export function checkIphone18Campaign(product?: CampaignProductCheck | null): boolean {
  if (!product) return false;
  const name = (product.product_name || product.name || '').toLowerCase();
  return name.includes('iphone 18');
}

export function calculateTieredInterestRate(
  amount: number,
  period: number,
  isIphone18 = false
): { rate: number; type: 'monthly' | 'yearly' } {
  if (isIphone18) {
    return { rate: 0, type: 'monthly' };
  }

  if (amount >= 50000000) {
    return { rate: 1.25, type: 'monthly' };
  } else if (amount >= 20000000) {
    return { rate: 1.5, type: 'monthly' };
  } else if (amount >= 10000000) {
    return { rate: 1.75, type: 'monthly' };
  }

  return { rate: 2.0, type: 'monthly' };
}
