
import { ApplicationReview, ApplicationVote, ApplicationComment, ReviewNotification, ApplicationFollower } from '@/shared/types/applicationReviews';

const REVIEWS_KEY = 'application_reviews';
const VOTES_KEY = 'application_votes';
const COMMENTS_KEY = 'application_comments';
const NOTIFICATIONS_KEY = 'review_notifications';
const FOLLOWERS_KEY = 'application_followers';

// Reviews
export function getReviewsByApplication(applicationId: string): ApplicationReview[] {
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    return reviews.filter((r: ApplicationReview) => r.applicationId === applicationId);
}

export function addReview(review: Omit<ApplicationReview, 'id' | 'createdAt' | 'updatedAt'>): ApplicationReview {
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    const newReview: ApplicationReview = {
        ...review,
        id: `review-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    return newReview;
}

export function updateReview(reviewId: string, updates: Partial<ApplicationReview>): void {
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    const index = reviews.findIndex((r: ApplicationReview) => r.id === reviewId);
    if (index !== -1) {
        reviews[index] = {
            ...reviews[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    }
}

// Votes
export function getVotesByApplication(applicationId: string): ApplicationVote[] {
    const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');
    return votes.filter((v: ApplicationVote) => v.applicationId === applicationId);
}

export function addVote(vote: Omit<ApplicationVote, 'id' | 'votedAt'>): ApplicationVote {
    const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');

    // Remove existing vote from same voter for this application
    const filteredVotes = votes.filter(
        (v: ApplicationVote) => !(v.applicationId === vote.applicationId && v.voterId === vote.voterId)
    );

    const newVote: ApplicationVote = {
        ...vote,
        id: `vote-${Date.now()}`,
        votedAt: new Date().toISOString(),
    };
    filteredVotes.push(newVote);
    localStorage.setItem(VOTES_KEY, JSON.stringify(filteredVotes));
    return newVote;
}

// Comments
export function getCommentsByApplication(applicationId: string): ApplicationComment[] {
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
    return comments.filter((c: ApplicationComment) => c.applicationId === applicationId);
}

export function addComment(comment: Omit<ApplicationComment, 'id' | 'createdAt' | 'updatedAt' | 'isEdited'>): ApplicationComment {
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
    const newComment: ApplicationComment = {
        ...comment,
        id: `comment-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false,
    };
    comments.push(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    return newComment;
}

export function getConsensusMetrics(applicationId: string) {
    const reviews = getReviewsByApplication(applicationId);
    const votes = getVotesByApplication(applicationId);

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const voteCount = {
        hire: votes.filter(v => v.decision === 'hire').length,
        noHire: votes.filter(v => v.decision === 'no-hire').length,
        abstain: votes.filter(v => v.decision === 'abstain').length,
    };

    const recommendationCount = {
        'strong-hire': reviews.filter(r => r.recommendation === 'strong-hire').length,
        'hire': reviews.filter(r => r.recommendation === 'hire').length,
        'maybe': reviews.filter(r => r.recommendation === 'maybe').length,
        'no-hire': reviews.filter(r => r.recommendation === 'no-hire').length,
        'strong-no-hire': reviews.filter(r => r.recommendation === 'strong-no-hire').length,
    };

    return {
        totalReviews: reviews.length,
        totalVotes: votes.length,
        averageRating: avgRating,
        voteCount,
        recommendationCount,
    };
}

// Notifications
export function getNotifications(userId: string): ReviewNotification[] {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    return notifications;
}

export function getUnreadCount(userId: string): number {
    const notifications = getNotifications(userId);
    return notifications.filter(n => !n.isRead).length;
}

export function markAsRead(notificationId: string): void {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const updated = notifications.map((n: ReviewNotification) =>
        n.id === notificationId ? { ...n, isRead: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function markAllAsRead(userId: string): void {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const updated = notifications.map((n: ReviewNotification) => ({ ...n, isRead: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
}

export function createNotification(
    notification: Omit<ReviewNotification, 'id' | 'createdAt' | 'isRead'>
): ReviewNotification {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    const newNotification: ReviewNotification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        isRead: false,
    };
    notifications.unshift(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return newNotification;
}

// Followers
export function followApplication(
    userId: string,
    applicationId: string,
    options: { emailNotifications?: boolean; inAppNotifications?: boolean } = {}
): void {
    const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');

    // Remove existing follow if any
    const filtered = followers.filter(
        (f: ApplicationFollower) => !(f.userId === userId && f.applicationId === applicationId)
    );

    filtered.push({
        userId,
        applicationId,
        followedAt: new Date().toISOString(),
        emailNotifications: options.emailNotifications ?? true,
        inAppNotifications: options.inAppNotifications ?? true,
    });

    localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(filtered));
}

export function unfollowApplication(userId: string, applicationId: string): void {
    const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');
    const filtered = followers.filter(
        (f: ApplicationFollower) => !(f.userId === userId && f.applicationId === applicationId)
    );
    localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(filtered));
}

export function isFollowing(userId: string, applicationId: string): boolean {
    const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');
    return followers.some(
        (f: ApplicationFollower) => f.userId === userId && f.applicationId === applicationId
    );
}

export function getFollowers(applicationId: string): ApplicationFollower[] {
    const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');
    return followers.filter((f: ApplicationFollower) => f.applicationId === applicationId);
}

export function updateNotificationPreferences(
    userId: string,
    applicationId: string,
    preferences: { emailNotifications?: boolean; inAppNotifications?: boolean }
): void {
    const followers = JSON.parse(localStorage.getItem(FOLLOWERS_KEY) || '[]');
    const updated = followers.map((f: ApplicationFollower) =>
        f.userId === userId && f.applicationId === applicationId
            ? { ...f, ...preferences }
            : f
    );
    localStorage.setItem(FOLLOWERS_KEY, JSON.stringify(updated));
}

// Notification creation helpers
export function notifyReviewAdded(
    applicationId: string,
    candidateName: string,
    jobTitle: string,
    reviewerId: string,
    reviewerName: string,
    reviewerAvatar?: string
): void {
    const followers = getFollowers(applicationId);

    followers.forEach((follower) => {
        if (follower.userId !== reviewerId && follower.inAppNotifications) {
            createNotification({
                type: 'review',
                applicationId,
                applicationTitle: `${jobTitle} - ${candidateName}`,
                candidateName,
                actorId: reviewerId,
                actorName: reviewerName,
                actorAvatar: reviewerAvatar,
                content: `${reviewerName} added a review`,
                link: `/applications/${applicationId}`,
            });

            // Mock email sending - would be replaced with actual edge function call
            if (follower.emailNotifications) {
                console.log(`[Mock Email] Sending review notification to user ${follower.userId}`);
            }
        }
    });
}
