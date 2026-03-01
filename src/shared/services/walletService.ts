/**
 * Wallet API Service
 * Client-side service for wallet API calls
 */

export interface WalletBalance {
    balance: number;
    totalCredits: number;
    totalDebits: number;
    currency: string;
    status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
}

export interface Transaction {
    id: string;
    type: string;
    amount: number;
    direction: 'CREDIT' | 'DEBIT';
    description: string;
    balance_after: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    created_at: string;
    metadata?: Record<string, any>;
}

export interface Subscription {
    id: string;
    name: string;
    plan_type: string;
    status: string;
    base_price: number;
    billing_cycle: 'MONTHLY' | 'ANNUAL';
    job_quota: number | null;
    jobs_used: number;
    prepaid_balance: number | null;
    renewal_date: string | null;
    created_at: string;
}

export interface WithdrawalRequest {
    amount: number;
    paymentMethod: string;
    paymentDetails: Record<string, any>;
    notes?: string;
}

export interface RefundRequest {
    transactionId: string;
    transactionType: 'JOB_PAYMENT' | 'SUBSCRIPTION_BILL' | 'ADDON_SERVICE';
    amount: number;
    reason: string;
}

export interface AddOnServiceRequest {
    serviceType: string;
    jobId?: string;
    amount: number;
    description: string;
}

class WalletService {
    private apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    private baseUrl = `${this.apiUrl}/api/wallet`;
    private fallbackWalletBaseUrl = '/api/wallet';

    private async fetchWallet(path: string, init: RequestInit = {}): Promise<Response> {
        const request: RequestInit = {
            credentials: 'include',
            ...init,
        };
        try {
            return await fetch(`${this.baseUrl}${path}`, request);
        } catch (error) {
            if (!this.apiUrl) throw error;
            return fetch(`${this.fallbackWalletBaseUrl}${path}`, request);
        }
    }

    private async fetchApi(path: string, init: RequestInit = {}): Promise<Response> {
        const request: RequestInit = {
            credentials: 'include',
            ...init,
        };
        try {
            return await fetch(`${this.apiUrl}${path}`, request);
        } catch (error) {
            if (!this.apiUrl) throw error;
            return fetch(path, request);
        }
    }

