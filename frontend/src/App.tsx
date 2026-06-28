import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { setTokenGetter } from "@/lib/api";

function AuthBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}
import Dashboard from "@/pages/Dashboard";
import JobDetail from "@/pages/JobDetail";
import Leaderboard from "@/pages/Leaderboard";
import CandidateProfile from "@/pages/CandidateProfile";
import Pipeline from "@/pages/Pipeline";
import Analytics from "@/pages/Analytics";
import SignInPage from "@/pages/SignIn";
import SignUpPage from "@/pages/SignUp";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <AuthBridge />
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>
        <AppLayout>{children}</AppLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/jobs/:id" element={<ProtectedLayout><JobDetail /></ProtectedLayout>} />
      <Route path="/jobs/:id/candidates" element={<ProtectedLayout><Leaderboard /></ProtectedLayout>} />
      <Route path="/candidates/:id" element={<ProtectedLayout><CandidateProfile /></ProtectedLayout>} />
      <Route path="/pipeline" element={<ProtectedLayout><Pipeline /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
