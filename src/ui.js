import { i18n } from './i18n.js';

// UI Controller
export class UIController {
    constructor() {
        this.infoPanel = document.getElementById('info-panel');
        this.closeBtn = document.getElementById('close-panel');
        this.yearSlider = document.getElementById('year-slider');
        this.currentYearDisplay = document.getElementById('current-year');
        this.speciesCountDisplay = document.getElementById('species-count');
        this.loading = document.getElementById('loading');

        // Mobile controls
        this.menuToggle = document.getElementById('menu-toggle');
        this.filterPanel = document.getElementById('filter-panel');
        this.filterClose = document.getElementById('filter-close');
        this.legendToggle = document.getElementById('legend-toggle');
        this.legend = document.getElementById('legend');

        // Language toggle
        this.languageToggle = document.getElementById('language-toggle');

        // Settings panel
        this.settingsToggle = document.getElementById('settings-toggle');
        this.settingsPanel = document.getElementById('settings-panel');
        this.labelVisibilityToggle = document.getElementById('label-visibility-toggle');
        this.labelsVisible = localStorage.getItem('labelsVisible') !== 'false'; // Default to true

        this.statusFilters = [];
        this.continentFilter = document.getElementById('continent-filter');
        this.searchInput = document.getElementById('species-search');

        this.onYearChange = null;
        this.onFilterChange = null;
        this.onSearch = null;
        this.onLanguageChange = null;
        this.onLabelVisibilityChange = null;

        this.initializeEventListeners();
        this.initializeMobileControls();
        this.initializeLanguageToggle();
        this.initializeSettingsPanel();
        this.updateStatusFilters(); // Initialize status filters

        // Subscribe to language changes
        i18n.addListener(() => this.updateUILanguage());

        // Initialize UI with current language
        this.updateUILanguage();
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

    initializeLanguageToggle() {
        if (this.languageToggle) {
            const langOptions = this.languageToggle.querySelectorAll('.lang-option');

            langOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const lang = option.dataset.lang;
                    i18n.setLanguage(lang);

                    // Update active state
                    langOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');

                    // Notify globe to update labels
                    if (this.onLanguageChange) {
                        this.onLanguageChange(lang);
                    }
                });
            });

            // Set initial active state
            const currentLang = i18n.getLanguage();
            langOptions.forEach(option => {
                if (option.dataset.lang === currentLang) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
    }

    initializeSettingsPanel() {
        // Settings toggle button
        if (this.settingsToggle) {
            this.settingsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.settingsPanel.classList.toggle('hidden');
            });
        }

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.classList.contains('hidden') &&
                !this.settingsPanel.contains(e.target) &&
                !this.settingsToggle.contains(e.target)) {
                this.settingsPanel.classList.add('hidden');
            }
        });

        // Label visibility toggle
        if (this.labelVisibilityToggle) {
            // Set initial state
            if (this.labelsVisible) {
                this.labelVisibilityToggle.classList.add('active');
            } else {
                this.labelVisibilityToggle.classList.remove('active');
            }

            this.labelVisibilityToggle.addEventListener('click', () => {
                this.labelsVisible = !this.labelsVisible;
                localStorage.setItem('labelsVisible', this.labelsVisible);

                if (this.labelsVisible) {
                    this.labelVisibilityToggle.classList.add('active');
                } else {
                    this.labelVisibilityToggle.classList.remove('active');
                }

                // Notify globe to update label visibility
                if (this.onLabelVisibilityChange) {
                    this.onLabelVisibilityChange(this.labelsVisible);
                }
            });
        }
    }

    getLabelsVisible() {
        return this.labelsVisible;
    }

    updateUILanguage() {
        // Update header
        document.querySelector('.subtitle').textContent = i18n.t('subtitle');

        // Update filter panel
        document.querySelector('.filter-header h3').textContent = i18n.t('filterTitle');
        document.querySelector('#continent-filter-label').textContent = i18n.t('continentFilter');
        document.querySelector('.filter-group label:first-child').textContent = i18n.t('statusFilter');

        // Update search placeholder
        this.searchInput.placeholder = i18n.t('searchPlaceholder');

        // Update legend
        document.querySelector('.legend-title-main').textContent = i18n.t('legendTitle');
        document.querySelector('.legend-title-sub').textContent = i18n.t('legendDescription');

        // Update legend descriptions
        const legendDescs = document.querySelectorAll('.legend-desc');
        legendDescs.forEach(desc => {
            const status = desc.getAttribute('data-status');
            desc.textContent = i18n.t(`statusDesc.${status}`);
        });

        // Update timeline
        document.querySelector('.timeline-label').textContent = i18n.t('timelineLabel');

        // Update loading text
        document.querySelector('.loading p').textContent = i18n.t('loading');

        // Update continent filter options
        const continentOptions = this.continentFilter.querySelectorAll('option');
        continentOptions.forEach(option => {
            const continentKey = option.value;
            option.textContent = i18n.t(`continents.${continentKey}`);
        });

        // Update info panel link labels
        document.querySelector('.info-links h3').textContent = '🔗 ' + i18n.t('learnMore');
        document.querySelector('#link-wikipedia span:last-child').textContent = i18n.t('linkWikipedia');
        document.querySelector('#link-news span:last-child').textContent = i18n.t('linkNews');
        document.querySelector('#link-iucn span:last-child').textContent = i18n.t('linkIUCN');

        // Update info panel section headers
        const infoPanelSections = document.querySelectorAll('.info-section h3');
        if (infoPanelSections.length >= 3) {
            infoPanelSections[0].textContent = i18n.t('threatsTitle');
            infoPanelSections[1].textContent = i18n.t('habitatTitle');
            infoPanelSections[2].textContent = i18n.t('populationTitle');
        }

        // Update settings panel
        const settingsTitle = document.getElementById('settings-title');
        if (settingsTitle) {
            settingsTitle.textContent = i18n.t('settingsTitle');
        }
        const labelVisibilityLabel = document.getElementById('label-visibility-label');
        if (labelVisibilityLabel) {
            labelVisibilityLabel.textContent = i18n.t('labelVisibility');
        }

        // Update close button aria-label
        this.closeBtn.setAttribute('aria-label', i18n.t('closeButton'));
    }

    updateStatusFilters() {
        const checkboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
        this.statusFilters = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    initializeMobileControls() {
        // Hamburger menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => {
                this.menuToggle.classList.toggle('active');
                this.filterPanel.classList.toggle('open');
            });
        }

        // Filter panel close button
        if (this.filterClose) {
            this.filterClose.addEventListener('click', () => {
                this.menuToggle.classList.remove('active');
                this.filterPanel.classList.remove('open');
            });
        }

        // Legend toggle (collapsible)
        if (this.legendToggle) {
            this.legendToggle.addEventListener('click', () => {
                this.legend.classList.toggle('collapsed');
            });
        }

        // Close filter panel when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const isMobile = window.innerWidth < 768;
            if (isMobile &&
                this.filterPanel.classList.contains('open') &&
                !this.filterPanel.contains(e.target) &&
                !this.menuToggle.contains(e.target)) {
                this.menuToggle.classList.remove('active');
                this.filterPanel.classList.remove('open');
            }
        });

        // Touch gestures for info panel (swipe down to close on mobile)
        let startY = 0;
        let currentY = 0;

        this.infoPanel.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });

        this.infoPanel.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            // Allow swipe down to close on mobile
            if (diff > 0 && window.innerWidth < 768) {
                this.infoPanel.style.transform = `translateY(${diff}px)`;
            }
        }, { passive: true });

        this.infoPanel.addEventListener('touchend', () => {
            const diff = currentY - startY;

            if (diff > 100 && window.innerWidth < 768) {
                // Swipe threshold exceeded, close panel
                this.hideInfoPanel();
            }

            // Reset transform
            this.infoPanel.style.transform = '';
            startY = 0;
            currentY = 0;
        });
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
        const currentLang = i18n.getLanguage();

        // Populate info panel with language-specific data
        const commonName = currentLang === 'ko' ? species.commonNameKo : species.commonName;
        document.getElementById('species-name').textContent = commonName;
        document.getElementById('scientific-name').textContent = species.name;

        // Species image/emoji
        const imageContainer = document.getElementById('species-image');
        imageContainer.innerHTML = species.emoji || '🐾';

        // Status badge
        const statusBadge = document.getElementById('status-badge');
        statusBadge.textContent = this.getStatusText(species.status);
        statusBadge.style.background = this.getStatusColor(species.status);

        // Threats (language-specific)
        const threats = currentLang === 'ko' ? species.threats : species.threatsEn;
        document.getElementById('threats').textContent = threats;

        // Habitat (language-specific)
        const habitat = currentLang === 'ko' ? species.habitat : species.habitatEn;
        document.getElementById('habitat').textContent = habitat;

        // Population (language-specific)
        const population = currentLang === 'ko' ? species.population : species.populationEn;
        document.getElementById('population').textContent = population;

        // Update external links
        this.updateExternalLinks(species, currentLang);

        // Show panel
        this.infoPanel.classList.remove('hidden');
    }

    updateExternalLinks(species, lang) {
        // Wikipedia link (using scientific name)
        const wikiLang = lang === 'ko' ? 'ko' : 'en';
        const wikiSearchTerm = encodeURIComponent(species.name);
        const wikiUrl = `https://${wikiLang}.wikipedia.org/wiki/${wikiSearchTerm}`;
        document.getElementById('link-wikipedia').href = wikiUrl;

        // News search link (using common name)
        const searchName = lang === 'ko' ? species.commonNameKo : species.commonName;
        const newsSearchTerm = encodeURIComponent(searchName + ' endangered');
        const newsUrl = `https://www.google.com/search?q=${newsSearchTerm}&tbm=nws`;
        document.getElementById('link-news').href = newsUrl;

        // IUCN Red List link (using scientific name)
        const iucnSearchTerm = encodeURIComponent(species.name);
        const iucnUrl = `https://www.iucnredlist.org/search?query=${iucnSearchTerm}&searchType=species`;
        document.getElementById('link-iucn').href = iucnUrl;
    }

    hideInfoPanel() {
        this.infoPanel.classList.add('hidden');
    }

    getStatusText(status) {
        const currentLang = i18n.getLanguage();
        const statusName = i18n.t(`status.${status}`);

        if (currentLang === 'ko') {
            return `${status} - ${statusName}`;
        } else {
            return `${status} - ${statusName}`;
        }
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
