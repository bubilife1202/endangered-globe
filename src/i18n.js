// Language management system

export const translations = {
    ko: {
        // Header
        title: '🌍 The Living Red List Globe',
        subtitle: '살아있는 멸종위기 지도',

        // Filter panel
        filterTitle: '필터',
        statusFilter: '보호 상태',
        continentFilter: '대륙',
        searchPlaceholder: '종 검색...',

        // Status labels
        status: {
            'EX': '멸종',
            'EW': '야생멸종',
            'CR': '위급',
            'EN': '위기',
            'VU': '취약',
            'NT': '준위협',
            'LC': '관심대상'
        },

        // Continents
        continents: {
            'AFRICA': '아프리카',
            'EUROPE': '유럽',
            'ASIA': '아시아',
            'NORTH AMERICA': '북아메리카',
            'SOUTH AMERICA': '남아메리카',
            'AUSTRALIA': '오세아니아',
            'ANTARCTICA': '남극',
            'ALL': '전체'
        },

        // Oceans
        oceans: {
            'PACIFIC OCEAN': '태평양',
            'ATLANTIC OCEAN': '대서양',
            'INDIAN OCEAN': '인도양',
            'ARCTIC OCEAN': '북극해',
            'SOUTHERN OCEAN': '남극해'
        },

        // Info panel
        commonName: '일반명',
        scientificName: '학명',
        location: '위치',
        year: '년도',
        closeButton: '닫기',

        // Legend
        legendTitle: '범례',

        // Timeline
        timelineLabel: '타임라인',

        // Loading
        loading: '데이터 불러오는 중...'
    },

    en: {
        // Header
        title: '🌍 The Living Red List Globe',
        subtitle: 'Interactive Endangered Species Map',

        // Filter panel
        filterTitle: 'Filters',
        statusFilter: 'Conservation Status',
        continentFilter: 'Continent',
        searchPlaceholder: 'Search species...',

        // Status labels
        status: {
            'EX': 'Extinct',
            'EW': 'Extinct in Wild',
            'CR': 'Critically Endangered',
            'EN': 'Endangered',
            'VU': 'Vulnerable',
            'NT': 'Near Threatened',
            'LC': 'Least Concern'
        },

        // Continents
        continents: {
            'AFRICA': 'Africa',
            'EUROPE': 'Europe',
            'ASIA': 'Asia',
            'NORTH AMERICA': 'North America',
            'SOUTH AMERICA': 'South America',
            'AUSTRALIA': 'Australia',
            'ANTARCTICA': 'Antarctica',
            'ALL': 'All'
        },

        // Oceans
        oceans: {
            'PACIFIC OCEAN': 'Pacific Ocean',
            'ATLANTIC OCEAN': 'Atlantic Ocean',
            'INDIAN OCEAN': 'Indian Ocean',
            'ARCTIC OCEAN': 'Arctic Ocean',
            'SOUTHERN OCEAN': 'Southern Ocean'
        },

        // Info panel
        commonName: 'Common Name',
        scientificName: 'Scientific Name',
        location: 'Location',
        year: 'Year',
        closeButton: 'Close',

        // Legend
        legendTitle: 'Legend',

        // Timeline
        timelineLabel: 'Timeline',

        // Loading
        loading: 'Loading data...'
    }
};

export class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'ko';
        this.listeners = [];
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.notifyListeners();
        }
    }

    getLanguage() {
        return this.currentLanguage;
    }

    t(key) {
        const keys = key.split('.');
        let value = translations[this.currentLanguage];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentLanguage));
    }
}

export const i18n = new I18n();
