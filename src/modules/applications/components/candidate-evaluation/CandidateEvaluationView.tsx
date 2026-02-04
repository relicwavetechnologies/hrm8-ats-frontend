import { useState, useEffect } from "react";
import { Application } from "@/shared/types/application";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Info, FileText, User as UserIcon, CheckCircle2, XCircle, ChevronRight, Star, Send, Users, Mail, Calendar, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiClient } from "@/shared/lib/api";
import { useToast } from "@/shared/hooks/use-toast";

interface CandidateEvaluationViewProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onEvaluationComplete?: () => void;
}

interface Evaluation {
  id: string;
  score: number;
  comment: string;
  decision: 'APPROVE' | 'REJECT' | 'PENDING';
  created_at: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function CandidateEvaluationView({ application, isOpen, onClose, onEvaluationComplete }: CandidateEvaluationViewProps) {
  const [activeTab, setActiveTab] = useState("questionnaire");
  const [score, setScore] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch existing evaluations
  useEffect(() => {
    if (isOpen && application.id) {
      loadEvaluations();
    }
  }, [isOpen, application.id]);

  const loadEvaluations = async () => {
    setIsLoading(true);
    try {
      // FIX: Added /api prefix
      const response = await apiClient.get<{ evaluations: Evaluation[] }>(`/api/applications/${application.id}/evaluations`);
      if (response.success && response.data) {
        setEvaluations(response.data.evaluations);
      }
    } catch (error) {
      console.error("Failed to load evaluations", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (decision: 'APPROVE' | 'REJECT' | 'PENDING' = 'PENDING') => {
    if (score === "" || !comment.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please provide a score and a comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // FIX: Added /api prefix
      const response = await apiClient.post(`/api/applications/${application.id}/evaluate`, {
        score: Number(score),
        comment,
        decision
      });

      if (response.success) {
        toast({
          title: "Evaluation Submitted",
          description: decision !== 'PENDING' ? `Candidate ${decision.toLowerCase()}d successfully.` : "Review posted successfully.",
        });
        loadEvaluations(); // Reload list
        onEvaluationComplete?.();
        if (decision !== 'PENDING') {
            onClose();
        } else {
            // clear form
            setScore("");
            setComment("");
        }
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not submit evaluation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string) => {
    return (name || "Unknown").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Helper for safe date formatting
  const safeFormatDistance = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? formatDistanceToNow(date, { addSuffix: true }) : 'N/A';
  };

  // Determine user role (Mock for now - ideally passed from props or context)
  const canMakeDecision = true;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-4xl lg:max-w-5xl p-0 gap-0 h-full flex flex-col border-l shadow-2xl bg-white"
      >
        {/* Header */}
        <div className="bg-white px-8 py-6 flex flex-col gap-6 border-b">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
               <Avatar className="h-14 w-14 ring-2 ring-slate-100 shadow-sm">
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 text-lg font-bold">
                    {getInitials(application.candidateName || "U N")}
                  </AvatarFallback>
               </Avatar>
               <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {application.candidateName}
                    </h2>
                    <Badge variant={application.shortlisted ? "default" : "secondary"} className="text-[10px] font-bold uppercase tracking-wider h-5">
                        {application.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {application.email || application.candidateEmail || "No email provided"}</span>
                    <span className="text-slate-300">•</span>
                    <span>{application.jobTitle || "Unknown Job"}</span>
                  </div>
               </div>
            </div>
             <div className="flex gap-2">
               <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium" 
                onClick={() => {
                  const url = application.resumeUrl || (application as any).resume_url;
                  if (url) {
                    window.open(url, '_blank');
                  } else {
                    toast({
                      title: "Resume missing",
                      description: "No resume URL found for this candidate.",
                      variant: "destructive"
                    });
                  }
                }}
               >
                 <FileText className="mr-2 h-4 w-4 text-indigo-500" /> Resume
               </Button>
               <Button variant="ghost" size="icon" onClick={() => onClose()} className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                 <XCircle className="h-6 w-6" />
               </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
             <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Applied {safeFormatDistance(application.appliedDate || application.createdAt || (application as any).created_at)}</span>
             </div>
             <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                <span>Team Reviews: {evaluations.length}</span>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-8 bg-white border-b">
              <TabsList className="h-14 w-full justify-start gap-8 bg-transparent p-0 rounded-none">
                <TabsTrigger 
                  value="questionnaire" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 rounded-none h-full px-0 font-semibold text-sm text-slate-400 transition-all"
                >
                  Questionnaire
                </TabsTrigger>
                <TabsTrigger 
                  value="evaluation" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 rounded-none h-full px-0 font-semibold text-sm text-slate-400 transition-all"
                >
                  Evaluation
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <div className="max-w-4xl mx-auto">
                <TabsContent value="questionnaire" className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    {application.custom_answers && Array.isArray(application.custom_answers) && application.custom_answers.length > 0 ? (
                      <div className="grid gap-6">
                        {application.custom_answers.map((answer: any, index: number) => (
                          <div key={index} className="space-y-3 group">
                               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                 <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                 {answer.question}
                               </h4>
                               <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/30 group-hover:bg-slate-50 group-hover:border-slate-200 transition-all">
                                 <p className="text-sm text-slate-700 leading-relaxed font-medium">{answer.answer}</p>
                               </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-32 text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                        <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
                        <h3 className="text-lg font-bold text-slate-400">No Responses</h3>
                        <p className="text-sm">Candidate has not provided questionnaire answers.</p>
                      </div>
                    )}
                </TabsContent>

                <TabsContent value="evaluation" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                     
                     {/* Left Column: Input Form */}
                     <div className="lg:col-span-5 space-y-8">
                       <div className="space-y-6 sticky top-0">
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900">Your Assessment</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Provide your professional perspective on this candidate's fit for the role.</p>
                          </div>
                          
                          <div className="space-y-6">
                              <div className="space-y-3">
                                  <Label htmlFor="score" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Score (1-10)</Label>
                                  <div className="flex items-center gap-4">
                                      <Input
                                          id="score"
                                          type="number"
                                          min="1"
                                          max="10"
                                          placeholder="0"
                                          value={score}
                                          onChange={(e) => setScore(e.target.value ? Number(e.target.value) : "")}
                                          className="h-10 text-lg font-bold border-slate-200 focus:ring-0 focus:border-slate-900 transition-all rounded-lg w-24"
                                      />
                                      <div className="text-lg font-bold text-slate-300">/ 10</div>
                                  </div>
                              </div>
                              <div className="space-y-3">
                                  <Label htmlFor="comment" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Detailed Review</Label>
                                  <Textarea
                                      id="comment"
                                      placeholder="What impression did they make? Highlight key evidence for your score..."
                                      value={comment}
                                      onChange={(e) => setComment(e.target.value)}
                                      className="min-h-[150px] border-slate-200 focus:ring-0 focus:border-slate-900 resize-none text-sm p-4 rounded-lg bg-slate-50/20 focus:bg-white transition-all shadow-sm"
                                  />
                              </div>
                          </div>

                          <div className="flex flex-col gap-3 pt-6">
                             <Button 
                               onClick={() => handleSubmit('PENDING')} 
                               disabled={isSubmitting}
                               className="w-full bg-slate-900 hover:bg-black text-white rounded-lg h-10 font-semibold text-sm transition-all active:scale-[0.98]"
                             >
                               {isSubmitting ? "Processing..." : "Submit Review"}
                             </Button>
                             
                             {canMakeDecision && (
                               <div className="grid grid-cols-2 gap-3 mt-1">
                                 <Button 
                                   variant="outline"
                                   size="sm"
                                   className="border-green-100 bg-green-50/30 hover:bg-green-50 text-green-700 font-semibold rounded-lg h-9 border text-xs"
                                    onClick={() => handleSubmit('APPROVE')}
                                    disabled={isSubmitting}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                   variant="outline"
                                   size="sm"
                                   className="border-red-100 bg-red-50/30 hover:bg-red-50 text-red-700 font-semibold rounded-lg h-9 border text-xs"
                                    onClick={() => handleSubmit('REJECT')}
                                    disabled={isSubmitting}
                                  >
                                    Reject
                                  </Button>
                                </div>
                             )}
                          </div>
                       </div>
                     </div>

                     {/* Right Column: Reviews Feed */}
                     <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Collective Feedback</h3>
                        </div>
                        
                        {isLoading ? (
                            <div className="space-y-6">
                               {[1, 2].map(i => (
                                 <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl w-full" />
                               ))}
                            </div>
                        ) : evaluations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                               <Users className="h-12 w-12 opacity-10 mb-4" />
                               <p className="text-sm font-bold text-slate-400">No team evaluations yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                               {evaluations.map((evalItem) => (
                                 <div key={evalItem.id} className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all bg-white shadow-sm ring-1 ring-slate-100/50">
                                     <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                                                  {getInitials(evalItem.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-none">{evalItem.user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{evalItem.user.role?.replace(/_/g, " ")}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                          <div className="flex items-center gap-2">
                                            {evalItem.decision === 'APPROVE' && (
                                              <Badge className="bg-green-500 hover:bg-green-500 text-white border-0 text-[9px] font-black uppercase tracking-tighter h-5">Approve</Badge>
                                            )}
                                            {evalItem.decision === 'REJECT' && (
                                              <Badge variant="destructive" className="border-0 text-[10px] font-black uppercase tracking-tighter h-5">Reject</Badge>
                                            )}
                                            <span className="font-bold text-lg text-slate-900">
                                                {evalItem.score}<span className="text-slate-300 text-sm">/10</span>
                                            </span>
                                          </div>
                                        </div>
                                     </div>
                                     
                                     <div className="pl-0">
                                       <p className="text-sm text-slate-700 leading-relaxed font-normal italic">"{evalItem.comment}"</p>
                                       <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
                                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            {safeFormatDistance(evalItem.created_at)}
                                         </p>
                                       </div>
                                     </div>
                                 </div>
                               ))}
                            </div>
                        )}
                     </div>
                   </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

