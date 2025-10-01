"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type TCreateShirt, type TShirtJob, CreateShirtBody } from "@/lib/contracts/shirt";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Signer, wrapFetchWithPayment } from "x402-fetch";

type Mode = "prompt" | "image";

export function CreateShirtForm() {
  const { data: walletClient } = useWalletClient();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [mode, setMode] = useState<Mode>("prompt");
  const [imageFile, setImageFile] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");

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

  // Type-safe mutation for prompt-based shirts
  const createShirtMutation = useMutation({
    mutationFn: async (data: TCreateShirt) => {
      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      const validated = CreateShirtBody.parse(data);
      const paymentFetch = wrapFetchWithPayment(
        fetch,
        walletClient as unknown as Signer,
        BigInt(25_000_000),
      );

      const response = await paymentFetch("/api/shirts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validated),
      });

      const result = await response.json();

      if (response.ok && response.status === 200) {
        return result as TShirtJob;
      } else {
        throw result;
      }
    },
  });

  // Type-safe mutation for image-based shirts
  const createShirtFromImageMutation = useMutation({
    mutationFn: async (data: {
      imageUrl: string;
      size: string;
      color: string;
      address_to: any;
    }) => {
      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      const paymentFetch = wrapFetchWithPayment(
        fetch,
        walletClient as unknown as Signer,
        BigInt(25_000_000),
      );

      const response = await paymentFetch("/api/shirts/from-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && response.status === 200) {
        return result as TShirtJob;
      } else {
        throw result;
      }
    },
  });

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageFile(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (mode === "prompt") {
      // Prompt-based creation
      const payload: TCreateShirt = {
        prompt: formData.prompt,
        size: formData.size as "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL" | "5XL",
        color: formData.color as "Black" | "White",
        address_to: addressPayload,
      };
      createShirtMutation.mutate(payload);
    } else {
      // Image-based creation
      const finalImageUrl = imageFile || imageUrl;
      if (!finalImageUrl) {
        alert("Please provide an image");
        return;
      }

      const payload = {
        imageUrl: finalImageUrl,
        size: formData.size,
        color: formData.color,
        address_to: addressPayload,
      };
      createShirtFromImageMutation.mutate(payload);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const curlCommand = () => {
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
    const payload =
      mode === "prompt"
        ? {
            prompt: formData.prompt,
            size: formData.size,
            color: formData.color,
            address_to: addressPayload,
          }
        : {
            imageUrl: imageFile || imageUrl,
            size: formData.size,
            color: formData.color,
            address_to: addressPayload,
          };

    return `curl -X POST https://shirt.sh${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "X-Payment-Token: <x402_signature>" \\
  -d '${JSON.stringify(payload, null, 2)}'`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground tracking-tight">
            $ create-shirt --price 25.00
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex gap-0 border-2 border-foreground">
                <button
                  type="button"
                  onClick={() => setMode("prompt")}
                  className={`flex-1 py-2 px-4 text-xs font-medium tracking-wide transition-colors border-r-2 border-foreground ${
                    mode === "prompt"
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  [AI_PROMPT]
                </button>
                <button
                  type="button"
                  onClick={() => setMode("image")}
                  className={`flex-1 py-2 px-4 text-xs font-medium tracking-wide transition-colors ${
                    mode === "image"
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  [YOUR_IMAGE]
                </button>
              </div>

              {/* Prompt Section */}
              {mode === "prompt" ? (
                <div className="space-y-2">
                  <label
                    htmlFor="prompt"
                    className="text-xs font-medium leading-none tracking-wide uppercase peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    &gt; design_prompt
                  </label>
                  <Textarea
                    id="prompt"
                    name="prompt"
                    value={formData.prompt}
                    onChange={handleChange}
                    placeholder="minimalist line art of a peregrine falcon in flight, black and white"
                    required
                    minLength={10}
                    maxLength={4000}
                    rows={4}
                    className="resize-none border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                  />
                  <p className="text-xs text-muted-foreground font-mono">[ 10-4000 chars ]</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-xs font-medium tracking-wide uppercase">&gt; upload_image</label>

                  {/* Drag & Drop Zone */}
                  <div
                    onDrop={handleImageDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onPaste={handlePaste}
                    className="border-2 border-dashed border-foreground p-8 text-center hover:bg-muted transition-colors cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground font-mono">
                          [ drag | paste | click ]
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">png | jpg | gif</div>
                      </div>
                    </label>
                  </div>

                  {/* Or Image URL */}
                  <div className="space-y-2">
                    <label htmlFor="imageUrl" className="text-xs font-medium tracking-wide uppercase">
                      &gt; or_paste_url
                    </label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  {/* Preview */}
                  {(imageFile || imageUrl) && (
                    <div className="border-2 border-foreground p-4 bg-muted">
                      <p className="text-xs font-medium mb-2 font-mono uppercase tracking-wide">[ preview ]</p>
                      <img
                        src={imageFile || imageUrl}
                        alt="Preview"
                        className="w-full max-w-sm border-2 border-foreground"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Size and Color Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="size" className="text-xs font-medium leading-none tracking-wide uppercase">
                    &gt; size
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, size: e.target.value }))}
                    className="w-full p-2 border-2 border-foreground bg-background text-sm font-mono focus:ring-2 focus:ring-foreground"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2XL">2XL</option>
                    <option value="3XL">3XL</option>
                    <option value="4XL">4XL</option>
                    <option value="5XL">5XL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="color" className="text-xs font-medium leading-none tracking-wide uppercase">
                    &gt; color
                  </label>
                  <select
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-full p-2 border-2 border-foreground bg-background text-sm font-mono focus:ring-2 focus:ring-foreground"
                  >
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                  </select>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-foreground" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-background px-3 text-foreground font-mono font-bold">[ SHIPPING ]</span>
                </div>
              </div>

              {/* Address Section - Collapsed or Expanded */}
              {!isEditingAddress ? (
                // Collapsed View
                <div className="p-4 bg-muted border-2 border-foreground space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 text-xs font-mono">
                      <p className="font-bold">
                        {formData.first_name} {formData.last_name}
                      </p>
                      <p className="text-muted-foreground">
                        {formData.address1}
                        {formData.address2 && `, ${formData.address2}`}
                      </p>
                      <p className="text-muted-foreground">
                        {formData.city}, {formData.region} {formData.zip}
                      </p>
                      <p className="text-muted-foreground">{formData.country}</p>
                      <p className="text-muted-foreground">{formData.email}</p>
                      {formData.phone && (
                        <p className="text-muted-foreground">{formData.phone}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingAddress(true)}
                      className="border-2 border-foreground hover:bg-foreground hover:text-background font-mono text-xs"
                    >
                      [EDIT]
                    </Button>
                  </div>
                </div>
              ) : (
                // Expanded Edit View
                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first_name" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; first_name
                      </label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last_name" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; last_name
                      </label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; phone <span className="text-muted-foreground font-mono text-xs normal-case">(optional)</span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="address1" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; street_address
                      </label>
                      <Input
                        id="address1"
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        required
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="address2" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; apt_suite <span className="text-muted-foreground font-mono text-xs normal-case">(optional)</span>
                      </label>
                      <Input
                        id="address2"
                        name="address2"
                        value={formData.address2}
                        onChange={handleChange}
                        placeholder="Apt 4B"
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  {/* City, Region, Zip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; city
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="region" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; state
                      </label>
                      <Input
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="NY"
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="zip" className="text-xs font-medium leading-none tracking-wide uppercase">
                        &gt; zip
                      </label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        placeholder="10001"
                        required
                        className="border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-xs font-medium leading-none tracking-wide uppercase">
                      &gt; country_code
                    </label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="US"
                      required
                      maxLength={2}
                      className="uppercase border-2 border-foreground text-sm font-mono bg-background focus:ring-2 focus:ring-foreground"
                    />
                    <p className="text-xs text-muted-foreground font-mono">
                      [ 2-char ISO: US | CA | GB | DE ]
                    </p>
                  </div>

                  {/* Save Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditingAddress(false)}
                    className="w-full border-2 border-foreground hover:bg-foreground hover:text-background font-mono text-xs tracking-wide"
                  >
                    [SAVE_ADDRESS]
                  </Button>
                </div>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-foreground" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-background px-3 text-foreground font-mono font-bold">[ REQUEST ]</span>
                </div>
              </div>

              {/* Curl Command Preview */}
              <div className="border-2 border-foreground bg-muted p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase">
                    [ API_REQUEST ]
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(curlCommand())}
                    className="text-xs font-mono border border-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors"
                  >
                    copy
                  </button>
                </div>
                <pre className="text-xs font-mono overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
                  {curlCommand()}
                </pre>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  (mode === "prompt"
                    ? createShirtMutation.isPending || !formData.prompt || formData.prompt.length < 10
                    : createShirtFromImageMutation.isPending || (!imageFile && !imageUrl)) ||
                  !formData.first_name ||
                  !formData.last_name ||
                  !formData.email ||
                  !formData.address1 ||
                  !formData.city ||
                  !formData.zip ||
                  !formData.country
                }
                className="w-full border-2 border-foreground bg-foreground hover:bg-background hover:text-foreground font-mono text-sm tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {(
                  mode === "prompt"
                    ? createShirtMutation.isPending
                    : createShirtFromImageMutation.isPending
                ) ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    [PROCESSING...]
                  </>
                ) : (
                  "$ ./create-shirt --pay 25.00"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Result */}
        {((mode === "prompt" && createShirtMutation.isSuccess && createShirtMutation.data) ||
          (mode === "image" &&
            createShirtFromImageMutation.isSuccess &&
            createShirtFromImageMutation.data)) && (
          <Card className="border-2 border-foreground bg-muted shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <CardHeader>
              <CardTitle className="text-foreground font-mono text-sm tracking-wide">
                [SUCCESS] SHIRT_CREATED
              </CardTitle>
              <CardDescription className="font-mono text-xs">order.status = complete</CardDescription>
            </CardHeader>
            <CardContent className="font-mono text-xs">
              {(() => {
                const data =
                  mode === "prompt" ? createShirtMutation.data : createShirtFromImageMutation.data;
                if (!data) return null;

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">job_id:</span>
                      <code className="font-mono">{data.id}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">status:</span>
                      <span className="font-mono uppercase">{data.status}</span>
                    </div>
                    {data.imageUrl && (
                      <div className="space-y-2 pt-2">
                        <span className="text-muted-foreground">design_preview:</span>
                        <img
                          src={data.imageUrl}
                          alt="Shirt design"
                          className="w-full border-2 border-foreground"
                        />
                      </div>
                    )}
                    {data.productId && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">product_id:</span>
                        <code className="font-mono">{data.productId}</code>
                      </div>
                    )}
                    {data.orderId && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">order_id:</span>
                        <code className="font-mono">{data.orderId}</code>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Error Result */}
        {(createShirtMutation.isError || createShirtFromImageMutation.isError) && (
          <Card className="border-2 border-foreground bg-muted shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <CardHeader>
              <CardTitle className="text-foreground font-mono text-sm tracking-wide">[ERROR] REQUEST_FAILED</CardTitle>
              <CardDescription className="font-mono text-xs">
                {(
                  (mode === "prompt"
                    ? createShirtMutation.error
                    : createShirtFromImageMutation.error) as any
                )?.error?.message || "error.message = unknown"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto p-4 bg-background border-2 border-foreground font-mono">
                {JSON.stringify(
                  mode === "prompt"
                    ? createShirtMutation.error
                    : createShirtFromImageMutation.error,
                  null,
                  2,
                )}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
