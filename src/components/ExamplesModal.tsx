import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Heart, Lightbulb, Microscope, Zap } from "lucide-react";

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (topic: string) => void;
}

const examples = [
  {
    category: "Science",
    icon: Microscope,
    color: "bg-gradient-secondary",
    topics: [
      { title: "How does the internet work?", description: "The magic behind connecting the world" },
      { title: "What is quantum physics?", description: "The weird world of tiny particles" },
      { title: "How do vaccines work?", description: "Your body's superhero training program" },
      { title: "How does photosynthesis work?", description: "How plants eat sunlight for breakfast" }
    ]
  },
  {
    category: "Technology",
    icon: Zap,
    color: "bg-gradient-primary",
    topics: [
      { title: "How does AI work?", description: "Teaching computers to think like humans" },
      { title: "What is blockchain?", description: "Digital chains that can't be broken" },
      { title: "How do smartphones work?", description: "A computer that fits in your pocket" },
      { title: "What is cloud computing?", description: "Storing your stuff in the sky" }
    ]
  },
  {
    category: "Nature",
    icon: Heart,
    color: "bg-gradient-accent",
    topics: [
      { title: "Why do we dream?", description: "Your brain's nightly movie theater" },
      { title: "How do birds fly?", description: "Mastering the art of floating on air" },
      { title: "Why do leaves change color?", description: "Nature's annual fashion show" },
      { title: "How do animals hibernate?", description: "The ultimate power nap" }
    ]
  },
  {
    category: "Space",
    icon: Brain,
    color: "bg-secondary",
    topics: [
      { title: "How are stars formed?", description: "Giant space furnaces being born" },
      { title: "What is a black hole?", description: "Space's ultimate vacuum cleaner" },
      { title: "Why do planets orbit the sun?", description: "The cosmic dance that never stops" },
      { title: "How big is the universe?", description: "Measuring the unmeasurable" }
    ]
  }
];

export const ExamplesModal = ({ isOpen, onClose, onSelectExample }: ExamplesModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleTopicSelect = (topic: string) => {
    onSelectExample(topic);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            <Lightbulb className="w-6 h-6 inline mr-2 text-primary" />
            Popular Explanations
          </DialogTitle>
          <p className="text-muted-foreground text-center">
            Click any topic to get an instant explanation at your perfect level!
          </p>
        </DialogHeader>
        
        <div className="grid gap-6 mt-6">
          {examples.map((category) => {
            const IconComponent = category.icon;
            const isExpanded = selectedCategory === category.category;
            
            return (
              <Card key={category.category} className="overflow-hidden hover-lift">
                <CardHeader 
                  className={`${category.color} text-white cursor-pointer`}
                  onClick={() => setSelectedCategory(isExpanded ? null : category.category)}
                >
                  <CardTitle className="flex items-center gap-3">
                    <IconComponent className="w-6 h-6" />
                    {category.category}
                    <Badge variant="secondary" className="ml-auto">
                      {category.topics.length} topics
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                {(isExpanded || selectedCategory === null) && (
                  <CardContent className="p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {category.topics.map((topic, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="h-auto p-4 flex-col items-start text-left hover:bg-accent/50 transition-all duration-200"
                          onClick={() => handleTopicSelect(topic.title)}
                        >
                          <div className="font-semibold text-sm mb-1">{topic.title}</div>
                          <div className="text-xs text-muted-foreground">{topic.description}</div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Can't find what you're looking for? Just type your question above!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};