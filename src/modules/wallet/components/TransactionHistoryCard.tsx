import { useEffect, useState } from 'react';
import { walletService, type Transaction } from '@/shared/services/walletService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { formatCurrency } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { DollarSign, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export function TransactionHistoryCard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const response = await walletService.getTransactions({ limit: 10 });

            if (response?.transactions) {
                setTransactions(response.transactions);
            }
        } catch (error: any) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionTypeLabel = (type: string) => {
        const typeMap: Record<string, string> = {
            'SUBSCRIPTION_PURCHASE': 'Subscription',
            'SUBSCRIPTION_REFUND': 'Subscription Refund',
            'JOB_POSTING_DEDUCTION': 'Job Posting',
            'JOB_REFUND': 'Job Refund',
            'COMMISSION_EARNED': 'Commission',
            'COMMISSION_WITHDRAWAL': 'Withdrawal',
            'ADDON_SERVICE_CHARGE': 'Add-on Service',
            'ADDON_SERVICE_REFUND': 'Add-on Refund',
            'ADMIN_ADJUSTMENT': 'Admin Adjustment',
            'PLATFORM_FEE': 'Platform Fee',
            'TRANSFER_IN': 'Wallet Recharge',
            'TRANSFER_OUT': 'Transfer Out',
        };
        return typeMap[type] || type;
    };

    const getTransactionIcon = (direction: string) => {
        return direction === 'CREDIT' ? (
            <ArrowUpCircle className="w-4 h-4 text-green-600" />
        ) : (
            <ArrowDownCircle className="w-4 h-4 text-red-600" />
        );
    };

    const totalSpent = transactions
        .filter(t => t.direction === 'DEBIT')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalEarned = transactions
        .filter(t => t.direction === 'CREDIT')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Transaction History
                        </CardTitle>
                        <CardDescription>All your company payments and transactions</CardDescription>
                    </div>
                    {!loading && transactions.length > 0 && (
                        <div className="text-right">
                            <div className="flex gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <TrendingDown className="w-3 h-3" />
                                        Total Spent
                                    </p>
                                    <p className="text-xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        Total Received
                                    </p>
                                    <p className="text-xl font-bold text-green-600">{formatCurrency(totalEarned)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Loading transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">No transactions found. Your payments will appear here once processed.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex-shrink-0">
                                        {getTransactionIcon(transaction.direction)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium truncate">{transaction.description || 'Transaction'}</p>
                                            <Badge variant={transaction.direction === 'CREDIT' ? 'default' : 'secondary'} className="flex-shrink-0">
                                                {getTransactionTypeLabel(transaction.type)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(transaction.created_at), 'MMM d, yyyy - h:mm a')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${transaction.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Balance: {formatCurrency(transaction.balance_after)}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={
                                        transaction.status === 'COMPLETED'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : transaction.status === 'PENDING'
                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }>
                                        {transaction.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
