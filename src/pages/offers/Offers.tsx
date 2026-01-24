import { useState, useEffect } from "react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FileText, Plus, Mail } from "lucide-react";
import { getOffers, saveOffer } from "@/shared/lib/mockOfferStorage";
import { OfferLetter } from "@/shared/types/offer";
import { Badge } from "@/shared/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { OfferForm } from "@/components/offers/OfferForm";
import { toast } from "@/shared/hooks/use-toast";

export default function Offers() {
  const [offers, setOffers] = useState<OfferLetter[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadOffers();
  }, []);
  

  const loadOffers = () => {
    setOffers(getOffers());
  };

  const handleSubmitOffer = (data: any) => {
    const newOffer: OfferLetter = {
      id: `offer-${Date.now()}`,
      applicationId: 'app-temp',
      candidateId: 'cand-temp',
      candidateName: 'Sample Candidate',
      candidateEmail: 'candidate@example.com',
      jobId: 'job-temp',
      jobTitle: 'Sample Position',
      templateId: data?.templateId,
      offerType: data.offerType,
      salary: data.salary,
      salaryCurrency: data.salaryCurrency,
      salaryPeriod: data.salaryPeriod,
      startDate: data.startDate,
      benefits: data.benefits?.split(',').map((b: string) => b.trim()) || [],
      bonusStructure: data.bonusStructure,
      equityOptions: data.equityOptions,
      workLocation: data.workLocation,
      workArrangement: data.workArrangement,
      probationPeriod: data.probationPeriod,
      vacationDays: data.vacationDays,
      customTerms: [],
      status: 'draft',
      approvalWorkflow: [],
      expiryDate: data.expiryDate,
      customMessage: data.customMessage,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveOffer(newOffer);
    loadOffers();
    setIsFormOpen(false);
    toast({
      title: "Offer Letter Created",
      description: "The offer letter has been created successfully.",
    });
  };

  const getStatusBadge = (status: OfferLetter['status']) => {
    const variants: Record<OfferLetter['status'], any> = {
      draft: "outline",
      'pending-approval': "secondary",
      approved: "default",
      sent: "secondary",
      accepted: "default",
      declined: "destructive",
      expired: "outline",
      withdrawn: "destructive",
    };
    return <Badge variant={variants[status]}>{status.replace('-', ' ')}</Badge>;
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Offer Letters</h1>
            <p className="text-muted-foreground">
              Create and manage employment offers
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Button>
        </div>

        <div className="grid gap-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">{offer.candidateName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{offer.jobTitle}</p>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-base font-semibold flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Salary:</span>{" "}
                      ${offer.salary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {offer.salaryCurrency} per {offer.salaryPeriod}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Start Date: {new Date(offer.startDate).toLocaleDateString()}
                    </div>
                    {offer.createdAt && (
                      <div className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {offer.status === 'approved' && (
                      <Button size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {offers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Offers Yet</p>
                <p className="text-sm text-muted-foreground">
                  Generate offer letters for selected candidates
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Offer Letter</DialogTitle>
            </DialogHeader>
            <OfferForm
              candidateName="Sample Candidate"
              jobTitle="Sample Position"
              onSubmit={handleSubmitOffer}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageLayout>
  );
}
