import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { LevelSelector } from "@/components/LevelSelector";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DailyFactCard } from "@/components/DailyFactCard";
import { ExamplesModal } from "@/components/ExamplesModal";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("eli5");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isExamplesModalOpen, setIsExamplesModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string, uploadedFileContent?: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-explanation', {
        body: {
          topic: query,
          level: selectedLevel,
          fileContent: uploadedFileContent || fileContent,
          userId: null // In real app, use actual user ID
        }
      });

      if (error) throw error;

      // Navigate to explanation page with the data
      navigate('/explanation', {
        state: {
          explanation: data.explanation,
          topic: query,
          level: selectedLevel
        }
      });

      toast({
        title: "Explanation generated!",
        description: `Here's ${query} explained like you're ${selectedLevel.replace('eli', '')}.`,
      });
    } catch (error) {
      console.error('Error generating explanation:', error);
      toast({
        title: "Couldn't generate explanation",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File, content?: string) => {
    setUploadedFile(file);
    setFileContent(content || "");
    
    if (content) {
      // Auto-generate explanation for uploaded file
      handleSearch(`document: ${file.name}`, content);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileContent("");
  };

  const handleSeeExamples = () => {
    setIsExamplesModalOpen(true);
  };

  const handleSelectExample = (topic: string) => {
    handleSearch(topic);
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-soft mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Making complex things simple since 2024
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 font-poppins">
              Explain
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Like </span>
              I'm 5
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Turn any complex topic into crystal-clear explanations. 
              Upload documents, ask questions, and learn at your perfect level.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 px-8 py-6 text-lg font-semibold rounded-2xl shadow-elevated hover-lift"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={handleSeeExamples}
                className="px-8 py-6 text-lg font-semibold rounded-2xl hover-lift"
              >
                <Users className="w-5 h-5 mr-2" />
                See Examples
              </Button>
            </div>
          </div>

          {/* Main Interface */}
          <div className="space-y-12">
            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            
            {/* Level Selector */}
            <LevelSelector 
              selectedLevel={selectedLevel} 
              onLevelChange={setSelectedLevel} 
            />
            
            {/* Document Upload */}
            <div className="text-center">
              <div className="inline-block p-1 bg-gradient-secondary rounded-2xl mb-6">
                <div className="bg-background px-6 py-3 rounded-xl">
                  <span className="text-sm font-medium text-foreground">
                    📄 Or upload a document to explain
                  </span>
                </div>
              </div>
              <DocumentUpload 
                onFileUpload={handleFileUpload}
                onRemoveFile={handleRemoveFile}
                uploadedFile={uploadedFile}
              />
            </div>
          </div>
        </div>
      </div>


      {/* Daily Fact Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Today's Brain Fuel ⚡
          </h2>
          <p className="text-muted-foreground">
            A daily dose of fascinating facts, explained simply
          </p>
        </div>
        <DailyFactCard />
      </div>

      {/* Examples Modal */}
      <ExamplesModal 
        isOpen={isExamplesModalOpen}
        onClose={() => setIsExamplesModalOpen(false)}
        onSelectExample={handleSelectExample}
      />

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              ExplainLikeIm5
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Making the complex simple, one explanation at a time.
            </p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;