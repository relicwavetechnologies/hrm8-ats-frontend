import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { TrendingUp, Users, BarChart3, MessageSquare } from "lucide-react";
import type { Feedback360 } from "@/types/performance";

interface Feedback360ResultsProps {
  feedback: Feedback360;
}

export function Feedback360Results({ feedback }: Feedback360ResultsProps) {
  // Aggregate data by relationship
  const aggregatedData = useMemo(() => {
    if (!feedback.responses || feedback.responses.length === 0) {
      return null;
    }

    const byRelationship: Record<string, {
      count: number;
      totalRating: number;
      avgRating: number;
      responses: typeof feedback.responses;
      providers: string[];
    }> = {};

    feedback.responses.forEach(response => {
      if (!byRelationship[response.relationship]) {
        byRelationship[response.relationship] = {
          count: 0,
          totalRating: 0,
          avgRating: 0,
          responses: [],
          providers: [],
        };
      }

      byRelationship[response.relationship].count += 1;
      byRelationship[response.relationship].totalRating += response.rating;
      byRelationship[response.relationship].responses.push(response);
      
      if (!byRelationship[response.relationship].providers.includes(response.providerName)) {
        byRelationship[response.relationship].providers.push(response.providerName);
      }
    });

    // Calculate averages
    Object.keys(byRelationship).forEach(relationship => {
      byRelationship[relationship].avgRating = 
        byRelationship[relationship].totalRating / byRelationship[relationship].count;
    });

    return byRelationship;
  }, [feedback.responses]);

  // Aggregate by question
  const questionAggregates = useMemo(() => {
    if (!feedback.responses || feedback.responses.length === 0) {
      return {};
    }

    const byQuestion: Record<string, {
      question: string;
      ratings: number[];
      avgRating: number;
      byRelationship: Record<string, number[]>;
    }> = {};

    feedback.questions.forEach(q => {
      byQuestion[q.id] = {
        question: q.question,
        ratings: [],
        avgRating: 0,
        byRelationship: {},
      };
    });

    feedback.responses.forEach(response => {
      if (byQuestion[response.questionId]) {
        byQuestion[response.questionId].ratings.push(response.rating);
        
        if (!byQuestion[response.questionId].byRelationship[response.relationship]) {
          byQuestion[response.questionId].byRelationship[response.relationship] = [];
        }
        byQuestion[response.questionId].byRelationship[response.relationship].push(response.rating);
      }
    });

    // Calculate averages
    Object.keys(byQuestion).forEach(questionId => {
      const ratings = byQuestion[questionId].ratings;
      byQuestion[questionId].avgRating = 
        ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    });

    return byQuestion;
  }, [feedback.responses, feedback.questions]);

  // Overall statistics
  const overallStats = useMemo(() => {
    if (!feedback.responses || feedback.responses.length === 0) {
      return null;
    }

    const allRatings = feedback.responses.map(r => r.rating);
    const avgRating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
    const totalResponses = feedback.responses.length;
    const uniqueProviders = new Set(feedback.responses.map(r => r.providerId)).size;

    return {
      avgRating,
      totalResponses,
      uniqueProviders,
      maxRating: Math.max(...allRatings),
      minRating: Math.min(...allRatings),
    };
  }, [feedback.responses]);

  if (!aggregatedData || !overallStats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Responses Yet</h3>
          <p className="text-muted-foreground">
            Feedback responses will appear here once providers submit their reviews.
          </p>
        </CardContent>
      </Card>
    );
  }

  const relationshipColors: Record<string, string> = {
    manager: 'hsl(var(--chart-1))',
    peer: 'hsl(var(--chart-2))',
    'direct-report': 'hsl(var(--chart-3))',
    client: 'hsl(var(--chart-4))',
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Respondents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.uniqueProviders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.totalResponses} total responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Highest Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.maxRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">peak score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Lowest Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.minRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="by-relationship" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-relationship">
            <Users className="h-4 w-4 mr-2" />
            By Relationship
          </TabsTrigger>
          <TabsTrigger value="by-question">
            <MessageSquare className="h-4 w-4 mr-2" />
            By Question
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments
          </TabsTrigger>
        </TabsList>

        {/* By Relationship Tab */}
        <TabsContent value="by-relationship" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ratings by Relationship Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(aggregatedData).map(([relationship, data]) => (
                <div key={relationship} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: relationshipColors[relationship] || 'hsl(var(--primary))' }}
                      />
                      <span className="font-medium capitalize">{relationship}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{data.avgRating.toFixed(1)}/5</Badge>
                      <span className="text-sm text-muted-foreground">
                        {data.providers.length} {data.providers.length === 1 ? 'provider' : 'providers'}
                      </span>
                    </div>
                  </div>
                  <Progress value={data.avgRating * 20} className="h-2" />
                  <div className="flex gap-2 flex-wrap">
                    {data.providers.map(provider => (
                      <Badge key={provider} variant="secondary" className="text-xs">
                        {provider}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Question Tab */}
        <TabsContent value="by-question" className="space-y-4">
          {Object.entries(questionAggregates).map(([questionId, data]) => (
            <Card key={questionId}>
              <CardHeader>
                <CardTitle className="text-base">{data.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Average</span>
                  <Badge variant="outline" className="text-base">
                    {data.avgRating.toFixed(1)}/5
                  </Badge>
                </div>
                <Progress value={data.avgRating * 20} className="h-2" />
                
                {/* Breakdown by relationship */}
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium">By Relationship:</p>
                  {Object.entries(data.byRelationship).map(([relationship, ratings]) => {
                    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
                    return (
                      <div key={relationship} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{relationship}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={avg * 20} className="h-1 w-24" />
                          <span className="font-medium w-12 text-right">{avg.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          {Object.entries(aggregatedData).map(([relationship, data]) => (
            <Card key={relationship}>
              <CardHeader>
                <CardTitle className="text-base capitalize flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: relationshipColors[relationship] || 'hsl(var(--primary))' }}
                  />
                  {relationship} Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.responses
                  .filter(r => r.comment && r.comment.trim())
                  .map((response) => (
                    <div key={response.id} className="border-l-2 border-primary pl-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{response.providerName}</p>
                        <Badge variant="outline">{response.rating}/5</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground italic">"{response.question}"</p>
                      <p className="text-sm bg-muted p-3 rounded">{response.comment}</p>
                    </div>
                  ))}
                {data.responses.every(r => !r.comment || !r.comment.trim()) && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    No comments provided by {relationship}s
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
