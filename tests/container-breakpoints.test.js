// @ts-check

/**
 * Repository module for container breakpoints.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  CONTAINER_BREAKPOINT_VALUES,
  CONTAINER_BREAKPOINT_ORDER,
  getContainerBreakpointQuery,
  getContainerBreakpointRangeQuery
} from "../src/spacing/container-breakpoints.js";
describe("CONTAINER_BREAKPOINT_VALUES", () => {
  test("has all five container breakpoints", () => {
    expect(Object.keys(CONTAINER_BREAKPOINT_VALUES)).toHaveLength(5);
    expect(CONTAINER_BREAKPOINT_VALUES["container-xs"]).toBe(200);
    expect(CONTAINER_BREAKPOINT_VALUES["container-sm"]).toBe(300);
    expect(CONTAINER_BREAKPOINT_VALUES["container-md"]).toBe(450);
    expect(CONTAINER_BREAKPOINT_VALUES["container-lg"]).toBe(600);
    expect(CONTAINER_BREAKPOINT_VALUES["container-xl"]).toBe(800);
  });
});
describe("CONTAINER_BREAKPOINT_ORDER", () => {
  test("is ascending by value", () => {
    for (let i = 1;i < CONTAINER_BREAKPOINT_ORDER.length; i++) {
      const prev = CONTAINER_BREAKPOINT_VALUES[CONTAINER_BREAKPOINT_ORDER[i - 1]];
      const curr = CONTAINER_BREAKPOINT_VALUES[CONTAINER_BREAKPOINT_ORDER[i]];
      expect(curr).toBeGreaterThan(prev);
    }
  });
  test("has all five names in order", () => {
    expect(CONTAINER_BREAKPOINT_ORDER).toEqual([
      "container-xs",
      "container-sm",
      "container-md",
      "container-lg",
      "container-xl"
    ]);
  });
});
describe("getContainerBreakpointQuery", () => {
  test("generates min-width query by default", () => {
    expect(getContainerBreakpointQuery("container-md")).toBe("@container (min-width: 450px)");
  });
  test("generates min-width query explicitly", () => {
    expect(getContainerBreakpointQuery("container-xs", "min")).toBe("@container (min-width: 200px)");
  });
  test("generates max-width query with 0.02px offset", () => {
    expect(getContainerBreakpointQuery("container-lg", "max")).toBe("@container (max-width: 599.98px)");
  });
  test("generates correct query for each breakpoint", () => {
    expect(getContainerBreakpointQuery("container-xs")).toBe("@container (min-width: 200px)");
    expect(getContainerBreakpointQuery("container-sm")).toBe("@container (min-width: 300px)");
    expect(getContainerBreakpointQuery("container-xl")).toBe("@container (min-width: 800px)");
  });
});
describe("getContainerBreakpointRangeQuery", () => {
  test("generates range query between two breakpoints", () => {
    expect(getContainerBreakpointRangeQuery("container-sm", "container-lg")).toBe("@container (min-width: 300px) and (max-width: 599.98px)");
  });
  test("generates range for adjacent breakpoints", () => {
    expect(getContainerBreakpointRangeQuery("container-xs", "container-sm")).toBe("@container (min-width: 200px) and (max-width: 299.98px)");
  });
});
