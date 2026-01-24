import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface ContractSLA {
  contractId: string;
  clientName: string;
  overallCompliance: number;
  metrics: {
    name: string;
    current: number;
    target: number;
    status: 'met' | 'at-risk' | 'missed';
  }[];
}

export function RPOSLAComparison() {
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data for multiple contracts
  const contracts: ContractSLA[] = [
    {
      contractId: '1',
      clientName: 'TechCorp Inc',
      overallCompliance: 100,
      metrics: [
        { name: 'Time to Submit', current: 36, target: 48, status: 'met' },
        { name: 'Quality Score', current: 88, target: 85, status: 'met' },
        { name: 'Placements', current: 10, target: 10, status: 'met' },
        { name: 'Response Time', current: 18, target: 24, status: 'met' },
      ]
    },
    {
      contractId: '2',
      clientName: 'Global Dynamics',
      overallCompliance: 83,
      metrics: [
        { name: 'Time to Submit', current: 42, target: 48, status: 'met' },
        { name: 'Quality Score', current: 82, target: 85, status: 'at-risk' },
        { name: 'Placements', current: 7, target: 10, status: 'at-risk' },
        { name: 'Response Time', current: 22, target: 24, status: 'met' },
      ]
    },
    {
      contractId: '3',
      clientName: 'Innovate Solutions',
      overallCompliance: 92,
      metrics: [
        { name: 'Time to Submit', current: 40, target: 48, status: 'met' },
        { name: 'Quality Score', current: 86, target: 85, status: 'met' },
        { name: 'Placements', current: 9, target: 10, status: 'at-risk' },
        { name: 'Response Time', current: 20, target: 24, status: 'met' },
      ]
    },
    {
      contractId: '4',
      clientName: 'Enterprise Systems',
      overallCompliance: 75,
      metrics: [
        { name: 'Time to Submit', current: 50, target: 48, status: 'missed' },
        { name: 'Quality Score', current: 80, target: 85, status: 'at-risk' },
        { name: 'Placements', current: 8, target: 10, status: 'at-risk' },
        { name: 'Response Time', current: 23, target: 24, status: 'met' },
      ]
    }
  ];

  // Prepare comparison data for charts
  const comparisonData = contracts.map(contract => ({
    client: contract.clientName.split(' ')[0],
    compliance: contract.overallCompliance,
    metCount: contract.metrics.filter(m => m.status === 'met').length,
    atRiskCount: contract.metrics.filter(m => m.status === 'at-risk').length,
    missedCount: contract.metrics.filter(m => m.status === 'missed').length,
  }));

  const getStatusIcon = (status: string) => {
    if (status === 'met') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Compliance Comparison</CardTitle>
          <CardDescription>Overall compliance across all RPO contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="client" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-2">{data.client}</p>
                      <p className="text-sm text-primary">
                        Compliance: {data.compliance}%
                      </p>
                      <p className="text-sm text-green-600">
                        Met: {data.metCount}
                      </p>
                      <p className="text-sm text-yellow-600">
                        At Risk: {data.atRiskCount}
                      </p>
                      {data.missedCount > 0 && (
                        <p className="text-sm text-destructive">
                          Missed: {data.missedCount}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar dataKey="compliance" fill="hsl(var(--primary))" name="Compliance %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metric Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detailed Comparison</CardTitle>
              <CardDescription>Compare specific metrics across contracts</CardDescription>
            </div>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="time">Time to Submit</SelectItem>
                <SelectItem value="quality">Quality Score</SelectItem>
                <SelectItem value="placements">Placements</SelectItem>
                <SelectItem value="response">Response Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.contractId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{contract.clientName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Contract ID: {contract.contractId}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      contract.overallCompliance >= 90 ? 'text-green-600' : 
                      contract.overallCompliance >= 75 ? 'text-yellow-600' : 
                      'text-destructive'
                    }`}>
                      {contract.overallCompliance}%
                    </div>
                    <p className="text-xs text-muted-foreground">Overall</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {contract.metrics.map((metric, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{metric.name}</span>
                        {getStatusIcon(metric.status)}
                      </div>
                      <div className="text-lg font-semibold">{metric.current}</div>
                      <div className="text-xs text-muted-foreground">
                        Target: {metric.target}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Badge variant="default" className="bg-green-600">
                    {contract.metrics.filter(m => m.status === 'met').length} Met
                  </Badge>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    {contract.metrics.filter(m => m.status === 'at-risk').length} At Risk
                  </Badge>
                  {contract.metrics.filter(m => m.status === 'missed').length > 0 && (
                    <Badge variant="destructive">
                      {contract.metrics.filter(m => m.status === 'missed').length} Missed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {contracts.filter(c => c.overallCompliance >= 90).length}
                </div>
                <p className="text-sm text-muted-foreground">High Performers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {contracts.filter(c => c.overallCompliance >= 75 && c.overallCompliance < 90).length}
                </div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">
                  {contracts.filter(c => c.overallCompliance < 75).length}
                </div>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
