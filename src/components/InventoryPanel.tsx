import { useState, useRef } from "react";
import { Ingredient, Constraints, CookingTime, CookingTool, DietaryPreference } from "@/types/kitchen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Clock, Flame, Leaf, AlertTriangle, ChefHat, Camera, Loader2 } from "lucide-react";
import { useImageRecognition } from "@/hooks/useImageRecognition";
import { toast } from "sonner";

interface Props {
  inventory: Ingredient[];
  setInventory: (i: Ingredient[]) => void;
  constraints: Constraints;
  setConstraints: (c: Constraints) => void;
}

const timeOptions: { value: CookingTime; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "60 min" },
];

const toolOptions: { value: CookingTool; label: string; emoji: string }[] = [
  { value: "stove", label: "Stove", emoji: "🔥" },
  { value: "microwave", label: "Microwave", emoji: "📡" },
  { value: "oven", label: "Oven", emoji: "♨️" },
  { value: "air fryer", label: "Air Fryer", emoji: "💨" },
];

const dietOptions: { value: DietaryPreference; label: string }[] = [
  { value: "vegetarian", label: "🌿 Vegetarian" },
  { value: "vegan", label: "🌱 Vegan" },
  { value: "high-protein", label: "💪 High Protein" },
  { value: "low-carb", label: "🥩 Low Carb" },
  { value: "gluten-free", label: "🌾 Gluten Free" },
];

export default function InventoryPanel({ inventory, setInventory, constraints, setConstraints }: Props) {
  const [inputText, setInputText] = useState("");
  const [exclusionText, setExclusionText] = useState("");

  const addIngredients = () => {
    if (!inputText.trim()) return;
    const newItems = inputText.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({
      name,
      daysUntilExpiry: undefined,
    }));
    setInventory([...inventory, ...newItems]);
    setInputText("");
  };

  const removeIngredient = (idx: number) => {
    setInventory(inventory.filter((_, i) => i !== idx));
  };

  const setExpiry = (idx: number, days: number | undefined) => {
    const updated = [...inventory];
    updated[idx] = { ...updated[idx], daysUntilExpiry: days };
    setInventory(updated);
  };

  const toggleTool = (tool: CookingTool) => {
    const tools = constraints.tools.includes(tool)
      ? constraints.tools.filter((t) => t !== tool)
      : [...constraints.tools, tool];
    setConstraints({ ...constraints, tools });
  };

  const toggleDiet = (diet: DietaryPreference) => {
    const dietary = constraints.dietary.includes(diet)
      ? constraints.dietary.filter((d) => d !== diet)
      : [...constraints.dietary, diet];
    setConstraints({ ...constraints, dietary });
  };

  const addExclusion = () => {
    if (!exclusionText.trim()) return;
    setConstraints({ ...constraints, exclusions: [...constraints.exclusions, exclusionText.trim()] });
    setExclusionText("");
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 mb-2">
        <ChefHat className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-display font-semibold text-foreground">Your Kitchen</h2>
      </div>

      {/* Ingredient input */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1 block">Add Ingredients</label>
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIngredients()}
            placeholder="eggs, tomato, milk..."
            className="flex-1 bg-card"
          />
          <Button size="icon" onClick={addIngredients} className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Ingredient list */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {inventory.map((ing, idx) => (
            <motion.div
              key={`${ing.name}-${idx}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="flex items-center gap-2 bg-card rounded-md px-3 py-1.5 text-sm group"
            >
              <span className="flex-1 text-foreground capitalize">{ing.name}</span>
              {ing.daysUntilExpiry !== undefined && ing.daysUntilExpiry <= 2 && (
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              )}
              <select
                value={ing.daysUntilExpiry ?? ""}
                onChange={(e) => setExpiry(idx, e.target.value ? Number(e.target.value) : undefined)}
                className="text-xs bg-muted rounded px-1.5 py-0.5 text-muted-foreground w-20"
              >
                <option value="">No expiry</option>
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">7 days</option>
              </select>
              <button onClick={() => removeIngredient(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {inventory.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">Add ingredients to get recipe recommendations</p>
        )}
      </div>

      <div className="border-t border-border pt-3 mt-1">
        <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Cooking Time
        </h3>
        <div className="flex gap-2">
          {timeOptions.map((opt) => (
            <Badge
              key={opt.value}
              variant={constraints.cookingTime === opt.value ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => setConstraints({ ...constraints, cookingTime: opt.value })}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5" /> Tools Available
        </h3>
        <div className="flex flex-wrap gap-2">
          {toolOptions.map((opt) => (
            <Badge
              key={opt.value}
              variant={constraints.tools.includes(opt.value) ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleTool(opt.value)}
            >
              {opt.emoji} {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
          <Leaf className="h-3.5 w-3.5" /> Dietary Preferences
        </h3>
        <div className="flex flex-wrap gap-2">
          {dietOptions.map((opt) => (
            <Badge
              key={opt.value}
              variant={constraints.dietary.includes(opt.value) ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleDiet(opt.value)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">Exclusions</h3>
        <div className="flex gap-2">
          <Input
            value={exclusionText}
            onChange={(e) => setExclusionText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addExclusion()}
            placeholder="Allergies..."
            className="flex-1 bg-card text-sm"
          />
          <Button size="icon" variant="outline" onClick={addExclusion}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {constraints.exclusions.map((ex, i) => (
            <Badge key={i} variant="destructive" className="cursor-pointer" onClick={() => setConstraints({ ...constraints, exclusions: constraints.exclusions.filter((_, j) => j !== i) })}>
              {ex} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
