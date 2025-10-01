"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";

type Mode = "prompt" | "image";

export default function MiniAppPage() {
  const [mode, setMode] = useState<Mode>("prompt");
  const [isReady, setIsReady] = useState(false);
  const [imageFile, setImageFile] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const [formData, setFormData] = useState({
    prompt: "",
    size: "XL",
    color: "White",
    first_name: "Ryan",
    last_name: "Sproule",
    email: "ryan@merit.systems",
    phone: "+1 (555) 123-4567",
    country: "US",
    region: "NY",
    address1: "300 Kent Ave",
    address2: "604",
    city: "Brooklyn",
    zip: "11249",
  });

  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;
      console.log("[Farcaster] Context:", context);

      await sdk.actions.ready();
      setIsReady(true);
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const addressPayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || undefined,
        country: formData.country,
        region: formData.region,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        zip: formData.zip,
      };

      const endpoint = mode === "prompt" ? "/api/shirts" : "/api/shirts/from-image";

      let payload: any;
      if (mode === "prompt") {
        payload = {
          prompt: formData.prompt,
          size: formData.size,
          color: formData.color,
          address_to: addressPayload,
        };
      } else {
        const finalImageUrl = imageFile || imageUrl;
        if (!finalImageUrl) {
          setError({ error: "Please provide an image" });
          setIsLoading(false);
          return;
        }
        payload = {
          imageUrl: finalImageUrl,
          size: formData.size,
          color: formData.color,
          address_to: addressPayload,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading Mini App...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ShirtSlop</h1>
          <p className="text-muted-foreground text-sm">Custom shirts • $25.00</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode("prompt")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === "prompt"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AI Prompt
                </button>
                <button
                  type="button"
                  onClick={() => setMode("image")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === "image"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Your Image
                </button>
              </div>

              {/* Input Section */}
              {mode === "prompt" ? (
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-medium">
                    Design Prompt
                  </label>
                  <Textarea
                    id="prompt"
                    name="prompt"
                    value={formData.prompt}
                    onChange={handleChange}
                    placeholder="e.g., minimalist line art falcon"
                    required
                    minLength={10}
                    rows={3}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    required
                  />
                </div>
              )}

              {/* Size and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="size" className="text-sm font-medium">
                    Size
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, size: e.target.value }))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="S">Small</option>
                    <option value="M">Medium</option>
                    <option value="L">Large</option>
                    <option value="XL">X-Large</option>
                    <option value="2XL">2X-Large</option>
                    <option value="3XL">3X-Large</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="color" className="text-sm font-medium">
                    Color
                  </label>
                  <select
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                  </select>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? "Creating..." : "Create Shirt • $25.00"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-green-500">
            <CardContent className="pt-6 space-y-2">
              <div className="text-green-600 font-semibold">Success!</div>
              <div className="text-sm">Order ID: {result.orderId}</div>
              {result.imageUrl && (
                <img src={result.imageUrl} alt="Design" className="w-full rounded-lg border" />
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-500">
            <CardContent className="pt-6">
              <div className="text-red-600 text-sm">
                {error?.error?.message || "An error occurred"}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
