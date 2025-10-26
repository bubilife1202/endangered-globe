// Simulation Engine for "What If" Scenarios
import { i18n } from './i18n.js';

export class SimulationEngine {
    constructor() {
        this.scenarios = this.getScenarios();
        this.currentScenario = null;
        this.originalData = null;
        this.simulatedData = null;
        this.isSimulating = false;
        this.animationProgress = 0;
    }

    getScenarios() {
        return [
            {
                id: 'climate_change',
                nameKo: '기후변화 +2°C',
                nameEn: 'Climate Change +2°C',
                descKo: '지구 평균 기온이 2°C 상승하면 어떻게 될까요?',
                descEn: 'What if global temperature rises by 2°C?',
                icon: '🌡️',
                effects: {
                    // Status changes (some species get worse)
                    statusChanges: [
                        { from: 'VU', to: 'EN', probability: 0.3 },
                        { from: 'EN', to: 'CR', probability: 0.4 },
                        { from: 'NT', to: 'VU', probability: 0.2 }
                    ],
                    // Population changes (decrease)
                    populationMultiplier: 0.6,
                    // Habitat loss
                    habitatLoss: 0.25,
                    // Affected regions (more in polar and tropical)
                    affectedRegions: ['ANTARCTICA', 'ASIA', 'SOUTH AMERICA', 'AUSTRALIA'],
                    // Timeline
                    timelineYears: 30,
                    // New threats
                    additionalThreats: {
                        ko: '기후변화로 인한 서식지 변화',
                        en: 'Habitat change due to climate change'
                    }
                }
            },
            {
                id: 'conservation_boost',
                nameKo: '보호 정책 강화',
                nameEn: 'Conservation Boost',
                descKo: '전 세계가 보호 예산을 2배로 늘리면?',
                descEn: 'What if global conservation funding doubles?',
                icon: '🛡️',
                effects: {
                    statusChanges: [
                        { from: 'CR', to: 'EN', probability: 0.3 },
                        { from: 'EN', to: 'VU', probability: 0.25 },
                        { from: 'VU', to: 'NT', probability: 0.2 }
                    ],
                    populationMultiplier: 1.5,
                    habitatLoss: -0.15, // Negative means gain
                    affectedRegions: ['ALL'],
                    timelineYears: 15,
                    additionalThreats: {
                        ko: '보호 구역 확대',
                        en: 'Protected area expansion'
                    }
                }
            },
            {
                id: 'habitat_restoration',
                nameKo: '서식지 복원',
                nameEn: 'Habitat Restoration',
                descKo: '주요 서식지를 복원하면?',
                descEn: 'What if we restore critical habitats?',
                icon: '🌳',
                effects: {
                    statusChanges: [
                        { from: 'EN', to: 'VU', probability: 0.35 },
                        { from: 'VU', to: 'NT', probability: 0.3 },
                        { from: 'CR', to: 'EN', probability: 0.2 }
                    ],
                    populationMultiplier: 1.8,
                    habitatLoss: -0.3,
                    affectedRegions: ['AFRICA', 'SOUTH AMERICA', 'ASIA'],
                    timelineYears: 20,
                    additionalThreats: {
                        ko: '서식지 재생 프로그램',
                        en: 'Habitat regeneration program'
                    }
                }
            },
            {
                id: 'worst_case',
                nameKo: '최악의 시나리오',
                nameEn: 'Worst Case Scenario',
                descKo: '아무 조치도 취하지 않으면?',
                descEn: 'What if we do nothing?',
                icon: '⚠️',
                effects: {
                    statusChanges: [
                        { from: 'NT', to: 'VU', probability: 0.5 },
                        { from: 'VU', to: 'EN', probability: 0.5 },
                        { from: 'EN', to: 'CR', probability: 0.6 },
                        { from: 'CR', to: 'EW', probability: 0.3 }
                    ],
                    populationMultiplier: 0.3,
                    habitatLoss: 0.5,
                    affectedRegions: ['ALL'],
                    timelineYears: 50,
                    additionalThreats: {
                        ko: '지속적인 서식지 파괴, 밀렵 증가',
                        en: 'Continued habitat loss, increased poaching'
                    }
                }
            }
        ];
    }

