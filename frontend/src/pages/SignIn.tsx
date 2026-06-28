import { SignIn } from "@clerk/clerk-react";
import { BrainCircuit } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/40 mb-4">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">RecruitSense</h1>
          <p className="text-slate-400 mt-2">AI-powered hiring intelligence</p>
        </div>
        <SignIn routing="path" path="/sign-in" afterSignInUrl="/" />
      </div>
    </div>
  );
}
