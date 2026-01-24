import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { DashboardPageLayout } from "@/components/layouts/DashboardPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { saveFeedback360 } from "@/shared/lib/performanceStorage";
import { toast } from "sonner";
import type { Feedback360, FeedbackProvider, FeedbackQuestion } from "@/shared/types/performance";

export default function FeedbackRequestCreate() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "EMP001",
    employeeName: "John Doe",
    reviewCycle: "Q1 2024",
    requestedBy: "MGR001",
    requestedByName: "Jane Smith",
    dueDate: "",
  });

  const [providers, setProviders] = useState<Omit<FeedbackProvider, 'id'>[]>([
    {
      providerId: "",
      providerName: "",
      relationship: "manager",
      email: "",
      status: "pending",
    }
  ]);

  const [questions, setQuestions] = useState<Omit<FeedbackQuestion, 'id'>[]>([
    { question: "How well does this person communicate with team members?" },
    { question: "How effectively does this person collaborate on projects?" },
    { question: "What are this person's key strengths?" },
  ]);

  const handleAddProvider = () => {
    setProviders([
      ...providers,
      {
        providerId: "",
        providerName: "",
        relationship: "peer",
        email: "",
        status: "pending",
      }
    ]);
  };

  const handleRemoveProvider = (index: number) => {
    setProviders(providers.filter((_, i) => i !== index));
  };

  const handleProviderChange = (index: number, field: keyof Omit<FeedbackProvider, 'id'>, value: any) => {
    const updated = [...providers];
    updated[index] = { ...updated[index], [field]: value };
    setProviders(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "" }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = { question: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dueDate) {
      toast.error("Please set a due date");
      return;
    }

    if (providers.some(p => !p.providerName || !p.email)) {
      toast.error("Please fill in all provider details");
      return;
    }

    if (questions.some(q => !q.question.trim())) {
      toast.error("Please fill in all questions");
      return;
    }

    setIsSaving(true);
    try {
      const newFeedback: Feedback360 = {
        id: `FB360-${Date.now()}`,
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        reviewCycle: formData.reviewCycle,
        requestedBy: formData.requestedBy,
        requestedByName: formData.requestedByName,
        providers: providers.map((provider, index) => ({
          ...provider,
          id: `PROV-${Date.now()}-${index}`,
          providerId: `USER-${index + 1}`,
        })),
        questions: questions.map((question, index) => ({
          ...question,
          id: `Q-${Date.now()}-${index}`,
        })),
        responses: [],
        status: 'pending',
        dueDate: new Date(formData.dueDate).toISOString(),
        createdAt: new Date().toISOString(),
      };

      saveFeedback360(newFeedback);
      toast.success("360 Feedback request created successfully");
      navigate('/performance');
    } catch (error) {
      toast.error("Failed to create feedback request");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Request 360 Feedback</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="text-base font-semibold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/performance')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Request 360 Feedback</h1>
              <p className="text-muted-foreground">Gather comprehensive feedback from multiple sources</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewCycle">Review Cycle</Label>
                    <Input
                      id="reviewCycle"
                      value={formData.reviewCycle}
                      onChange={(e) => setFormData({ ...formData, reviewCycle: e.target.value })}
                      placeholder="e.g., Q1 2024, Annual 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      When should all feedback be submitted by?
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Providers */}
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Feedback Providers</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddProvider}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Provider
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {providers.map((provider, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="text-base font-semibold flex items-center justify-between">
                        <h4 className="font-semibold">Provider {index + 1}</h4>
                        {providers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProvider(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={provider.providerName}
                            onChange={(e) => handleProviderChange(index, 'providerName', e.target.value)}
                            placeholder="Full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={provider.email}
                            onChange={(e) => handleProviderChange(index, 'email', e.target.value)}
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship *</Label>
                        <Select
                          value={provider.relationship}
                          onValueChange={(value) => handleProviderChange(index, 'relationship', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="peer">Peer</SelectItem>
                            <SelectItem value="direct-report">Direct Report</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Feedback Questions</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="text-base font-semibold flex items-center justify-between">
                        <h4 className="font-semibold">Question {index + 1}</h4>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={question.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        placeholder="Enter your question..."
                        rows={3}
                        required
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Employee</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employee Name</Label>
                    <Select
                      value={formData.employeeName}
                      onValueChange={(value) => setFormData({ ...formData, employeeName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Doe">John Doe</SelectItem>
                        <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                        <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Who is this feedback for?
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="text-base font-semibold flex items-center justify-between">
                    <span className="text-muted-foreground">Providers</span>
                    <span className="font-medium">{providers.length}</span>
                  </div>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Creating..." : "Send Feedback Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/performance')}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardPageLayout>
  );
}
