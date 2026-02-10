import { useEffect, useState, useCallback } from "react";
import { getSolutionList, getCurrentChallenge, setChallenge, fetchMarkdown } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw, FastForward, Undo2 } from "lucide-react";

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewIndex, setViewIndex] = useState(0);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSolutionList(), getCurrentChallenge()])
      .then(([list, status]) => {
        setSolutions(list);
        setCurrentStep(status.challenge);
        setViewIndex(Math.max(0, Math.min(status.challenge - 1, list.length - 1)));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (solutions.length === 0) return;
    const file = solutions[viewIndex];
    if (!file) return;
    fetchMarkdown(`/md/solutions/${file}`).then(setMarkdown);
  }, [viewIndex, solutions]);

  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < solutions.length) setViewIndex(idx);
    },
    [solutions.length]
  );

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

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-muted-foreground">Loading solutions…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solutions</h1>
          <p className="text-muted-foreground mt-1">
            Solution {viewIndex + 1} of {solutions.length}
          </p>
        </div>
        <Badge variant="secondary">Coach View</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => goTo(viewIndex - 1)} disabled={viewIndex <= 0}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => goTo(Math.min(currentStep - 1, solutions.length - 1))}>
            Current
          </Button>
          <Button variant="outline" size="sm" onClick={() => goTo(viewIndex + 1)} disabled={viewIndex >= solutions.length - 1}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

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
      </div>

      <Card>
        <CardContent className="prose prose-neutral dark:prose-invert max-w-none py-8">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ node, src, alt, ...props }) => {
                // Transform relative image paths to absolute API paths
                const imageSrc = src?.startsWith('media/') 
                  ? `/md/solutions/${src}` 
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
