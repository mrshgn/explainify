import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Fact {
  title: string;
  content: string;
  category: string;
  emoji: string;
}

export const DailyFactCard = () => {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadFacts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-facts');
      
      if (error) throw error;
      
      setFacts(data.facts);
      setCurrentFactIndex(0);
    } catch (error) {
      console.error('Error loading facts:', error);
      toast({
        title: "Couldn't load new facts",
        description: "Using cached facts instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacts();
  }, []);

  const currentFact = facts[currentFactIndex];

  const nextFact = () => {
    setCurrentFactIndex((prev) => (prev + 1) % facts.length);
  };

  const prevFact = () => {
    setCurrentFactIndex((prev) => (prev - 1 + facts.length) % facts.length);
  };

  if (!currentFact) {
    return (
      <Card className="max-w-2xl mx-auto shadow-elevated">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading amazing facts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-elevated hover-lift transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentFact.emoji}</span>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                {currentFact.title}
              </CardTitle>
              <Badge variant="secondary" className="mt-1">
                {currentFact.category}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadFacts}
            disabled={isLoading}
            className="hover-lift"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-foreground leading-relaxed mb-6">
          {currentFact.content}
        </p>
        
        {facts.length > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevFact}
              className="hover-lift"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {facts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentFactIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextFact}
              className="hover-lift"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};