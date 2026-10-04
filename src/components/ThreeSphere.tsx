import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';

interface ThreeSphereProps {
  onEnter: () => void;
  lang: string;
}

const ThreeSphere: React.FC<ThreeSphereProps> = ({ onEnter, lang }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionRef = useRef(false);
  const transitionStartTime = useRef(0);

  useEffect(() => {
    transitionRef.current = isTransitioning;
    if (isTransitioning) {
      transitionStartTime.current = performance.now();
    }
  }, [isTransitioning]);

  useEffect(() => {
    if (!containerRef.current) return;
    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const isMobile = window.innerWidth < 768;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = isMobile ? 8 : 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear any existing children before appending
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // --- Particles ---
    const particlesCount = 12000; // Increased for better scattering
    const positions = new Float32Array(particlesCount * 3);
    const originalPositions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3); // For explosion
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    const radius = 2.5;

    for (let i = 0; i < particlesCount; i++) {
      // Sphere distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Random velocity for explosion
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      // Colors (cyan to deep blue)
      const mix = Math.random();
      colors[i * 3] = 0.13 + mix * -0.02; // R
      colors[i * 3 + 1] = 0.82 + mix * -0.57; // G
      colors[i * 3 + 2] = 0.93 + mix * -0.25; // B

      sizes[i] = Math.random() * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- Mouse Interaction ---
    const mouse = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // --- Animation Loop ---
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      // Mouse-driven rotation (Smoothly follow mouse)
      const targetRotationX = mouse.y * 0.5;
      const targetRotationY = mouse.x * 0.5;
      
      points.rotation.x += (targetRotationX - points.rotation.x) * 0.05;
      points.rotation.y += (targetRotationY - points.rotation.y) * 0.05;

      // Constant slow rotation
      points.rotation.y += 0.01;

      // Floating movement
      points.position.y = Math.sin(time) * 0.1;

      // Repulsion logic
      const posAttr = geometry.attributes.position;
      const posArray = posAttr.array as Float32Array;

      raycaster.setFromCamera(mouse, camera);
      const mouseWorld = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
      const dir = mouseWorld.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const mousePos = camera.position.clone().add(dir.multiplyScalar(distance));

      for (let i = 0; i < particlesCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        if (transitionRef.current) {
          // SLOW MOTION EXPLOSION EFFECT
          const elapsed = (performance.now() - transitionStartTime.current) / 1000;
          
          // Speed starts at a certain point and stays controlled for slow-mo feel
          // We use a very low multiplier for that "cinematic" look
          const slowMoFactor = 0.15; 
          
          posArray[ix] += velocities[ix] * slowMoFactor;
          posArray[iy] += velocities[iy] * slowMoFactor;
          posArray[iz] += velocities[iz] * slowMoFactor;
          
          // Subtle outward expansion
          const p = new THREE.Vector3(posArray[ix], posArray[iy], posArray[iz]);
          const outward = p.normalize().multiplyScalar(0.015); 
          posArray[ix] += outward.x;
          posArray[iy] += outward.y;
          posArray[iz] += outward.z;
          
          continue;
        }

        // Get current world position of particle
        const p = new THREE.Vector3(posArray[ix], posArray[iy], posArray[iz]);
        p.applyMatrix4(points.matrixWorld);

        const dist = p.distanceTo(mousePos);
        const repulsionRadius = 1.5;

        if (dist < repulsionRadius) {
          const force = Math.pow((repulsionRadius - dist) / repulsionRadius, 2);
          const repulsionVec = p.clone().sub(mousePos).normalize().multiplyScalar(force * 0.5);
          
          // Apply repulsion back to local space
          const localRepulsion = repulsionVec.applyMatrix4(points.matrixWorld.clone().invert());
          
          posArray[ix] += localRepulsion.x;
          posArray[iy] += localRepulsion.y;
          posArray[iz] += localRepulsion.z;
        } else {
          // Return to original position with a bit of "floaty" noise
          const targetX = originalPositions[ix] + Math.sin(time + i) * 0.02;
          const targetY = originalPositions[iy] + Math.cos(time + i) * 0.02;
          const targetZ = originalPositions[iz] + Math.sin(time * 0.5 + i) * 0.02;

          posArray[ix] += (targetX - posArray[ix]) * 0.03;
          posArray[iy] += (targetY - posArray[iy]) * 0.03;
          posArray[iz] += (targetZ - posArray[iz]) * 0.03;
        }
      }

      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // --- Resize ---
    const handleResize = () => {
      if (!cameraRef.current) return;
      const isMobile = window.innerWidth < 768;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.position.z = isMobile ? 8 : 5;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onEnter();
    }, 1000); // Faster transition
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-brand-bg transition-all duration-[1000ms] ease-in-out ${isTransitioning ? 'opacity-0 scale-110' : 'opacity-100'}`}
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={containerRef} className="absolute inset-0" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center max-w-[80vw] md:max-w-[50vw]">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-brand-text dark:text-white font-mono text-xs mb-2 tracking-[0.5em] uppercase"
          >
            Welcome
          </motion.p>
          <h1 className={`text-3xl md:text-6xl font-bold text-brand-text dark:text-white tracking-widest transition-all duration-500 ${isHovered ? 'scale-110 blur-none' : 'scale-100 blur-[1px]'} drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]`}>
            MUSOXON MAXMUDOV
          </h1>
          <p className="text-brand-text dark:text-white font-mono text-xs md:text-sm mt-4 tracking-[0.2em] md:tracking-[0.3em] opacity-80">
            {lang === 'en' ? 'CLICK TO ENTER' : lang === 'ru' ? 'НАЖМИТЕ, ЧТОБЫ ВОЙТИ' : 'KIRISH UCHUN BOSING'}
          </p>
        </div>
      </div>

      {/* Subtle glow overlay */}
      <div className={`absolute inset-0 bg-brand-accent-cyan/5 pointer-events-none transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
};

export default ThreeSphere;
