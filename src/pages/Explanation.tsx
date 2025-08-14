import { useLocation, useNavigate } from "react-router-dom";
import { ExplanationOutput } from "@/components/ExplanationOutput";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

interface ExplanationState {
  explanation: string;
  topic: string;
  level: string;
}

const Explanation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ExplanationState;

  useEffect(() => {
    // If no explanation data, redirect to home
    if (!state?.explanation) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state?.explanation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="hover-lift"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground">
                Explanation Results
              </h1>
              <p className="text-sm text-muted-foreground">
                {state.topic} • Explained like you're {state.level.replace('eli', '')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <ExplanationOutput
          explanation={state.explanation}
          topic={state.topic}
          level={state.level}
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default Explanation;