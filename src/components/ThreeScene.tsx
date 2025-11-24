import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Torus, Box, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// Shield Component
const Shield = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group position={[-3, 0, 0]}>
      <Box
        ref={meshRef}
        args={[1.5, 2, 0.3]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          color={hovered ? "#00d9ff" : "#0099cc"}
          emissive="#00d9ff"
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      {/* Shield cross */}
      <Box args={[0.3, 1.5, 0.4]} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.3} />
      </Box>
      <Box args={[1.2, 0.3, 0.4]} position={[0, 0.3, 0.2]}>
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.3} />
      </Box>
    </group>
  );
};

// Lock Component
const Lock = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.015;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime + 2) * 0.2;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Lock body */}
      <Box args={[1.5, 1.8, 0.8]}>
        <meshStandardMaterial
          color={hovered ? "#b537ff" : "#8b2fc9"}
          emissive="#b537ff"
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </Box>
      {/* Lock shackle */}
      <Torus args={[0.7, 0.15, 16, 32, Math.PI]} position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial
          color="#b537ff"
          emissive="#b537ff"
          emissiveIntensity={0.4}
          metalness={0.9}
        />
      </Torus>
      {/* Keyhole */}
      <Sphere args={[0.2, 16, 16]} position={[0, 0, 0.45]}>
        <meshStandardMaterial color="#00d9ff" emissive="#00d9ff" emissiveIntensity={0.8} />
      </Sphere>
    </group>
  );
};

// Network Node Component
const NetworkNode = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.01;
      groupRef.current.rotation.y += 0.01;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime + 4) * 0.2;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[3, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Central sphere */}
      <Sphere args={[0.5, 32, 32]}>
        <MeshDistortMaterial
          color={hovered ? "#00d9ff" : "#00aacc"}
          emissive="#00d9ff"
          emissiveIntensity={hovered ? 0.6 : 0.3}
          distort={0.3}
          speed={2}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Orbiting nodes */}
      {[0, 1, 2, 3].map((i) => (
        <Sphere
          key={i}
          args={[0.15, 16, 16]}
          position={[
            Math.cos((i * Math.PI) / 2) * 1.5,
            Math.sin((i * Math.PI) / 2) * 1.5,
            0,
          ]}
        >
          <meshStandardMaterial
            color="#b537ff"
            emissive="#b537ff"
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Main Scene Component
const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d9ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#b537ff" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} color="#00d9ff" />
      
      <Shield />
      <Lock />
      <NetworkNode />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const ThreeScene = () => {
  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
