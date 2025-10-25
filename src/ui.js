// UI Controller
export class UIController {
    constructor() {
        this.infoPanel = document.getElementById('info-panel');
        this.closeBtn = document.getElementById('close-panel');
        this.yearSlider = document.getElementById('year-slider');
        this.currentYearDisplay = document.getElementById('current-year');
        this.speciesCountDisplay = document.getElementById('species-count');
        this.loading = document.getElementById('loading');

        this.statusFilters = [];
        this.continentFilter = document.getElementById('continent-filter');
        this.searchInput = document.getElementById('species-search');

        this.onYearChange = null;
        this.onFilterChange = null;
        this.onSearch = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Close info panel
        this.closeBtn.addEventListener('click', () => {
            this.hideInfoPanel();
        });

        // Year slider
        this.yearSlider.addEventListener('input', (e) => {
            const year = parseInt(e.target.value);
            this.currentYearDisplay.textContent = year;
            if (this.onYearChange) {
                this.onYearChange(year);
            }
        });

        // Status filters
        const statusCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
        statusCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateStatusFilters();
                if (this.onFilterChange) {
                    this.onFilterChange();
                }
            });
        });

        // Continent filter
        this.continentFilter.addEventListener('change', () => {
            if (this.onFilterChange) {
                this.onFilterChange();
            }
        });

        // Search input
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.onSearch) {
                    this.onSearch(e.target.value);
                }
            }, 300);
        });
    }

    updateStatusFilters() {
        const checkboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
        this.statusFilters = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    getActiveFilters() {
        return {
            statuses: this.statusFilters.length > 0 ? this.statusFilters : ['EX', 'EW', 'CR', 'EN', 'VU'],
            continent: this.continentFilter.value,
            year: parseInt(this.yearSlider.value),
            searchQuery: this.searchInput.value
        };
    }

    showInfoPanel(species) {
        // Populate info panel
        document.getElementById('species-name').textContent = species.commonName;
        document.getElementById('scientific-name').textContent = species.name;

        // Species image/emoji
        const imageContainer = document.getElementById('species-image');
        imageContainer.innerHTML = species.emoji || '🐾';

        // Status badge
        const statusBadge = document.getElementById('status-badge');
        statusBadge.textContent = this.getStatusText(species.status);
        statusBadge.style.background = this.getStatusColor(species.status);

        // Threats
        document.getElementById('threats').textContent = species.threats;

        // Habitat
        document.getElementById('habitat').textContent = species.habitat;

        // Population
        document.getElementById('population').textContent = species.population;

        // Show panel
        this.infoPanel.classList.remove('hidden');
    }

    hideInfoPanel() {
        this.infoPanel.classList.add('hidden');
    }

    getStatusText(status) {
        const statusMap = {
            'EX': 'EX - 멸종 (Extinct)',
            'EW': 'EW - 야생 멸종 (Extinct in the Wild)',
            'CR': 'CR - 위급 (Critically Endangered)',
            'EN': 'EN - 위기 (Endangered)',
            'VU': 'VU - 취약 (Vulnerable)',
            'NT': 'NT - 준위협 (Near Threatened)',
            'LC': 'LC - 관심대상 (Least Concern)'
        };
        return statusMap[status] || status;
    }

    getStatusColor(status) {
        const colors = {
            'EX': '#000000',
            'EW': '#4A4A4A',
            'CR': '#D32F2F',
            'EN': '#FF6F00',
            'VU': '#FBC02D',
            'NT': '#66BB6A',
            'LC': '#4CAF50'
        };
        return colors[status] || '#FFFFFF';
    }

    updateSpeciesCount(count) {
        this.speciesCountDisplay.textContent = count;
    }

    showLoading() {
        this.loading.classList.remove('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showError(message) {
        alert(message);
    }
}
