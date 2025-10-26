// IUCN Red List Data Manager
export class DataManager {
    constructor() {
        this.species = [];
        this.apiKey = null; // Set your IUCN API key here
    }

    /**
     * Initialize data - Load from IUCN API or use sample data
     */
    async initialize() {
        // For now, use sample data
        // In production, replace with actual IUCN API calls
        this.species = this.getSampleData();
        return this.species;
    }

    /**
     * Fetch data from IUCN Red List API
     * Note: Requires API token from https://apiv3.iucnredlist.org/api/v3/token
     */
    async fetchFromIUCN(apiKey) {
        // Example API endpoint:
        // https://apiv3.iucnredlist.org/api/v3/species/page/0?token=YOUR_TOKEN

        try {
            const response = await fetch(
                `https://apiv3.iucnredlist.org/api/v3/species/page/0?token=${apiKey}`
            );
            const data = await response.json();
            return this.processIUCNData(data);
        } catch (error) {
            console.error('Error fetching IUCN data:', error);
            return this.getSampleData();
        }
    }

    /**
     * Process IUCN API response
     */
    processIUCNData(data) {
        // Transform IUCN data to our format
        return data.result.map(species => ({
            name: species.scientific_name,
            commonName: species.main_common_name,
            status: species.category,
            lat: species.lat || 0,
            lng: species.lng || 0,
            year: new Date(species.published_year).getFullYear(),
            threats: this.getThreats(species),
            population: species.population,
            habitat: species.habitat
        }));
    }

