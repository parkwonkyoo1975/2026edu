import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Eye, Pause, Play, Compass, ChevronDown, ChevronUp, Sparkles, Layers } from 'lucide-react';

interface ThreeHeroCampusProps {
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenIntroVideo?: () => void;
}

const PROJECT_BEACONS = [
  { id: 'ai-school', label: '선도학교', name: '선도학교', color: 0x3b82f6, emissive: 0x1d4ed8, angle: 0, radius: 10, y: 1.5 },
  { id: 'steam-club', label: 'STEAM', name: 'STEAM', color: 0x10b981, emissive: 0x047857, angle: (Math.PI * 2) / 5, radius: 10, y: 1.8 },
  { id: 'sel-classroom', label: 'SEL', name: 'SEL', color: 0xec4899, emissive: 0xbe185d, angle: (Math.PI * 4) / 5, radius: 10, y: 1.4 },
  { id: 'reading-debate', label: '독서·토론', name: '독서·토론', color: 0x8b5cf6, emissive: 0x6d28d9, angle: (Math.PI * 6) / 5, radius: 10, y: 1.9 },
  { id: 'teacher-community', label: '교원학습공동체', name: '교원학습공동체', color: 0xf59e0b, emissive: 0xb45309, angle: (Math.PI * 8) / 5, radius: 10, y: 1.6 },
];

function createBeaconTextSprite(text: string, colorHex: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const hexStr = `#${colorHex.toString(16).padStart(6, '0')}`;
    ctx.font = 'bold 88px "Pretendard", "Noto Sans KR", -apple-system, sans-serif';
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;

    // Calculate dynamic pill width centered in canvas
    const dotRadius = 22;
    const dotGap = 28;
    const innerContentWidth = dotRadius * 2 + dotGap + textWidth;
    const paddingX = 64;
    const pillWidth = Math.min(1024 - 40, innerContentWidth + paddingX * 2);
    const pillHeight = 200;
    const pillX = (1024 - pillWidth) / 2;
    const pillY = (280 - pillHeight) / 2;
    const r = pillHeight / 2;

    // 1. Subtle drop shadow on the HUD plate
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;

    // 2. High contrast dark glass plate
    ctx.fillStyle = 'rgba(10, 15, 30, 0.95)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, r);
    ctx.fill();

    // 3. Glowing neon border in theme color
    ctx.shadowColor = hexStr;
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = hexStr;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, r);
    ctx.stroke();

    // Reset shadow for razor-sharp text & icon
    ctx.shadowBlur = 0;

    // 4. Dot position & icon
    const contentStartX = pillX + (pillWidth - innerContentWidth) / 2;
    const dotCenterX = contentStartX + dotRadius;
    const centerY = 280 / 2;

    // Glowing Dot
    ctx.fillStyle = hexStr;
    ctx.beginPath();
    ctx.arc(dotCenterX, centerY, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // White dot ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(dotCenterX, centerY, dotRadius + 4, 0, Math.PI * 2);
    ctx.stroke();

    // 5. Crisp Korean Typography
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, dotCenterX + dotRadius + dotGap, centerY + 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.8, 1.3, 1);
  sprite.renderOrder = 999;
  return sprite;
}

