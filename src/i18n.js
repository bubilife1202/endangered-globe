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
        learnMore: '더 알아보기',
        linkWikipedia: '위키피디아',
        linkNews: '뉴스 검색',
        linkIUCN: 'IUCN 정보',
        threatsTitle: '🚨 왜 위기인가요?',
        habitatTitle: '📍 어디에 사나요?',
        populationTitle: '📊 남은 개체 수',

        // Legend
        legendTitle: '범례',
        legendDescription: 'IUCN 멸종위기등급',

        // Status descriptions
        statusDesc: {
            'EX': '이미 멸종',
            'EW': '야생에서 멸종',
            'CR': '심각한 위험',
            'EN': '멸종 위기',
            'VU': '취약'
        },

        // Timeline
        timelineLabel: '타임라인',

        // Settings
        settingsTitle: '설정',
        labelVisibility: '동물 이름 표시',

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
        learnMore: 'Learn More',
        linkWikipedia: 'Wikipedia',
        linkNews: 'News Search',
        linkIUCN: 'IUCN Info',
        threatsTitle: '🚨 Why Endangered?',
        habitatTitle: '📍 Where Do They Live?',
        populationTitle: '📊 Population Remaining',

        // Legend
        legendTitle: 'Legend',
        legendDescription: 'IUCN Red List Status',

        // Status descriptions
        statusDesc: {
            'EX': 'Already extinct',
            'EW': 'Extinct in the wild',
            'CR': 'Critical risk',
            'EN': 'Endangered',
            'VU': 'Vulnerable'
        },

        // Timeline
        timelineLabel: 'Timeline',

        // Settings
        settingsTitle: 'Settings',
        labelVisibility: 'Show Species Labels',

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
