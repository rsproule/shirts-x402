"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TestImagePage() {
  const [prompt, setPrompt] = useState(
    "minimalist line art of a peregrine falcon",
  );
  const [provider, setProvider] = useState<"google" | "openai">("google");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/test/image-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, provider }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data);
      }
    } catch (err: any) {
      setError({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Generation Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your design prompt..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="google"
                    checked={provider === "google"}
                    onChange={(e) => setProvider(e.target.value as "google")}
                  />
                  Google Gemini
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="openai"
                    checked={provider === "openai"}
                    onChange={(e) => setProvider(e.target.value as "openai")}
                  />
                  OpenAI
                </label>
              </div>
            </div>

            <Button onClick={handleTest} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Test Image Generation"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600">Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Generated Title:</p>
                <p className="text-lg">{result.result?.title}</p>
              </div>

              {result.result?.imageUrl && (
                <div>
                  <p className="text-sm font-medium mb-2">Generated Image:</p>
                  <img
                    src={result.result.imageUrl}
                    alt="Generated design"
                    className="w-full max-w-lg rounded-lg border"
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Metadata:</p>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                  {JSON.stringify(result.metadata, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
