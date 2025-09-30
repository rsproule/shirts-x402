# ShirtSlop API

AI-powered custom t-shirt creation and fulfillment API with crypto payments.

## API Endpoints

Both endpoints are protected by x402 payment middleware ($25.00 on Base network).

---

### 1. Create Shirt from AI Prompt

Generate a custom shirt design using AI and submit order to Printify.

**Endpoint:** `POST /api/shirts`

**Price:** $25.00 USD (paid via x402 on Base)

**Request Body:**
```typescript
{
  prompt: string,        // AI design prompt (10-4000 chars)
  size: "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL" | "5XL",
  color: "Black" | "White",
  address_to: {
    first_name: string,
    last_name: string,
    email: string,        // Valid email
    phone?: string,       // Optional
    country: string,      // ISO-3166-1 alpha-2 (e.g., "US", "GB")
    region?: string,      // State/province
    address1: string,
    address2?: string,    // Optional
    city: string,
    zip: string
  }
}
```

**Response:** `200 OK`
```typescript
{
  id: string,            // Job UUID
  status: "completed",
  imageUrl: string,      // Generated design image (base64 data URL)
  orderId: string,       // Printify order ID
  productId: null        // null for direct orders
}
```

**Error Responses:**
- `400` - Invalid request body
- `422` - Address validation failed
- `500` - Workflow execution failed

**Example:**
```bash
curl -X POST http://localhost:3000/api/shirts \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: <x402-token>" \
  -d '{
    "prompt": "minimalist line art of a peregrine falcon in flight",
    "size": "XL",
    "color": "White",
    "address_to": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "country": "US",
      "address1": "123 Main St",
      "city": "New York",
      "zip": "10001"
    }
  }'
```

**Workflow:**
1. Generate image using Google Gemini
2. Generate product title using GPT-5
3. Upload image to Printify
4. Submit order to Printify production

---

### 2. Create Shirt from Your Image

Submit a custom shirt order using your own image.

**Endpoint:** `POST /api/shirts/from-image`

**Price:** $25.00 USD (paid via x402 on Base)

**Request Body:**
```typescript
{
  imageUrl: string,      // Image data URL or remote URL
  size: "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL" | "5XL",
  color: "Black" | "White",
  address_to: {
    first_name: string,
    last_name: string,
    email: string,
    phone?: string,
    country: string,      // ISO-3166-1 alpha-2
    region?: string,
    address1: string,
    address2?: string,
    city: string,
    zip: string
  }
}
```

**Response:** `200 OK`
```typescript
{
  id: string,            // Job UUID
  status: "completed",
  imageUrl: string,      // Your provided image
  orderId: string,       // Printify order ID
  productId: null
}
```

**Error Responses:**
- `400` - Invalid request body
- `422` - Address validation failed
- `500` - Order creation failed

**Example:**
```bash
curl -X POST http://localhost:3000/api/shirts/from-image \
  -H "Content-Type: application/json" \
  -H "X-Payment-Token: <x402-token>" \
  -d '{
    "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "size": "L",
    "color": "Black",
    "address_to": {
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "country": "US",
      "address1": "456 Oak Ave",
      "city": "Brooklyn",
      "zip": "11249"
    }
  }'
```

**Workflow:**
1. Upload your image to Printify
2. Submit order to Printify production

---

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **AI:** Google Gemini (image generation), OpenAI GPT-5 (title generation)
- **Payments:** x402 (crypto micropayments on Base)
- **Authentication:** Echo SDK
- **Fulfillment:** Printify API
- **Validation:** Zod schemas
- **Type Safety:** TypeScript + ts-rest contracts

## Environment Variables

```bash
# Echo
ECHO_APP_ID=your_echo_app_id

# Printify (Product Creation)
PRINTIFY_API_KEY=your_product_api_key
PRINTIFY_SHOP_ID=your_shop_id

# Printify (Order Creation)
PRINTIFY_ORDER_API_KEY=your_order_api_key
PRINTIFY_ORDER_SHOP_ID=your_order_shop_id
```

## Development

```bash
pnpm install
pnpm dev
```

Navigate to `http://localhost:3000`

## Payment Flow

1. User submits shirt creation request
2. x402 middleware intercepts request
3. Payment modal displays ($25.00 on Base network)
4. User approves payment
5. Request proceeds to API handler
6. Shirt created and order submitted
7. Response returned with order details

## Product Configuration

- **Blueprint:** Comfort Colors t-shirt (#706)
- **Print Provider:** #99
- **Variants:** 15 sizes (S-5XL) in Black and White
- **Print Area:** Front, 50% scale, centered
- **Price:** $25.00 per shirt
