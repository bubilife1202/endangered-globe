import { Globe } from './globe.js';
import { DataManager } from './data.js';
import { UIController } from './ui.js';
import { simulationEngine } from './simulation.js';

class App {
    constructor() {
        this.globe = null;
        this.dataManager = null;
        this.ui = null;
        this.currentSpecies = [];
        this.simulationActive = false;
    }

    async init() {
        try {
            // Initialize UI
            this.ui = new UIController();
            this.ui.showLoading();

            console.log('Initializing data manager...');
            // Initialize data manager
            this.dataManager = new DataManager();
            await this.dataManager.initialize();
            console.log(`Data loaded: ${this.dataManager.species.length} species`);

            console.log('Initializing 3D globe...');
            // Initialize globe
            const container = document.getElementById('globe-container');
            this.globe = new Globe(container);
            console.log('Globe created successfully');

            // Set up event listeners
            this.setupEventListeners();

            console.log('Updating visualization...');
            // Initial render
            this.updateVisualization();

            // Set initial label visibility from settings
            this.globe.setLabelsVisible(this.ui.getLabelsVisible());

            this.ui.hideLoading();

            console.log('The Living Red List Globe initialized successfully!');
            console.log(`Loaded ${this.dataManager.species.length} species`);
        } catch (error) {
            console.error('Error initializing app:', error);
            this.ui.hideLoading();
            this.ui.showError('초기화 중 오류가 발생했습니다: ' + error.message);
        }
    }

    setupEventListeners() {
        // Globe marker click event
        window.addEventListener('click', (event) => {
            this.globe.onMouseClick(event, (species) => {
                this.ui.showInfoPanel(species);
            });
        });

        // Label click event
        this.globe.onLabelClick = (species) => {
            this.ui.showInfoPanel(species);
        };

        // Year slider change
        this.ui.onYearChange = (year) => {
            this.updateVisualization();
        };

        // Filter change
        this.ui.onFilterChange = () => {
            this.updateVisualization();
        };

        // Search
        this.ui.onSearch = (query) => {
            this.updateVisualization();
        };

        // Language change
        this.ui.onLanguageChange = (lang) => {
            this.globe.updateGeographicLabels();
            this.globe.updateSpeciesLabels();
        };

        // Label visibility change
        this.ui.onLabelVisibilityChange = (visible) => {
            this.globe.setLabelsVisible(visible);
        };

        // Simulation start
        this.ui.onSimulationStart = (scenarioId) => {
            const result = simulationEngine.startSimulation(scenarioId, this.currentSpecies);
            if (result) {
                this.simulationActive = true;
                // Update visualization with simulated data
                this.globe.clearMarkers();
                result.simulated.forEach(species => {
                    this.globe.addSpeciesMarker(species);
                });
                // Update stats
                const stats = simulationEngine.getSimulationStats();
                this.ui.updateSimulationStats(stats);
            }
        };

        // Simulation stop
        this.ui.onSimulationStop = () => {
            const originalData = simulationEngine.stopSimulation();
            this.simulationActive = false;
            // Restore original visualization
            this.updateVisualization();
        };
    }

    updateVisualization() {
        // Get active filters
        const filters = this.ui.getActiveFilters();

        // Start with all species
        let filtered = [...this.dataManager.species];

        // Filter by year
        filtered = filtered.filter(s => s.year <= filters.year);

        // Filter by status
        if (filters.statuses.length > 0) {
            filtered = filtered.filter(s => filters.statuses.includes(s.status));
        }

        // Filter by continent
        if (filters.continent !== 'ALL') {
            filtered = this.dataManager.filterByContinent(filters.continent);
            // Re-apply other filters
            filtered = filtered.filter(s =>
                s.year <= filters.year &&
                filters.statuses.includes(s.status)
            );
        }

        // Filter by search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.commonName.toLowerCase().includes(query)
            );
        }

        // Clear existing markers
        this.globe.clearMarkers();

        // Add new markers
        filtered.forEach(species => {
            this.globe.addSpeciesMarker(species);
        });

        // Update species count
        this.ui.updateSpeciesCount(filtered.length);

        this.currentSpecies = filtered;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting app...');
    const app = new App();
    app.init().catch(error => {
        console.error('Fatal error:', error);
    });

    // Initialize PWA
    initPWA();
});

// PWA Installation and Service Worker
function initPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('[PWA] Service Worker registered:', registration);

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60000); // Check every minute
                })
                .catch(error => {
                    console.error('[PWA] Service Worker registration failed:', error);
                });
        });
    }

    // PWA install prompt
    let deferredPrompt;
    const installPrompt = document.getElementById('pwa-install-prompt');
    const installBtn = document.getElementById('pwa-install-btn');
    const laterBtn = document.getElementById('pwa-later-btn');
    const closeBtn = document.getElementById('pwa-prompt-close');

    // Capture the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] beforeinstallprompt event fired');
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Don't show prompt if user dismissed it recently
        const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (lastDismissed) {
            const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) {
                console.log('[PWA] Prompt dismissed recently, not showing');
                return;
            }
        }

        // Show the install prompt after a delay
        setTimeout(() => {
            if (installPrompt) {
                installPrompt.classList.remove('hidden');
            }
        }, 3000); // Show after 3 seconds
    });

    // Install button click
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) {
                console.log('[PWA] No deferred prompt available');
                return;
            }

            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`[PWA] User response to the install prompt: ${outcome}`);

            // Clear the deferredPrompt
            deferredPrompt = null;

            // Hide the install prompt
            if (installPrompt) {
                installPrompt.classList.add('hidden');
            }
        });
    }

    // Later button click
    if (laterBtn) {
        laterBtn.addEventListener('click', () => {
            if (installPrompt) {
                installPrompt.classList.add('hidden');
                localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
            }
        });
    }

    // Close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (installPrompt) {
                installPrompt.classList.add('hidden');
                localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
            }
        });
    }

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App successfully installed');
        deferredPrompt = null;
        if (installPrompt) {
            installPrompt.classList.add('hidden');
        }
    });

    // Check if app is already installed (iOS/standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        console.log('[PWA] App is running in standalone mode');
        // Hide install prompt if already installed
        if (installPrompt) {
            installPrompt.classList.add('hidden');
        }
    }
}
