// ============================================================================
// Remotion 3D Scene Component
// ============================================================================
// Wraps @react-three/fiber Canvas for use in Remotion compositions
// ============================================================================

import { useRef, useEffect, useMemo, Suspense } from "react";
import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Stars, Sparkles, Center, Text3D, MeshDistortMaterial, MeshWobbleMaterial, RoundedBox, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// ── 3D Scene Wrapper for Remotion ──────────────────────────────────────────

interface Scene3DProps {
  children?: React.ReactNode;
  camera?: { position: [number, number, number]; fov?: number };
  environment?: string;
  stars?: boolean;
  sparkles?: boolean;
  className?: string;
}

export function Scene3D({
  children,
  camera = { position: [0, 0, 8], fov: 45 },
  environment = "city",
  stars = false,
  sparkles = false,
  className,
}: Scene3DProps) {
  return (
    <AbsoluteFill className={className}>
      <Canvas
        camera={{ position: camera.position, fov: camera.fov }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <SuspenseFallback>
          {children}
          {stars && <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}
          {sparkles && <Sparkles count={100} scale={10} size={2} speed={0.4} color="#38bdf8" />}
        </SuspenseFallback>
      </Canvas>
    </AbsoluteFill>
  );
}

// ── 3D Animated Objects ────────────────────────────────────────────────────

interface FloatingShapeProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
  distort?: number;
  wobble?: number;
  shape?: "box" | "sphere" | "torus" | "torusKnot" | "icosahedron" | "octahedron" | "dodecahedron";
  rotationSpeed?: [number, number, number];
}

export function FloatingShape({
  position = [0, 0, 0],
  scale = 1,
  color = "#38bdf8",
  speed = 1,
  distort = 0,
  wobble = 0,
  shape = "box",
  rotationSpeed = [0.01, 0.01, 0.01],
}: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed[0];
      meshRef.current.rotation.y += rotationSpeed[1];
      meshRef.current.rotation.z += rotationSpeed[2];
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case "sphere": return <sphereGeometry args={[1, 32, 32]} />;
      case "torus": return <torusGeometry args={[1, 0.4, 16, 32]} />;
      case "torusKnot": return <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />;
      case "icosahedron": return <icosahedronGeometry args={[1, 0]} />;
      case "octahedron": return <octahedronGeometry args={[1, 0]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[1, 0]} />;
      default: return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    }
  }, [shape]);

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        {distort > 0 ? (
          <MeshDistortMaterial color={color} speed={2} distort={distort} roughness={0.2} metalness={0.8} />
        ) : wobble > 0 ? (
          <MeshWobbleMaterial color={color} speed={2} factor={wobble} roughness={0.2} metalness={0.8} />
        ) : (
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} emissive={color} emissiveIntensity={0.1} />
        )}
      </mesh>
    </Float>
  );
}

// ── 3D Text ────────────────────────────────────────────────────────────────

interface Text3DProps {
  text: string;
  position?: [number, number, number];
  scale?: number;
  color?: string;
  fontSize?: number;
  height?: number;
  bevel?: boolean;
}

export function Text3DRemotion({
  text,
  position = [0, 0, 0],
  scale = 1,
  color = "#f8fafc",
  fontSize = 0.5,
  height = 0.1,
  bevel = true,
}: Text3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Center>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={fontSize}
          height={height}
          bevelEnabled={bevel}
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelSegments={5}
        >
          {text}
          <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} emissive={color} emissiveIntensity={0.05} />
        </Text3D>
      </Center>
    </group>
  );
}

// ── 3D Particle Field ──────────────────────────────────────────────────────

interface ParticleFieldProps {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
}

export function ParticleField({ count = 500, radius = 10, color = "#38bdf8", size = 0.05 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 2;
    }
    return positions;
  }, [count, radius]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// ── 3D Camera Rig ──────────────────────────────────────────────────────────

interface CameraRigProps {
  startPosition?: [number, number, number];
  endPosition?: [number, number, number];
  startFov?: number;
  endFov?: number;
}

export function CameraRig({
  startPosition = [0, 0, 10],
  endPosition = [0, 0, 5],
  startFov = 50,
  endFov = 40,
}: CameraRigProps) {
  const frame = useCurrentFrame();
  const { camera } = useThree();

  useEffect(() => {
    const x = interpolate(frame, [0, 300], [startPosition[0], endPosition[0]]);
    const y = interpolate(frame, [0, 300], [startPosition[1], endPosition[1]]);
    const z = interpolate(frame, [0, 300], [startPosition[2], endPosition[2]]);
    const fov = interpolate(frame, [0, 300], [startFov, endFov]);

    camera.position.set(x, y, z);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [frame, camera, startPosition, endPosition, startFov, endFov]);

  return null;
}

// ── 3D Lighting Setup ──────────────────────────────────────────────────────

export function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#38bdf8" />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#a855f7" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} color="#38bdf8" castShadow />
    </>
  );
}

// ── 3D Environment Presets ─────────────────────────────────────────────────

export function CityEnvironment() {
  return <Environment preset="city" />;
}

export function SunsetEnvironment() {
  return <Environment preset="sunset" />;
}

export function NightEnvironment() {
  return <Environment preset="night" />;
}

export function WarehouseEnvironment() {
  return <Environment preset="warehouse" />;
}

// ── 3D Scene Presets ───────────────────────────────────────────────────────

export function FloatingGeometryScene() {
  return (
    <>
      <StudioLighting />
      <CityEnvironment />
      <FloatingShape position={[-2, 0, 0]} scale={0.8} color="#38bdf8" shape="icosahedron" distort={0.4} speed={1.5} />
      <FloatingShape position={[2, 0, 0]} scale={0.6} color="#a855f7" shape="torusKnot" wobble={0.3} speed={1} />
      <FloatingShape position={[0, 1.5, -1]} scale={0.5} color="#f472b6" shape="sphere" distort={0.2} speed={2} />
      <FloatingShape position={[-1, -1.5, 0.5]} scale={0.4} color="#34d399" shape="octahedron" speed={1.2} />
      <FloatingShape position={[1.5, -1, -0.5]} scale={0.45} color="#fbbf24" shape="dodecahedron" distort={0.3} speed={0.8} />
      <ParticleField count={300} radius={8} color="#38bdf8" size={0.03} />
      <Stars radius={50} depth={30} count={1000} factor={3} fade />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export function ProductShowcaseScene() {
  return (
    <>
      <StudioLighting />
      <Environment preset="studio" />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <RoundedBox args={[2, 2, 2]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} />
        </RoundedBox>
      </Float>
      <Sparkles count={50} scale={4} size={3} speed={0.3} color="#38bdf8" />
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={5} blur={2} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
    </>
  );
}

// ── Suspense Fallback ──────────────────────────────────────────────────────

function SuspenseFallback({ children }: { children?: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
