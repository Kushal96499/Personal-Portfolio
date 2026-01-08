import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Environment, Stars, Sparkles } from "@react-three/drei";
import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

const NebulaRing = ({ isMobile }: { isMobile: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.05;
            meshRef.current.rotation.y += delta * 0.07;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef} scale={isMobile ? 1.4 : 2.5}>
                {/* Smoother geometry but optimized */}
                <torusKnotGeometry args={[1, 0.3, 128, 32]} />

                {/* High Performance "Dark Chrome" Material for all devices */}
                <meshStandardMaterial
                    color="#050505"
                    roughness={0.1}
                    metalness={0.9}
                    envMapIntensity={1.5}
                />
            </mesh>
        </Float>
    );
};

const Debris = () => {
    const count = 40; // Reduced count
    const tempObject = new THREE.Object3D();
    const data = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10
            ],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
            scale: 0.2 + Math.random() * 0.5,
            speed: 0.01 + Math.random() * 0.05
        }));
    }, []);

    const meshRef = useRef<THREE.InstancedMesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        data.forEach((d, i) => {
            // Anti-gravity rise
            d.position[1] += d.speed;
            if (d.position[1] > 10) d.position[1] = -10;

            tempObject.position.set(d.position[0], d.position[1], d.position[2] as number);
            tempObject.rotation.set(d.rotation[0], d.rotation[1] + state.clock.elapsedTime * 0.1, d.rotation[2]);
            tempObject.scale.setScalar(d.scale);
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.8} />
        </instancedMesh>
    );
};

const Experience3D = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        };

        const handleScroll = () => {
            // Dim the background when scrolling down
            const scrollY = window.scrollY;
            const newOpacity = Math.max(0.3, 1 - scrollY / 800);
            setOpacity(newOpacity);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("resize", checkMobile);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[-1] pointer-events-none bg-[#020005] transition-opacity duration-500"
            style={{ opacity }}
        >
            <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />

                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#4f46e5" />
                <pointLight position={[10, -10, -10]} intensity={1.5} color="#a855f7" />

                {/* Environment & Atmosphere */}
                <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />
                <Sparkles count={50} scale={15} size={2} speed={0.2} opacity={0.3} color="#ffffff" />

                <Suspense fallback={null}>
                    <NebulaRing isMobile={isMobile} />
                    <Debris />
                    <Environment preset="city" />
                </Suspense>
            </Canvas>

            {/* Noise Overlay for texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}
            />
        </div>
    );
};

export default Experience3D;
