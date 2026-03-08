import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  ClipboardCheck,
  Users,
  BarChart3,
  BookOpen,
  Shield,
  Play,
  RotateCcw,
  Map as MapIcon,
  Library,
  Hammer,
  HeadphonesIcon,
  FileBarChart,
  Flame,
  Sun,
  Building2,
  Contact,
  LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useDemo } from '@/contexts/DemoContext';
import { usePreview } from '@/contexts/PreviewContext';
import { useAuth } from '@/hooks/useAuth';
import igniteupLogo from '@/assets/igniteup-logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

type NavItem = { title: string; url: string; icon: React.ElementType; roles?: readonly string[] };

const todayItem: NavItem = { title: 'Today', url: '/app/today', icon: Sun };

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Journey',
    items: [
      todayItem,
      { title: 'My Journey', url: '/app/journey', icon: MapIcon },
      { title: 'Catalog', url: '/app/catalog', icon: Library },
      { title: 'Build Journey', url: '/app/builder', icon: Hammer },
    ],
  },
  {
    label: 'Practice',
    items: [
      { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
      { title: 'Challenges', url: '/app/challenges', icon: Target },
      { title: 'My Check-in', url: '/app/checkin', icon: ClipboardCheck, roles: ['manager', 'participant'] },
      { title: 'Team', url: '/app/team', icon: Users },
    ],
  },
  {
    label: 'Library',
    items: [
      { title: 'Playbooks', url: '/app/playbooks', icon: BookOpen },
    ],
  },
  {
    label: 'Measure',
    items: [
      { title: 'ROI Barometer', url: '/app/barometer', icon: BarChart3 },
      { title: 'Ignite', url: '/app/ignite', icon: Flame },
      { title: 'Team Ignite', url: '/app/ignite-team', icon: Flame, roles: ['admin', 'manager'] },
      { title: 'Reports', url: '/app/reports', icon: FileBarChart, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Support',
    items: [
      { title: 'Service Requests', url: '/app/services', icon: HeadphonesIcon, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { title: 'Admin', url: '/app/admin', icon: Shield, roles: ['admin'] },
      { title: 'Demo Script', url: '/app/demo', icon: Play, roles: ['admin'] },
    ],
  },
];

const adminSections: { label: string; items: NavItem[] }[] = [
  {
    label: '',
    items: [todayItem],
  },
  {
    label: 'Pilot',
    items: [
      { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
      { title: 'Ignite Heatmap', url: '/app/ignite-team', icon: Flame },
      { title: 'Reports', url: '/app/reports', icon: FileBarChart },
      { title: 'Leads', url: '/app/leads', icon: Contact, roles: ['admin'] },
    ],
  },
  {
    label: 'Drive',
    items: [
      { title: 'Playbooks', url: '/app/playbooks', icon: BookOpen },
      { title: 'Challenges', url: '/app/challenges', icon: Target },
      { title: 'Team', url: '/app/team', icon: Users },
    ],
  },
  {
    label: 'Support',
    items: [
      { title: 'Service Requests', url: '/app/services', icon: HeadphonesIcon, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { title: 'Workspace', url: '/app/workspace', icon: Building2, roles: ['admin'] },
      { title: 'Admin', url: '/app/admin', icon: Shield, roles: ['admin'] },
      { title: 'Demo Script', url: '/app/demo', icon: Play, roles: ['admin'] },
    ],
  },
];

const managerSections: { label: string; items: NavItem[] }[] = [
  {
    label: '',
    items: [todayItem],
  },
  {
    label: 'Pilot',
    items: [
      { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
      { title: 'Ignite Heatmap', url: '/app/ignite-team', icon: Flame },
      { title: 'Reports', url: '/app/reports', icon: FileBarChart },
    ],
  },
  {
    label: 'Drive',
    items: [
      { title: 'Playbooks', url: '/app/playbooks', icon: BookOpen },
      { title: 'Challenges', url: '/app/challenges', icon: Target },
      { title: 'Team', url: '/app/team', icon: Users },
    ],
  },
  {
    label: 'Me',
    items: [
      { title: 'My Journey', url: '/app/journey', icon: MapIcon },
      { title: 'My Check-in', url: '/app/checkin', icon: ClipboardCheck },
      { title: 'Ignite (Personal)', url: '/app/ignite', icon: Flame },
      { title: 'Catalog', url: '/app/catalog', icon: Library },
    ],
  },
  {
    label: 'Support',
    items: [
      { title: 'Service Requests', url: '/app/services', icon: HeadphonesIcon, roles: ['admin', 'manager'] },
    ],
  },
];

const PREVIEW_ALLOWED_URLS = ['/app/today', '/app/journey', '/app/catalog', '/app/playbooks', '/app/challenges', '/app/checkin', '/app/barometer', '/app/ignite', '/app'];

export function AppSidebar() {
  const { state, resetDemo } = useDemo();
  const { isPreviewMode } = usePreview();
  const { user, role: authRole, profile, signOut } = useAuth();
  const location = useLocation();

  const isAuthenticated = !!user;
  const displayRole = isAuthenticated ? (authRole ?? 'user') : state.currentRole;
  const isAdminRole = displayRole === 'admin';
  const isManagerRole = displayRole === 'manager';
  const isLeaderRole = isAdminRole || isManagerRole;

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <a href="/"><img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain cursor-pointer" /></a>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          Role: {displayRole}
        </p>
      </div>

      <SidebarContent>
        {(isAdminRole ? adminSections : isManagerRole ? managerSections : sections).map(section => {
          let visibleItems = section.items.filter(
            item => !item.roles || (item.roles as readonly string[]).includes(displayRole)
          );
          if (isPreviewMode) {
            visibleItems = visibleItems.filter(item => PREVIEW_ALLOWED_URLS.includes(item.url));
          }
          if (visibleItems.length === 0) return null;
          return (
            <SidebarGroup key={section.label || '_top'}>
              {section.label && (
                <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
                  {section.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map(item => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === '/app'}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                          activeClassName="bg-sidebar-accent text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={async () => {
              await signOut();
              window.location.href = '/auth';
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={resetDemo}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Demo
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
