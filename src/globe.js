import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Globe {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.globe = null;
        this.markers = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 3;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1.5;
        this.controls.maxDistance = 5;
        this.controls.enablePan = false;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);

        // Create Globe
        this.createGlobe();

        // Create Stars
        this.createStars();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();
    }

    createGlobe() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);

        // Earth-like material
        const material = new THREE.MeshPhongMaterial({
            color: 0x2233ff,
            emissive: 0x112244,
            shininess: 5,
            transparent: true,
            opacity: 0.9
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Add atmosphere glow
        const glowGeometry = new THREE.SphereGeometry(1.05, 64, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.globe.add(glow);

        // Add grid lines
        this.addGridLines();
    }

    addGridLines() {
        const gridHelper = new THREE.Group();

        // Latitude lines
        for (let i = -80; i <= 80; i += 20) {
            const lat = (i * Math.PI) / 180;
            const radius = Math.cos(lat) * 1.01;

            // Create circle points
            const points = [];
            const segments = 64;
            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * Math.PI * 2;
                points.push(
                    new THREE.Vector3(
                        radius * Math.cos(theta),
                        0,
                        radius * Math.sin(theta)
                    )
                );
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Line(geometry, material);
            line.rotation.x = Math.PI / 2;
            line.position.y = Math.sin(lat) * 1.01;
            gridHelper.add(line);
        }

        // Longitude lines
        for (let i = 0; i < 12; i++) {
            const curve = new THREE.EllipseCurve(
                0, 0,
                1.01, 1.01,
                0, 2 * Math.PI,
                false,
                0
            );
            const points = curve.getPoints(64);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Line(geometry, material);
            line.rotation.y = (i * Math.PI) / 6;
            gridHelper.add(line);
        }

        this.globe.add(gridHelper);
    }

    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(starsVertices, 3)
        );

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    addSpeciesMarker(species) {
        const { lat, lng, status } = species;

        // Convert lat/lng to 3D coordinates
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -1.02 * Math.sin(phi) * Math.cos(theta);
        const y = 1.02 * Math.cos(phi);
        const z = 1.02 * Math.sin(phi) * Math.sin(theta);

        // Create marker
        const geometry = new THREE.SphereGeometry(0.015, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: this.getColorByStatus(status),
            transparent: true,
            opacity: 0.9
        });

        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(x, y, z);
        marker.userData = species; // Store species data

        this.globe.add(marker);
        this.markers.push(marker);

        // Add pulsing animation
        this.animateMarker(marker);
    }

    animateMarker(marker) {
        const originalScale = marker.scale.clone();
        let time = Math.random() * Math.PI * 2;

        const animate = () => {
            time += 0.05;
            const scale = 1 + Math.sin(time) * 0.3;
            marker.scale.set(scale, scale, scale);
            requestAnimationFrame(animate);
        };

        animate();
    }

    getColorByStatus(status) {
        const colors = {
            'EX': 0x000000,  // 멸종 - 검은색
            'EW': 0x4A4A4A,  // 야생 멸종 - 회색
            'CR': 0xD32F2F,  // 위급 - 붉은색
            'EN': 0xFF6F00,  // 위기 - 주황색
            'VU': 0xFBC02D,  // 취약 - 노란색
            'NT': 0x66BB6A,  // 준위협 - 연두색
            'LC': 0x4CAF50   // 관심대상 - 녹색
        };
        return colors[status] || 0xFFFFFF;
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            this.globe.remove(marker);
            marker.geometry.dispose();
            marker.material.dispose();
        });
        this.markers = [];
    }

    onMouseClick(event, callback) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.markers);

        if (intersects.length > 0) {
            const marker = intersects[0].object;
            callback(marker.userData);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Auto-rotate globe slowly
        this.globe.rotation.y += 0.001;

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
