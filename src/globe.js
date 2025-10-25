import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class Globe {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.controls = null;
        this.globe = null;
        this.markers = [];
        this.labels = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isMobile = window.innerWidth < 768;

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
        this.camera.position.z = this.isMobile ? 3.5 : 3;

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // CSS2D Label Renderer
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.left = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.container.appendChild(this.labelRenderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = this.isMobile ? 2 : 1.5;
        this.controls.maxDistance = this.isMobile ? 6 : 5;
        this.controls.enablePan = false;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.5;

        // Mobile touch optimization
        if (this.isMobile) {
            this.controls.rotateSpeed = 0.7;
            this.controls.zoomSpeed = 0.8;
        }

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);

        // Create Globe with continents
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

        // Create earth texture with continents
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Ocean color
        ctx.fillStyle = '#1a4d7a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw continents (simplified)
        this.drawContinents(ctx, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Earth material with texture
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpScale: 0.01,
            shininess: 10,
            transparent: false
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Add atmosphere glow
        const glowGeometry = new THREE.SphereGeometry(1.02, 64, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.globe.add(glow);

        // Add subtle grid lines
        this.addGridLines();
    }

    drawContinents(ctx, width, height) {
        ctx.fillStyle = '#2d5a3d';
        ctx.strokeStyle = '#3d6a4d';
        ctx.lineWidth = 2;

        // Simple continent shapes (rough approximations)
        // Africa
        this.drawContinent(ctx, width, height, [
            { lat: 37, lng: 10 }, { lat: 30, lng: 30 }, { lat: 10, lng: 50 },
            { lat: -35, lng: 30 }, { lat: -30, lng: 20 }, { lat: 10, lng: 10 }
        ]);

        // Europe
        this.drawContinent(ctx, width, height, [
            { lat: 70, lng: 10 }, { lat: 60, lng: 30 }, { lat: 45, lng: 40 },
            { lat: 36, lng: 10 }, { lat: 45, lng: -10 }
        ]);

        // Asia
        this.drawContinent(ctx, width, height, [
            { lat: 70, lng: 60 }, { lat: 75, lng: 100 }, { lat: 60, lng: 140 },
            { lat: 20, lng: 140 }, { lat: 0, lng: 100 }, { lat: 10, lng: 70 },
            { lat: 40, lng: 50 }
        ]);

        // North America
        this.drawContinent(ctx, width, height, [
            { lat: 70, lng: -100 }, { lat: 75, lng: -80 }, { lat: 60, lng: -60 },
            { lat: 25, lng: -80 }, { lat: 15, lng: -90 }, { lat: 30, lng: -120 },
            { lat: 50, lng: -130 }
        ]);

        // South America
        this.drawContinent(ctx, width, height, [
            { lat: 10, lng: -80 }, { lat: 10, lng: -50 }, { lat: -30, lng: -40 },
            { lat: -55, lng: -70 }, { lat: -20, lng: -80 }
        ]);

        // Australia
        this.drawContinent(ctx, width, height, [
            { lat: -10, lng: 130 }, { lat: -10, lng: 150 }, { lat: -40, lng: 150 },
            { lat: -40, lng: 120 }
        ]);
    }

    drawContinent(ctx, width, height, points) {
        if (points.length < 3) return;

        ctx.beginPath();
        points.forEach((point, i) => {
            const x = ((point.lng + 180) / 360) * width;
            const y = ((90 - point.lat) / 180) * height;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    addGridLines() {
        const gridHelper = new THREE.Group();

        // Latitude lines
        for (let i = -80; i <= 80; i += 20) {
            const lat = (i * Math.PI) / 180;
            const radius = Math.cos(lat) * 1.005;

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
                opacity: 0.15
            });
            const line = new THREE.Line(geometry, material);
            line.rotation.x = Math.PI / 2;
            line.position.y = Math.sin(lat) * 1.005;
            gridHelper.add(line);
        }

        // Longitude lines
        for (let i = 0; i < 12; i++) {
            const curve = new THREE.EllipseCurve(
                0, 0,
                1.005, 1.005,
                0, 2 * Math.PI,
                false,
                0
            );
            const points = curve.getPoints(64);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.15
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
        const { lat, lng, status, commonName, emoji } = species;

        // Convert lat/lng to 3D coordinates
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const markerRadius = 1.02;
        const x = -markerRadius * Math.sin(phi) * Math.cos(theta);
        const y = markerRadius * Math.cos(phi);
        const z = markerRadius * Math.sin(phi) * Math.sin(theta);

        // Create marker
        const geometry = new THREE.SphereGeometry(this.isMobile ? 0.02 : 0.015, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: this.getColorByStatus(status),
            transparent: true,
            opacity: 0.9
        });

        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(x, y, z);
        marker.userData = species;

        this.globe.add(marker);
        this.markers.push(marker);

        // Add pulsing animation
        this.animateMarker(marker);

        // Add label (text)
        this.addLabel(species, x, y, z);
    }

    addLabel(species, x, y, z) {
        const { commonName, emoji, status } = species;

        // Create label element
        const labelDiv = document.createElement('div');
        labelDiv.className = 'species-label';

        // Show emoji on mobile, name on desktop
        const displayText = this.isMobile ? emoji : `${emoji} ${commonName}`;
        labelDiv.textContent = displayText;

        // Color based on status
        labelDiv.style.color = this.getStatusColorHex(status);
        labelDiv.style.fontSize = this.isMobile ? '12px' : '11px';
        labelDiv.style.padding = this.isMobile ? '3px 6px' : '2px 5px';

        const label = new CSS2DObject(labelDiv);

        // Position label slightly above marker
        const labelRadius = 1.08;
        const phi = Math.acos(y / 1.02);
        const theta = Math.atan2(z, -x);

        label.position.set(
            -labelRadius * Math.sin(phi) * Math.cos(theta),
            labelRadius * Math.cos(phi),
            labelRadius * Math.sin(phi) * Math.sin(theta)
        );

        this.globe.add(label);
        this.labels.push(label);
    }

    animateMarker(marker) {
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

    getStatusColorHex(status) {
        const colors = {
            'EX': '#000000',
            'EW': '#9E9E9E',
            'CR': '#D32F2F',
            'EN': '#FF6F00',
            'VU': '#FBC02D',
            'NT': '#66BB6A',
            'LC': '#4CAF50'
        };
        return colors[status] || '#FFFFFF';
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            this.globe.remove(marker);
            marker.geometry.dispose();
            marker.material.dispose();
        });
        this.markers = [];

        this.labels.forEach(label => {
            this.globe.remove(label);
        });
        this.labels = [];
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
        this.isMobile = window.innerWidth < 768;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);

        // Adjust camera distance for mobile
        if (this.isMobile) {
            this.controls.minDistance = 2;
            this.controls.maxDistance = 6;
        } else {
            this.controls.minDistance = 1.5;
            this.controls.maxDistance = 5;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Auto-rotate globe slowly
        this.globe.rotation.y += 0.001;

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }
}
