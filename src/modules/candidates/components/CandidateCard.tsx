import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { CandidateAvatar } from "./CandidateAvatar";
import { CandidateStatusBadge } from "./CandidateStatusBadge";
import { AIInterviewScoreBadge } from "./AIInterviewScoreBadge";
import { SkillsBadgeGroup } from "./SkillsBadgeGroup";
import { Button } from "@/shared/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import type { Candidate } from "@/shared/types/entities";
import { Link } from "react-router-dom";

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Link to={`/candidates/${candidate.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CandidateAvatar 
                name={candidate.name} 
                photo={candidate.photo}
                status={candidate.status}
                showStatus
                size="lg"
              />
              <div>
                <h3 className="font-semibold">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">{candidate.position}</p>
                <div className="mt-1">
                  <AIInterviewScoreBadge candidateId={candidate.id} variant="compact" />
                </div>
              </div>
            </div>
            <CandidateStatusBadge status={candidate.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3" />
              {candidate.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3 w-3" />
              {candidate.phone}
            </div>
            {candidate.city && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {candidate.city}, {candidate.state}
              </div>
            )}
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Skills</p>
            <SkillsBadgeGroup skills={candidate.skills} maxVisible={3} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>{candidate.experience}</span>
            <span>Applied {candidate.appliedDate.toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
