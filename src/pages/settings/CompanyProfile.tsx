import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/app/layouts/DashboardPageLayout';
import { AtsPageHeader } from '@/app/layouts/AtsPageHeader';
import { useCompanyProfile } from '@/shared/hooks/useCompanyProfile';
import { useAuth } from '@/app/providers/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Button } from '@/shared/components/ui/button';
import { Loader2, Building2, MapPin, User, Users, CreditCard, Palette, CheckCircle2, Circle, Edit, Phone, Globe, X, Save } from 'lucide-react';
import {
  CompanyProfileSectionKey,
  COMPANY_PROFILE_SECTION_ENUM,
  CompanyProfileBasicDetails,
  CompanyProfileLocation,
} from '@/shared/types/companyProfile';
import { cn } from '@/shared/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Separator } from '@/shared/components/ui/separator';
import { FormMultiSelect } from '@/shared/components/common/form-fields';
import { PhoneCountrySelect } from '@/shared/components/common/PhoneCountrySelect';
import { LocationSelect } from '@/shared/components/common/LocationSelect';
import { useToast } from '@/shared/hooks/use-toast';
// TODO: Dev tools - enable when needed
// import { DeveloperTools } from '@/components/dev/DeveloperTools';

const enumToKeyMap = Object.entries(COMPANY_PROFILE_SECTION_ENUM).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [value]: key as CompanyProfileSectionKey,
  }),
  {} as Record<string, CompanyProfileSectionKey>
);

const sectionConfig = [
  {
    key: 'basicDetails' as CompanyProfileSectionKey,
    title: 'Basic Details',
    description: 'Company name, size, industry, and contact information',
    icon: Building2,
  },
  {
    key: 'primaryLocation' as CompanyProfileSectionKey,
    title: 'Locations',
    description: 'Primary and additional office locations',
    icon: MapPin,
  },
  {
    key: 'personalProfile' as CompanyProfileSectionKey,
    title: 'Personal Profile',
    description: 'Your position and contact details',
    icon: User,
  },
  {
    key: 'teamMembers' as CompanyProfileSectionKey,
    title: 'Team Members',
    description: 'Invited team members and collaborators',
    icon: Users,
  },
  {
    key: 'billing' as CompanyProfileSectionKey,
    title: 'Billing',
    description: 'Payment preferences and billing information',
    icon: CreditCard,
  },
  {
    key: 'branding' as CompanyProfileSectionKey,
    title: 'Branding',
    description: 'Company branding and careers page settings',
    icon: Palette,
  },
];

const companySizeOptions = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1,000',
  '1,001-5,000',
  '5,001-10,000',
  '10,001+',
];

const industrySuggestions = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Hospitality',
];

const defaultLocation = (): CompanyProfileLocation => ({
  
  name: '',
  streetAddress: '',
  city: '',
  stateOrRegion: '',
  postalCode: '',
  country: '',
  isPrimary: false,
});

