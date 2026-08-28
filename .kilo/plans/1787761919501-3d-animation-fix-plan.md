# 3D Animation Runtime Fix Plan

## Root Cause Analysis

**Error:** `R3F: Hooks can only be used within the Canvas component!`

**Actual Root Cause:** The `SafeReact.createElement` wrapper in `compiler.ts` is intercepting ALL `React.createElement` calls, including those from R3F's internal rendering. This breaks R3F's context propagation, causing hooks like `useFrame` and `useThree` to fail when they can't find the Canvas context.

The generated code structure that triggers this:
```tsx
<AbsoluteFill>
  <Canvas>  {/* R3F context starts here */}
    {/* 3D content */}
  </Canvas>
  <div>...</div>  {/* HTML outside Canvas - SafeReact interferes */}
</AbsoluteFill>
```

## Solution: Safe R3F Hook Wrappers + Less Intrusive Element Wrapper

### Step 1: Create Safe R3F Hook Wrappers

Create wrapper functions for `useFrame` and `useThree` that catch errors and provide fallbacks:

```typescript
const safeUseFrame: typeof useFrame = (callback, renderPriority) => {
  try {
    return useFrame(callback, renderPriority);
  } catch {
    // Outside Canvas context - silently ignore
  }
};

const safeUseThree: typeof useThree = (selector) => {
  try {
    return useThree(selector);
  } catch {
    // Outside Canvas context - return defaults
    return {
      camera: { position: { x: 0, y: 0, z: 8 } },
      gl: {},
      scene: {},
      // ... other defaults
    } as any;
  }
};
```

### Step 2: Fix `SafeReact.createElement` Wrapper

Make the wrapper less intrusive by:
1. Only modifying style props for HTML elements (strings like 'div', 'span', etc.)
2. Passing R3F elements through without modification

```typescript
const SafeReact = {
  ...React,
  createElement: function (type: any, props: any, ...children: any[]) {
    // Only modify style for HTML elements, not R3F elements
    if (typeof type === 'string' && props?.style && typeof props.style === 'object') {
      // ... existing style modification logic ...
    }
    return React.createElement(type, props, ...children);
  },
};
```

### Step 3: Update Compiler Sandbox

Pass `safeUseFrame` and `safeUseThree` instead of the raw hooks to the sandbox.

### Step 4: Build and Verify

Run `npm run build` to ensure no errors.

## Files to Modify

1. `volviq-motion-engine/src/remotion/compiler.ts` - Add safe hook wrappers, fix SafeReact.createElement

## Validation

- Build passes: `npm run build`
- 3D animation generation renders without R3F hook errors
- Both 2D ad generation and 3D animation generation work correctly
