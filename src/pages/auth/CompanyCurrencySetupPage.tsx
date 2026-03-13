/**
 * Company Currency Setup Page
 * First-time setup for companies to select their billing currency.
 * Shown when currency_preference_confirmed_at is null and currency is not locked.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { companyProfileService } from '@/shared/lib/companyProfileService';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const SUPPORTED_CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'INR', 'NZD', 'SGD', 'CAD'] as const;

export default function CompanyCurrencySetupPage() {
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const { user, isLoading: authLoading, refreshProfileSummary } = useAuth();
  const navigate = useNavigate();

  const suggestedCurrency = 'USD';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currency = selectedCurrency || suggestedCurrency;
    if (!user?.companyId) {
      toast.error('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await companyProfileService.confirmCurrencyPreference(user.companyId, currency);
      if (response.success) {
        toast.success('Billing currency saved');
        await refreshProfileSummary();
        navigate('/home', { replace: true });
      } else {
        toast.error(response.error || 'Failed to save currency preference');
      }
    } catch {
      toast.error('Failed to save currency preference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <CardTitle className="text-xl">Set Your Billing Currency</CardTitle>
          </div>
          <CardDescription>
            Choose the currency for all transactions, subscriptions, and job postings. This can only be changed before
            your first payment.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Billing Currency</Label>
              <Select
                value={selectedCurrency || suggestedCurrency}
                onValueChange={setSelectedCurrency}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Continue
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
