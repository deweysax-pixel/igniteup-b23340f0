import { Outlet, useLocation } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { getLevelColor } from '@/types/demo';

export default function AppLayout() {
  const { currentUser } = useDemo();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center justify-between px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            {currentUser && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{currentUser.name}</span>
                <Badge variant="outline" className={`${getLevelColor(currentUser.level)} border-current text-xs`}>
                  {currentUser.level} · {currentUser.xp} XP
                </Badge>
              </div>
            )}
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
