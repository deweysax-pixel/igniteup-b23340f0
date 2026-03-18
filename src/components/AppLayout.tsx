import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { usePreview } from '@/contexts/PreviewContext';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/AppSidebar';
import { PreviewBanner } from '@/components/PreviewBanner';
import { PreviewGate } from '@/components/PreviewGate';
import { CommandCenter } from '@/components/CommandCenter';
import { SearchJump } from '@/components/SearchJump';
import { DemoPerspectiveSwitcher } from '@/components/DemoPerspectiveSwitcher';
import { SparkAssistant } from '@/components/SparkAssistant';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

const PREVIEW_ALLOWED_PATHS = ['/app', '/app/journey', '/app/catalog', '/app/playbooks', '/app/challenges', '/app/checkin', '/app/barometer', '/app/onboarding'];

export default function AppLayout() {
  const { currentUser, isDemoSession } = useDemo();
  const { isPreviewMode, setPreviewMode } = usePreview();
  const { user: authUser, profile, role: authRole } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('mode') === 'preview') {
      setPreviewMode(true);
    }
  }, [searchParams, setPreviewMode]);

  const isGated = isPreviewMode && !PREVIEW_ALLOWED_PATHS.includes(location.pathname) && !location.pathname.startsWith('/app/modules/');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <PreviewBanner />
          <header className="h-14 border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <SearchJump />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8 text-xs"
                onClick={() => setCommandOpen(true)}
              >
                <Zap className="h-3.5 w-3.5 text-primary" />
                Do now
              </Button>
              {isDemoSession && currentUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{currentUser.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {currentUser.level} · {currentUser.xp} XP
                  </Badge>
                </div>
              ) : authUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {profile?.full_name || authUser.email}
                  </span>
                  {authRole && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {authRole}
                    </Badge>
                  )}
                </div>
              ) : currentUser ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{currentUser.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {currentUser.level} · {currentUser.xp} XP
                  </Badge>
                </div>
              ) : null}
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {isGated ? <PreviewGate /> : <Outlet />}
          </main>
        </div>
      </div>
      <CommandCenter open={commandOpen} onOpenChange={setCommandOpen} />
      <DemoPerspectiveSwitcher />
      <SparkAssistant />
    </SidebarProvider>
  );
}
