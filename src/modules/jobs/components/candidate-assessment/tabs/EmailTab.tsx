import React from "react";
import { Application } from "@/shared/types/application";
import { CandidateEmailPanel } from "../CandidateEmailPanel";

interface EmailTabProps {
  application: Application;
}

export function EmailTab({ application }: EmailTabProps) {
  return (
    <div className="h-full -m-4">
      <CandidateEmailPanel
        applicationId={application.id}
        jobId={application.jobId || ''}
        candidateName={application.candidateName || "Candidate"}
        jobTitle={application.jobTitle || "Position"}
        candidateEmail={application.candidateEmail}
      />
    </div>
  );
}
