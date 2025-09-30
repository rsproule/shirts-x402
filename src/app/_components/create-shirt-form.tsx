"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type TCreateShirt,
  type TShirtJob,
  CreateShirtBody,
} from "@/lib/contracts/shirt";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Signer, wrapFetchWithPayment } from "x402-fetch";

export function CreateShirtForm() {
  const { data: walletClient } = useWalletClient();
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [formData, setFormData] = useState({
    prompt: "",
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

  // Type-safe mutation with TanStack Query
  const createShirtMutation = useMutation({
    mutationFn: async (data: TCreateShirt) => {
      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      // Validate input with Zod before sending
      const validated = CreateShirtBody.parse(data);

      // Create payment-wrapped fetch
      const paymentFetch = wrapFetchWithPayment(
        fetch,
        walletClient as unknown as Signer,
      ); // coinbase bricked their viem versions here

      // Make typed API call
      const response = await paymentFetch("/api/shirts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validated),
      });

      const result = await response.json();

      // Type-safe response handling
      if (response.ok && response.status === 200) {
        return result as TShirtJob;
      } else {
        throw result;
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Type-safe input
    const payload: TCreateShirt = {
      prompt: formData.prompt,
      address_to: {
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
      },
    };

    createShirtMutation.mutate(payload);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            Create custom AI-generated shirts • $25.00 per order
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Prompt Section */}
              <div className="space-y-2">
                <label
                  htmlFor="prompt"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Design Prompt
                </label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  placeholder="e.g., minimalist line art of a peregrine falcon in flight, black and white"
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  10-4000 characters
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Shipping Details
                  </span>
                </div>
              </div>

              {/* Address Section - Collapsed or Expanded */}
              {!isEditingAddress ? (
                // Collapsed View
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {formData.first_name} {formData.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.address1}
                        {formData.address2 && `, ${formData.address2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.city}, {formData.region} {formData.zip}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.country}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formData.email}
                      </p>
                      {formData.phone && (
                        <p className="text-sm text-muted-foreground">
                          {formData.phone}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingAddress(true)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ) : (
                // Expanded Edit View
                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="first_name"
                        className="text-sm font-medium leading-none"
                      >
                        First Name
                      </label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="last_name"
                        className="text-sm font-medium leading-none"
                      >
                        Last Name
                      </label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium leading-none"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="text-sm font-medium leading-none"
                      >
                        Phone{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="address1"
                        className="text-sm font-medium leading-none"
                      >
                        Street Address
                      </label>
                      <Input
                        id="address1"
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="address2"
                        className="text-sm font-medium leading-none"
                      >
                        Apartment, suite, etc.{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </label>
                      <Input
                        id="address2"
                        name="address2"
                        value={formData.address2}
                        onChange={handleChange}
                        placeholder="Apt 4B"
                      />
                    </div>
                  </div>

                  {/* City, Region, Zip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="city"
                        className="text-sm font-medium leading-none"
                      >
                        City
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="region"
                        className="text-sm font-medium leading-none"
                      >
                        State/Region
                      </label>
                      <Input
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="zip"
                        className="text-sm font-medium leading-none"
                      >
                        ZIP Code
                      </label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label
                      htmlFor="country"
                      className="text-sm font-medium leading-none"
                    >
                      Country Code
                    </label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="US"
                      required
                      maxLength={2}
                      className="uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      2-letter ISO code (e.g., US, CA, GB, DE)
                    </p>
                  </div>

                  {/* Save Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditingAddress(false)}
                    className="w-full"
                  >
                    Save Address
                  </Button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createShirtMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createShirtMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Processing Payment...
                  </>
                ) : (
                  "Create Shirt • $0.01"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Result */}
        {createShirtMutation.isSuccess && createShirtMutation.data && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-900 dark:text-green-100">
                ✓ Shirt Created Successfully!
              </CardTitle>
              <CardDescription>
                Your custom shirt has been created and ordered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Job ID:</span>
                  <code className="font-mono text-xs">
                    {createShirtMutation.data.id}
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">
                    {createShirtMutation.data.status}
                  </span>
                </div>
                {createShirtMutation.data.imageUrl && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">
                      Design:
                    </span>
                    <img
                      src={createShirtMutation.data.imageUrl}
                      alt="Shirt design"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
                {createShirtMutation.data.productId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Product ID:</span>
                    <code className="font-mono text-xs">
                      {createShirtMutation.data.productId}
                    </code>
                  </div>
                )}
                {createShirtMutation.data.orderId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Order ID:</span>
                    <code className="font-mono text-xs">
                      {createShirtMutation.data.orderId}
                    </code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Result */}
        {createShirtMutation.isError && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-100">
                ✕ Error
              </CardTitle>
              <CardDescription>
                {(createShirtMutation.error as any)?.error?.message ||
                  "An error occurred"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto p-4 bg-red-100 dark:bg-red-900/50 rounded">
                {JSON.stringify(createShirtMutation.error, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
