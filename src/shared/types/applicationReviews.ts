
export interface ApplicationReview {
    id: string;
    applicationId: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string;
    rating: number; // 1-5
    categories: {
        technicalSkills: number;
        experience: number;
        culturalFit: number;
        communication: number;
    };
    comment: string;
    recommendation: 'strong-hire' | 'hire' | 'maybe' | 'no-hire' | 'strong-no-hire';
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationVote {
    id: string;
    applicationId: string;
    voterId: string;
    voterName: string;
    voterAvatar?: string;
    decision: 'hire' | 'no-hire' | 'abstain';
    reasoning: string;
    votedAt: string;
}

export interface ApplicationComment {
    id: string;
    applicationId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    parentId?: string;
    mentions?: string[];
    createdAt: string;
    updatedAt: string;
    isEdited: boolean;
}

export interface ReviewNotification {
    id: string;
    type: 'review' | 'vote' | 'comment' | 'reply';
    applicationId: string;
    applicationTitle: string;
    candidateName: string;
    actorId: string;
    actorName: string;
    actorAvatar?: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    link: string;
}

export interface ApplicationFollower {
    userId: string;
    applicationId: string;
    followedAt: string;
    emailNotifications: boolean;
    inAppNotifications: boolean;
}
