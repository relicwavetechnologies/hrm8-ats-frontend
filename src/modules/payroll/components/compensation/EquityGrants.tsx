import { useState, useMemo } from "react";
import { Plus, Search, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { getEquityGrants } from "@/lib/compensationStorage";
import { format } from "date-fns";
import { useCurrencyFormat } from "@/contexts/CurrencyFormatContext";

export function EquityGrants() {
  const { formatCurrency } = useCurrencyFormat();
  const [searchQuery, setSearchQuery] = useState("");

  const grants = getEquityGrants();

  const filteredGrants = useMemo(() => {
    return grants.filter(grant => 
      grant.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [grants, searchQuery]);

  const getGrantTypeBadge = (type: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      'stock-option': { variant: 'default', label: 'Stock Options' },
      'rsu': { variant: 'secondary', label: 'RSU' },
      'sar': { variant: 'outline', label: 'SAR' },
    };
    return variants[type] || variants['stock-option'];
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      'fully-vested': { variant: 'outline', label: 'Fully Vested' },
      forfeited: { variant: 'destructive', label: 'Forfeited' },
    };
    return variants[status] || variants.active;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Grant
        </Button>
      </div>

      {/* Grants List */}
      <div className="space-y-3">
        {filteredGrants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Equity Grants</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No grants match your search"
                  : "Create your first equity grant to get started"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredGrants.map((grant) => {
            const typeBadge = getGrantTypeBadge(grant.grantType);
            const statusBadge = getStatusBadge(grant.status);
            const vestingPercentage = (grant.vestedShares / grant.shares) * 100;

            return (
              <Card key={grant.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{grant.employeeName}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {grant.shares.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Shares</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Grant Date: </span>
                        <span className="font-medium">
                          {format(new Date(grant.grantDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vesting Start: </span>
                        <span className="font-medium">
                          {format(new Date(grant.vestingStartDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Schedule: </span>
                        <span className="font-medium">{grant.vestingSchedule}</span>
                      </div>
                      {grant.strikePrice && (
                        <div>
                          <span className="text-muted-foreground">Strike Price: </span>
                          <span className="font-medium">{formatCurrency(grant.strikePrice)}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vesting Progress</span>
                        <span className="font-medium">
                          {grant.vestedShares.toLocaleString()} / {grant.shares.toLocaleString()} 
                          ({vestingPercentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={vestingPercentage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
