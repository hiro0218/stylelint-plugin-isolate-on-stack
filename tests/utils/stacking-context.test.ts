/**
 * Tests for stacking context utilities
 */
import { describe, it, expect } from "vitest";
import {
  createsStackingContext,
  hasPositionAndZIndexStackingContext,
  hasFlexOrGridItemZIndexStackingContext,
  getZIndexValue,
  hasInvalidBackgroundBlendWithIsolation,
  alreadyCreatesStackingContext,
} from "../../src/utils/stacking-context";
import { Declaration } from "postcss";

// Helper function to create mock Declaration
function createMockDeclaration(prop: string, value: string): Declaration {
  return {
    prop,
    value,
    parent: {
      type: "rule",
      nodes: [],
    },
  } as unknown as Declaration;
}

describe("Stacking Context Utilities", () => {
  describe("createsStackingContext", () => {
    it("should return true for isolation: isolate", () => {
      const decl = createMockDeclaration("isolation", "isolate");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("should return false for isolation: auto", () => {
      const decl = createMockDeclaration("isolation", "auto");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("should return true for opacity: 0.5", () => {
      const decl = createMockDeclaration("opacity", "0.5");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("should return false for opacity: 1", () => {
      const decl = createMockDeclaration("opacity", "1");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("should return true for transform: translateX(10px)", () => {
      const decl = createMockDeclaration("transform", "translateX(10px)");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("should return false for transform: none", () => {
      const decl = createMockDeclaration("transform", "none");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("should return true for filter: blur(5px)", () => {
      const decl = createMockDeclaration("filter", "blur(5px)");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("should return true for mix-blend-mode: multiply", () => {
      const decl = createMockDeclaration("mix-blend-mode", "multiply");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("should return false for mix-blend-mode: normal", () => {
      const decl = createMockDeclaration("mix-blend-mode", "normal");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("should return true for contain: layout", () => {
      const decl = createMockDeclaration("contain", "layout");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("should return false for contain: none", () => {
      const decl = createMockDeclaration("contain", "none");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("should return true for will-change: transform", () => {
      const decl = createMockDeclaration("will-change", "transform");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("should return true for will-change: transform, opacity", () => {
      const decl = createMockDeclaration("will-change", "transform, opacity");
      expect(createsStackingContext(decl)).toBe(true);
    });

    it("should return false for will-change: color", () => {
      const decl = createMockDeclaration("will-change", "color");
      expect(createsStackingContext(decl)).toBe(false);
    });

    it("should return false for undefined properties", () => {
      const decl = createMockDeclaration("color", "red");
      expect(createsStackingContext(decl)).toBe(false);
    });
  });

  describe("hasPositionAndZIndexStackingContext", () => {
    it("should return true for position: relative with z-index: 1", () => {
      expect(
        hasPositionAndZIndexStackingContext({
          position: "relative",
          "z-index": "1",
        }),
      ).toBe(true);
    });

    it("should return false for position: static with z-index: 1", () => {
      expect(
        hasPositionAndZIndexStackingContext({
          position: "static",
          "z-index": "1",
        }),
      ).toBe(false);
    });

    it("should return false for position: relative with z-index: auto", () => {
      expect(
        hasPositionAndZIndexStackingContext({
          position: "relative",
          "z-index": "auto",
        }),
      ).toBe(false);
    });

    it("should return false when position property is missing", () => {
      const result = hasPositionAndZIndexStackingContext({
        "z-index": "1",
      });
      // Test passes if the function returns a falsy value
      expect(!!result).toBe(false);
    });
  });

  describe("hasFlexOrGridItemZIndexStackingContext", () => {
    it("should return true for flex parent with z-index: 1", () => {
      expect(
        hasFlexOrGridItemZIndexStackingContext({
          parentDisplay: "flex",
          "z-index": "1",
        }),
      ).toBe(true);
    });

    it("should return true for grid parent with z-index: 1", () => {
      expect(
        hasFlexOrGridItemZIndexStackingContext({
          parentDisplay: "grid",
          "z-index": "1",
        }),
      ).toBe(true);
    });

    it("should return false for flex parent with z-index: auto", () => {
      expect(
        hasFlexOrGridItemZIndexStackingContext({
          parentDisplay: "flex",
          "z-index": "auto",
        }),
      ).toBe(false);
    });

    it("should return false for block parent with z-index: 1", () => {
      expect(
        hasFlexOrGridItemZIndexStackingContext({
          parentDisplay: "block",
          "z-index": "1",
        }),
      ).toBe(false);
    });
  });

  describe("getZIndexValue", () => {
    it("should return 5 for z-index: 5", () => {
      const decl = createMockDeclaration("z-index", "5");
      expect(getZIndexValue(decl)).toBe(5);
    });

    it("should return null for z-index: auto", () => {
      const decl = createMockDeclaration("z-index", "auto");
      expect(getZIndexValue(decl)).toBeNull();
    });

    it("should return -10 for z-index: -10", () => {
      const decl = createMockDeclaration("z-index", "-10");
      expect(getZIndexValue(decl)).toBe(-10);
    });

    it("should return null for non-z-index properties", () => {
      const decl = createMockDeclaration("color", "red");
      expect(getZIndexValue(decl)).toBeNull();
    });
  });

  describe("hasInvalidBackgroundBlendWithIsolation", () => {
    it("should return true for isolation: isolate with background-blend-mode: multiply", () => {
      expect(
        hasInvalidBackgroundBlendWithIsolation({
          isolation: "isolate",
          "background-blend-mode": "multiply",
        }),
      ).toBe(true);
    });

    it("should return false for isolation: isolate with background-blend-mode: normal", () => {
      expect(
        hasInvalidBackgroundBlendWithIsolation({
          isolation: "isolate",
          "background-blend-mode": "normal",
        }),
      ).toBe(false);
    });

    it("should return false for isolation: auto with background-blend-mode: multiply", () => {
      expect(
        hasInvalidBackgroundBlendWithIsolation({
          isolation: "auto",
          "background-blend-mode": "multiply",
        }),
      ).toBe(false);
    });

    it("should return false when background-blend-mode is missing", () => {
      expect(
        hasInvalidBackgroundBlendWithIsolation({
          isolation: "isolate",
        }),
      ).toBe(false);
    });
  });

  describe("alreadyCreatesStackingContext", () => {
    it("should return true for stacking context created by position and z-index", () => {
      expect(
        alreadyCreatesStackingContext({
          position: "relative",
          "z-index": "1",
        }),
      ).toBe(true);
    });

    it("should return true for opacity: 0.5", () => {
      expect(
        alreadyCreatesStackingContext({
          opacity: "0.5",
        }),
      ).toBe(true);
    });

    it("should return true for transform: translateX(10px)", () => {
      expect(
        alreadyCreatesStackingContext({
          transform: "translateX(10px)",
        }),
      ).toBe(true);
    });

    it("should return true for filter: blur(5px)", () => {
      expect(
        alreadyCreatesStackingContext({
          filter: "blur(5px)",
        }),
      ).toBe(true);
    });

    it("should return true for backdrop-filter: blur(5px)", () => {
      expect(
        alreadyCreatesStackingContext({
          "backdrop-filter": "blur(5px)",
        }),
      ).toBe(true);
    });

    it("should return true for mix-blend-mode: multiply", () => {
      expect(
        alreadyCreatesStackingContext({
          "mix-blend-mode": "multiply",
        }),
      ).toBe(true);
    });

    it("should return true for perspective: 1000px", () => {
      expect(
        alreadyCreatesStackingContext({
          perspective: "1000px",
        }),
      ).toBe(true);
    });

    it("should return true for clip-path: circle(50%)", () => {
      expect(
        alreadyCreatesStackingContext({
          "clip-path": "circle(50%)",
        }),
      ).toBe(true);
    });

    it("should return true for mask: url(#mask)", () => {
      expect(
        alreadyCreatesStackingContext({
          mask: "url(#mask)",
        }),
      ).toBe(true);
    });

    it("should return true for mask-image: url(mask.png)", () => {
      expect(
        alreadyCreatesStackingContext({
          "mask-image": "url(mask.png)",
        }),
      ).toBe(true);
    });

    it("should return true for mask-border: url(border.png)", () => {
      expect(
        alreadyCreatesStackingContext({
          "mask-border": "url(border.png)",
        }),
      ).toBe(true);
    });

    it("should return true for contain: layout", () => {
      expect(
        alreadyCreatesStackingContext({
          contain: "layout",
        }),
      ).toBe(true);
    });

    it("should return true for contain: paint strict", () => {
      expect(
        alreadyCreatesStackingContext({
          contain: "paint strict",
        }),
      ).toBe(true);
    });

    it("should return true for will-change: transform", () => {
      expect(
        alreadyCreatesStackingContext({
          "will-change": "transform",
        }),
      ).toBe(true);
    });

    it("should return true for will-change: opacity, z-index", () => {
      expect(
        alreadyCreatesStackingContext({
          "will-change": "opacity, z-index",
        }),
      ).toBe(true);
    });

    it("should return false for properties that don't create stacking contexts", () => {
      expect(
        alreadyCreatesStackingContext({
          color: "red",
          margin: "10px",
          padding: "20px",
        }),
      ).toBe(false);
    });
  });

  // Add more tests for other functions as needed
});
