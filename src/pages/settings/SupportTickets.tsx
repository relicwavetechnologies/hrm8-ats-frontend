import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { AtsPageHeader } from "@/app/layouts/AtsPageHeader";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Helmet } from "react-helmet-async";
import { 
  Ticket, Search, Filter, MessageSquare, AlertCircle, 
  CheckCircle, Clock, User, Building2, Calendar, Send
} from "lucide-react";
import { getSupportTickets, type SupportTicket } from "@/data/mockPlatformData";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";

const mockResponseTemplates = [
  { id: '1', name: 'Acknowledge & Investigating', content: 'Thank you for reporting this issue. Our team is currently investigating and will update you shortly.' },
  { id: '2', name: 'Request More Info', content: 'To better assist you, could you please provide more details about...' },
  { id: '3', name: 'Resolved', content: 'This issue has been resolved. Please let us know if you need any further assistance.' },
  { id: '4', name: 'Workaround Available', content: 'While we work on a permanent fix, here is a workaround you can use...' },
];

export default function SupportTickets() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
  const [assignTo, setAssignTo] = useState("");

  const tickets = useMemo(() => getSupportTickets(), []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.employerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const ticketsByStatus = useMemo(() => ({
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    'in-progress': tickets.filter(t => t.status === 'in-progress').length,
    'waiting-response': tickets.filter(t => t.status === 'waiting-response').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  }), [tickets]);

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return AlertCircle;
      case 'in-progress': return Clock;
      case 'waiting-response': return MessageSquare;
      case 'resolved': return CheckCircle;
      case 'closed': return CheckCircle;
    }
  };

  const handleAssignTicket = () => {
    if (!selectedTicket || !assignTo) return;
    toast({
      title: "Ticket Assigned",
      description: `Ticket ${selectedTicket.ticketNumber} assigned to ${assignTo}`,
    });
    setSelectedTicket(null);
    setAssignTo("");
  };

  const handleSendResponse = () => {
    if (!selectedTicket || !responseText) return;
    toast({
      title: "Response Sent",
      description: `Response sent for ticket ${selectedTicket.ticketNumber}`,
    });
    setResponseText("");
    setSelectedTicket(null);
  };

  const applyTemplate = (template: typeof mockResponseTemplates[0]) => {
    setResponseText(template.content);
  };

  return (
    <DashboardPageLayout>
      <Helmet>
        <title>Support Tickets - HRM8</title>
      </Helmet>

      <div className="p-6 space-y-6">
        <AtsPageHeader
          title="Support Tickets"
          subtitle="Manage and respond to customer support requests"
        >
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
        </AtsPageHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="text-lg md:text-xl font-semibold">{ticketsByStatus.all}</div>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="text-lg md:text-xl font-semibold">{ticketsByStatus.open}</div>
              <p className="text-xs text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="text-lg md:text-xl font-semibold">{ticketsByStatus['in-progress']}</div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="text-lg md:text-xl font-semibold">{ticketsByStatus['waiting-response']}</div>
              <p className="text-xs text-muted-foreground">Waiting</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="text-lg md:text-xl font-semibold">{ticketsByStatus.resolved}</div>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="text-lg md:text-xl font-semibold">{ticketsByStatus.closed}</div>
              <p className="text-xs text-muted-foreground">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="waiting-response">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature-request">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tickets ({filteredTickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No tickets found</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const StatusIcon = getStatusIcon(ticket.status);
                  return (
                    <Dialog key={ticket.id}>
                      <DialogTrigger asChild>
                        <div
                          className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-lg border-2",
                            getPriorityColor(ticket.priority)
                          )}>
                            <StatusIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">
                                    {ticket.ticketNumber}
                                  </Badge>
                                  <Badge className={cn("text-xs capitalize whitespace-nowrap", getPriorityColor(ticket.priority))}>
                                    {ticket.priority}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs capitalize whitespace-nowrap">
                                    {ticket.status.replace('-', ' ')}
                                  </Badge>
                                </div>
                                <h3 className="text-sm font-semibold truncate">{ticket.subject}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {ticket.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {ticket.employerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                              </span>
                              {ticket.assignedTo && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {ticket.assignedTo}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs capitalize">
                                {ticket.category.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <Ticket className="h-4 w-4" />
                            {ticket.ticketNumber} - {ticket.subject}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Badge className={cn("capitalize whitespace-nowrap", getPriorityColor(ticket.priority))}>
                              {ticket.priority} Priority
                            </Badge>
                            <Badge variant="secondary" className="capitalize whitespace-nowrap">
                              {ticket.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className="capitalize whitespace-nowrap">
                              {ticket.category.replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 py-4 border-y">
                            <div>
                              <Label className="text-muted-foreground">Employer</Label>
                              <p className="font-medium">{ticket.employerName}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Created By</Label>
                              <p className="font-medium">{ticket.createdBy}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Created</Label>
                              <p className="font-medium">{format(new Date(ticket.createdAt), 'PPpp')}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Last Updated</Label>
                              <p className="font-medium">{format(new Date(ticket.updatedAt), 'PPpp')}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-muted-foreground">Description</Label>
                            <p className="mt-2 text-sm">{ticket.description}</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Assign To</Label>
                            <div className="flex gap-2">
                              <Select value={assignTo} onValueChange={setAssignTo}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team member" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sarah Admin">Sarah Admin</SelectItem>
                                  <SelectItem value="Michael Support">Michael Support</SelectItem>
                                  <SelectItem value="Emma Tech">Emma Tech</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button onClick={handleAssignTicket}>Assign</Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Response Templates</Label>
                            <div className="flex flex-wrap gap-2">
                              {mockResponseTemplates.map((template) => (
                                <Button
                                  key={template.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => applyTemplate(template)}
                                >
                                  {template.name}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Send Response</Label>
                            <Textarea
                              placeholder="Type your response..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={6}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                            Close
                          </Button>
                          <Button onClick={handleSendResponse} disabled={!responseText}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Response
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}
