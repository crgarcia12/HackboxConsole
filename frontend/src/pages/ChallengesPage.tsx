import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChallengeList,
  getCurrentChallenge,
  setChallenge,
  fetchMarkdown,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RotateCcw,
  FastForward,
  Undo2,
} from "lucide-react";

export default function ChallengesPage() {
  const { role } = useAuth();
  const [challenges, setChallenges] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewIndex, setViewIndex] = useState(0);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    Promise.all([getChallengeList(), getCurrentChallenge()])
      .then(([list, status]) => {
        setChallenges(list);
        setCurrentStep(status.challenge);
        const idx = Math.min(status.challenge - 1, list.length - 1);
        setViewIndex(Math.max(0, idx));
      })
      .finally(() => setLoading(false));
  }, []);

  // Load markdown when viewIndex changes
  useEffect(() => {
    if (challenges.length === 0) return;
    const file = challenges[viewIndex];
    if (!file) return;
    fetchMarkdown(`/md/challenges/${file}`).then(setMarkdown);
  }, [viewIndex, challenges]);

  // Poll for challenge updates
  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentChallenge().then((s) => setCurrentStep(s.challenge)).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < challenges.length && idx < currentStep) {
        setViewIndex(idx);
      }
    },
    [challenges.length, currentStep]
  );

  const goToCurrent = () => goTo(Math.min(currentStep - 1, challenges.length - 1));
  const goPrev = () => goTo(viewIndex - 1);
  const goNext = () => goTo(viewIndex + 1);

  // Coach actions
  const approve = async () => {
    const res = await setChallenge("increase");
    setCurrentStep(res.challenge);
  };
  const approveAll = async () => {
    const res = await setChallenge("last");
    setCurrentStep(res.challenge);
  };
  const revert = async () => {
    const res = await setChallenge("decrease");
    setCurrentStep(res.challenge);
  };
  const resetAll = async () => {
    const res = await setChallenge("first");
    setCurrentStep(res.challenge);
    setViewIndex(0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case "c": goToCurrent(); break;
        case "p":
        case "arrowleft": goPrev(); break;
        case "n":
        case "arrowright": goNext(); break;
        case "a": if (role === "coach") approve(); break;
        case "r": if (role === "coach") revert(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-muted-foreground">Loading challenges…</div>;
  }

  const total = challenges.length;
  const completed = Math.min(currentStep - 1, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground mt-1">
            Challenge {viewIndex + 1} of {total}
          </p>
        </div>
        <Badge variant={viewIndex < completed ? "success" : viewIndex === completed && currentStep <= total ? "warning" : "secondary"}>
          {viewIndex < completed ? "Completed" : viewIndex === completed && currentStep <= total ? "Current" : "Locked"}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{completed}/{total}</span>
        </div>
        <Progress value={completed} max={total} />
      </div>

      {/* Navigation Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={goPrev} disabled={viewIndex <= 0}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={goToCurrent}>
            Current
          </Button>
          <Button variant="outline" size="sm" onClick={goNext} disabled={viewIndex >= currentStep - 1 || viewIndex >= total - 1}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {role === "coach" && (
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="success" size="sm" onClick={approve}>
              <CheckCircle className="h-4 w-4" /> Approve
            </Button>
            <Button variant="warning" size="sm" onClick={approveAll}>
              <FastForward className="h-4 w-4" /> Approve All
            </Button>
            <Button variant="warning" size="sm" onClick={revert}>
              <Undo2 className="h-4 w-4" /> Revert
            </Button>
            <Button variant="destructive" size="sm" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        )}
      </div>

      {/* Markdown Content */}
      <Card>
        <CardContent className="prose prose-neutral dark:prose-invert max-w-none py-8">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ node, src, alt, ...props }) => {
                // Transform relative image paths to absolute API paths
                const imageSrc = src?.startsWith('media/') 
                  ? `/md/challenges/${src}` 
                  : src;
                return <img src={imageSrc} alt={alt} {...props} />;
              }
            }}
          >
            {markdown}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
