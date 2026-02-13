import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoProvider } from "@/contexts/DemoContext";
import { JourneyProvider } from "@/contexts/JourneyContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import CheckInPage from "./pages/CheckIn";
import TeamLeaderboard from "./pages/TeamLeaderboard";
import Barometer from "./pages/Barometer";
import Admin from "./pages/Admin";
import DemoScript from "./pages/DemoScript";
import Playbooks from "./pages/Playbooks";
import JourneyPage from "./pages/Journey";
import CatalogPage from "./pages/Catalog";
import BuilderPage from "./pages/Builder";
import ModulePlayer from "./pages/ModulePlayer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoProvider>
        <JourneyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="challenges" element={<Challenges />} />
                <Route path="checkin" element={<CheckInPage />} />
                <Route path="team" element={<TeamLeaderboard />} />
                <Route path="barometer" element={<Barometer />} />
                <Route path="playbooks" element={<Playbooks />} />
                <Route path="admin" element={<Admin />} />
                <Route path="demo" element={<DemoScript />} />
                <Route path="journey" element={<JourneyPage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="builder" element={<BuilderPage />} />
                <Route path="modules/:id" element={<ModulePlayer />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </JourneyProvider>
      </DemoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