    // Wallet Balance & Account
    async getBalance(): Promise<WalletBalance> {
        const response = await this.fetchWallet('/balance', {
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch wallet balance');
        }
        const data = await response.json();
        return data.data;
    }

    async getAccount() {
        const response = await this.fetchWallet('/account', {
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch wallet account');
        const data = await response.json();
        return data.data;
    }

    async verifyIntegrity() {
        const response = await this.fetchWallet('/verify');
        if (!response.ok) throw new Error('Failed to verify wallet integrity');
        const data = await response.json();
        return data.data;
    }

    // Transactions
    async getTransactions(params?: {
        limit?: number;
        offset?: number;
        type?: string;
        direction?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        if (params?.type) queryParams.append('type', params.type);
        if (params?.direction) queryParams.append('direction', params.direction);
        if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
        if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());

        const response = await this.fetchWallet(`/transactions?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        return data.data;
    }

    // Subscriptions
    async getSubscriptions(): Promise<Subscription[]> {
        const response = await this.fetchWallet('/subscriptions', {
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch subscriptions');
        }
        const data = await response.json();
        const payload = data.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.subscriptions)) return payload.subscriptions;
        if (Array.isArray(payload?.subscriptions?.subscriptions)) return payload.subscriptions.subscriptions;
        return [];
    }

    async getSubscription(subscriptionId: string) {
        const response = await this.fetchWallet(`/subscriptions/${subscriptionId}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch subscription');
        const data = await response.json();
        return data.data;
    }

    async createSubscription(subscriptionData: {
        planType: string;
        name: string;
        basePrice: number;
        billingCycle: 'MONTHLY' | 'ANNUAL';
        jobQuota?: number;
        autoRenew?: boolean;
    }) {
        // Use /api/subscriptions (SubscriptionService) - creates subscription snapshot + quota
        const response = await this.fetchApi('/api/subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriptionData),
        });

        if (!response.ok) {
            const error = await response.json();
            const errorObj: any = new Error(error.message || 'Failed to create subscription');
            errorObj.response = { status: response.status };
            errorObj.errorCode = error.errorCode;
            throw errorObj;
        }

        return response.json();
    }

    async renewSubscription(subscriptionId: string) {
        const response = await this.fetchWallet(`/subscriptions/${subscriptionId}/renew`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to renew subscription');
        }
        return response.json();
    }

    async cancelSubscription(subscriptionId: string, reason?: string) {
        const response = await this.fetchWallet(`/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to cancel subscription');
        return response.json();
    }

    // Subscription purchase via Airwallex billing orchestration
    async createSubscriptionCheckout(data: {
        planType: string;
        name: string;
        amount: number;
        billingCycle?: string;
        jobQuota?: number | null;
    }) {
        const origin = window.location.origin;
        const response = await this.fetchApi('/api/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'subscription',
                amount: data.amount,
                planType: data.planType,
                planName: data.name,
                billingCycle: data.billingCycle || 'MONTHLY',
                jobQuota: data.jobQuota ?? undefined,
                description: `${data.name} - $${data.amount.toFixed(2)}`,
                successUrl: `${origin}/subscriptions?subscription_success=true`,
                cancelUrl: `${origin}/subscriptions?canceled=true`,
            }),
        });
        if (!response.ok) {
            const err = await response.json();
            const e: any = new Error(err.message || 'Failed to create checkout');
            e.response = { status: response.status };
            e.errorCode = err.errorCode;
            throw e;
        }
        const result = await response.json();
        if (result.data?.url) {
            window.location.href = result.data.url;
        } else {
            throw new Error('No checkout URL returned');
        }
        return result;
    }

    // Wallet recharge via Airwallex billing orchestration
    async rechargeWallet(data: {
        amount: number;
        paymentMethod: string;
    }) {
        console.log('[WalletService] rechargeWallet called', data);
        console.log('[WalletService] Fetching URL:', `${this.apiUrl}/api/billing/checkout`);

        try {
            const response = await this.fetchApi('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'wallet_recharge',
                    amount: data.amount,
                    description: `Wallet recharge - $${data.amount.toFixed(2)}`,
                    metadata: {
                        type: 'wallet_recharge',
                    },
                }),
            });

            console.log('[WalletService] Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[WalletService] Response Error Text:', errorText);
                let error;
                try {
                    error = JSON.parse(errorText);
                } catch (e) {
                    error = { message: errorText || 'Network error' };
                }
                const errorObj: any = new Error(error.message || 'Failed to initiate recharge');
                errorObj.response = { status: response.status };
                errorObj.errorCode = error.errorCode;
                throw errorObj;
            }

            const result = await response.json();
            console.log('[WalletService] Recharge Result:', result);

            // Redirect to provider checkout/success URL
            if (result.data?.url) {
                console.log('[WalletService] Redirecting to:', result.data.url);
                window.location.href = result.data.url;
            } else {
                console.warn('[WalletService] No URL in result data:', result);
            }

            return result;
        } catch (error) {
            console.error('[WalletService] rechargeWallet exception:', error);
            throw error;
        }
    }

    // Add-on Services
    async purchaseAddOnService(request: AddOnServiceRequest) {
        const response = await fetch(`${this.baseUrl}/addons`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            if (error.error === 'INSUFFICIENT_BALANCE') {
                throw {
                    type: 'INSUFFICIENT_BALANCE',
                    message: error.message,
                    currentBalance: error.currentBalance,
                    requiredAmount: error.requiredAmount,
                    shortfall: error.shortfall,
                };
            }
            throw new Error(error.message || 'Failed to purchase add-on service');
        }
        return response.json();
    }

    // Consultant Earnings & Withdrawals
    async getEarnings() {
        const response = await fetch(`${this.baseUrl}/earnings`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch earnings');
        const data = await response.json();
        return data.data;
    }

    async requestWithdrawal(request: WithdrawalRequest) {
        const response = await fetch(`${this.baseUrl}/withdrawals`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to request withdrawal');
        }
        return response.json();
    }

    async getWithdrawalHistory(params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/withdrawals?${queryParams}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch withdrawal history');
        const data = await response.json();
        return data.data;
    }

    // Refunds
    async requestRefund(request: RefundRequest) {
        const response = await fetch(`${this.baseUrl}/refunds`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to request refund');
        return response.json();
    }

    async getRefundHistory(params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/refunds?${queryParams}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch refund history');
        const data = await response.json();
        return data.data;
    }

    // Admin Operations
    async getPendingWithdrawals(params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/admin/withdrawals/pending?${queryParams}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch pending withdrawals');
        const data = await response.json();
        return data.data;
    }

    async approveWithdrawal(withdrawalId: string, data: { paymentReference?: string; adminNotes?: string }) {
        const response = await fetch(`${this.baseUrl}/admin/withdrawals/${withdrawalId}/approve`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to approve withdrawal');
        return response.json();
    }

    async rejectWithdrawal(withdrawalId: string, reason: string) {
        const response = await fetch(`${this.baseUrl}/admin/withdrawals/${withdrawalId}/reject`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to reject withdrawal');
        return response.json();
    }

    async getPendingRefunds(params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/admin/refunds/pending?${queryParams}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch pending refunds');
        const data = await response.json();
        return data.data;
    }

    async approveRefund(refundId: string, adminNotes?: string) {
        const response = await fetch(`${this.baseUrl}/admin/refunds/${refundId}/approve`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminNotes }),
        });
        if (!response.ok) throw new Error('Failed to approve refund');
        return response.json();
    }

    async rejectRefund(refundId: string, reason: string) {
        const response = await fetch(`${this.baseUrl}/admin/refunds/${refundId}/reject`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
        });
        if (!response.ok) throw new Error('Failed to reject refund');
        return response.json();
    }

    async getWalletStats() {
        const response = await fetch(`${this.baseUrl}/admin/stats`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch wallet stats');
        const data = await response.json();
        return data.data;
    }
}

export const walletService = new WalletService();
