"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type Step = "idle" | "image" | "product" | "order" | "complete";

export default function TestPrintifyPage() {
  const [currentStep, setCurrentStep] = useState<Step>("idle");
  const [loading, setLoading] = useState(false);

  // Form data
  const [prompt, setPrompt] = useState(
    "minimalist line art of a peregrine falcon in flight",
  );
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("XL");
  const [color, setColor] = useState("White");

  // Results
  const [imageResult, setImageResult] = useState<any>(null);
  const [productResult, setProductResult] = useState<any>(null);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  // Address (default)
  const defaultAddress = {
    first_name: "Ryan",
    last_name: "Sproule",
    email: "ryan@merit.systems",
    country: "US",
    region: "NY",
    address1: "300 Kent Ave",
    address2: "604",
    city: "Brooklyn",
    zip: "11249",
  };

  const handleGenerateImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test/image-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          provider: "google",
        }),
      });

      const data = await response.json();

      if (response.ok && data.result) {
        setImageUrl(data.result.imageUrl);
        setTitle(data.result.title);
        setDescription(prompt);
        setImageResult(data);
        setCurrentStep("image");
      } else {
        setError(data);
      }
    } catch (err: any) {
      setError({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    setLoading(true);
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

      if (response.ok && data.result) {
        setProductResult(data);
        setCurrentStep("product");
      } else {
        setError(data);
      }
    } catch (err: any) {
      setError({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const productId = productResult?.result?.productId;
      const variantId = productResult?.result?.variants?.[0]?.id || 78994;

      const response = await fetch("/api/test/printify-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity: 1,
          address_to: defaultAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.result) {
        setOrderResult(data);
        setCurrentStep("complete");
      } else {
        setError(data);
      }
    } catch (err: any) {
      setError({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test/direct-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          size,
          color,
          quantity: 1,
          address_to: defaultAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.result) {
        setOrderResult(data);
        setCurrentStep("complete");
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
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Printify E2E Workflow Test</h1>
          <p className="text-muted-foreground">
            Step through the complete shirt creation workflow
          </p>
        </div>

        {/* Step 1: Generate Image */}
        <Card className={currentStep === "idle" ? "border-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep === "idle"
                    ? "bg-blue-500 text-white"
                    : imageResult
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                1
              </span>
              Generate Image & Title
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Design Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter design prompt..."
                rows={2}
                disabled={currentStep !== "idle"}
              />
            </div>

            <Button
              onClick={handleGenerateImage}
              disabled={loading || currentStep !== "idle"}
              className="w-full"
            >
              {loading && currentStep === "idle"
                ? "Generating..."
                : "Generate Image"}
            </Button>

            {imageResult && (
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Title:</span>
                  <span>{imageResult.result?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Image Size:</span>
                  <span>{Math.round(imageUrl.length / 1024)}KB</span>
                </div>
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full max-w-sm rounded border"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Create Product OR Direct Order */}
        {currentStep === "image" && (
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="text-orange-600">Quick Option</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                Skip product creation and order directly (faster, recommended)
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>2XL</option>
                    <option>3XL</option>
                    <option>4XL</option>
                    <option>5XL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option>Black</option>
                    <option>White</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleDirectOrder}
                disabled={loading}
                variant="outline"
                className="w-full border-orange-500"
              >
                {loading
                  ? "Creating Order..."
                  : `Skip to Direct Order (${size} ${color})`}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className={currentStep === "image" ? "border-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep === "image"
                    ? "bg-blue-500 text-white"
                    : productResult
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                2
              </span>
              Create Printify Product (Traditional Flow)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Upload image and create product in Printify (slower but creates
              reusable product)
            </div>

            <Button
              onClick={handleCreateProduct}
              disabled={loading || currentStep !== "image"}
              className="w-full"
            >
              {loading && currentStep === "image"
                ? "Creating Product..."
                : "Create Product in Printify"}
            </Button>

            {productResult && (
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Product ID:</span>
                  <code className="text-xs">
                    {productResult.result?.productId}
                  </code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Variants:</span>
                  <span>{productResult.result?.variants?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Duration:</span>
                  <span>{productResult.metadata?.duration}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Create Order */}
        <Card className={currentStep === "product" ? "border-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep === "product"
                    ? "bg-blue-500 text-white"
                    : orderResult
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                3
              </span>
              Create & Submit Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Create order and submit to production
            </div>

            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <div className="font-medium">Shipping to:</div>
              <div>
                {defaultAddress.first_name} {defaultAddress.last_name}
              </div>
              <div>
                {defaultAddress.address1}, {defaultAddress.address2}
              </div>
              <div>
                {defaultAddress.city}, {defaultAddress.region}{" "}
                {defaultAddress.zip}
              </div>
              <div>{defaultAddress.email}</div>
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={loading || currentStep !== "product"}
              className="w-full"
            >
              {loading && currentStep === "product"
                ? "Creating Order..."
                : "Create & Submit Order"}
            </Button>

            {orderResult && (
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Order ID:</span>
                  <code className="text-xs">{orderResult.result?.orderId}</code>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Status:</span>
                  <span className="capitalize">
                    {orderResult.result?.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Duration:</span>
                  <span>{orderResult.metadata?.duration}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete */}
        {currentStep === "complete" && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-600">
                Workflow Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>Image generated and uploaded</div>
                <div>Product created and published</div>
                <div>Order created and submitted to production</div>
              </div>
              <Button
                onClick={() => {
                  setCurrentStep("idle");
                  setImageResult(null);
                  setProductResult(null);
                  setOrderResult(null);
                  setImageUrl("");
                  setTitle("");
                  setDescription("");
                }}
                variant="outline"
                className="w-full mt-4"
              >
                Start New Test
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
              <Button
                onClick={() => setError(null)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Clear Error
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
