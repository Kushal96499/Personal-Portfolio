import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const Globe = () => {
    const ref = useRef<any>();
    const sphere = random.inSphere(new Float32Array(5000), { radius: 1.5 }) as Float32Array;

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#4C8CFF"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
};

const ContactSection = () => {
    return (
        <section className="relative h-screen flex flex-col md:flex-row items-center justify-center overflow-hidden">

            {/* 3D Globe Container */}
            <div className="absolute inset-0 md:relative md:w-1/2 h-full z-0 opacity-30 md:opacity-100">
                <Canvas camera={{ position: [0, 0, 3] }}>
                    <ambientLight intensity={0.5} />
                    <Globe />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
            </div>

            {/* Content */}
            <div className="relative z-10 md:w-1/2 p-8 md:p-20 text-center md:text-left">
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 font-heading">
                    LET'S BUILD<br />SOMETHING<br /><span className="text-accent">WORLDWIDE.</span>
                </h2>
                <p className="text-white/60 text-lg mb-8 max-w-md">
                    Based in the cloud, available globally. Ready to turn your vision into a digital reality.
                </p>
                <a
                    href="mailto:kushalkumawat85598@gmail.com"
                    className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform duration-300"
                >
                    Start a Project
                </a>
            </div>
        </section>
    );
};

export default ContactSection;
