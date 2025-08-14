import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LevelSelectorProps {
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}

const levels = [
  {
    id: "eli5",
    label: "ELI5",
    title: "Like I'm 5",
    description: "Super simple, like talking to a child",
    icon: "🧸",
    color: "bg-gradient-accent",
  },
  {
    id: "eli12",
    label: "ELI12",
    title: "Like I'm 12", 
    description: "More detail, but still easy to follow",
    icon: "🎒",
    color: "bg-gradient-secondary",
  },
  {
    id: "eli18",
    label: "ELI18",
    title: "Like I'm 18",
    description: "Full complexity with clear explanations",
    icon: "🎓",
    color: "bg-gradient-primary",
  },
];

export const LevelSelector = ({ selectedLevel, onLevelChange }: LevelSelectorProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Choose your explanation level
        </h3>
        <p className="text-muted-foreground text-sm">
          How complex should the explanation be?
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onLevelChange(level.id)}
            className={`
              p-4 rounded-2xl border-2 transition-all duration-300 hover-lift text-left
              ${
                selectedLevel === level.id
                  ? "border-primary shadow-elevated scale-105"
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{level.icon}</span>
              <div>
                <h4 className="font-semibold text-foreground">{level.label}</h4>
                <p className="text-xs text-muted-foreground">{level.title}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {level.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};