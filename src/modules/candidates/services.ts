import type { Candidate, CandidateNote, CandidateDocument } from './types';
import { mockCandidatesData, mockCandidateNotes } from '@/shared/data/mockCandidatesData';

const STORAGE_KEY = 'hrm8_candidates';
const NOTES_STORAGE_KEY = 'hrm8_candidate_notes';
const DOCS_STORAGE_KEY = 'hrm8_candidate_documents';

// Initialize storage with mock data if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCandidatesData));
  }
  if (!localStorage.getItem(NOTES_STORAGE_KEY)) {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(mockCandidateNotes));
  }
  if (!localStorage.getItem(DOCS_STORAGE_KEY)) {
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify([]));
  }
}

// Deserialize dates
function deserializeCandidate(data: any): Candidate {
  return {
    ...data,
    appliedDate: new Date(data.appliedDate),
    availabilityDate: data.availabilityDate ? new Date(data.availabilityDate) : undefined,
    lastContactedDate: data.lastContactedDate ? new Date(data.lastContactedDate) : undefined,
    nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

export const candidateService = {
  getCandidates(): Candidate[] {
    initializeStorage();
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data).map(deserializeCandidate);
  },

  getCandidateById(id: string): Candidate | undefined {
    const candidates = this.getCandidates();
    return candidates.find(c => c.id === id);
  },

  saveCandidate(candidate: Candidate): void {
    const candidates = this.getCandidates();
    const newCandidate = {
      ...candidate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    candidates.push(newCandidate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  },

  updateCandidate(id: string, updates: Partial<Candidate>): void {
    const candidates = this.getCandidates();
    const index = candidates.findIndex(c => c.id === id);
    if (index !== -1) {
      candidates[index] = {
        ...candidates[index],
        ...updates,
        updatedAt: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    }
  },

  deleteCandidate(id: string): void {
    const candidates = this.getCandidates();
    const filtered = candidates.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  searchCandidates(query: string, filters?: {
    status?: string[];
    experienceLevel?: string[];
    skills?: string[];
    location?: string;
    source?: string;
    assignedTo?: string;
    availableFrom?: Date;
    availableTo?: Date;
  }): Candidate[] {
    let candidates = this.getCandidates();

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      candidates = candidates.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery) ||
        c.phone.includes(query) ||
        c.position.toLowerCase().includes(lowerQuery) ||
        c.skills.some(s => s.toLowerCase().includes(lowerQuery))
      );
    }

    // Filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        candidates = candidates.filter(c => filters.status!.includes(c.status));
      }
      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        candidates = candidates.filter(c => filters.experienceLevel!.includes(c.experienceLevel));
      }
      if (filters.skills && filters.skills.length > 0) {
        candidates = candidates.filter(c =>
          filters.skills!.some(skill => c.skills.includes(skill))
        );
      }
      if (filters.location) {
        const lowerLocation = filters.location.toLowerCase();
        candidates = candidates.filter(c =>
          c.city?.toLowerCase().includes(lowerLocation) ||
          c.state?.toLowerCase().includes(lowerLocation)
        );
      }
      if (filters.source) {
        candidates = candidates.filter(c => c.source === filters.source);
      }
      if (filters.assignedTo) {
        candidates = candidates.filter(c => c.assignedTo === filters.assignedTo);
      }
    }

    return candidates;
  },

  clearAllCandidates(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(NOTES_STORAGE_KEY);
    localStorage.removeItem(DOCS_STORAGE_KEY);
  },

  // Notes Management
  getCandidateNotes(candidateId: string): CandidateNote[] {
    initializeStorage();
    const data = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!data) return [];
    const notes = JSON.parse(data);
    return notes
      .filter((n: any) => n.candidateId === candidateId)
      .map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      }));
  },

  addCandidateNote(note: Omit<CandidateNote, 'id' | 'createdAt' | 'updatedAt'>): void {
    initializeStorage();
    const data = localStorage.getItem(NOTES_STORAGE_KEY);
    const notes = data ? JSON.parse(data) : [];
    const newNote: CandidateNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    notes.push(newNote);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  },

  deleteCandidateNote(noteId: string): void {
    const data = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!data) return;
    const notes = JSON.parse(data);
    const filtered = notes.filter((n: any) => n.id !== noteId);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filtered));
  },

  // Documents Management
  getCandidateDocuments(candidateId: string): CandidateDocument[] {
    initializeStorage();
    const data = localStorage.getItem(DOCS_STORAGE_KEY);
    if (!data) return [];
    const docs = JSON.parse(data);
    return docs
      .filter((d: any) => d.candidateId === candidateId)
      .map((d: any) => ({
        ...d,
        uploadedAt: new Date(d.uploadedAt),
      }));
  },

  addCandidateDocument(doc: Omit<CandidateDocument, 'id' | 'uploadedAt'>): void {
    initializeStorage();
    const data = localStorage.getItem(DOCS_STORAGE_KEY);
    const docs = data ? JSON.parse(data) : [];
    const newDoc: CandidateDocument = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date(),
    };
    docs.push(newDoc);
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
  },

  deleteCandidateDocument(docId: string): void {
    const data = localStorage.getItem(DOCS_STORAGE_KEY);
    if (!data) return;
    const docs = JSON.parse(data);
    const filtered = docs.filter((d: any) => d.id !== docId);
    localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(filtered));
  }
};
