import { useState, useCallback, useEffect, useRef } from "react";
import { ScoredRecipe } from "@/types/kitchen";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Copy, Volume2, VolumeX, Square } from "lucide-react";
import { toast } from "sonner";

interface Props {
  recipe: ScoredRecipe;
}

export default function CookingMode({ recipe }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const readCurrentStep = useCallback(() => {
    const step = recipe.steps[currentStep];
    speak(`Step ${currentStep + 1}: ${step}`);
  }, [currentStep, recipe.steps, speak]);

  // Stop speech on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const copyShoppingList = () => {
    const list = recipe.missingIngredients.map((i) => `• ${i.name} (${i.amount})`).join("\n");
    navigator.clipboard.writeText(list);
    toast.success("Shopping list copied!");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
      {/* Shopping list */}
      {recipe.missingIngredients.length > 0 && (
        <div className="bg-secondary/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground">🛒 Shopping List</h3>
            <Button size="sm" variant="ghost" onClick={copyShoppingList}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
            </Button>
          </div>
          <ul className="space-y-1">
            {recipe.missingIngredients.map((ing) => (
              <li key={ing.name} className="text-sm text-muted-foreground">• {ing.name} ({ing.amount})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Cooking Steps</h3>
        <div className="space-y-2 mb-4">
          {recipe.steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={false}
              animate={{ opacity: idx === currentStep ? 1 : 0.5, scale: idx === currentStep ? 1 : 0.98 }}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${idx === currentStep ? "bg-primary/10 border border-primary/20" : "bg-card"} ${idx < currentStep ? "line-through text-muted-foreground" : ""}`}
            >
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground">
                {idx < currentStep ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </span>
              <p className="text-sm text-foreground">{step}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => s - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <Button variant="ghost" size="sm" onClick={stopSpeaking} className="text-destructive">
                <Square className="h-3.5 w-3.5 mr-1" /> Stop
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={readCurrentStep}>
                <Volume2 className="h-3.5 w-3.5 mr-1" /> Read
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {recipe.steps.length}
            </span>
          </div>
          <Button
            size="sm"
            disabled={currentStep === recipe.steps.length - 1}
            onClick={() => setCurrentStep((s) => s + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="bg-secondary/50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-foreground mb-1">💡 Tips</h3>
          {recipe.tips.map((tip, i) => (
            <p key={i} className="text-xs text-muted-foreground">{tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
