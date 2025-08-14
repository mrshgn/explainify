import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string, fileContent?: string) => void;
  isLoading?: boolean;
}

export const SearchBar = ({ onSearch, isLoading = false }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Type any topic… we'll explain it like you're 5! 🌟"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-16 pl-6 pr-20 text-lg font-medium bg-card shadow-elevated border-0 rounded-2xl focus-ring placeholder:text-muted-foreground/70"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 h-12 px-6 bg-gradient-primary hover:opacity-90 border-0 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? "Thinking..." : "Explain"}
          </Button>
        </div>
      </form>
    </div>
  );
};