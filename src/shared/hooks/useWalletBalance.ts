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

interface WalletBalanceResponse {
    balance: number;
    currency: string;
}

export function useWalletBalance() {
    const { data: balanceData, isLoading, refetch } = useQuery({
        queryKey: ['wallet-balance'],
        queryFn: async () => {
            const response = await apiClient.get<WalletBalanceResponse>('/api/wallet/balance');
            if (!response.success || !response.data) {
                throw new Error(response.error || 'Failed to load wallet balance');
            }
            return response.data;
        }
    });

    const checkBalanceForJob = useCallback(async (
        servicePackage: string,
        salaryMax?: number
    ): Promise<WalletCheckResult> => {
        const currentBalance = balanceData?.balance ?? 0;
        const currentCurrency = balanceData?.currency ?? 'USD';

        if (servicePackage === 'self-managed' || servicePackage === 'rpo') {
            return {
                canPost: true,
                balance: currentBalance,
                required: 0,
                shortfall: 0,
                currency: currentCurrency
            };
        }

        // Use dynamic pricing API only; no static price fallback.
        const salaryForCalc = salaryMax ?? 100000;
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
    }, [balanceData]);

    return {
        balance: balanceData?.balance ?? 0,
        isLoading,
        refetch,
        checkBalanceForJob
    };
}
