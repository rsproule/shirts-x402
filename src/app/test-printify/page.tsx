"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function TestPrintifyPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("Cool Falcon Design");
  const [description, setDescription] = useState(
    "A minimalist line art of a peregrine falcon in flight",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/test/printify-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          title,
          description,
        }),
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

  const handleGenerateImageFirst = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test/image-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: description,
          provider: "google",
        }),
      });

      const data = await response.json();

      if (response.ok && data.result?.imageUrl) {
        setImageUrl(data.result.imageUrl);
        setTitle(data.result.title || title);
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
            <CardTitle>Printify Product Creation Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter product title..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description..."
                rows={3}
              />
            </div>

            {imageUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Image Status</label>
                <div className="p-3 bg-muted rounded text-sm">
                  Image loaded ({Math.round(imageUrl.length / 1024)}KB)
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateImageFirst}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? "Generating..." : "1. Generate Image First"}
              </Button>
              <Button
                onClick={handleTest}
                disabled={loading || !imageUrl}
                className="flex-1"
              >
                {loading ? "Creating..." : "2. Create Product"}
              </Button>
            </div>

            {imageUrl && (
              <div className="border rounded-lg p-4 bg-muted">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full max-w-md rounded border"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-green-600">
                Product Created Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Product ID:</span>
                  <code className="text-xs">{result.result?.productId}</code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Title:</span>
                  <span>{result.result?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Duration:</span>
                  <span>{result.metadata?.duration}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Full Response:</p>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
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
