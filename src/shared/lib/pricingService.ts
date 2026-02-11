import { apiClient } from "./api/apiClient";

export interface SubscriptionTier {
  planType: string;
  name: string;
  price: number;
  currency: string;
}

export interface RecruitmentService {
  serviceType: string;
  name: string;
  price: number;
  currency: string;
  bandName?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export interface ExecutiveSearchBand {
  band: string;
  bandName: string;
  price: number;
  currency: string;
  salaryMin: number | null;
  salaryMax: number | null;
  productCode: string;
}

export interface CompanyCurrency {
  pricingPeg: string;
  billingCurrency: string;
  isLocked: boolean;
  lockedAt: Date | null;
}

export interface JobPriceCalculation {
  isExecutiveSearch: boolean;
  band?: string;
  price: number;
  currency: string;
  productCode: string;
  salaryMax: number;
}

class PricingService {
  /**
   * Get all subscription tiers for the current company
   */
  async getSubscriptionTiers() {
    const res = await apiClient.get<{ tiers: SubscriptionTier[] }>(
      "/api/pricing/subscription-tiers"
    );
    if (!res.success || !res.data) {
      throw new Error(res.error || "Failed to fetch subscription tiers");
    }
    return res.data.tiers;
  }

  /**
   * Get all recruitment service prices for the current company
   */
  async getRecruitmentServices() {
    const res = await apiClient.get<{ services: RecruitmentService[] }>(
      "/api/pricing/recruitment-services"
    );
    if (!res.success || !res.data) {
      throw new Error(res.error || "Failed to fetch recruitment services");
    }
    return res.data.services;
  }

  /**
   * Get all executive search bands for the current company
   */
  async getExecutiveSearchBands() {
    const res = await apiClient.get<{ bands: ExecutiveSearchBand[] }>(
      "/api/pricing/executive-search-bands"
    );
    if (!res.success || !res.data) {
      throw new Error(res.error || "Failed to fetch executive search bands");
    }
    return res.data.bands;
  }

  /**
   * Calculate price for a job based on salary range
   */
  async calculateJobPrice(salaryMax: number, serviceType?: string) {
    const res = await apiClient.post<JobPriceCalculation>(
      "/api/pricing/calculate-job-price",
      {
        salaryMax,
        serviceType,
      }
    );
    if (!res.success || !res.data) {
      throw new Error(res.error || "Failed to calculate job price");
    }
    return res.data;
  }

  /**
   * Get company's pricing peg and billing currency
   */
  async getCompanyCurrency() {
    const res = await apiClient.get<CompanyCurrency>(
      "/api/pricing/company-currency"
    );
    if (!res.success || !res.data) {
      throw new Error(res.error || "Failed to fetch company currency");
    }
    return res.data;
  }

  /**
   * Format price with currency symbol
   */
  formatPrice(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: "$",
      AUD: "A$",
      GBP: "£",
      EUR: "€",
      INR: "₹",
    };

    const symbol = symbols[currency] || currency;
    
    // Format with commas
    const formatted = amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formatted}`;
  }

  /**
   * Format salary range with currency
   */
  formatSalaryRange(
    min: number | null,
    max: number | null,
    currency: string
  ): string {
    if (min === null && max === null) return "N/A";
    if (min === null) return `Up to ${this.formatPrice(max!, currency)}`;
    if (max === null) return `${this.formatPrice(min, currency)}+`;
    return `${this.formatPrice(min, currency)} - ${this.formatPrice(
      max,
      currency
    )}`;
  }
}

export const pricingService = new PricingService();
