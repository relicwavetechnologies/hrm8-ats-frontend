import { Candidate, CandidateNote, CandidateDocument } from '@/shared/types/entities';

export type { Candidate, CandidateNote, CandidateDocument };

export interface CandidateFilter {
  search?: string;
  status?: string[];
  skills?: string[];
  location?: string;
  experienceLevel?: string[];
  source?: string[];
  tags?: string[];
  minSalary?: number;
  maxSalary?: number;
  availability?: string;
}

export interface CandidateSort {
  field: 'name' | 'appliedDate' | 'rating' | 'score' | 'experience';
  direction: 'asc' | 'desc';
}
