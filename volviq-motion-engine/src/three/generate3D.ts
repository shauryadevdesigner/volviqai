// ============================================================================
// 3D Scene Code Generator
// ============================================================================
// Generates Remotion + Three.js 3D scene code for AI to use
// All animations use useCurrentFrame() - NO useFrame or useThree hooks
// ============================================================================

/**
 * Generates a complete 3D scene component that can be injected into AI-generated code
 */
export function generate3DSceneCode(options: {
  text?: string;
  textColor?: string;
  backgroundColor?: string;
  particleCount?: number;
  floatingShapes?: boolean;
  environment?: "city" | "sunset" | "night" | "studio" | "warehouse";
  cameraMovement?: boolean;
  bloom?: boolean;
}): string {
  const {
    text = "",
    textColor = "#f8fafc",
    particleCount = 300,
    floatingShapes = true,
    environment = "city",
    cameraMovement = true,
  } = options;

  return `import { Canvas } from "@react-three/fiber";
import { Float, Stars, Sparkles, Center, Text3D, MeshDistortMaterial, OrbitControls, Environment, RoundedBox, Icosahedron, TorusKnot, Sphere, Octahedron, Dodecahedron } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from "remotion";
import { useMemo, Suspense } from "react";
import * as THREE from "three";

const VolviqAnimation = () => {
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0b0f19 0%, #1a1a2e 100%)" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </AbsoluteFill>
  );
};

const SceneContent = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const time = frame / fps;
  const progress = frame / durationInFrames;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.6} color="#38bdf8" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#a855f7" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1.2} color="#38bdf8" />

      {/* Environment */}
      <Environment preset="${environment}" />

      {/* 3D Text */}
      ${text ? `<Text3DScene text="${text}" color="${textColor}" />` : ""}

      {/* Floating Shapes */}
      ${floatingShapes ? `
      <FloatingShape position={[-2.5, 0.5, 0]} scale={0.7} color="#38bdf8" shape="icosahedron" distort={0.4} speed={1.5} />
      <FloatingShape position={[2.5, -0.3, 0]} scale={0.5} color="#a855f7" shape="torusKnot" wobble={0.3} speed={1} />
      <FloatingShape position={[0, 1.8, -1]} scale={0.4} color="#f472b6" shape="sphere" distort={0.2} speed={2} />
      <FloatingShape position={[-1.5, -1.5, 0.5]} scale={0.35} color="#34d399" shape="octahedron" speed={1.2} />
      <FloatingShape position={[1.8, -0.8, -0.5]} scale={0.4} color="#fbbf24" shape="dodecahedron" distort={0.3} speed={0.8} />
      <FloatingShape position={[-0.5, -0.5, 1]} scale={0.3} color="#f87171" shape="torus" wobble={0.4} speed={1.8} />
      ` : ""}

      {/* Particles */}
      <ParticleField count={${particleCount}} radius={10} color="#38bdf8" size={0.04} />
      <Stars radius={50} depth={30} count={1500} factor={3} fade speed={0.5} />
      <Sparkles count={80} scale={8} size={2} speed={0.3} color="#a855f7" />

      {/* Camera */}
      <OrbitControls enableZoom={false} enablePan={false} ${cameraMovement ? 'autoRotate autoRotateSpeed={0.5}' : ''} />
    </>
  );
};

const FloatingShape = ({ position, scale, color, shape, distort = 0, wobble = 0, speed = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const rotationSpeed = 0.02 * speed;
  const rotationX = frame * rotationSpeed;
  const rotationY = frame * rotationSpeed * 1.3;
  const floatOffset = Math.sin(time * speed) * 0.3;
  const posY = position[1] + floatOffset;

  const shapes = {
    icosahedron: <icosahedronGeometry args={[1, 0]} />,
    torusKnot: <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />,
    sphere: <sphereGeometry args={[1, 32, 32]} />,
    octahedron: <octahedronGeometry args={[1, 0]} />,
    dodecahedron: <dodecahedronGeometry args={[1, 0]} />,
    torus: <torusGeometry args={[1, 0.4, 16, 32]} />,
  };

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={[position[0], posY, position[2]]} rotation={[rotationX, rotationY, 0]} scale={scale}>
        {shapes[shape] || shapes.icosahedron}
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
};

const Text3DScene = ({ text, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const rotationY = Math.sin(time * 0.5) * 0.1;
  const floatY = Math.sin(time * 0.8) * 0.1;

  return (
    <group rotation={[0, rotationY, 0]} position={[0, floatY, 0]}>
      <Center>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={0.6}
          height={0.15}
          bevelEnabled
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
};

const ParticleField = ({ count, radius, color, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 2;
    }
    return positions;
  }, [count, radius]);

  const rotationY = time * 0.05;
  const rotationX = Math.sin(time * 0.03) * 0.1;

  return (
    <points rotation={[rotationX, rotationY, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

export default VolviqAnimation;`;
}

/**
 * Generates a minimal 3D scene for simpler use cases
 */
export function generateMinimal3DCode(text?: string): string {
  return generate3DSceneCode({
    text: text || "",
    particleCount: 200,
    floatingShapes: true,
    environment: "city",
    cameraMovement: true,
  });
}

/**
 * Generates a product showcase 3D scene
 */
export function generateProduct3DCode(productName?: string): string {
  return `import { Canvas } from "@react-three/fiber";
import { Float, Environment, ContactShadows, Sparkles, OrbitControls, RoundedBox, Center, Text3D } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from "remotion";
import { Suspense } from "react";
import * as THREE from "three";

const VolviqAnimation = () => {
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-3, 3, 0]} intensity={0.8} color="#a855f7" />
          <Environment preset="studio" />
          
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
            <RoundedBox args={[2, 2, 2]} radius={0.15} smoothness={4}>
              <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.95} />
            </RoundedBox>
          </Float>
          
          ${productName ? `
          <Center position={[0, -1.8, 0]}>
            <Text3D
              font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
              size={0.35}
              height={0.08}
              bevelEnabled
              bevelThickness={0.01}
              bevelSize={0.01}
            >
              ${productName}
              <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.8} />
            </Text3D>
          </Center>
          ` : ""}
          
          <Sparkles count={60} scale={5} size={3} speed={0.3} color="#38bdf8" />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={4} blur={2} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
        </Suspense>
      </Canvas>
    </AbsoluteFill>
  );
};

export default VolviqAnimation;`;
}
