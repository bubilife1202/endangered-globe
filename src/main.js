import { Globe } from './globe.js';
import { DataManager } from './data.js';
import { UIController } from './ui.js';

class App {
    constructor() {
        this.globe = null;
        this.dataManager = null;
        this.ui = null;
        this.currentSpecies = [];
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
        // Globe click event
        window.addEventListener('click', (event) => {
            this.globe.onMouseClick(event, (species) => {
                this.ui.showInfoPanel(species);
            });
        });

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
});
