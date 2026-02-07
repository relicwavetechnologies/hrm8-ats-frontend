import { useState, useCallback, useEffect } from 'react';
import { Message } from './types';
import { useJobCreateStore } from '@/modules/jobs/store/useJobCreateStore';
import { documentService } from '@/shared/lib/documentService';
import { toast } from '@/shared/hooks/use-toast';

export const useJobConversation = () => {
    const { currentStepId, jobData, nextStep, setJobData, ingestParsedData } = useJobCreateStore();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'bot',
            content: "Welcome! I'm your hiring assistant. I'll help you create a great job post in just a few minutes.\n\nDo you want to **upload a Job Description** (PDF/Word) to get started faster, or should we create it together from scratch?\n\n*Tip: Uploading a JD will auto-fill most fields!*",
            timestamp: new Date(),
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleFileUpload = useCallback(async (file: File) => {
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: `Uploaded: ${file.name}`,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);

        setIsTyping(true);

        try {
            const result = await documentService.parseDocument(file);

            if (result.success && result.data) {
                // Ingest data into the store (this includes the legacy filling logic)
                ingestParsedData(result.data.extractedData, {});

                const extracted = result.data.extractedData;
                const fields = [];
                if (extracted.title) fields.push("Job Title");
                if (extracted.description) fields.push("Description");
                if (extracted.salaryRange) fields.push("Compensation");
                if (extracted.requirements?.length) fields.push("Requirements");

                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    content: `Great! I've analyzed "${file.name}" and extracted details for: **${fields.join(', ')}**.\n\nNow, let's verify a few things. First, what is the **Current Location** for this role?`,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, botMsg]);
            } else {
                throw new Error(result.error || "Failed to parse document");
            }
        } catch (error: any) {
            toast({
                title: "Parsing Error",
                description: error.message || "Something went wrong while reading the file.",
                variant: "destructive"
            });
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: "I'm sorry, I had trouble reading that file. Let's try another one, or we can just start by entering the **Job Title** manually.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    }, [ingestParsedData]);

    const sendMessage = useCallback(async (content: string) => {
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);

        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        let botResponse = "";

        if (currentStepId === 'service-type' || currentStepId === 'basic-details') {
            setJobData({ title: content });
            botResponse = "Great! And which **Department** should this be assigned to?";
            nextStep();
        } else {
            botResponse = "Got it! Let's keep going. What about the **Location**?";
            nextStep();
        }

        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            content: botResponse,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
    }, [currentStepId, nextStep, setJobData]);

    return {
        messages,
        isTyping,
        sendMessage,
        handleFileUpload
    };
};
