import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Torus, Float } from '@react-three/drei';

const GlassShape = () => {
    const mesh = useRef<any>();

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.2;
            mesh.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Torus ref={mesh} args={[1, 0.3, 16, 100]}>
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.5}
                    chromaticAberration={0.1}
                    anisotropy={0.1}
                    distortion={0.1}
                    distortionScale={0.1}
                    temporalDistortion={0.1}
                    iridescence={0.5}
                    iridescenceIOR={1}
                    iridescenceThicknessRange={[0, 1400]}
                    roughness={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    color="#ffffff"
                />
            </Torus>
        </Float>
    );
};

const GeometricShape = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
            <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 1.5]}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <GlassShape />
            </Canvas>
        </div>
    );
};

export default GeometricShape;
