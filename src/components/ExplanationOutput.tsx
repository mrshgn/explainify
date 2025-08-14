import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, List, Play, Share, Save, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExplanationOutputProps {
  explanation?: string;
  topic?: string;
  level?: string;
  isLoading?: boolean;
}

const formatModes = [
  { id: "text", label: "Plain Text", icon: BookOpen },
  { id: "bullets", label: "Bullet Points", icon: List },
  { id: "story", label: "Story Mode", icon: Play },
];

export const ExplanationOutput = ({ explanation, topic, level, isLoading }: ExplanationOutputProps) => {
  const [currentMode, setCurrentMode] = useState("text");
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const levelLabels = {
    eli5: "Like I'm 5",
    eli12: "Like I'm 12", 
    eli18: "Like I'm 18"
  };

  const handleQuizToggle = async () => {
    if (!showQuiz && !quizData) {
      setIsLoadingQuiz(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-quiz', {
          body: { topic, level }
        });
        
        if (error) throw error;
        
        setQuizData(data);
        setShowQuiz(true);
        setSelectedAnswers([]);
        setShowResults(false);
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast({
          title: "Couldn't load quiz",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingQuiz(false);
      }
    } else {
      setShowQuiz(!showQuiz);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleShowResults = () => {
    setShowResults(true);
    const correctCount = selectedAnswers.filter((answer, index) => answer === quizData.questions[index].correct).length;
    const total = quizData.questions.length;
    
    toast({
      title: `Quiz Results: ${correctCount}/${total}`,
      description: correctCount === total ? "Perfect score! 🎉" : correctCount > total/2 ? "Great job! 👍" : "Keep learning! 📚",
    });
  };

  const formatExplanation = (text: string, mode: string) => {
    switch (mode) {
      case "bullets":
        return text.split('.').filter(s => s.trim()).map((sentence, i) => (
          <li key={i} className="mb-2">{sentence.trim()}.</li>
        ));
      case "story":
        return `Once upon a time, there was someone curious about ${topic}. ${text.replace(/\./g, '... and then')}. And that's the wonderful story of ${topic}!`;
      default:
        return text;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto shadow-elevated animate-pulse-soft">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-lg font-medium">Crafting your explanation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!explanation) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">
                {topic}
              </CardTitle>
              {level && (
                <Badge variant="secondary" className="mt-2">
                  {levelLabels[level as keyof typeof levelLabels]}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hover-lift"
                onClick={() => {
                  navigator.share?.({
                    title: `${topic} - Explained Like I'm ${level.replace('eli', '')}`,
                    text: explanation,
                    url: window.location.href
                  }) || navigator.clipboard.writeText(explanation).then(() => {
                    toast({
                      title: "Copied to clipboard!",
                      description: "Explanation copied successfully.",
                    });
                  });
                }}
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover-lift"
                onClick={() => {
                  const blob = new Blob([`${topic}\n\n${explanation}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_explanation.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast({
                    title: "Downloaded!",
                    description: "Explanation saved as text file.",
                  });
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              {formatModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Button
                    key={mode.id}
                    variant={currentMode === mode.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentMode(mode.id)}
                    className="hover-lift"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {mode.label}
                  </Button>
                );
              })}
            </div>
            
            <div className="prose prose-sm max-w-none">
              {currentMode === "bullets" ? (
                <ul className="space-y-2 text-foreground leading-relaxed">
                  {formatExplanation(explanation, currentMode)}
                </ul>
              ) : (
                <p className="text-foreground leading-relaxed">
                  {formatExplanation(explanation, currentMode)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={handleQuizToggle}
              className="bg-gradient-secondary hover:opacity-90"
              disabled={isLoadingQuiz}
            >
              <Brain className="w-4 h-4 mr-2" />
              {isLoadingQuiz ? "Loading Quiz..." : showQuiz ? "Hide Quiz" : "Test Your Knowledge"}
            </Button>
          </div>
          
          {showQuiz && quizData && (
            <div className="mt-6 p-6 bg-muted/50 rounded-2xl">
              <h4 className="font-semibold text-foreground mb-4">Quick Quiz! 🧠</h4>
              <div className="space-y-6">
                {quizData.questions.map((question: any, qIndex: number) => (
                  <div key={qIndex} className="space-y-3">
                    <p className="text-sm text-foreground font-medium">
                      {qIndex + 1}. {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option: string, oIndex: number) => (
                        <Button
                          key={oIndex}
                          variant={selectedAnswers[qIndex] === oIndex ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => handleAnswerSelect(qIndex, oIndex)}
                          disabled={showResults}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    {showResults && (
                      <div className={`p-3 rounded-lg ${selectedAnswers[qIndex] === question.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <p className="text-sm font-medium">
                          {selectedAnswers[qIndex] === question.correct ? '✅ Correct!' : '❌ Incorrect'}
                        </p>
                        <p className="text-sm mt-1">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {selectedAnswers.length === quizData.questions.length && !showResults && (
                  <div className="flex justify-center">
                    <Button onClick={handleShowResults} className="bg-gradient-primary hover:opacity-90">
                      Show Results
                    </Button>
                  </div>
                )}
                
                {showResults && (
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-lg font-semibold text-foreground">
                      You got {selectedAnswers.filter((answer, index) => answer === quizData.questions[index].correct).length} out of {quizData.questions.length} correct! 🎉
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};