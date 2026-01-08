import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color, Vector2 } from 'three';

const FluidShader = {
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color('#050505') },
        uResolution: { value: new Vector2() },
        uMouse: { value: new Vector2() },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    varying vec2 vUv;

    // Simplex noise function (simplified for brevity)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 st = vUv;
      float time = uTime * 0.2;
      
      // Fluid distortion
      float noise = snoise(st * 3.0 + time);
      float dist = distance(st, uMouse);
      
      // Interaction ripple
      float ripple = sin(dist * 20.0 - time * 5.0) * 0.02 * exp(-dist * 2.0);
      
      vec3 color = uColor;
      // Add subtle violet/blue tint based on noise
      color += vec3(0.05, 0.0, 0.1) * noise;
      color += vec3(0.1) * ripple;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

const FluidPlane = () => {
    const mesh = useRef<any>();
    const mouse = useRef(new Vector2(0.5, 0.5));

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor: { value: new Color('#050505') },
            uResolution: { value: new Vector2(1, 1) }, // Placeholder, updated in useFrame or resize
            uMouse: { value: new Vector2(0.5, 0.5) },
        }),
        []
    );

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
            // Smooth mouse interpolation could go here
            mesh.current.material.uniforms.uMouse.value.lerp(mouse.current, 0.1);
        }
    });

    // Simple mouse tracker
    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <mesh ref={mesh} scale={[10, 10, 1]}> {/* Scale to cover screen */}
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={FluidShader.vertexShader}
                fragmentShader={FluidShader.fragmentShader}
            />
        </mesh>
    );
};

export const LiquidBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 bg-[#050505]">
            <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
                <FluidPlane />
            </Canvas>
        </div>
    );
};
