import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentChallenge, getChallengeList } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Trophy, Rocket, Lightbulb, Keyboard, Terminal } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, username, role } = useAuth();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !role || role === "techlead") return;
    Promise.all([getCurrentChallenge(), getChallengeList()]).then(
      ([status, list]) => {
        const current = status.challenge - 1; // 1-based to 0-based
        setTotal(list.length);
        setProgress(current);
        if (current >= list.length) setAllDone(true);
      }
    ).catch(() => {});
  }, [isAuthenticated, role]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <Terminal className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Welcome to MicroHacks</h1>
        <p className="text-muted-foreground text-lg">Sign in to start your hackathon journey.</p>
        <Button size="lg" onClick={() => navigate("/login")}>
          Login to Start
        </Button>
      </div>
    );
  }

  if (role === "techlead") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Tech Lead 👋</h1>
        <p className="text-muted-foreground">
          As a Tech Lead, you can manage tenants, challenges, and stopwatches.
        </p>
        <Button onClick={() => navigate("/techlead")}>Open Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, {username} 👋</h1>
      <p className="text-muted-foreground">Dive into challenges and track your progress.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Get Started */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <CardTitle>Get Started</CardTitle>
            </div>
            <CardDescription>Open the Challenges section to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/challenges">
              <Button className="w-full">Start Now</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <CardTitle>Track Progress</CardTitle>
            </div>
            <CardDescription>
              {progress} of {total} challenges completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} max={total} />
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Shortcut keys="C" description="Go to current challenge" />
            <Shortcut keys="P / ←" description="Previous challenge" />
            <Shortcut keys="N / →" description="Next challenge" />
            {role === "coach" && (
              <>
                <Shortcut keys="A" description="Approve current challenge" />
                <Shortcut keys="R" description="Revert approval" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {allDone && (
        <Card className="border-success bg-success/5">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">
              🎉 Congratulations! All challenges completed!
            </h2>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Shortcut({ keys, description }: { keys: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-2 py-0.5 font-mono text-xs">
        <Keyboard className="h-3 w-3" /> {keys}
      </kbd>
      <span className="text-muted-foreground">{description}</span>
    </div>
  );
}