    /**
     * Sample data for development and demonstration
     */
    getSampleData() {
        return [
            // Africa
            {
                id: 1,
                name: 'Diceros bicornis',
                commonName: 'Black Rhinoceros',
                commonNameKo: '검은코뿔소',
                status: 'CR',
                lat: -1.2921,
                lng: 36.8219,
                year: 2020,
                threats: '밀렵, 서식지 파괴',
                threatsEn: 'Poaching, habitat loss',
                population: '약 5,500마리',
                populationEn: 'About 5,500',
                habitat: '아프리카 동부 및 남부 사바나',
                habitatEn: 'Eastern and Southern African savannas',
                emoji: '🦏',
                continent: 'AFRICA'
            },
            {
                id: 2,
                name: 'Gorilla beringei',
                commonName: 'Mountain Gorilla',
                commonNameKo: '마운틴고릴라',
                status: 'EN',
                lat: -1.4167,
                lng: 29.5000,
                year: 2018,
                threats: '서식지 손실, 밀렵',
                threatsEn: 'Habitat loss, poaching',
                population: '약 1,000마리',
                populationEn: 'About 1,000',
                habitat: '콩고 분지 산악 지대',
                habitatEn: 'Mountainous forests of Congo Basin',
                emoji: '🦍',
                continent: 'AFRICA'
            },
            {
                id: 3,
                name: 'Pan troglodytes',
                commonName: 'Chimpanzee',
                commonNameKo: '침팬지',
                status: 'EN',
                lat: 6.5244,
                lng: 3.3792,
                year: 2016,
                threats: '서식지 파괴, 질병',
                threatsEn: 'Habitat destruction, disease',
                population: '170,000-300,000마리',
                populationEn: '170,000-300,000',
                habitat: '중앙 아프리카 열대우림',
                habitatEn: 'Central African rainforests',
                emoji: '🐵',
                continent: 'AFRICA'
            },
            {
                id: 15,
                name: 'Raphus cucullatus',
                commonName: 'Dodo',
                commonNameKo: '도도새',
                status: 'EX',
                lat: -20.1609,
                lng: 57.5012,
                year: 1662,
                threats: '인간의 사냥, 외래종',
                threatsEn: 'Human hunting, invasive species',
                population: '멸종 (1662년)',
                populationEn: 'Extinct (1662)',
                habitat: '모리셔스 섬 (과거)',
                habitatEn: 'Mauritius Island (historical)',
                emoji: '🦤',
                continent: 'AFRICA'
            },

            // Asia
            {
                id: 4,
                name: 'Panthera tigris',
                commonName: 'Tiger',
                commonNameKo: '호랑이',
                status: 'EN',
                lat: 27.7172,
                lng: 85.3240,
                year: 2015,
                threats: '밀렵, 서식지 파괴',
                threatsEn: 'Poaching, habitat loss',
                population: '약 3,900마리',
                populationEn: 'About 3,900',
                habitat: '아시아 열대우림 및 타이가',
                habitatEn: 'Asian rainforests and taiga',
                emoji: '🐅',
                continent: 'ASIA'
            },
            {
                id: 5,
                name: 'Ailuropoda melanoleuca',
                commonName: 'Giant Panda',
                commonNameKo: '자이언트판다',
                status: 'VU',
                lat: 30.5728,
                lng: 104.0668,
                year: 2016,
                threats: '서식지 단편화',
                threatsEn: 'Habitat fragmentation',
                population: '약 1,864마리',
                populationEn: 'About 1,864',
                habitat: '중국 서부 산악 대나무 숲',
                habitatEn: 'Western Chinese mountain bamboo forests',
                emoji: '🐼',
                continent: 'ASIA'
            },
            {
                id: 6,
                name: 'Pongo abelii',
                commonName: 'Sumatran Orangutan',
                commonNameKo: '수마트라오랑우탄',
                status: 'CR',
                lat: 2.7500,
                lng: 98.0000,
                year: 2017,
                threats: '팜유 농장으로 인한 서식지 파괴',
                threatsEn: 'Palm oil plantation habitat destruction',
                population: '약 14,600마리',
                populationEn: 'About 14,600',
                habitat: '수마트라 섬 열대우림',
                habitatEn: 'Sumatra Island rainforests',
                emoji: '🦧',
                continent: 'ASIA'
            },
            {
                id: 7,
                name: 'Rhinoceros sondaicus',
                commonName: 'Javan Rhinoceros',
                commonNameKo: '자바코뿔소',
                status: 'CR',
                lat: -6.7610,
                lng: 105.3333,
                year: 2019,
                threats: '서식지 손실, 극소 개체군',
                threatsEn: 'Habitat loss, extremely small population',
                population: '약 74마리',
                populationEn: 'About 74',
                habitat: '자바 섬 우중쿨론 국립공원',
                habitatEn: 'Ujung Kulon National Park, Java',
                emoji: '🦏',
                continent: 'ASIA'
            },
            {
                id: 18,
                name: 'Panthera leo persica',
                commonName: 'Asiatic Lion',
                commonNameKo: '아시아사자',
                status: 'EN',
                lat: 21.1458,
                lng: 70.7697,
                year: 2019,
                threats: '서식지 제한, 질병',
                threatsEn: 'Limited habitat, disease',
                population: '약 674마리',
                populationEn: 'About 674',
                habitat: '인도 기르 숲',
                habitatEn: 'Gir Forest, India',
                emoji: '🦁',
                continent: 'ASIA'
            },
            {
                id: 20,
                name: 'Elephas maximus',
                commonName: 'Asian Elephant',
                commonNameKo: '아시아코끼리',
                status: 'EN',
                lat: 13.7563,
                lng: 100.5018,
                year: 2016,
                threats: '서식지 손실, 인간-코끼리 갈등',
                threatsEn: 'Habitat loss, human-elephant conflict',
                population: '약 40,000-50,000마리',
                populationEn: 'About 40,000-50,000',
                habitat: '남아시아 및 동남아시아',
                habitatEn: 'South and Southeast Asia',
                emoji: '🐘',
                continent: 'ASIA'
            },

            // South America
            {
                id: 8,
                name: 'Tapirus bairdii',
                commonName: "Baird's Tapir",
                commonNameKo: '중앙아메리카맥',
                status: 'EN',
                lat: 9.7489,
                lng: -83.7534,
                year: 2014,
                threats: '서식지 파괴, 사냥',
                threatsEn: 'Habitat destruction, hunting',
                population: '알 수 없음',
                populationEn: 'Unknown',
                habitat: '중앙아메리카 열대우림',
                habitatEn: 'Central American rainforests',
                emoji: '🦌',
                continent: 'SOUTH AMERICA'
            },
            {
                id: 9,
                name: 'Ara glaucogularis',
                commonName: 'Blue-throated Macaw',
                commonNameKo: '블루목앵무',
                status: 'CR',
                lat: -14.8333,
                lng: -64.9000,
                year: 2018,
                threats: '불법 거래, 서식지 손실',
                threatsEn: 'Illegal trade, habitat loss',
                population: '약 250-300마리',
                populationEn: 'About 250-300',
                habitat: '볼리비아 사바나',
                habitatEn: 'Bolivian savannas',
                emoji: '🦜',
                continent: 'SOUTH AMERICA'
            },

            // North America
            {
                id: 10,
                name: 'Ursus maritimus',
                commonName: 'Polar Bear',
                commonNameKo: '북극곰',
                status: 'VU',
                lat: 71.2906,
                lng: -156.7886,
                year: 2015,
                threats: '기후 변화로 인한 해빙 감소',
                threatsEn: 'Sea ice loss due to climate change',
                population: '약 26,000마리',
                populationEn: 'About 26,000',
                habitat: '북극 해빙 지역',
                habitatEn: 'Arctic sea ice regions',
                emoji: '🐻‍❄️',
                continent: 'NORTH AMERICA'
            },
            {
                id: 16,
                name: 'Vaquita',
                commonName: 'Vaquita',
                commonNameKo: '바키타',
                status: 'CR',
                lat: 31.0000,
                lng: -114.5000,
                year: 2022,
                threats: '어망에 의한 혼획',
                threatsEn: 'Bycatch in fishing nets',
                population: '약 10마리',
                populationEn: 'About 10',
                habitat: '캘리포니아만 북부',
                habitatEn: 'Northern Gulf of California',
                emoji: '🐬',
                continent: 'NORTH AMERICA'
            },
            {
                id: 17,
                name: 'Eubalaena glacialis',
                commonName: 'North Atlantic Right Whale',
                commonNameKo: '북대서양참고래',
                status: 'CR',
                lat: 41.5801,
                lng: -69.9761,
                year: 2020,
                threats: '선박 충돌, 어망 얽힘',
                threatsEn: 'Ship strikes, fishing gear entanglement',
                population: '약 336마리',
                populationEn: 'About 336',
                habitat: '북대서양',
                habitatEn: 'North Atlantic Ocean',
                emoji: '🐋',
                continent: 'NORTH AMERICA'
            },

            // Australia/Oceania
            {
                id: 11,
                name: 'Phascolarctos cinereus',
                commonName: 'Koala',
                commonNameKo: '코알라',
                status: 'VU',
                lat: -33.8688,
                lng: 151.2093,
                year: 2016,
                threats: '산불, 서식지 파괴, 질병',
                threatsEn: 'Bushfires, habitat destruction, disease',
                population: '약 100,000-500,000마리',
                populationEn: 'About 100,000-500,000',
                habitat: '호주 동부 유칼립투스 숲',
                habitatEn: 'Eastern Australian eucalyptus forests',
                emoji: '🐨',
                continent: 'AUSTRALIA'
            },
            {
                id: 12,
                name: 'Zaglossus bruijnii',
                commonName: "Western Long-beaked Echidna",
                commonNameKo: '서부긴부리바늘두더지',
                status: 'CR',
                lat: -4.2699,
                lng: 138.0804,
                year: 2016,
                threats: '사냥, 서식지 손실',
                threatsEn: 'Hunting, habitat loss',
                population: '알 수 없음',
                populationEn: 'Unknown',
                habitat: '뉴기니 섬 산악 지대',
                habitatEn: 'New Guinea highlands',
                emoji: '🦔',
                continent: 'AUSTRALIA'
            },
            {
                id: 14,
                name: 'Thylacinus cynocephalus',
                commonName: 'Tasmanian Tiger',
                commonNameKo: '태즈메이니아호랑이',
                status: 'EX',
                lat: -42.8821,
                lng: 147.3272,
                year: 1936,
                threats: '인간의 사냥',
                threatsEn: 'Human hunting',
                population: '멸종 (1936년)',
                populationEn: 'Extinct (1936)',
                habitat: '태즈메이니아 섬 (과거)',
                habitatEn: 'Tasmania (historical)',
                emoji: '🐺',
                continent: 'AUSTRALIA'
            },

            // Europe
            {
                id: 13,
                name: 'Lynx pardinus',
                commonName: 'Iberian Lynx',
                commonNameKo: '이베리아스라소니',
                status: 'EN',
                lat: 38.7223,
                lng: -9.1393,
                year: 2015,
                threats: '먹이 감소, 서식지 단편화',
                threatsEn: 'Prey decline, habitat fragmentation',
                population: '약 400마리',
                populationEn: 'About 400',
                habitat: '이베리아 반도 지중해 관목지',
                habitatEn: 'Iberian Peninsula Mediterranean scrubland',
                emoji: '🐈',
                continent: 'EUROPE'
            },

            // Antarctica/Southern Ocean
            {
                id: 19,
                name: 'Balaenoptera musculus',
                commonName: 'Blue Whale',
                commonNameKo: '대왕고래',
                status: 'EN',
                lat: -60.0000,
                lng: 0.0000,
                year: 2018,
                threats: '과거 포경, 선박 충돌',
                threatsEn: 'Historic whaling, ship strikes',
                population: '약 10,000-25,000마리',
                populationEn: 'About 10,000-25,000',
                habitat: '전 세계 해양',
                habitatEn: 'Global oceans',
                emoji: '🐋',
                continent: 'ANTARCTICA'
            }
        ];
    }

    /**
     * Get threats description
     */
    getThreats(species) {
        // Parse threats from IUCN data
        return species.threats || '데이터 없음';
    }

    /**
     * Filter species by year
     */
    filterByYear(year) {
        return this.species.filter(s => s.year <= year);
    }

    /**
     * Filter species by status
     */
    filterByStatus(statuses) {
        return this.species.filter(s => statuses.includes(s.status));
    }

    /**
     * Filter species by continent
     */
    filterByContinent(continent) {
        if (continent === 'ALL') return this.species;
        return this.species.filter(s => s.continent === continent);
    }

    /**
     * Search species by name
     */
    searchByName(query) {
        const lowerQuery = query.toLowerCase();
        return this.species.filter(s =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.commonName.toLowerCase().includes(lowerQuery) ||
            s.commonNameKo.toLowerCase().includes(lowerQuery)
        );
    }
}
