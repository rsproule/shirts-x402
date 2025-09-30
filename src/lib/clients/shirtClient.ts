import { shirtRouter } from "@/lib/contracts/shirt";
import { initClient } from "@ts-rest/core";

export const shirtClient = initClient(shirtRouter, {
  baseUrl: "/api",
  baseHeaders: {},
});