    startSimulation(scenarioId, speciesData) {
        this.currentScenario = this.scenarios.find(s => s.id === scenarioId);
        if (!this.currentScenario) return null;

        // Store original data
        this.originalData = JSON.parse(JSON.stringify(speciesData));
        this.isSimulating = true;
        this.animationProgress = 0;

        // Apply simulation effects
        this.simulatedData = this.applyScenarioEffects(
            JSON.parse(JSON.stringify(speciesData)),
            this.currentScenario.effects
        );

        return {
            original: this.originalData,
            simulated: this.simulatedData,
            scenario: this.currentScenario
        };
    }

    applyScenarioEffects(speciesData, effects) {
        return speciesData.map(species => {
            const modified = { ...species };
            const lang = i18n.getLanguage();

            // Check if this species is in affected region
            const isAffected = effects.affectedRegions.includes('ALL') ||
                             effects.affectedRegions.includes(species.continent);

            if (!isAffected) return modified;

            // Apply status changes
            effects.statusChanges.forEach(change => {
                if (species.status === change.from && Math.random() < change.probability) {
                    modified.status = change.to;
                    modified.statusChanged = true;
                }
            });

            // Apply population changes
            if (species.population) {
                const currentPop = this.parsePopulation(species.population);
                if (currentPop) {
                    const newPop = Math.floor(currentPop * effects.populationMultiplier);
                    modified.population = lang === 'ko' ?
                        `약 ${newPop.toLocaleString()}마리` :
                        `About ${newPop.toLocaleString()}`;
                    modified.populationEn = `About ${newPop.toLocaleString()}`;
                    modified.populationChanged = currentPop !== newPop;
                }
            }

            // Add simulation note
            modified.simulationNote = effects.additionalThreats[lang] || effects.additionalThreats.en;

            // Mark as simulated
            modified.isSimulated = true;

            return modified;
        });
    }

    parsePopulation(popString) {
        // Extract number from population string
        const match = popString.match(/[\d,]+/);
        if (match) {
            return parseInt(match[0].replace(/,/g, ''));
        }
        return null;
    }

    stopSimulation() {
        this.isSimulating = false;
        this.currentScenario = null;
        this.animationProgress = 0;
        const original = this.originalData;
        this.originalData = null;
        this.simulatedData = null;
        return original;
    }

    getSimulationStats() {
        if (!this.isSimulating || !this.originalData || !this.simulatedData) {
            return null;
        }

        const original = this.originalData;
        const simulated = this.simulatedData;

        // Count status changes
        const statusChanges = {
            improved: 0,
            worsened: 0,
            unchanged: 0
        };

        const statusSeverity = {
            'LC': 0, 'NT': 1, 'VU': 2, 'EN': 3, 'CR': 4, 'EW': 5, 'EX': 6
        };

        simulated.forEach((sim, i) => {
            const orig = original[i];
            const origSeverity = statusSeverity[orig.status] || 0;
            const simSeverity = statusSeverity[sim.status] || 0;

            if (simSeverity < origSeverity) {
                statusChanges.improved++;
            } else if (simSeverity > origSeverity) {
                statusChanges.worsened++;
            } else {
                statusChanges.unchanged++;
            }
        });

        // Calculate average population change
        let totalPopChange = 0;
        let popCount = 0;

        simulated.forEach((sim, i) => {
            const orig = original[i];
            const origPop = this.parsePopulation(orig.population || '');
            const simPop = this.parsePopulation(sim.population || '');

            if (origPop && simPop) {
                totalPopChange += ((simPop - origPop) / origPop) * 100;
                popCount++;
            }
        });

        const avgPopChange = popCount > 0 ? totalPopChange / popCount : 0;

        return {
            statusChanges,
            avgPopChange: Math.round(avgPopChange),
            totalSpecies: original.length,
            timeline: this.currentScenario?.effects.timelineYears || 0
        };
    }

    // Animation helper for smooth transitions
    updateAnimationProgress(delta) {
        if (this.isSimulating && this.animationProgress < 1) {
            this.animationProgress = Math.min(1, this.animationProgress + delta);
            return this.animationProgress;
        }
        return 1;
    }

    // Get interpolated data for smooth animation
    getInterpolatedData(progress) {
        if (!this.originalData || !this.simulatedData) return null;

        return this.simulatedData.map((sim, i) => {
            const orig = this.originalData[i];

            // For now, just return either original or simulated based on progress
            // Could add more sophisticated interpolation here
            if (progress < 0.5) {
                return orig;
            } else {
                return sim;
            }
        });
    }
}

export const simulationEngine = new SimulationEngine();
