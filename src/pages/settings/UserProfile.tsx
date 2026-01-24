import { useState } from "react";
import { DashboardPageLayout } from "@/app/layouts/DashboardPageLayout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import {
  User, Mail, Phone, MapPin, Building2, Calendar,
  Bell, Lock, Palette, Globe, Shield, Camera,
  Save, KeyRound, Eye, EyeOff, Code, Copy, Check
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { isDevelopmentMode } from "@/shared/lib/rbacService";

export default function UserProfile() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCookie, setCopiedCookie] = useState<string | null>(null);
  const isDev = isDevelopmentMode();

  // Get all cookies
  const getAllCookies = (): string => {
    return document.cookie;
  };

  // Parse cookies into an object for display
  const parseCookies = (): Record<string, string> => {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });
    return cookies;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCookie(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedCookie(null), 2000);
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    });
  };

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    jobTitle: "HR Manager",
    department: "Human Resources",
    location: "San Francisco, CA",
    bio: "Experienced HR professional with 10+ years in talent management and employee development.",
    avatar: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNewCandidate: true,
    emailInterview: true,
    emailOffer: true,
    emailReview: true,
    pushNewCandidate: false,
    pushInterview: true,
    pushOffer: true,
    pushReview: false,
    weeklyDigest: true,
    monthlyReport: true,
  });

  // Security settings
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "30",
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: "system",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    density: "comfortable",
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });

    setSecurity({
      ...security,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Preferences saved",
      description: "Your appearance settings have been updated.",
    });
  };

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
            {isDev && (
              <TabsTrigger value="developer">
                <Code className="mr-2 h-4 w-4" />
                Developer Tools
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Email Notifications</CardTitle>
                <CardDescription>
                  Choose what email notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-base font-semibold flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Candidate Applications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email when new candidates apply
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNewCandidate}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailNewCandidate: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="text-base font-semibold flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Interview Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming interviews
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailInterview}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailInterview: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="text-base font-semibold flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Offer Status Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates on offer acceptances and rejections
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailOffer}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailOffer: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="text-base font-semibold flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Performance Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about review cycles and submissions
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailReview}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, emailReview: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Push Notifications</CardTitle>
                <CardDescription>
                  Manage in-app push notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-base font-semibold flex items-center justify-between">
                  <Label>Interview Reminders</Label>
                  <Switch
                    checked={notifications.pushInterview}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, pushInterview: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="text-base font-semibold flex items-center justify-between">
                  <Label>Offer Updates</Label>
                  <Switch
                    checked={notifications.pushOffer}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, pushOffer: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Digest & Reports</CardTitle>
                <CardDescription>
                  Periodic summaries and analytics reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-base font-semibold flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of the week's activities
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, weeklyDigest: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="text-base font-semibold flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Monthly Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Detailed analytics and metrics report
                    </p>
                  </div>
                  <Switch
                    checked={notifications.monthlyReport}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, monthlyReport: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={security.newPassword}
                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  />
                </div>
                <Button onClick={handleChangePassword}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-base font-semibold flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Require a verification code in addition to your password
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecurity({ ...security, twoFactorEnabled: checked })
                    }
                  />
                </div>
                {security.twoFactorEnabled && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm">
                      Two-factor authentication is enabled. You'll need to enter a code from your
                      authenticator app when signing in.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Session Management</CardTitle>
                <CardDescription>
                  Control how long you stay signed in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout</Label>
                  <Select
                    value={security.sessionTimeout}
                    onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    You'll be automatically signed out after this period of inactivity
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Theme & Display</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={appearance.theme}
                    onValueChange={(value) => setAppearance({ ...appearance, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="density">Display Density</Label>
                  <Select
                    value={appearance.density}
                    onValueChange={(value) => setAppearance({ ...appearance, density: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Localization</CardTitle>
                <CardDescription>
                  Set your language and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={appearance.language}
                    onValueChange={(value) => setAppearance({ ...appearance, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={appearance.dateFormat}
                    onValueChange={(value) => setAppearance({ ...appearance, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={appearance.timeFormat}
                    onValueChange={(value) => setAppearance({ ...appearance, timeFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveAppearance}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Developer Tools Tab - Only visible in development mode */}
          {isDev && (
            <TabsContent value="developer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Session Cookies</CardTitle>
                  <CardDescription>
                    Copy these cookies to use with curl commands for testing backend endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>All Cookies (for curl -H "Cookie: ...")</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={getAllCookies()}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(getAllCookies(), "Cookie string")}
                      >
                        {copiedCookie === "Cookie string" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Individual Session Cookies</Label>
                    {Object.entries(parseCookies()).map(([name, value]) => (
                      <div key={name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-mono">{name}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`${name}=${value}`, name)}
                          >
                            {copiedCookie === name ? (
                              <Check className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <Input
                          readOnly
                          value={value}
                          className="font-mono text-xs"
                        />
                      </div>
                    ))}
                    {Object.keys(parseCookies()).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No cookies found. Please log in first.
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                    <Label className="text-sm font-semibold">Usage Instructions</Label>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Copy the cookie string from above</li>
                      <li>Use it with the curl test script:</li>
                      <li className="ml-4 font-mono text-xs bg-background p-2 rounded">
                        cd backend && npx ts-node test-scripts/curl-test-template.ts "{getAllCookies()}"
                      </li>
                      <li>Or use it directly with curl:</li>
                      <li className="ml-4 font-mono text-xs bg-background p-2 rounded">
                        curl -H "Cookie: {getAllCookies()}" http://localhost:3000/api/auth/me
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardPageLayout>
  );
}
