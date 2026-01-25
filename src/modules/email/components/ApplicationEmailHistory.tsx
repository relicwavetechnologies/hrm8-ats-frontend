
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { EmailLogsList } from "./EmailLogsList";
import { getEmailLogs } from "../services";
import { getApplications } from "@/shared/lib/mockApplicationStorage";
import { Mail } from "lucide-react";
import { EmailLog } from "@/shared/types/emailTracking";

interface ApplicationEmailHistoryProps {
    applicationId: string;
}

export function ApplicationEmailHistory({ applicationId }: ApplicationEmailHistoryProps) {
    const [emails, setEmails] = useState<EmailLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would be an API call to fetch emails by application ID
        // For now, we'll filter the mock email logs by candidate email
        const loadEmails = () => {
            setIsLoading(true);
            try {
                const application = getApplications().find(app => app.id === applicationId);

                if (application && application.candidateEmail) {
                    const allLogs = getEmailLogs();
                    // Filter logs where the recipient includes the candidate's email
                    const candidateEmails = allLogs.filter(log =>
                        log.recipientEmails.some(email =>
                            email.toLowerCase() === application.candidateEmail.toLowerCase()
                        )
                    );
                    setEmails(candidateEmails);
                } else {
                    setEmails([]);
                }
            } catch (error) {
                console.error("Failed to load email history:", error);
                setEmails([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadEmails();
    }, [applicationId]);

    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Loading email history...</div>;
    }

    if (emails.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No email history found for this application.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <EmailLogsList emails={emails} />
        </div>
    );
}
