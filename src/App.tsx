import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoProvider } from "@/contexts/DemoContext";
import { JourneyProvider } from "@/contexts/JourneyContext";
import { PreviewProvider } from "@/contexts/PreviewContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import FitCheck from "./pages/FitCheck";
import PreviewSandbox from "./pages/PreviewSandbox";
import PreviewJourney from "./pages/PreviewJourney";
import Login from "./pages/Login";
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import CheckInPage from "./pages/CheckIn";
import TeamLeaderboard from "./pages/TeamLeaderboard";
import Barometer from "./pages/Barometer";
import Admin from "./pages/Admin";
import AdminInvites from "./pages/AdminInvites";
import DemoScript from "./pages/DemoScript";
import Playbooks from "./pages/Playbooks";
import JourneyPage from "./pages/Journey";
import CatalogPage from "./pages/Catalog";
import BuilderPage from "./pages/Builder";
import ModulePlayer from "./pages/ModulePlayer";
import OnboardingPage from "./pages/Onboarding";
import ServiceRequests from "./pages/ServiceRequests";
import Reports from "./pages/Reports";
import IgnitePage from "./pages/Ignite";
import IgniteTeam from "./pages/IgniteTeam";
import TodayPage from "./pages/Today";
import PricingPage from "./pages/Pricing";
import WorkspacePage from "./pages/Workspace";
import LeadsPage from "./pages/Leads";
import AdminTeams from "./pages/AdminTeams";
import Administration from "./pages/Administration";
import Bootstrap from "./pages/Bootstrap";
import RolloutPreview from "./pages/RolloutPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const IS_DEMO_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === 'true';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PreviewProvider>
          <DemoProvider>
            <JourneyProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/fit-check" element={<FitCheck />} />
                  <Route path="/preview/journey" element={<PreviewJourney />} />
                  <Route path="/preview/sandbox" element={<PreviewSandbox />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/rollout-preview" element={<RolloutPreview />} />
                  <Route path="/bootstrap" element={<Bootstrap />} />

                  {/* Auth routes */}
                  <Route path="/auth" element={<AuthLogin />} />
                  <Route path="/signup" element={<AuthSignup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Demo login — always available */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected app routes */}
                  <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="challenges" element={<Challenges />} />
                    <Route path="checkin" element={<CheckInPage />} />
                    <Route path="team" element={<TeamLeaderboard />} />
                    <Route path="teams" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeams /></ProtectedRoute>} />
                    <Route path="barometer" element={<Barometer />} />
                    <Route path="playbooks" element={<Playbooks />} />
                    <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
                    <Route path="admin/invites" element={<ProtectedRoute allowedRoles={['admin']}><AdminInvites /></ProtectedRoute>} />
                    <Route path="demo" element={<DemoScript />} />
                    <Route path="journey" element={<JourneyPage />} />
                    <Route path="catalog" element={<CatalogPage />} />
                    <Route path="builder" element={<BuilderPage />} />
                    <Route path="modules/:id" element={<ModulePlayer />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                    <Route path="services" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ServiceRequests /></ProtectedRoute>} />
                    <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Reports /></ProtectedRoute>} />
                    <Route path="ignite" element={<IgnitePage />} />
                    <Route path="ignite-team" element={<IgniteTeam />} />
                    <Route path="today" element={<TodayPage />} />
                    <Route path="workspace" element={<ProtectedRoute allowedRoles={['admin']}><WorkspacePage /></ProtectedRoute>} />
                    <Route path="leads" element={<ProtectedRoute allowedRoles={['admin']}><LeadsPage /></ProtectedRoute>} />
                    <Route path="administration" element={<ProtectedRoute allowedRoles={['admin']}><Administration /></ProtectedRoute>} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </JourneyProvider>
          </DemoProvider>
        </PreviewProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
