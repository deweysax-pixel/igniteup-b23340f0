import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  ClipboardCheck,
  Users,
  BarChart3,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useDemo } from '@/contexts/DemoContext';
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

const navItems = [
  { title: 'Tableau de bord', url: '/app', icon: LayoutDashboard },
  { title: 'Défis', url: '/app/challenges', icon: Target },
  { title: 'Mon check-in', url: '/app/checkin', icon: ClipboardCheck, roles: ['manager', 'participant'] as const },
  { title: 'Classement', url: '/app/team', icon: Users },
  { title: 'Baromètre ROI', url: '/app/barometer', icon: BarChart3 },
  { title: 'Administration', url: '/app/admin', icon: Shield, roles: ['admin'] as const },
];

export function AppSidebar() {
  const { state, resetDemo } = useDemo();
  const location = useLocation();

  const visibleItems = navItems.filter(
    item => !item.roles || (item.roles as readonly string[]).includes(state.currentRole)
  );

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-primary">Ignite</span>
          <span className="text-muted-foreground">+</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 capitalize">
          Rôle : {state.currentRole}
        </p>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={resetDemo}
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser la démo
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
