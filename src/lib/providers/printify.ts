import type { TAddressTo } from "@/lib/contracts/shirt";

// Minimal mapping helper; extend with items/variants when you wire the real order
export function toPrintifyAddress(addr: TAddressTo) {
  return {
    first_name: addr.first_name,
    last_name: addr.last_name,
    email: addr.email,
    phone: addr.phone ?? "",
    country: addr.country,
    region: addr.region ?? "",
    address1: addr.address1,
    address2: addr.address2 ?? "",
    city: addr.city,
    zip: addr.zip,
  };
}
