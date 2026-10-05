/**
 * Vitest global setup — mocks native Expo modules so pure-logic tests in
 * `lib/` and `data/` never pull in `react-native` (whose index.js contains
 * Flow syntax that Rolldown cannot parse).
 *
 * Add more mocks here when new native dependencies appear in the import
 * chain of testable modules.
 */
import { vi } from "vitest";

vi.mock("expo-secure-store", () => ({
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  getItemAsync: vi.fn().mockResolvedValue(null),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}));
