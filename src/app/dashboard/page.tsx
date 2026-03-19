import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import ScoreCard from "@/components/dashboard/ScoreCard";
import BuildingPreview2D from "@/components/dashboard/BuildingPreview2D";
import NextSteps from "@/components/dashboard/NextSteps";
import TrustScoreDisplay from "@/components/dashboard/TrustScoreDisplay";
import VotingPanel from "@/components/dashboard/VotingPanel";
import CreditsDisplay from "@/components/dashboard/CreditsDisplay";
import BadgeShowcase from "@/components/dashboard/BadgeShowcase";
import MyBuildingPreview from "@/components/dashboard/MyBuildingPreview";

export const metadata = {
  title: "Dashboard | Atlas City",
  description: "Citizen technical score and reputation dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

const getTrustData = async (userId: string) => {
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/reputation/trust/${userId}`, {
    cache: 'no-store'
  });
  if (!res.ok) return { trustScore: 0.5, status: "Neutral" };
  return res.json();
};

const getScoreData = async (userId: string) => {
  // Use absolute URL for server-side fetch or direct lib call if possible.
  // For simplicity and to reuse the API logic:
  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/score/${userId}`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Use the name or email as the user_id for the mock API
  const userId = session.user.email || session.user.name || "unknown";
  const [scoreData, trustData] = await Promise.all([
    getScoreData(userId),
    getTrustData(userId)
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-black">
      {/* Header / Nav Area */}
      <nav className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
            <span className="text-xl font-bold tracking-tighter">ATLAS CITY</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold">{session.user.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Verified Citizen</p>
            </div>
            {session.user.image && (
              <img src={session.user.image} alt="User avatar" className="w-10 h-10 rounded-full border border-slate-800" />
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">{session.user.name}</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
            Your technical influence is the heartbeat of the city. Level up your residence by contributing to the ecosystem.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Score & Progress */}
          <div className="lg:col-span-8 space-y-8">
            {scoreData ? (
              <ScoreCard 
                score={scoreData.score} 
                breakdown={scoreData.breakdown} 
                calculatedAt={scoreData.calculatedAt}
                onRefresh={() => {}} // Client-side logic handled by component or page refresh
              />
            ) : (
              <div className="p-8 bg-red-900/10 border border-red-900/20 rounded-2xl">
                 <p className="text-red-400 font-medium">Unable to load technical data. Please check your GitHub connection.</p>
              </div>
            )}
            
            <MyBuildingPreview />
            <CreditsDisplay />
            <BadgeShowcase />
            <VotingPanel />
            <NextSteps />
          </div>

          {/* Right: City Representation */}
          <div className="lg:col-span-4 space-y-8">
            <TrustScoreDisplay trustScore={trustData.trustScore} status={trustData.status} />
            <BuildingPreview2D score={scoreData?.score || 0} />
            
            <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-blue-900/30 rounded-2xl p-6">
               <h4 className="text-blue-400 font-bold mb-2 uppercase tracking-tighter text-xs">District Status</h4>
               <p className="text-slate-300 text-sm leading-snug font-medium">
                 Your building is currently in the <strong className="text-white">Central Development Zone</strong>. Reach 5,000 DIS to unlock the Upper Tier Skyline.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-900 py-12 px-6 bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-xs tracking-widest uppercase">© 2026 ATLAS CITY PROTOCOL — ALL RIGHTS RESERVED</p>
          <div className="flex gap-8 text-slate-500 text-xs">
             <a href="#" className="hover:text-blue-400 transition-colors">Security</a>
             <a href="#" className="hover:text-blue-400 transition-colors">Protocol</a>
             <a href="#" className="hover:text-blue-400 transition-colors">Citizenship</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
