import { useState } from "react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Eye,
} from "lucide-react";
import { getOffers, getOfferStats, Offer } from "@/shared/lib/offerService";
import { format } from "date-fns";
import { CreateOfferDialog } from "@/components/offers/CreateOfferDialog";

export default function OfferManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("pending");

  const allOffers = getOffers();
  const stats = getOfferStats();

  const filteredOffers =
    filter === "all" ? allOffers : allOffers.filter((o) => o.status === filter);

  const getStatusColor = (status: Offer["status"]) => {
    switch (status) {
      case "accepted":
        return "teal";
      case "pending":
        return "orange";
      case "rejected":
        return "destructive";
      case "withdrawn":
        return "secondary";
      case "expired":
        return "default";
      case "draft":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Offer Management</h1>
            <p className="text-muted-foreground">
              Create and track job offers for candidates
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acceptanceRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Offers List */}
        <Tabs defaultValue="pending" onValueChange={(v: any) => setFilter(v)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4 mt-4">
            {filteredOffers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No offers found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {filter === "pending"
                      ? "No pending offers"
                      : filter === "accepted"
                      ? "No accepted offers"
                      : filter === "rejected"
                      ? "No rejected offers"
                      : "No offers yet"}
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredOffers.map((offer) => (
                  <Card key={offer.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{offer.candidateName}</h3>
                              <p className="text-sm text-muted-foreground">{offer.jobTitle}</p>
                            </div>
                            <Badge variant={getStatusColor(offer.status)}>
                              {offer.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Salary</p>
                              <p className="font-medium">
                                ${offer.salary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {offer.currency}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                per {offer.salaryPeriod}
                              </p>
                            </div>

                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-medium">
                                {format(new Date(offer.startDate), "MMM dd, yyyy")}
                              </p>
                            </div>

                            <div>
                              <p className="text-muted-foreground">Sent Date</p>
                              <p className="font-medium">
                                {offer.sentDate
                                  ? format(new Date(offer.sentDate), "MMM dd, yyyy")
                                  : "Not sent"}
                              </p>
                            </div>

                            <div>
                              <p className="text-muted-foreground">Approvals</p>
                              <p className="font-medium">
                                {offer.approvals.filter((a) => a.status === "approved").length}/
                                {offer.approvals.length}
                              </p>
                            </div>
                          </div>

                          <div className="text-base font-semibold flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            {offer.status === "pending" && (
                              <>
                                <Button variant="default" size="sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark Accepted
                                </Button>
                                <Button variant="outline" size="sm">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Withdraw
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CreateOfferDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </div>
    </DashboardPageLayout>
  );
}