export default function CompanyProfile() {
  const { data, isLoading, savingSection, saveSection, refresh } = useCompanyProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CompanyProfileSectionKey>('basicDetails');
  const [editingSection, setEditingSection] = useState<CompanyProfileSectionKey | null>(null);

  const profile = data?.profile;
  const profileData = profile?.profileData || {};

  const completedSectionKeys = new Set(
    profile?.completedSections
      ?.map((section) => enumToKeyMap[section])
      .filter(Boolean) as CompanyProfileSectionKey[] || []
  );

  const actualCompletionPercentage = Math.round((completedSectionKeys.size / sectionConfig.length) * 100);

  const handleEdit = (section: CompanyProfileSectionKey) => {
    setEditingSection(section);
    setActiveTab(section);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSave = async (section: CompanyProfileSectionKey, payload: any) => {
    try {
      await saveSection(section, payload);
      setEditingSection(null);
      await refresh();
      toast({
        title: 'Profile updated',
        description: 'Your company profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: error instanceof Error ? error.message : 'An error occurred while saving.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && !profile) {
    return (
      <DashboardPageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardPageLayout>
    );
  }

  const basicDetails = profileData.basicDetails || {};
  const primaryLocation = profileData.primaryLocation || {};
  const additionalLocations = profileData.additionalLocations || [];
  const personalProfile = profileData.personalProfile || {};
  const teamMembers = profileData.teamMembers || { invites: [] };
  const billing = profileData.billing || {};
  const branding = profileData.branding || {};

  return (
    <DashboardPageLayout>
      <div className="p-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <AtsPageHeader
            title="Company Profile"
            subtitle="View and manage your company information and onboarding details"
          />

          {/* Progress Card */}
          <Card>
            <CardHeader>
              <div className="text-base font-semibold flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Profile Completion</CardTitle>
                  <CardDescription className="text-sm">
                    Complete all required sections to unlock full features
                  </CardDescription>
                </div>
                <Badge variant={profile?.status === 'COMPLETED' ? 'default' : 'secondary'}>
                  {profile?.status === 'COMPLETED' ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedSectionKeys.size} of {sectionConfig.length} sections completed
                  </span>
                  <span className="font-medium">{actualCompletionPercentage}%</span>
                </div>
                <Progress value={actualCompletionPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CompanyProfileSectionKey)}>
            <div className="overflow-x-auto -mx-1 px-1">
              <TabsList className="inline-flex w-auto gap-1 rounded-full border bg-muted/40 px-1 py-1 shadow-sm">
              {sectionConfig.map((section) => {
                const isComplete = completedSectionKeys.has(section.key);
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={section.key}
                    value={section.key}
                      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      {isComplete ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span>{section.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            </div>

            {/* Basic Details Tab */}
            <TabsContent value="basicDetails" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Basic Company Details</CardTitle>
                      <CardDescription className="text-sm">
                        {sectionConfig.find((s) => s.key === 'basicDetails')?.description}
                      </CardDescription>
                    </div>
                    {editingSection !== 'basicDetails' ? (
                      <Button variant="outline" size="sm" onClick={() => handleEdit('basicDetails')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection === 'basicDetails' ? (
                    <BasicDetailsForm
                      initialData={basicDetails}
                      registeredCompanyName={user?.companyName}
                      registeredCompanyWebsite={user?.companyWebsite}
                      onSave={(data) => handleSave('basicDetails', data)}
                      onCancel={handleCancelEdit}
                      isSaving={savingSection === 'basicDetails'}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                          <p className="text-base mt-1">{basicDetails.companyName || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Company Size</Label>
                          <p className="text-base mt-1">{basicDetails.companySize || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Industries</Label>
                          <p className="text-base mt-1">
                            {basicDetails.industries?.length ? basicDetails.industries.join(', ') : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                          <p className="text-base mt-1 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {basicDetails.phone?.countryCode && basicDetails.phone?.number
                              ? `${basicDetails.phone.countryCode} ${basicDetails.phone.number}`
                              : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                          <p className="text-base mt-1 flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {basicDetails.websiteUrl || user?.companyWebsite || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Year Founded</Label>
                          <p className="text-base mt-1">{basicDetails.yearFounded || 'Not set'}</p>
                        </div>
                      </div>
                      {basicDetails.overview && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Overview</Label>
                          <p className="text-base mt-1">{basicDetails.overview}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Primary Location Tab */}
            <TabsContent value="primaryLocation" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Locations</CardTitle>
                      <CardDescription className="text-sm">
                        {sectionConfig.find((s) => s.key === 'primaryLocation')?.description}
                      </CardDescription>
                    </div>
                    {editingSection !== 'primaryLocation' ? (
                      <Button variant="outline" size="sm" onClick={() => handleEdit('primaryLocation')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection === 'primaryLocation' ? (
                    <LocationForm
                      initialData={{ primary: primaryLocation, additional: additionalLocations }}
                      onSave={(data) => handleSave('primaryLocation', data)}
                      onCancel={handleCancelEdit}
                      isSaving={savingSection === 'primaryLocation'}
                    />
                  ) : (
                    <div className="space-y-4">
                      {primaryLocation.name ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Location Name</Label>
                            <p className="text-base mt-1">{primaryLocation.name}</p>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Street Address</Label>
                              <p className="text-base mt-1">{primaryLocation.streetAddress}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">City</Label>
                              <p className="text-base mt-1">{primaryLocation.city}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">State/Region</Label>
                              <p className="text-base mt-1">{primaryLocation.stateOrRegion}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                              <p className="text-base mt-1">{primaryLocation.postalCode}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                              <p className="text-base mt-1">{primaryLocation.country}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No location information set</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Profile Tab */}
            <TabsContent value="personalProfile" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Personal Profile</CardTitle>
                      <CardDescription className="text-sm">
                        {sectionConfig.find((s) => s.key === 'personalProfile')?.description}
                      </CardDescription>
                    </div>
                    {editingSection !== 'personalProfile' ? (
                      <Button variant="outline" size="sm" onClick={() => handleEdit('personalProfile')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection === 'personalProfile' ? (
                    <PersonalProfileForm
                      initialData={personalProfile}
                      onSave={(data) => handleSave('personalProfile', data)}
                      onCancel={handleCancelEdit}
                      isSaving={savingSection === 'personalProfile'}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Position Title</Label>
                        <p className="text-base mt-1">{personalProfile.positionTitle || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p className="text-base mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {personalProfile.phone?.countryCode && personalProfile.phone?.number
                            ? `${personalProfile.phone.countryCode} ${personalProfile.phone.number}`
                            : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                        <p className="text-base mt-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {personalProfile.location || 'Not set'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Members Tab */}
            <TabsContent value="teamMembers" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Team Members</CardTitle>
                      <CardDescription className="text-sm">
                        {sectionConfig.find((s) => s.key === 'teamMembers')?.description}
                      </CardDescription>
                    </div>
                    {editingSection !== 'teamMembers' ? (
                      <Button variant="outline" size="sm" onClick={() => handleEdit('teamMembers')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection === 'teamMembers' ? (
                    <TeamMembersForm
                      initialData={teamMembers}
                      onSave={(data) => handleSave('teamMembers', data)}
                      onCancel={handleCancelEdit}
                      isSaving={savingSection === 'teamMembers'}
                    />
                  ) : (
                    <>
                      {teamMembers.invites && teamMembers.invites.length > 0 ? (
                        <div className="space-y-3">
                          {teamMembers.invites.map((invite: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="text-base font-semibold flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{invite.email}</p>
                                    <p className="text-sm text-muted-foreground">{invite.role}</p>
                                  </div>
                                </div>
                                <Badge variant={invite.status === 'accepted' ? 'default' : 'secondary'}>
                                  {invite.status || 'pending'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No team members invited yet</p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Billing Setup</CardTitle>
                      <CardDescription className="text-sm">
                        {sectionConfig.find((s) => s.key === 'billing')?.description}
                      </CardDescription>
                    </div>
                    {editingSection !== 'billing' ? (
                      <Button variant="outline" size="sm" onClick={() => handleEdit('billing')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection === 'billing' ? (
                    <BillingForm
                      initialData={billing}
                      onSave={(data) => handleSave('billing', data)}
                      onCancel={handleCancelEdit}
                      isSaving={savingSection === 'billing'}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Payment Preference</Label>
                        <p className="text-base mt-1 capitalize">{billing.paymentPreference || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Subscription Plan</Label>
                        <p className="text-base mt-1">{billing.subscriptionPlan || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Registered Business Name</Label>
                        <p className="text-base mt-1">{billing.registeredBusinessName || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tax ID</Label>
                        <p className="text-base mt-1">{billing.taxId || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Accounts Email</Label>
                        <p className="text-base mt-1">{billing.accountsEmail || 'Not set'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="text-base font-semibold flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Branding & Careers Page</CardTitle>
                      <CardDescription className="text-sm">
                        {sectionConfig.find((s) => s.key === 'branding')?.description}
                      </CardDescription>
                    </div>
                    {editingSection !== 'branding' ? (
                      <Button variant="outline" size="sm" onClick={() => handleEdit('branding')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editingSection === 'branding' ? (
                    <BrandingForm
                      initialData={branding}
                      onSave={(data) => handleSave('branding', data)}
                      onCancel={handleCancelEdit}
                      isSaving={savingSection === 'branding'}
                    />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Careers Page Enabled</Label>
                        <p className="text-base mt-1">{branding.careersPageEnabled ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Subdomain</Label>
                        <p className="text-base mt-1">{branding.subdomain || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Brand Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {branding.brandColor && (
                            <div
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: branding.brandColor }}
                            />
                          )}
                          <p className="text-base">{branding.brandColor || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {branding.companyIntroduction && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-muted-foreground">Company Introduction</Label>
                      <p className="text-base mt-1">{branding.companyIntroduction}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Developer Tools - Only visible in development mode */}
          {/* <DeveloperTools /> */}
        </div>
      </div>
    </DashboardPageLayout>
  );
}

// Form Components
interface FormProps<T> {
  initialData?: T;
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

interface BasicDetailsFormProps extends FormProps<CompanyProfileBasicDetails> {
  registeredCompanyName?: string;
  registeredCompanyWebsite?: string;
}

function BasicDetailsForm({
  initialData,
  onSave,
  onCancel,
  isSaving,
  registeredCompanyName,
  registeredCompanyWebsite,
}: BasicDetailsFormProps) {
  const schema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    companySize: z.string().min(1, 'Company size is required'),
    industries: z.array(z.string().min(1)).min(1, 'Select at least one industry').max(3),
    phoneCountryCode: z.string().min(1, 'Country code is required'),
    phoneNumber: z.string().min(5, 'Phone number is required'),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    yearFounded: z
      .string()
      .optional()
      .refine((value) => !value || /^\d{4}$/.test(value), {
        message: 'Enter a valid year',
      }),
    overview: z.string().optional(),
    logoUrl: z.string().url().optional().or(z.literal('')),
    iconUrl: z.string().url().optional().or(z.literal('')),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: initialData?.companyName || registeredCompanyName || '',
      companySize: initialData?.companySize || '',
      industries: initialData?.industries || [],
      phoneCountryCode: initialData?.phone?.countryCode || '+1',
      phoneNumber: initialData?.phone?.number || '',
      websiteUrl: initialData?.websiteUrl || registeredCompanyWebsite || '',
      yearFounded: initialData?.yearFounded ? String(initialData.yearFounded) : '',
      overview: initialData?.overview || '',
      logoUrl: initialData?.logoUrl || '',
      iconUrl: initialData?.iconUrl || '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave({
      companyName: values.companyName,
      companySize: values.companySize,
      industries: values.industries,
      phone: {
        countryCode: values.phoneCountryCode,
        number: values.phoneNumber,
        type: 'work',
      },
      websiteUrl: values.websiteUrl || undefined,
      yearFounded: values.yearFounded ? Number(values.yearFounded) : undefined,
      overview: values.overview,
      logoUrl: values.logoUrl || undefined,
      iconUrl: values.iconUrl || undefined,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company name</FormLabel>
                <FormControl>
                  <Input placeholder="HRM8" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companySize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company size</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companySizeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormMultiSelect
          form={form}
          name="industries"
          label="Industries (select up to 3)"
          suggestions={industrySuggestions}
          required
          maxItems={3}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="phoneCountryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country code</FormLabel>
                <FormControl>
                  <PhoneCountrySelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Search country code"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Company phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company website</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearFounded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year founded</FormLabel>
                <FormControl>
                  <Input placeholder="2019" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="overview"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company overview</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Share your mission, values, and culture." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Upload or paste an image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iconUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Upload or paste an icon URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

function LocationForm({
  initialData,
  onSave,
  onCancel,
  isSaving,
}: FormProps<{ primary?: CompanyProfileLocation; additional: CompanyProfileLocation[] }>) {
  const locationSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Location name is required'),
    streetAddress: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    stateOrRegion: z.string().min(1, 'State/Region is required'),
    postalCode: z.string().min(1, 'Zip/Postcode is required'),
    country: z.string().min(1, 'Country is required'),
  });

  const schema = z.object({
    primary: locationSchema,
    additional: z.array(locationSchema).optional(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      primary: initialData?.primary || { ...defaultLocation(), isPrimary: true },
      additional: initialData?.additional || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'additional',
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" /> Primary location (required)
          </div>
          <LocationFields control={form.control} prefix="primary" />
        </div>

        <div className="space-y-4">
          <div className="text-base font-semibold flex items-center justify-between">
            <div>
              <p className="font-medium">Additional locations</p>
              <p className="text-sm text-muted-foreground">
                Add satellite offices or remote hubs (optional).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => append(defaultLocation())}
            >
              Add location
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No additional locations added.</p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium">Location #{index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
              <LocationFields control={form.control} prefix={`additional.${index}`} />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

function LocationFields({ control, prefix }: { control: any; prefix: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={control}
        name={`${prefix}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location name</FormLabel>
            <FormControl>
              <Input placeholder="Melbourne HQ" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.streetAddress`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street address</FormLabel>
            <FormControl>
              <Input placeholder="123 Collins Street" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.city`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.stateOrRegion`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>State / Region</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.postalCode`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Zip / Postcode</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.country`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function PersonalProfileForm({ initialData, onSave, onCancel, isSaving }: FormProps<any>) {
  const schema = z.object({
    positionTitle: z.string().optional(),
    phoneType: z.enum(['mobile', 'work', 'office']).default('work'),
    phoneCountryCode: z.string().optional(),
    phoneNumber: z.string().optional(),
    location: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      positionTitle: initialData?.positionTitle || '',
      phoneType: initialData?.phone?.type || 'work',
      phoneCountryCode: initialData?.phone?.countryCode || '+1',
      phoneNumber: initialData?.phone?.number || '',
      location: initialData?.location || '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave({
      positionTitle: values.positionTitle,
      phone:
        values.phoneNumber && values.phoneCountryCode
          ? {
              type: values.phoneType,
              countryCode: values.phoneCountryCode,
              number: values.phoneNumber,
            }
          : undefined,
      location: values.location,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="positionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your position title</FormLabel>
              <FormControl>
                <Input placeholder="Head of Talent Acquisition" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="phoneType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneCountryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country code</FormLabel>
                <FormControl>
                  <PhoneCountrySelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Search country code"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="(03) 5555 1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search location"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

function TeamMembersForm({ initialData, onSave, onCancel, isSaving }: FormProps<any>) {
  const schema = z.object({
    invites: z
      .array(
        z.object({
          email: z.string().email('Valid email is required'),
          role: z.string().min(1, 'Role is required'),
          authorizationLevel: z.string().optional(),
          approvalLevel: z.string().optional(),
        })
      )
      .default([]),
    defaultAdminId: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      invites: initialData?.invites || [],
      defaultAdminId: initialData?.defaultAdminId || 'none',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'invites',
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No teammates added yet. Start with your finance or recruiting partners.
            </p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Invite #{index + 1}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`invites.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work email</FormLabel>
                      <FormControl>
                        <Input placeholder="teammate@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`invites.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="User, Recruiter, Finance, Collaborator..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`invites.${index}.authorizationLevel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authorization level</FormLabel>
                      <FormControl>
                        <Input placeholder="Can approve offers, manage billing, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`invites.${index}.approvalLevel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approval level</FormLabel>
                      <FormControl>
                        <Input placeholder="Hiring approvals, expenses, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              email: '',
              role: 'User',
              authorizationLevel: '',
              approvalLevel: '',
            })
          }
        >
          Add teammate
        </Button>

        <FormField
          control={form.control}
          name="defaultAdminId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default account admin</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teammate" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No default admin selected</SelectItem>
                  {fields.map((field, index) => (
                    <SelectItem
                      key={field.id}
                      value={form.watch(`invites.${index}.email`) || field.id}
                    >
                      {form.watch(`invites.${index}.email`) || `Invite #${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

function BillingForm({ initialData, onSave, onCancel, isSaving }: FormProps<any>) {
  const schema = z.object({
    paymentPreference: z.enum(['payg', 'subscription']).default('payg'),
    subscriptionPlan: z.string().optional(),
    registeredBusinessName: z.string().optional(),
    taxId: z.string().optional(),
    registeredCountry: z.string().optional(),
    isCharity: z.boolean().optional(),
    accountsEmail: z.string().email('Enter a valid email').optional(),
    billingStreet: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingPostalCode: z.string().optional(),
    billingCountry: z.string().optional(),
    paymentMethod: z.enum(['card', 'invoice', 'bank']).optional(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentPreference: initialData?.paymentPreference || 'payg',
      subscriptionPlan: initialData?.subscriptionPlan || '',
      registeredBusinessName: initialData?.registeredBusinessName || '',
      taxId: initialData?.taxId || '',
      registeredCountry: initialData?.registeredCountry || '',
      isCharity: initialData?.isCharity || false,
      accountsEmail: initialData?.accountsEmail || '',
      billingStreet: initialData?.billingAddress?.street || '',
      billingCity: initialData?.billingAddress?.city || '',
      billingState: initialData?.billingAddress?.stateOrRegion || '',
      billingPostalCode: initialData?.billingAddress?.postalCode || '',
      billingCountry: initialData?.billingAddress?.country || '',
      paymentMethod: initialData?.paymentMethod?.type || 'invoice',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave({
      paymentPreference: values.paymentPreference,
      subscriptionPlan: values.subscriptionPlan || undefined,
      registeredBusinessName: values.registeredBusinessName,
      taxId: values.taxId,
      registeredCountry: values.registeredCountry,
      isCharity: values.isCharity,
      accountsEmail: values.accountsEmail,
      billingAddress:
        values.billingStreet ||
        values.billingCity ||
        values.billingState ||
        values.billingPostalCode ||
        values.billingCountry
          ? {
              street: values.billingStreet,
              city: values.billingCity,
              stateOrRegion: values.billingState,
              postalCode: values.billingPostalCode,
              country: values.billingCountry,
            }
          : undefined,
      paymentMethod:
        values.paymentMethod !== undefined
          ? {
              type: values.paymentMethod,
            }
          : undefined,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="paymentPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing preference</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="payg">PAYG</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subscriptionPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan (if subscription)</FormLabel>
                <FormControl>
                  <Input placeholder="Growth, Enterprise, PAYG..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="registeredBusinessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registered business name</FormLabel>
                <FormControl>
                  <Input placeholder="HRM8 Pty Ltd" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID</FormLabel>
                <FormControl>
                  <Input placeholder="ABN / GST / VAT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="registeredCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registered country</FormLabel>
                <FormControl>
                  <Input placeholder="Australia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountsEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accounts email</FormLabel>
                <FormControl>
                  <Input placeholder="accounts@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <FormField
            control={form.control}
            name="isCharity"
            render={({ field }) => (
              <>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <div>
                  <p className="font-medium">Registered Charity / NFP</p>
                  <p className="text-sm text-muted-foreground">
                    Provide supporting documentation for HRM8 admin approval.
                  </p>
                </div>
              </>
            )}
          />
        </div>

        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="billingStreet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing street</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State / Region</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingPostalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment method</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="card">Credit / Debit Card</SelectItem>
                  <SelectItem value="invoice">Invoice / PO</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

function BrandingForm({ initialData, onSave, onCancel, isSaving }: FormProps<any>) {
  const schema = z.object({
    careersPageEnabled: z.boolean().optional(),
    brandColor: z.string().optional(),
    subdomain: z.string().optional(),
    companyIntroduction: z.string().optional(),
    logoUrl: z.string().optional(),
    iconUrl: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      careersPageEnabled: initialData?.careersPageEnabled || false,
      brandColor: initialData?.brandColor || '#7c3aed',
      subdomain: initialData?.subdomain || '',
      companyIntroduction: initialData?.companyIntroduction || '',
      logoUrl: initialData?.logoUrl || '',
      iconUrl: initialData?.iconUrl || '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <FormField
            control={form.control}
            name="careersPageEnabled"
            render={({ field }) => (
              <>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <div>
                  <p className="font-medium">Build corporate careers page</p>
                  <p className="text-sm text-muted-foreground">
                    Showcase roles on a branded subdomain with curated content.
                  </p>
                </div>
              </>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="brandColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input type="color" className="h-12 w-16 p-1" value={field.value} onChange={field.onChange} />
                    <Input value={field.value} onChange={field.onChange} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subdomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Careers page subdomain</FormLabel>
                <FormControl>
                  <div className="text-base font-semibold flex items-center gap-2">
                    <Input placeholder="careers" {...field} />
                    <span className="text-sm text-muted-foreground">.hrm8.com</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyIntroduction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company introduction</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Share your mission, values, and culture." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Upload or paste an image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iconUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Upload or paste an icon URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
