import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components expose `data-ocid` rather than `data-testid`.
configure({ testIdAttribute: "data-ocid" });

// main.tsx installs this so BigInt values (DayKey, quantities) can be hashed
// by React Query and serialized. Tests render App directly, so mirror it here.
if (typeof BigInt !== "undefined" && !BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function toJSON(this: bigint) {
    return this.toString();
  };
}

// jsdom does not implement matchMedia, which the theme hook reads on mount.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom does not implement scrollTo, which App calls on navigation.
if (typeof window !== "undefined") {
  window.scrollTo = () => undefined;
}

afterEach(() => {
  cleanup();
});
