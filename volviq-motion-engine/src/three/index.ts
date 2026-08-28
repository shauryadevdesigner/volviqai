// ============================================================================
// 3D Animation System for Remotion
// ============================================================================
// Full 3D scene support using @react-three/fiber + @react-three/drei
// with post-processing effects (bloom, DOF, chromatic aberration)
// ============================================================================

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Text3D,
  Center,
  Stars,
  Sparkles,
  Cloud,
  ContactShadows,
  AccumulativeShadows,
  RandomizedLight,
  useGLTF,
  Html,
  RoundedBox,
  Torus,
  TorusKnot,
  Icosahedron,
  Octahedron,
  Dodecahedron,
  Sphere,
  Box,
  Cone,
  Cylinder,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

// Re-export everything for use in generated code
export {
  Canvas,
  OrbitControls,
  Environment,
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Text3D,
  Center,
  Stars,
  Sparkles,
  Cloud,
  ContactShadows,
  AccumulativeShadows,
  RandomizedLight,
  useGLTF,
  Html,
  RoundedBox,
  Torus,
  TorusKnot,
  Icosahedron,
  Octahedron,
  Dodecahedron,
  Sphere,
  Box,
  Cone,
  Cylinder,
  useFrame,
  useThree,
  useRef,
  useMemo,
  Suspense,
  THREE,
};
