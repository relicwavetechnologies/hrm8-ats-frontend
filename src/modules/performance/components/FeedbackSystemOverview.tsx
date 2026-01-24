import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Vote,
  LayoutDashboard,
  FileText,
  Bell,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeedbackSystemOverview() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Multi-Criteria Feedback',
      description: 'Rate candidates on customizable criteria with confidence levels and structured comments',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Collect feedback from multiple team members and track response status',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      title: 'Consensus Tracking',
      description: 'Visualize team alignment with agreement metrics and recommendation distribution',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Vote,
      title: 'Voting System',
      description: 'Enable team voting on candidates with clear reasoning and decision recording',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Bell,
      title: 'Email Notifications',
      description: 'Automated email requests for feedback with reminders and customizable preferences',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      icon: FileText,
      title: 'Request Templates',
      description: 'Pre-configured templates for different roles and interview stages',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Zap,
      title: 'Automation Rules',
      description: 'Trigger feedback requests automatically based on interview events',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track completion rates, response times, and team engagement metrics',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const quickLinks = [
    {
      title: 'Feedback Dashboard',
      description: 'View all requests and analytics',
      href: '/feedback-dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Manage Templates',
      description: 'Create reusable feedback templates',
      href: '/feedback-templates',
      icon: FileText,
    },
    {
      title: 'Notification Center',
      description: 'Track requests and preferences',
      href: '/notifications',
      icon: Bell,
    },
    {
      title: 'Candidate Feedback',
      description: 'Provide collaborative feedback',
      href: '/collaborative-feedback',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Collaborative Feedback System
          </CardTitle>
          <CardDescription className="text-base">
            A comprehensive platform for team-based candidate evaluation with multi-criteria ratings,
            consensus tracking, automated notifications, and detailed analytics.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {link.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <CardTitle className="text-sm">{feature.title}</CardTitle>
                <CardDescription className="text-xs">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to start using the collaborative feedback system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Configure Rating Criteria</h4>
                <p className="text-sm text-muted-foreground">
                  Set up custom rating criteria for evaluating candidates in the Rating Criteria tab
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Create Feedback Templates</h4>
                <p className="text-sm text-muted-foreground">
                  Build reusable templates for different roles and interview stages
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Request Team Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Send feedback requests to team members for candidates using templates
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Track & Analyze</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor feedback completion, view consensus metrics, and make data-driven hiring decisions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