export const ThreeHeroCampus: React.FC<ThreeHeroCampusProps> = ({
  activeProjectId,
  onSelectProject,
  onOpenIntroVideo,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isAutoRotateRef = useRef<boolean>(true);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [activeCamPreset, setActiveCamPreset] = useState<string>('overview');

  // Pre-allocated scratch objects for zero-GC animation loop
  const scratchVec1 = useRef(new THREE.Vector3());
  const scratchVec2 = useRef(new THREE.Vector3());

  // Fly camera to a specific coordinate smoothly
  const flyTo = useCallback((camPos: THREE.Vector3, lookAt: THREE.Vector3, presetName: string) => {
    targetCamPosRef.current = camPos.clone();
    targetLookAtRef.current = lookAt.clone();
    setActiveCamPreset(presetName);
  }, []);

  const handleSelectPreset = (preset: string) => {
    if (preset === 'overview') {
      flyTo(new THREE.Vector3(0, 14, 24), new THREE.Vector3(0, 2, 0), 'overview');
      onSelectProject('all');
    } else {
      const beacon = PROJECT_BEACONS.find((b) => b.id === preset);
      if (beacon) {
        const bx = Math.sin(beacon.angle) * beacon.radius;
        const bz = Math.cos(beacon.angle) * beacon.radius;
        // Position camera slightly offset from the beacon looking towards it
        const camPos = new THREE.Vector3(bx * 1.5, beacon.y + 4, bz * 1.5);
        const lookAt = new THREE.Vector3(bx, beacon.y, bz);
        flyTo(camPos, lookAt, preset);
        onSelectProject(preset);
      }
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x0a0f1d);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.022);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 14, 24);
    cameraRef.current = camera;

    // 3. Renderer
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: !isHeadless, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 6;
    controls.maxDistance = 45;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // 6. Balanced Lighting Rig
    const warmKeyLight = new THREE.DirectionalLight(0xfff1db, 2.8);
    warmKeyLight.position.set(15, 25, 12);
    warmKeyLight.castShadow = !isHeadless;
    warmKeyLight.shadow.mapSize.width = 1024;
    warmKeyLight.shadow.mapSize.height = 1024;
    warmKeyLight.shadow.camera.near = 0.5;
    warmKeyLight.shadow.camera.far = 60;
    const d = 16;
    warmKeyLight.shadow.camera.left = -d;
    warmKeyLight.shadow.camera.right = d;
    warmKeyLight.shadow.camera.top = d;
    warmKeyLight.shadow.camera.bottom = -d;
    warmKeyLight.shadow.bias = -0.0005;
    warmKeyLight.shadow.normalBias = 0.02;
    scene.add(warmKeyLight);

    const coolFillLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2);
    scene.add(coolFillLight);

    // 7. Ground Grid & Contact Floor
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Procedural Grid Texture on floor
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 512, 512);
    }
    const gridTexture = new THREE.CanvasTexture(canvas);
    gridTexture.wrapS = THREE.RepeatWrapping;
    gridTexture.wrapT = THREE.RepeatWrapping;
    gridTexture.repeat.set(16, 16);
    gridTexture.colorSpace = THREE.SRGBColorSpace;
    gridTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    groundMat.map = gridTexture;
    groundMat.needsUpdate = true;

    // Contact shadow radial disk
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.6, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    scene.add(shadowPlane);

    // 8. Composite Procedural Center Academy Hub (Group of 8 distinct parts)
    const academyGroup = new THREE.Group();
    academyGroup.position.set(0, 0, 0);

    // Part 1: Hexagonal Tier 1 Base Plinth
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.85 });
    const plinthGeo = new THREE.CylinderGeometry(4.2, 4.8, 0.6, 6);
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.3;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    academyGroup.add(plinth);

    // Part 2: Hexagonal Tier 2 Stepped Deck
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 });
    const deckGeo = new THREE.CylinderGeometry(3.2, 3.8, 0.5, 6);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 0.85;
    deck.castShadow = true;
    academyGroup.add(deck);

    // Part 3: Core Observatory Body with Vertical Fluting
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 });
    const coreGeo = new THREE.CylinderGeometry(2.0, 2.4, 2.8, 12);
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 2.5;
    core.castShadow = true;
    academyGroup.add(core);

    // Part 4: Inner Luminescent Energy Core (Octahedron crystal)
    const energyCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      emissive: 0x2563eb,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 1.2,
      clearcoat: 1.0,
    });
    const energyCrystalGeo = new THREE.OctahedronGeometry(1.2, 0);
    const energyCrystal = new THREE.Mesh(energyCrystalGeo, energyCrystalMat);
    energyCrystal.position.y = 4.6;
    academyGroup.add(energyCrystal);

    // Part 5: Floating Holographic Orbital Data Rings
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ringGeo1 = new THREE.TorusGeometry(3.0, 0.08, 16, 64);
    const orbitRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    orbitRing1.position.y = 3.8;
    orbitRing1.rotation.x = Math.PI / 4;
    academyGroup.add(orbitRing1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ringGeo2 = new THREE.TorusGeometry(3.6, 0.06, 16, 64);
    const orbitRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    orbitRing2.position.y = 4.2;
    orbitRing2.rotation.x = -Math.PI / 3;
    orbitRing2.rotation.y = Math.PI / 6;
    academyGroup.add(orbitRing2);

    // Part 6: Spire Needle & Crown Emitter
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.1, metalness: 0.95 });
    const spireGeo = new THREE.ConeGeometry(0.3, 2.2, 12);
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 6.4;
    spire.castShadow = true;
    academyGroup.add(spire);

    // Part 7: Spire Beacon Light Glow Tip
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const tipGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 7.6;
    academyGroup.add(tip);

    scene.add(academyGroup);

    // 9. Procedural 5 Project Beacons (Each an assembled 3-5 part group)
    const beaconMeshes: THREE.Group[] = [];
    const interactiveObjects: THREE.Object3D[] = [];

    PROJECT_BEACONS.forEach((b) => {
      const beaconGroup = new THREE.Group();
      const bx = Math.sin(b.angle) * b.radius;
      const bz = Math.cos(b.angle) * b.radius;
      beaconGroup.position.set(bx, 0, bz);
      beaconGroup.userData = { id: b.id, name: b.name };

      // Subpart 1: Pylon Base
      const pylonMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.8,
      });
      const pylonGeo = new THREE.CylinderGeometry(0.8, 1.1, 0.4, 8);
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.y = 0.2;
      pylon.castShadow = true;
      pylon.receiveShadow = true;
      beaconGroup.add(pylon);

      // Subpart 2: Energy Stem Columns (4 thin pillars)
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.9 });
      for (let i = 0; i < 4; i++) {
        const theta = (i * Math.PI) / 2;
        const pillarGeo = new THREE.CylinderGeometry(0.06, 0.06, b.y + 0.5, 8);
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(Math.cos(theta) * 0.55, (b.y + 0.5) / 2, Math.sin(theta) * 0.55);
        pillar.castShadow = true;
        beaconGroup.add(pillar);
      }

      // Subpart 3: Glowing Gem / Polyhedron for the specific project
      const gemMat = new THREE.MeshPhysicalMaterial({
        color: b.color,
        emissive: b.emissive,
        emissiveIntensity: 0.8,
        roughness: 0.15,
        metalness: 0.2,
        clearcoat: 0.8,
        transmission: 0.7,
        thickness: 0.8,
      });
      let gemGeo: THREE.BufferGeometry;
      if (b.id === 'ai-school') {
        gemGeo = new THREE.IcosahedronGeometry(0.7, 0);
      } else if (b.id === 'steam-club') {
        gemGeo = new THREE.OctahedronGeometry(0.75, 0);
      } else if (b.id === 'sel-classroom') {
        gemGeo = new THREE.DodecahedronGeometry(0.7, 0);
      } else if (b.id === 'reading-debate') {
        gemGeo = new THREE.BoxGeometry(0.9, 1.1, 0.5);
      } else {
        gemGeo = new THREE.TorusKnotGeometry(0.45, 0.16, 48, 8);
      }

      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.position.y = b.y + 0.6;
      gemMesh.castShadow = true;
      gemMesh.name = 'gem';
      beaconGroup.add(gemMesh);

      // Subpart 4: Orbiting Halo Ring
      const haloMat = new THREE.MeshStandardMaterial({
        color: b.color,
        emissive: b.emissive,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
      });
      const haloGeo = new THREE.TorusGeometry(1.1, 0.04, 12, 32);
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.y = b.y + 0.6;
      halo.name = 'halo';
      beaconGroup.add(halo);

      // Subpart 5: Subtle floor light marker
      const groundMarkerGeo = new THREE.RingGeometry(0.85, 1.2, 32);
      const groundMarkerMat = new THREE.MeshBasicMaterial({
        color: b.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const groundMarker = new THREE.Mesh(groundMarkerGeo, groundMarkerMat);
      groundMarker.rotation.x = -Math.PI / 2;
      groundMarker.position.y = 0.02;
      beaconGroup.add(groundMarker);

      // Subpart 6: Vertical Light Stem connecting to Floating Label
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8);
      const stemMat = new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.65,
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = b.y + 1.45;
      stem.name = 'stem';
      beaconGroup.add(stem);

      // Subpart 7: High-Visibility 3D HUD Text Sprite Label (선도학교, STEAM, SEL, 독서·토론, 교원학습공동체)
      const labelSprite = createBeaconTextSprite(b.label, b.color);
      labelSprite.position.set(0, b.y + 2.3, 0);
      labelSprite.name = 'labelSprite';
      labelSprite.userData = { id: b.id, name: b.name };
      beaconGroup.add(labelSprite);

      scene.add(beaconGroup);
      beaconMeshes.push(beaconGroup);
      interactiveObjects.push(gemMesh);
      interactiveObjects.push(labelSprite);
    });

    // 10. Connecting Light Beams from Central Hub to Beacons
    PROJECT_BEACONS.forEach((b) => {
      const bx = Math.sin(b.angle) * b.radius;
      const bz = Math.cos(b.angle) * b.radius;
      const points = [
        new THREE.Vector3(0, 3.8, 0),
        new THREE.Vector3(bx * 0.5, 2.5, bz * 0.5),
        new THREE.Vector3(bx, b.y + 0.6, bz),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.035, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.4,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
    });

    // 11. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const parent = obj.parent as THREE.Group;
        const targetName = obj.userData?.name || parent?.userData?.name;
        if (targetName) {
          setHoveredProject(targetName);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredProject(null);
      container.style.cursor = 'default';
    };

    const onClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const parent = obj.parent as THREE.Group;
        const targetId = obj.userData?.id || parent?.userData?.id;
        if (targetId) {
          handleSelectPreset(targetId);
        }
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // 12. Animation Loop with Exponential Damping & Lossless 60fps
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Rotate Academy energy rings
      orbitRing1.rotation.z += delta * 0.8;
      orbitRing2.rotation.y += delta * 0.6;
      energyCrystal.rotation.y += delta * 0.5;
      energyCrystal.rotation.x = Math.sin(currentTime * 0.002) * 0.2;

      // Animate Beacons gems, halos, stems and HUD text labels
      beaconMeshes.forEach((bg, idx) => {
        const floatOffset = Math.sin(currentTime * 0.003 + idx) * 0.12;
        const gem = bg.getObjectByName('gem');
        const halo = bg.getObjectByName('halo');
        const stem = bg.getObjectByName('stem');
        const label = bg.getObjectByName('labelSprite');
        if (gem) {
          gem.rotation.y += delta * (0.8 + idx * 0.2);
          gem.position.y = PROJECT_BEACONS[idx].y + 0.6 + floatOffset;
        }
        if (halo) {
          halo.rotation.x = Math.PI / 4 + Math.sin(currentTime * 0.002 + idx) * 0.25;
          halo.rotation.z += delta * 0.4;
          halo.position.y = PROJECT_BEACONS[idx].y + 0.6 + floatOffset;
        }
        if (stem) {
          stem.position.y = PROJECT_BEACONS[idx].y + 1.45 + floatOffset;
        }
        if (label) {
          label.position.y = PROJECT_BEACONS[idx].y + 2.3 + floatOffset;
        }
      });

      // Smooth Camera Preset Interpolation
      if (targetCamPosRef.current && targetLookAtRef.current) {
        // Smooth exponential damping
        const factor = 1 - Math.exp(-4 * delta);
        camera.position.lerp(targetCamPosRef.current, factor);
        controls.target.lerp(targetLookAtRef.current, factor);

        // Check if arrived close enough
        if (
          camera.position.distanceTo(targetCamPosRef.current) < 0.1 &&
          controls.target.distanceTo(targetLookAtRef.current) < 0.05
        ) {
          targetCamPosRef.current = null;
          targetLookAtRef.current = null;
        }
      } else if (!isPaused && isAutoRotateRef.current) {
        // Gentle Orbit when idle
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
      } else {
        controls.autoRotate = false;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleSelectPreset, isPaused]);

  return (
    <div className="relative w-full h-[480px] md:h-[580px] bg-slate-950 overflow-hidden border-b border-slate-800">
      {/* 3D WebGL Canvas Mount Container (Pure ref, stable lifecycle) */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Badge & Scene Info */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-white shadow-xl">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold tracking-wider text-slate-200">
            2026 미래교육 3D 메타 캠퍼스
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        </div>
        <p className="text-[11px] text-slate-300 pl-1 max-w-sm drop-shadow">
          빛나는 5대 위성(선도학교 · STEAM · SEL · 독서·토론 · 교원학습공동체)을 클릭하여 탐색하세요.
        </p>
      </div>

      {/* Top Center Hovered Beacon Indicator Tag */}
      {hoveredProject && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-1.5 rounded-xl bg-slate-900/95 border border-sky-400 text-sky-200 text-xs font-bold shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping inline-block" />
            <span className="text-white font-extrabold">{hoveredProject}</span>
            <span className="text-[11px] text-sky-300 font-medium">클릭하여 해당 사업으로 이동</span>
          </div>
        </div>
      )}

      {/* Top Right: Always Visible Featured Intro Video Button */}
      {onOpenIntroVideo && (
        <div className="absolute top-4 right-4 z-20 animate-in fade-in duration-200">
          <button
            onClick={onOpenIntroVideo}
            className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-rose-950/90 to-slate-900/90 hover:from-rose-900 hover:to-slate-800 border-2 border-rose-500 hover:border-rose-400 text-white shadow-xl shadow-rose-950/50 hover:scale-105 transition-all cursor-pointer group backdrop-blur-md ring-2 ring-rose-500/30"
            title="2026 교육 사업 공식 소개 영상 시청"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/50 group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-rose-300 font-black uppercase tracking-wider flex items-center gap-1">
                <span>공식 소개 영상</span>
                <span className="px-1 py-0.2 rounded bg-rose-500/30 text-[9px] text-rose-200 font-bold border border-rose-400/40">HD</span>
              </div>
              <div className="text-xs sm:text-sm font-black text-white group-hover:text-rose-200">
                영상 바로보기 ▶
              </div>
            </div>
            <span className="sm:hidden text-xs font-bold text-rose-200">소개 영상 ▶</span>
          </button>
        </div>
      )}

      {/* Collapsible Unified Bottom Control Dock (Strictly adhering to Three.js Ergonomics) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 w-[94%] max-w-[880px] ${
          isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Collapse/Expand Tab */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-t-lg bg-slate-900 border-t border-x border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                <span>3D 컨트롤 펼치기</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>시네마 뷰 (컨트롤 접기)</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Surface Body */}
        <div className="bg-slate-900 border border-slate-700/90 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-wrap items-center justify-between gap-2.5">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleSelectPreset('overview')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeCamPreset === 'overview'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>전체 조망</span>
            </button>

            {PROJECT_BEACONS.map((beacon, idx) => (
              <button
                key={beacon.id}
                onClick={() => handleSelectPreset(beacon.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCamPreset === beacon.id
                    ? 'bg-blue-600 text-white font-semibold ring-2 ring-blue-400/50'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: `#${beacon.color.toString(16).padStart(6, '0')}` }}
                />
                <span>{beacon.name}</span>
              </button>
            ))}
          </div>

          {/* Right Action Controls: Play/Pause Auto-orbit & Reset */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? '자동 회전 재개' : '자동 회전 일시정지'}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <button
              onClick={() => handleSelectPreset('overview')}
              title="카메라 원위치"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
