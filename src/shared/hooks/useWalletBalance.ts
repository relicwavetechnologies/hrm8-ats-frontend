import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { pricingService } from '@/shared/lib/pricingService';

export interface WalletBalance {
    balance: number;
    currency: string;
}

export interface WalletCheckResult {
    canPost: boolean;
    balance: number;
    required: number;
    shortfall: number;
    currency: string;
}

export function useWalletBalance() {
    const { data: balanceData, isLoading, refetch } = useQuery({
        queryKey: ['wallet-balance'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: number }>('/api/wallet/balance');
            return response.data; // Response format: { success: true, data: 1234.56 }
        }
    });

    const checkBalanceForJob = useCallback(async (
        servicePackage: string,
        salaryMax?: number
    ): Promise<WalletCheckResult> => {
        const currentBalance = typeof balanceData === 'number' ? balanceData : (balanceData as any)?.data ?? 0;

        if (servicePackage === 'self-managed' || servicePackage === 'rpo') {
            return {
                canPost: true,
                balance: currentBalance,
                required: 0,
                shortfall: 0,
                currency: 'USD'
            };
        }

        try {
            // Use dynamic pricing API for accurate regional prices
            const salaryForCalc = salaryMax ?? 100000; // fallback for exec search band detection
            const priceResult = await pricingService.calculateJobPrice(
                salaryForCalc,
                servicePackage === 'shortlisting' ? 'SHORTLISTING' : servicePackage === 'executive-search' ? 'EXECUTIVE_SEARCH' : 'FULL'
            );
            const required = priceResult.price;
            const currency = priceResult.currency;

            return {
                canPost: currentBalance >= required,
                balance: currentBalance,
                required,
                shortfall: Math.max(0, required - currentBalance),
                currency
            };
        } catch {
            // Fallback to safe upper bound if API fails (avoid blocking user)
            const fallbackPrices: Record<string, number> = {
                shortlisting: 1990,
                'full-service': 5990,
                executive-search: 9990
            };
            const required = fallbackPrices[servicePackage] ?? 5990;
            return {
                canPost: currentBalance >= required,
                balance: currentBalance,
                required,
                shortfall: Math.max(0, required - currentBalance),
                currency: 'USD'
            };
        }
    }, [balanceData]);

    return {
        balance: typeof balanceData === 'number' ? balanceData : (balanceData as any)?.data ?? 0,
        isLoading,
        refetch,
        checkBalanceForJob
    };
}
