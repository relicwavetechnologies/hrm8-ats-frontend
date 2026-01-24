import { useMemo } from 'react';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { getCandidates } from '@/shared/lib/mockCandidateStorage';
import { getJobs } from '@/shared/lib/mockJobStorage';

interface SelectCandidateStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

// Fallback data if storage is empty
const fallbackCandidates = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com' },
  { id: '2', name: 'Michael Chen', email: 'michael.c@email.com' },
  { id: '3', name: 'Emily Rodriguez', email: 'emily.r@email.com' },
];

const fallbackJobs = [
  { id: '1', title: 'Senior Software Engineer' },
  { id: '2', title: 'Product Manager' },
  { id: '3', title: 'UX Designer' },
];

export function SelectCandidateStep({ data, onUpdate }: SelectCandidateStepProps) {
  // Fetch real data from storage, fallback to mock if empty
  const candidates = useMemo(() => {
    const stored = getCandidates();
    return stored.length > 0 ? stored : fallbackCandidates;
  }, []);

  const jobs = useMemo(() => {
    const stored = getJobs();
    return stored.length > 0 ? stored : fallbackJobs;
  }, []);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Select Candidate</Label>
        <Select 
          value={data.candidateId} 
          onValueChange={(value) => {
            const candidate = candidates.find(c => c.id === value);
            onUpdate({ 
              candidateId: value,
              candidateName: candidate?.name,
              candidateEmail: candidate?.email
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a candidate" />
          </SelectTrigger>
          <SelectContent>
            {candidates.map(candidate => (
              <SelectItem key={candidate.id} value={candidate.id}>
                {candidate.name} ({candidate.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Select Job Position</Label>
        <Select 
          value={data.jobId} 
          onValueChange={(value) => {
            const job = jobs.find(j => j.id === value);
            onUpdate({ jobId: value, jobTitle: job?.title });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a job position" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map(job => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
