import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { i18n } from './i18n.js';

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
        this.geoLabels = []; // Store geographic labels separately
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

        // Add geographic labels (continents and oceans)
        this.addGeographicLabels();

        // Create Stars
        this.createStars();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();
    }

    createGlobe() {
        const geometry = new THREE.SphereGeometry(1, 128, 128);

        // Create beautiful earth texture with continents
        const canvas = document.createElement('canvas');
        canvas.width = 4096;  // Higher resolution for better quality
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        // Ocean with gradient (deep to shallow water)
        const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGradient.addColorStop(0, '#0a2e4a');    // Arctic - dark blue
        oceanGradient.addColorStop(0.25, '#1a5f8a'); // North - medium blue
        oceanGradient.addColorStop(0.5, '#2680b8');  // Equator - bright blue
        oceanGradient.addColorStop(0.75, '#1a5f8a'); // South - medium blue
        oceanGradient.addColorStop(1, '#0a2e4a');    // Antarctic - dark blue
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add ocean depth variation (noise)
        this.addOceanTexture(ctx, canvas.width, canvas.height);

        // Draw continents with better colors and details
        this.drawContinents(ctx, canvas.width, canvas.height);

        // Add clouds layer
        this.addClouds(ctx, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create bump map for 3D relief
        const bumpCanvas = this.createBumpMap(canvas.width, canvas.height);
        const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
        bumpTexture.needsUpdate = true;

        // Earth material with enhanced textures
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: bumpTexture,
            bumpScale: 0.005,
            shininess: 15,
            specular: 0x222222,
            transparent: false
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Add beautiful atmosphere glow (multiple layers)
        this.addAtmosphere();

        // Add subtle grid lines
        this.addGridLines();
    }

    addOceanTexture(ctx, width, height) {
        // Add subtle ocean texture for realism
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3;
            ctx.fillStyle = Math.random() > 0.5 ? '#1a4d7a' : '#0d3a5a';
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1.0;
    }

    addClouds(ctx, width, height) {
        // Add realistic cloud layer
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ffffff';

        // Cloud patches
        const cloudCount = 150;
        for (let i = 0; i < cloudCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height * 0.6 + height * 0.2; // Avoid poles
            const size = Math.random() * 100 + 50;

            const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            cloudGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = cloudGradient;
            ctx.fillRect(x - size, y - size/2, size * 2, size);
        }
        ctx.globalAlpha = 1.0;
    }

    createBumpMap(width, height) {
        const bumpCanvas = document.createElement('canvas');
        bumpCanvas.width = width;
        bumpCanvas.height = height;
        const ctx = bumpCanvas.getContext('2d');

        // Base dark color
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Mountains and terrain (lighter areas = higher elevation)
        ctx.fillStyle = '#666666';

        // Add some mountain ranges (simplified)
        const mountainRanges = [
            { lat: 28, lng: 85, size: 30 },   // Himalayas
            { lat: 46, lng: -110, size: 25 }, // Rockies
            { lat: -15, lng: -70, size: 20 }, // Andes
        ];

        mountainRanges.forEach(range => {
            const x = ((range.lng + 180) / 360) * width;
            const y = ((90 - range.lat) / 180) * height;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, range.size);
            gradient.addColorStop(0, '#aaaaaa');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - range.size, y - range.size, range.size * 2, range.size * 2);
        });

        return bumpCanvas;
    }

    addAtmosphere() {
        // Multi-layer atmosphere for better effect
        // Inner glow (thin atmosphere)
        const glow1Geometry = new THREE.SphereGeometry(1.015, 64, 64);
        const glow1Material = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow1 = new THREE.Mesh(glow1Geometry, glow1Material);
        this.globe.add(glow1);

        // Outer glow (thick atmosphere)
        const glow2Geometry = new THREE.SphereGeometry(1.03, 64, 64);
        const glow2Material = new THREE.MeshBasicMaterial({
            color: 0x6699ff,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide
        });
        const glow2 = new THREE.Mesh(glow2Geometry, glow2Material);
        this.globe.add(glow2);

        // Far atmosphere (atmospheric scattering effect)
        const glow3Geometry = new THREE.SphereGeometry(1.05, 64, 64);
        const glow3Material = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide
        });
        const glow3 = new THREE.Mesh(glow3Geometry, glow3Material);
        this.globe.add(glow3);
    }

    drawContinents(ctx, width, height) {
        // First, add terrain features (deserts, forests, etc.)
        this.addTerrainFeatures(ctx, width, height);

        // Draw continents with realistic terrain colors
        const continents = [
            // Africa - varied terrain
            {
                name: 'Africa',
                color: '#6B8E5A',  // Savanna green
                border: '#5a7a4a',
                terrain: 'savanna',
                points: [
                    { lat: 37, lng: 10 }, { lat: 35, lng: 15 }, { lat: 32, lng: 22 },
                    { lat: 30, lng: 32 }, { lat: 15, lng: 43 }, { lat: 12, lng: 51 },
                    { lat: -5, lng: 42 }, { lat: -12, lng: 40 }, { lat: -26, lng: 32 },
                    { lat: -34, lng: 28 }, { lat: -34, lng: 20 }, { lat: -28, lng: 16 },
                    { lat: -18, lng: 12 }, { lat: -5, lng: 13 }, { lat: 5, lng: 9 },
                    { lat: 15, lng: 8 }, { lat: 25, lng: 8 }, { lat: 32, lng: 6 }
                ]
            },
            // Europe - temperate
            {
                name: 'Europe',
                color: '#5D8A66',  // Temperate forest
                border: '#4d7356',
                terrain: 'forest',
                points: [
                    { lat: 71, lng: 25 }, { lat: 70, lng: 30 }, { lat: 60, lng: 30 },
                    { lat: 55, lng: 37 }, { lat: 45, lng: 40 }, { lat: 42, lng: 44 },
                    { lat: 40, lng: 29 }, { lat: 36, lng: 25 }, { lat: 36, lng: 12 },
                    { lat: 40, lng: 8 }, { lat: 43, lng: 3 }, { lat: 48, lng: -5 },
                    { lat: 51, lng: -5 }, { lat: 58, lng: 0 }, { lat: 60, lng: 5 },
                    { lat: 65, lng: 10 }, { lat: 70, lng: 15 }
                ]
            },
            // Asia - diverse terrain
            {
                name: 'Asia',
                color: '#6B8555',  // Mixed terrain
                border: '#5a7345',
                terrain: 'mixed',
                points: [
                    { lat: 75, lng: 60 }, { lat: 78, lng: 90 }, { lat: 73, lng: 125 },
                    { lat: 65, lng: 145 }, { lat: 60, lng: 150 }, { lat: 50, lng: 142 },
                    { lat: 42, lng: 130 }, { lat: 35, lng: 125 }, { lat: 24, lng: 122 },
                    { lat: 20, lng: 110 }, { lat: 10, lng: 105 }, { lat: 1, lng: 103 },
                    { lat: -8, lng: 115 }, { lat: -10, lng: 120 }, { lat: -8, lng: 125 },
                    { lat: 0, lng: 100 }, { lat: 8, lng: 95 }, { lat: 22, lng: 88 },
                    { lat: 28, lng: 85 }, { lat: 32, lng: 75 }, { lat: 25, lng: 68 },
                    { lat: 25, lng: 60 }, { lat: 40, lng: 50 }, { lat: 50, lng: 55 },
                    { lat: 65, lng: 60 }
                ]
            },
            // North America - forests and plains
            {
                name: 'North America',
                color: '#6F9560',  // Prairie/Forest
                border: '#5f8350',
                terrain: 'plains',
                points: [
                    { lat: 72, lng: -95 }, { lat: 75, lng: -85 }, { lat: 72, lng: -70 },
                    { lat: 60, lng: -65 }, { lat: 50, lng: -55 }, { lat: 45, lng: -60 },
                    { lat: 42, lng: -70 }, { lat: 35, lng: -75 }, { lat: 28, lng: -80 },
                    { lat: 25, lng: -82 }, { lat: 20, lng: -85 }, { lat: 15, lng: -88 },
                    { lat: 14, lng: -92 }, { lat: 18, lng: -95 }, { lat: 25, lng: -100 },
                    { lat: 32, lng: -110 }, { lat: 38, lng: -120 }, { lat: 48, lng: -125 },
                    { lat: 55, lng: -130 }, { lat: 60, lng: -135 }, { lat: 65, lng: -140 },
                    { lat: 70, lng: -130 }, { lat: 72, lng: -110 }
                ]
            },
            // South America - rainforest
            {
                name: 'South America',
                color: '#4A7C40',  // Rainforest green
                border: '#3a6c30',
                terrain: 'rainforest',
                points: [
                    { lat: 12, lng: -72 }, { lat: 10, lng: -65 }, { lat: 5, lng: -60 },
                    { lat: -5, lng: -55 }, { lat: -10, lng: -50 }, { lat: -20, lng: -43 },
                    { lat: -30, lng: -48 }, { lat: -40, lng: -62 }, { lat: -50, lng: -70 },
                    { lat: -55, lng: -68 }, { lat: -50, lng: -73 }, { lat: -40, lng: -73 },
                    { lat: -30, lng: -71 }, { lat: -20, lng: -70 }, { lat: -10, lng: -75 },
                    { lat: -5, lng: -78 }, { lat: 0, lng: -79 }, { lat: 5, lng: -77 },
                    { lat: 10, lng: -75 }
                ]
            },
            // Australia - arid/coastal
            {
                name: 'Australia',
                color: '#8B9E6D',  // Arid/scrubland
                border: '#7b8e5d',
                terrain: 'desert',
                points: [
                    { lat: -10, lng: 130 }, { lat: -12, lng: 135 }, { lat: -15, lng: 138 },
                    { lat: -20, lng: 142 }, { lat: -25, lng: 145 }, { lat: -30, lng: 148 },
                    { lat: -35, lng: 150 }, { lat: -38, lng: 148 }, { lat: -37, lng: 145 },
                    { lat: -35, lng: 138 }, { lat: -33, lng: 135 }, { lat: -30, lng: 130 },
                    { lat: -28, lng: 125 }, { lat: -25, lng: 120 }, { lat: -22, lng: 115 },
                    { lat: -18, lng: 122 }, { lat: -14, lng: 128 }
                ]
            },
            // Greenland - ice
            {
                name: 'Greenland',
                color: '#e8f2f0',  // Ice/snow
                border: '#c8d8d0',
                terrain: 'ice',
                points: [
                    { lat: 83, lng: -35 }, { lat: 80, lng: -20 }, { lat: 76, lng: -18 },
                    { lat: 70, lng: -22 }, { lat: 65, lng: -35 }, { lat: 60, lng: -45 },
                    { lat: 65, lng: -50 }, { lat: 70, lng: -52 }, { lat: 75, lng: -55 },
                    { lat: 80, lng: -50 }, { lat: 82, lng: -42 }
                ]
            },
            // Antarctica - ice
            {
                name: 'Antarctica',
                color: '#f5fffe',  // Pure ice
                border: '#e0f0f0',
                terrain: 'ice',
                points: [
                    { lat: -60, lng: -180 }, { lat: -65, lng: -90 }, { lat: -70, lng: 0 },
                    { lat: -65, lng: 90 }, { lat: -60, lng: 180 }, { lat: -85, lng: 0 }
                ]
            }
        ];

        // Draw each continent with terrain-specific styling
        continents.forEach(continent => {
            this.drawContinentWithTerrain(ctx, width, height, continent);
        });

        // Add country borders
        this.drawCountryBorders(ctx, width, height);
    }

    addTerrainFeatures(ctx, width, height) {
        // Sahara Desert (light brown/yellow)
        ctx.fillStyle = '#D4A574';
        const saharaPoints = [
            { lat: 30, lng: -10 }, { lat: 30, lng: 30 }, { lat: 15, lng: 35 },
            { lat: 15, lng: 0 }
        ];
        this.drawTerrainPatch(ctx, width, height, saharaPoints);

        // Amazon Rainforest (dark green)
        ctx.fillStyle = '#2D5016';
        const amazonPoints = [
            { lat: 5, lng: -75 }, { lat: -5, lng: -50 }, { lat: -10, lng: -55 },
            { lat: 0, lng: -80 }
        ];
        this.drawTerrainPatch(ctx, width, height, amazonPoints);

        // Siberian Tundra (light brown)
        ctx.fillStyle = '#A0917B';
        const siberiaPoints = [
            { lat: 70, lng: 60 }, { lat: 70, lng: 120 }, { lat: 60, lng: 140 },
            { lat: 60, lng: 80 }
        ];
        this.drawTerrainPatch(ctx, width, height, siberiaPoints);

        // Gobi Desert (tan)
        ctx.fillStyle = '#C9B896';
        const gobiPoints = [
            { lat: 45, lng: 100 }, { lat: 42, lng: 115 }, { lat: 38, lng: 110 },
            { lat: 40, lng: 95 }
        ];
        this.drawTerrainPatch(ctx, width, height, gobiPoints);

        // Australian Outback (red-brown)
        ctx.fillStyle = '#B8885B';
        const outbackPoints = [
            { lat: -20, lng: 130 }, { lat: -30, lng: 140 }, { lat: -30, lng: 125 },
            { lat: -22, lng: 120 }
        ];
        this.drawTerrainPatch(ctx, width, height, outbackPoints);
    }

    drawTerrainPatch(ctx, width, height, points) {
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
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    drawContinentWithTerrain(ctx, width, height, continent) {
        const { points, color, border, terrain } = continent;
        if (points.length < 3) return;

        // Base color
        ctx.fillStyle = color;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;

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

        // Add texture based on terrain type
        ctx.save();
        ctx.clip();

        switch(terrain) {
            case 'forest':
                this.addForestTexture(ctx, width, height, points);
                break;
            case 'desert':
                this.addDesertTexture(ctx, width, height, points);
                break;
            case 'rainforest':
                this.addRainforestTexture(ctx, width, height, points);
                break;
            case 'savanna':
                this.addSavannaTexture(ctx, width, height, points);
                break;
            case 'plains':
                this.addPlainsTexture(ctx, width, height, points);
                break;
        }

        ctx.restore();

        // Add subtle gradient for depth
        ctx.globalAlpha = 0.1;
        const gradient = ctx.createLinearGradient(0, 0, width/2, height/2);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        points.forEach((point, i) => {
            const x = ((point.lng + 180) / 360) * width;
            const y = ((90 - point.lat) / 180) * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    addForestTexture(ctx, width, height, points) {
        // Add darker green patches for forest
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < 30; i++) {
            const point = points[Math.floor(Math.random() * points.length)];
            const x = ((point.lng + 180) / 360) * width + (Math.random() - 0.5) * 50;
            const y = ((90 - point.lat) / 180) * height + (Math.random() - 0.5) * 50;
            ctx.fillStyle = '#2a5a2a';
            ctx.fillRect(x, y, 10 + Math.random() * 10, 10 + Math.random() * 10);
        }
        ctx.globalAlpha = 1.0;
    }

    addDesertTexture(ctx, width, height, points) {
        // Add sandy/tan patches
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 40; i++) {
            const point = points[Math.floor(Math.random() * points.length)];
            const x = ((point.lng + 180) / 360) * width + (Math.random() - 0.5) * 60;
            const y = ((90 - point.lat) / 180) * height + (Math.random() - 0.5) * 60;
            ctx.fillStyle = Math.random() > 0.5 ? '#C9B896' : '#B8A686';
            ctx.fillRect(x, y, 8 + Math.random() * 8, 8 + Math.random() * 8);
        }
        ctx.globalAlpha = 1.0;
    }

    addRainforestTexture(ctx, width, height, points) {
        // Very dark green patches for dense jungle
        ctx.globalAlpha = 0.25;
        for (let i = 0; i < 50; i++) {
            const point = points[Math.floor(Math.random() * points.length)];
            const x = ((point.lng + 180) / 360) * width + (Math.random() - 0.5) * 40;
            const y = ((90 - point.lat) / 180) * height + (Math.random() - 0.5) * 40;
            ctx.fillStyle = '#1a4010';
            ctx.fillRect(x, y, 6 + Math.random() * 6, 6 + Math.random() * 6);
        }
        ctx.globalAlpha = 1.0;
    }

    addSavannaTexture(ctx, width, height, points) {
        // Yellow-green patches for grassland
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 35; i++) {
            const point = points[Math.floor(Math.random() * points.length)];
            const x = ((point.lng + 180) / 360) * width + (Math.random() - 0.5) * 50;
            const y = ((90 - point.lat) / 180) * height + (Math.random() - 0.5) * 50;
            ctx.fillStyle = Math.random() > 0.5 ? '#8B9E5A' : '#7A8E4A';
            ctx.fillRect(x, y, 9 + Math.random() * 9, 9 + Math.random() * 9);
        }
        ctx.globalAlpha = 1.0;
    }

    addPlainsTexture(ctx, width, height, points) {
        // Light green patches for prairies
        ctx.globalAlpha = 0.12;
        for (let i = 0; i < 30; i++) {
            const point = points[Math.floor(Math.random() * points.length)];
            const x = ((point.lng + 180) / 360) * width + (Math.random() - 0.5) * 55;
            const y = ((90 - point.lat) / 180) * height + (Math.random() - 0.5) * 55;
            ctx.fillStyle = '#6F9E50';
            ctx.fillRect(x, y, 10 + Math.random() * 10, 10 + Math.random() * 10);
        }
        ctx.globalAlpha = 1.0;
    }

    drawCountryBorders(ctx, width, height) {
        ctx.strokeStyle = 'rgba(100, 120, 100, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        const countries = [
            // USA
            [
                { lat: 49, lng: -125 }, { lat: 49, lng: -95 }, { lat: 49, lng: -67 },
                { lat: 45, lng: -67 }, { lat: 40, lng: -74 }, { lat: 32, lng: -117 }
            ],
            // Canada (simplified)
            [
                { lat: 60, lng: -140 }, { lat: 60, lng: -95 }, { lat: 50, lng: -95 },
                { lat: 49, lng: -95 }
            ],
            // Brazil
            [
                { lat: 5, lng: -60 }, { lat: -5, lng: -70 }, { lat: -15, lng: -55 },
                { lat: -20, lng: -45 }, { lat: -30, lng: -50 }
            ],
            // Russia
            [
                { lat: 70, lng: 60 }, { lat: 70, lng: 100 }, { lat: 65, lng: 140 },
                { lat: 50, lng: 142 }
            ],
            // China
            [
                { lat: 45, lng: 85 }, { lat: 42, lng: 125 }, { lat: 30, lng: 120 },
                { lat: 22, lng: 110 }, { lat: 25, lng: 100 }
            ],
            // India
            [
                { lat: 30, lng: 75 }, { lat: 25, lng: 85 }, { lat: 15, lng: 78 },
                { lat: 8, lng: 77 }
            ],
            // Australia (states)
            [
                { lat: -28, lng: 138 }, { lat: -28, lng: 141 }, { lat: -35, lng: 141 }
            ]
        ];

        countries.forEach(country => {
            ctx.beginPath();
            country.forEach((point, i) => {
                const x = ((point.lng + 180) / 360) * width;
                const y = ((90 - point.lat) / 180) * height;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        });

        ctx.setLineDash([]);
    }

    addGeographicLabels() {
        // Define geographic labels with their positions
        this.geoLabelDefinitions = {
            continents: [
                { key: 'AFRICA', lat: 5, lng: 20, size: '18px' },
                { key: 'EUROPE', lat: 55, lng: 15, size: '14px' },
                { key: 'ASIA', lat: 45, lng: 90, size: '20px' },
                { key: 'NORTH AMERICA', lat: 50, lng: -100, size: '16px' },
                { key: 'SOUTH AMERICA', lat: -15, lng: -60, size: '16px' },
                { key: 'AUSTRALIA', lat: -25, lng: 135, size: '14px' },
                { key: 'ANTARCTICA', lat: -75, lng: 0, size: '14px' }
            ],
            oceans: [
                { key: 'PACIFIC OCEAN', lat: 0, lng: -140, size: '16px', color: '#5599cc' },
                { key: 'ATLANTIC OCEAN', lat: 15, lng: -30, size: '16px', color: '#5599cc' },
                { key: 'INDIAN OCEAN', lat: -20, lng: 75, size: '14px', color: '#5599cc' },
                { key: 'ARCTIC OCEAN', lat: 80, lng: 0, size: '12px', color: '#6bb6dd' },
                { key: 'SOUTHERN OCEAN', lat: -65, lng: 90, size: '12px', color: '#6bb6dd' }
            ]
        };

        // Add continent labels
        this.geoLabelDefinitions.continents.forEach(item => {
            const text = i18n.t(`continents.${item.key}`);
            const label = this.addGeoLabel(text, item.lat, item.lng, item.size, '#4a5a3a', 800);
            this.geoLabels.push({ label, definition: item, type: 'continent' });
        });

        // Add ocean labels
        this.geoLabelDefinitions.oceans.forEach(item => {
            const text = i18n.t(`oceans.${item.key}`);
            const label = this.addGeoLabel(text, item.lat, item.lng, item.size, item.color, 600, 'italic');
            this.geoLabels.push({ label, definition: item, type: 'ocean' });
        });
    }

    updateGeographicLabels() {
        // Remove old labels
        this.geoLabels.forEach(({ label }) => {
            this.globe.remove(label);
        });
        this.geoLabels = [];

        // Re-add labels with new language
        this.addGeographicLabels();
    }

    updateSpeciesLabels() {
        // Update species label text based on current language
        const currentLang = i18n.getLanguage();

        this.labels.forEach(label => {
            if (label.userData && label.userData.commonName) {
                const species = label.userData;
                const displayName = currentLang === 'ko' ? species.commonNameKo : species.commonName;
                const displayText = this.isMobile ? species.emoji : `${species.emoji} ${displayName}`;
                label.element.textContent = displayText;
            }
        });
    }

    addGeoLabel(text, lat, lng, fontSize, color, weight = 700, fontStyle = 'normal') {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'geo-label';
        labelDiv.textContent = text;
        labelDiv.style.fontSize = fontSize;
        labelDiv.style.color = color;
        labelDiv.style.fontWeight = weight;
        labelDiv.style.fontStyle = fontStyle;

        const label = new CSS2DObject(labelDiv);

        // Convert lat/lng to 3D coordinates (slightly above surface)
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const radius = 1.01; // Just above surface

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        label.position.set(x, y, z);

        this.globe.add(label);
        this.labels.push(label);

        return label;
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
        const { commonName, commonNameKo, emoji, status } = species;

        // Create label element
        const labelDiv = document.createElement('div');
        labelDiv.className = 'species-label';

        // Get current language and select appropriate name
        const currentLang = i18n.getLanguage();
        const displayName = currentLang === 'ko' ? commonNameKo : commonName;

        // Show emoji on mobile, name on desktop
        const displayText = this.isMobile ? emoji : `${emoji} ${displayName}`;
        labelDiv.textContent = displayText;

        // Store species data for potential updates
        labelDiv.dataset.speciesId = species.id;

        // Color based on status
        labelDiv.style.color = this.getStatusColorHex(status);
        labelDiv.style.fontSize = this.isMobile ? '12px' : '11px';
        labelDiv.style.padding = this.isMobile ? '3px 6px' : '2px 5px';

        const label = new CSS2DObject(labelDiv);
        label.userData = species; // Store species data on label

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
            'EX': '#FFFFFF',  // 멸종 - 흰색 (잘 보이도록)
            'EW': '#CCCCCC',  // 야생 멸종 - 밝은 회색
            'CR': '#FF5555',  // 위급 - 밝은 빨강
            'EN': '#FF8C00',  // 위기 - 주황색
            'VU': '#FFD700',  // 취약 - 금색
            'NT': '#90EE90',  // 준위협 - 연두색
            'LC': '#98FB98'   // 관심대상 - 밝은 녹색
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

        // Update label visibility (only show labels on front side)
        this.updateLabelVisibility();

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    updateLabelVisibility() {
        // Get camera direction
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        // Check all labels (species labels + geographic labels)
        const allLabels = [...this.labels, ...this.geoLabels.map(g => g.label)];

        allLabels.forEach(label => {
            // Get label world position
            const labelWorldPos = new THREE.Vector3();
            label.getWorldPosition(labelWorldPos);

            // Calculate direction from camera to label
            const labelDirection = labelWorldPos.clone().sub(this.camera.position).normalize();

            // Calculate dot product (if negative, label is behind camera)
            const dot = labelDirection.dot(cameraDirection);

            // Also check if label is on the visible hemisphere of the globe
            // by checking if it's facing the camera
            const labelNormal = labelWorldPos.clone().normalize();
            const dotWithCamera = labelNormal.dot(cameraDirection.clone().negate());

            // Show label only if it's in front of camera and on visible side of globe
            if (dot > 0 && dotWithCamera > -0.1) {
                label.element.style.opacity = '1';
                label.element.style.pointerEvents = 'auto';
            } else {
                label.element.style.opacity = '0';
                label.element.style.pointerEvents = 'none';
            }
        });
    }
}
