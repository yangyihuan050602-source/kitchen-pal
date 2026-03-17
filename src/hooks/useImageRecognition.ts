import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useImageRecognition() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognizeIngredients = async (file: File): Promise<string[]> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error: fnError } = await supabase.functions.invoke("recognize-ingredients", {
        body: { imageBase64: base64 },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      return data?.ingredients || [];
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Recognition failed";
      setError(msg);
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  return { recognizeIngredients, isProcessing, error };
}
