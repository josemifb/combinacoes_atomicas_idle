/**
 * ARQUIVO: js/missions.js
 * FINALIDADE: 50 Missões com substituição dinâmica anti-autocompletar,
 *             Loja com Expansão Offline, Sorte Quântica e Salto Temporal (1h).
 */

class SaveManager {
    static SAVE_KEY = 'atomic_fusion_local_save_v2';
    static isResetting = false;

    static hasSave() {
        try {
            const raw = localStorage.getItem(SaveManager.SAVE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            return !!(data && (data.coins > 15 || data.currentMissionIndex > 0 || (data.slots && data.slots.some(s => s !== null))));
        } catch (e) {
            return false;
        }
    }

    static save() {
        if (SaveManager.isResetting) return;
        if (!window.gameEngine || !window.fusionGrid || !window.missionManager) return;

        const currentName = localStorage.getItem('particle_idle_player_name') || "Dr. Hélio";

        const payload = {
            timestamp: Date.now(),
            playerName: currentName,
            coins: Number(window.gameEngine.coins) || 0,
            photons: Number(window.gameEngine.photons) || 0,
            prestigeLevel: window.gameEngine.prestigeLevel,
            speedBonus: window.gameEngine.speedBonus,
            detectorsCount: window.gameEngine.detectors.length,
            buffTimers: window.gameEngine.buffTimers,
            playerLevel: window.missionManager.playerLevel,
            currentMissionIndex: window.missionManager.currentMissionIndex,
            fusionLevel: window.missionManager.fusionLevel,
            currentInjectorZ: window.missionManager.currentInjectorZ,
            atomPurchases: window.missionManager.atomPurchases,
            injectorUpgrades: window.missionManager.injectorUpgrades,
            speedPurchases: window.missionManager.speedPurchases,
            detectorPurchases: window.missionManager.detectorPurchases,
            protonPurchases: window.missionManager.protonPurchases,
            maxProtonsSynthesized: window.missionManager.maxProtonsSynthesized,
            totalFusions: window.missionManager.totalFusions,
            totalSold: window.missionManager.totalSold,
            slots: window.fusionGrid.slots.map(s => s ? { protons: s.protons } : null),
            activeBounty: window.missionManager.activeBounty,
            bountyProgress: window.missionManager.bountyProgress,
            offlineHoursLevel: window.missionManager.offlineHoursLevel || 0,
            quantumLuckLevel: window.missionManager.quantumLuckLevel || 0,
            dynamicSubstitute: window.missionManager.dynamicSubstitute || null
        };

        try {
            localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.error("[ERRO SAVE]:", e);
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(SaveManager.SAVE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);

            if (data.playerName) {
                try {
                    localStorage.setItem('particle_idle_player_name', data.playerName);
                    const elName = document.getElementById('display-player-name');
                    if (elName) elName.textContent = data.playerName;
                } catch (e) {}
            }

            window.gameEngine.coins = Number(data.coins) || 0;
            window.gameEngine.photons = Number(data.photons) || 0;
            window.gameEngine.prestigeLevel = data.prestigeLevel || 0;
            window.gameEngine.speedBonus = data.speedBonus || 0;
            if (data.buffTimers) window.gameEngine.buffTimers = data.buffTimers;

            const detCount = Math.min(10, Math.max(1, data.detectorsCount || 1));
            window.gameEngine.detectors = [];
            for (let i = 0; i < detCount; i++) {
                window.gameEngine.detectors.push({
                    angle: (i * (Math.PI * 2)) / detCount,
                    pulseTimer: 0,
                    label: `DET-${String(i + 1).padStart(2, '0')}`
                });
            }

            window.missionManager.playerLevel = data.playerLevel || 1;
            window.missionManager.currentMissionIndex = data.currentMissionIndex || 0;
            window.missionManager.fusionLevel = data.fusionLevel || 1;
            window.missionManager.currentInjectorZ = data.currentInjectorZ || 1;
            window.missionManager.atomPurchases = data.atomPurchases || 0;
            window.missionManager.injectorUpgrades = data.injectorUpgrades || 0;
            window.missionManager.speedPurchases = data.speedPurchases || 0;
            window.missionManager.detectorPurchases = data.detectorPurchases || 0;
            window.missionManager.protonPurchases = data.protonPurchases || 0;
            window.missionManager.maxProtonsSynthesized = data.maxProtonsSynthesized || 1;
            window.missionManager.totalFusions = data.totalFusions || 0;
            window.missionManager.totalSold = data.totalSold || 0;

            window.missionManager.offlineHoursLevel = data.offlineHoursLevel || 0;
            window.missionManager.quantumLuckLevel = data.quantumLuckLevel || 0;
            window.missionManager.dynamicSubstitute = data.dynamicSubstitute || null;

            window.missionManager.applyPermanentUpgrades();

            if (data.activeBounty) window.missionManager.activeBounty = data.activeBounty;
            if (typeof data.bountyProgress === 'number') window.missionManager.bountyProgress = data.bountyProgress;

            if (Array.isArray(data.slots)) {
                data.slots.forEach((s, idx) => {
                    if (s && ATOM_REGISTRY[s.protons]) {
                        window.fusionGrid.slots[idx] = {
                            protons: s.protons,
                            uuid: Math.random().toString(36).substr(2, 9)
                        };
                    } else {
                        window.fusionGrid.slots[idx] = null;
                    }
                });
            }

            const now = Date.now();
            const maxAllowedSeconds = (window.gameEngine.maxOfflineHours || 1.0) * 3600;
            const elapsed = Math.min(maxAllowedSeconds, Math.max(0, (now - (data.timestamp || now)) / 1000));
            if (elapsed > 10) {
                const activeAtoms = window.fusionGrid.slots.filter(s => s !== null);
                const massSum = activeAtoms.reduce((acc, curr) => acc + (ATOM_REGISTRY[curr.protons]?.mass || 0), 0);

                if (massSum > 0) {
                    const revPerSec = (massSum * (window.gameEngine.prestigeLevel + 1) * detCount) * 0.12;
                    const offlineEarned = Math.floor(revPerSec * elapsed);
                    window.gameEngine.coins += offlineEarned;

                    setTimeout(() => {
                        window.missionManager.showToast(i18n.currentLang === 'pt'
                            ? `BEM-VINDO DE VOLTA! +${formatQuantumNumber(offlineEarned)} ⚛️ gerados offline (${Math.round(elapsed / 60)}m)!`
                            : `WELCOME BACK! +${formatQuantumNumber(offlineEarned)} ⚛️ generated offline (${Math.round(elapsed / 60)}m)!`
                        );
                    }, 800);
                }
            }

            window.fusionGrid.renderSlots();
            window.fusionGrid.syncWithAccelerator();
            window.gameEngine.updateHud();
            window.missionManager.updateHUD();
            window.missionManager.updateUpgradesUI();
            SaveManager.updateEmergencyButtonState();
            return true;
        } catch (e) {
            console.error("[FALHA LOAD]:", e);
            return false;
        }
    }

    static updateEmergencyButtonState() {
        const btnEmergency = document.getElementById('btn-emergency-inject');
        if (!btnEmergency || !window.fusionGrid) return;

        const count = window.fusionGrid.countActiveAtoms();
        if (count === 0) {
            btnEmergency.disabled = false;
            btnEmergency.textContent = i18n.currentLang === 'pt' ? "INJETAR H — Z=1 DE EMERGÊNCIA" : "INJECT EMERGENCY H — Z=1";
        } else {
            btnEmergency.disabled = true;
            btnEmergency.textContent = i18n.currentLang === 'pt' ? "🔒 CÂMARA EM OPERAÇÃO" : "🔒 CHAMBER ACTIVE";
        }
    }

    static emergencyInject() {
        if (!window.fusionGrid) return;

        if (window.fusionGrid.countActiveAtoms() > 0) {
            if (window.missionManager) {
                window.missionManager.showToast(i18n.currentLang === 'pt' 
                    ? "Negado! A câmara já possui átomos ativos." 
                    : "Denied! Chamber already has active atoms."
                );
            }
            SaveManager.updateEmergencyButtonState();
            return;
        }

        window.fusionGrid.addAtomToSlot(0, 1);
        SaveManager.updateEmergencyButtonState();
        SaveManager.save();

        if (window.missionManager) {
            window.missionManager.showToast(i18n.currentLang === 'pt' 
                ? "Hidrogênio (1H) injetado com sucesso!" 
                : "Hydrogen (1H) injected successfully!"
            );
        }
    }

    static resetAll() {
        const confirmMsg = i18n.currentLang === 'pt'
            ? "ATENÇÃO: Isso apagará TODO o seu progresso e credenciais, retornando ao diálogo inicial. Deseja continuar?"
            : "WARNING: This will erase ALL your progress and credentials, returning to the intro dialogue. Continue?";

        if (confirm(confirmMsg)) {
            SaveManager.isResetting = true;
            localStorage.removeItem(SaveManager.SAVE_KEY);
            localStorage.removeItem('particle_idle_player_name');
            window.location.reload();
        }
    }
}

window.atomicLegacySaveInterval = setInterval(() => SaveManager.save(), 5000);
window.atomicLegacyBeforeUnload = () => SaveManager.save();
window.addEventListener('beforeunload', window.atomicLegacyBeforeUnload);

class MissionManager {
    constructor() {
        this.playerLevel = 1;
        this.currentMissionIndex = 0;
        this.fusionLevel = 1;
        this.currentInjectorZ = 1;

        this.atomPurchases = 0;
        this.injectorUpgrades = 0;
        this.speedPurchases = 0;
        this.detectorPurchases = 0;
        this.protonPurchases = 0;

        this.maxProtonsSynthesized = 1;
        this.totalFusions = 0;
        this.totalDetections = 0;
        this.totalSold = 0;

        this.offlineHoursLevel = 0;
        this.quantumLuckLevel = 0;
        this.dynamicSubstitute = null;

        this.fusionTiers = [
            { level: 1, reqPlayerLv: 1,  maxZ: 2,   cost: 0,           name: "Hélio (He)" },
            { level: 2, reqPlayerLv: 4,  maxZ: 6,   cost: 250,         name: "Carbono (C)" },
            { level: 3, reqPlayerLv: 8,  maxZ: 12,  cost: 2500,        name: "Magnésio (Mg)" },
            { level: 4, reqPlayerLv: 15, maxZ: 26,  cost: 28000,       name: "Ferro (Fe)" },
            { level: 5, reqPlayerLv: 23, maxZ: 31,  cost: 190000,      name: "Gálio (Ga)" },
            { level: 6, reqPlayerLv: 26, maxZ: 36,  cost: 550000,      name: "Criptônio (Kr)" },
            { level: 7, reqPlayerLv: 29, maxZ: 42,  cost: 1800000,     name: "Molibdênio (Mo)" },
            { level: 8, reqPlayerLv: 32, maxZ: 48,  cost: 5500000,     name: "Cádmio (Cd)" },
            { level: 9, reqPlayerLv: 35, maxZ: 54,  cost: 16000000,    name: "Xenônio (Xe)" },
            { level: 10, reqPlayerLv: 38, maxZ: 64, cost: 48000000,    name: "Gadolínio (Gd)" },
            { level: 11, reqPlayerLv: 41, maxZ: 74, cost: 140000000,   name: "Tungstênio (W)" },
            { level: 12, reqPlayerLv: 44, maxZ: 84, cost: 420000000,   name: "Polônio (Po)" },
            { level: 13, reqPlayerLv: 47, maxZ: 100,cost: 1250000000,  name: "Férmio (Fm)" },
            { level: 14, reqPlayerLv: 49, maxZ: 118,cost: 3800000000,  name: "Oganessônio (Og)" }
        ];

        this.speedTiers = [
            { purchaseIndex: 0, reqLv: 3,  cost: 180 },
            { purchaseIndex: 1, reqLv: 7,  cost: 950 },
            { purchaseIndex: 2, reqLv: 12, cost: 5400 },
            { purchaseIndex: 3, reqLv: 17, cost: 32000 },
            { purchaseIndex: 4, reqLv: 22, cost: 190000 },
            { purchaseIndex: 5, reqLv: 27, cost: 1200000 },
            { purchaseIndex: 6, reqLv: 32, cost: 7800000 },
            { purchaseIndex: 7, reqLv: 37, cost: 48000000 },
            { purchaseIndex: 8, reqLv: 42, cost: 310000000 },
            { purchaseIndex: 9, reqLv: 47, cost: 2000000000 }
        ];

        this.detectorTiers = [
            { purchaseIndex: 0, reqLv: 2,  cost: 120 },
            { purchaseIndex: 1, reqLv: 6,  cost: 800 },
            { purchaseIndex: 2, reqLv: 11, cost: 4500 },
            { purchaseIndex: 3, reqLv: 16, cost: 28000 },
            { purchaseIndex: 4, reqLv: 21, cost: 180000 },
            { purchaseIndex: 5, reqLv: 28, cost: 1100000 },
            { purchaseIndex: 6, reqLv: 35, cost: 8500000 },
            { purchaseIndex: 7, reqLv: 41, cost: 65000000 },
            { purchaseIndex: 8, reqLv: 46, cost: 550000000 }
        ];

        this.missions = [
            { id: 1, pt: "Gerar 50 Moedas no Acelerador", en: "Generate 50 Coins in Accelerator",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.coins / 50) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.coins >= 50 },

            { id: 2, pt: "Instalar o 2º Detector Laser", en: "Install 2nd Laser Detector",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.detectors.length / 2) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.detectors.length >= 2 },

            { id: 3, pt: "Injetar um 2º átomo no circuito", en: "Inject a 2nd atom into loop",
              getProgress: () => Math.min(100, (this.countActiveAtoms() / 2) * 100),
              check: () => this.countActiveAtoms() >= 2 },

            { id: 4, pt: "Síntese abstrata: H — Z=1 + H — Z=1 → He — Z=2", en: "Abstract synthesis: H — Z=1 + H — Z=1 → He — Z=2",
              getProgress: () => this.hasReaction?.(1, 1, 2) ? 100 : 0,
              check: () => Boolean(this.hasReaction?.(1, 1, 2)) },

            { id: 5, pt: "Evoluir o AURORA para Síntese Nível 2", en: "Upgrade AURORA to Synthesis Level 2",
              getProgress: () => this.fusionLevel >= 2 ? 100 : 0,
              check: () => this.fusionLevel >= 2 },

            { id: 6, pt: "Aumentar Velocidade Orbital (+10%)", en: "Increase Orbital Speed (+10%)",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.speedBonus / 0.10) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.speedBonus >= 0.10 },

            { id: 7, pt: "Fundir Hélios: 2He + 2He -> 4Be", en: "Fuse Heliums: 2He + 2He -> 4Be",
              getProgress: () => this.maxProtonsSynthesized >= 4 ? 100 : 0,
              check: () => this.maxProtonsSynthesized >= 4 },

            { id: 8, pt: "Instalar o 3º Detector Laser", en: "Install 3rd Laser Detector",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.detectors.length / 3) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.detectors.length >= 3 },

            { id: 9, pt: "Comprar 1 Próton (1H) na Loja", en: "Buy 1 Proton (1H) in Shop",
              getProgress: () => this.protonPurchases >= 1 ? 100 : 0,
              check: () => this.protonPurchases >= 1 },

            { id: 10, pt: "Evoluir o AURORA para Síntese Nível 3", en: "Upgrade AURORA to Synthesis Level 3",
              getProgress: () => this.fusionLevel >= 3 ? 100 : 0,
              check: () => this.fusionLevel >= 3 },

            { id: 11, pt: "Fundir Próton com Berílio: 4Be + 1H -> 5B", en: "Fuse Proton with Beryllium: 4Be + 1H -> 5B",
              getProgress: () => this.maxProtonsSynthesized >= 5 ? 100 : 0,
              check: () => this.maxProtonsSynthesized >= 5 },

            { id: 12, pt: "Melhorar Injetor para Hélio (Z=2)", en: "Upgrade Injector to Helium (Z=2)",
              getProgress: () => this.currentInjectorZ >= 2 ? 100 : 0,
              check: () => this.currentInjectorZ >= 2 },

            { id: 13, pt: "Aumentar Velocidade Orbital (+20%)", en: "Increase Orbital Speed (+20%)",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.speedBonus / 0.20) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.speedBonus >= 0.20 },

            { id: 14, pt: "Vender 1 átomo sobressalente na câmara", en: "Sell 1 spare atom in chamber",
              getProgress: () => this.totalSold >= 1 ? 100 : 0,
              check: () => this.totalSold >= 1 },

            { id: 15, pt: "Sintetizar Oxigênio (8O)", en: "Synthesize Oxygen (8O)",
              getProgress: () => this.maxProtonsSynthesized >= 8 ? 100 : (this.maxProtonsSynthesized / 8) * 100,
              check: () => this.maxProtonsSynthesized >= 8 },

            { id: 16, pt: "Instalar o 4º Detector Laser", en: "Install 4th Laser Detector",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.detectors.length / 4) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.detectors.length >= 4 },

            { id: 17, pt: "Evoluir o AURORA para Síntese Nível 4", en: "Upgrade AURORA to Synthesis Level 4",
              getProgress: () => this.fusionLevel >= 4 ? 100 : 0,
              check: () => this.fusionLevel >= 4 },

            { id: 18, pt: "Acumular 15.000 Moedas Quânticas", en: "Accumulate 15,000 Quantum Coins",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.coins / 15000) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.coins >= 15000 },

            { id: 19, pt: "Realizar 15 Fusões Atômicas no total", en: "Perform 15 Total Atomic Fusions",
              getProgress: () => Math.min(100, (this.totalFusions / 15) * 100),
              check: () => this.totalFusions >= 15 },

            { id: 20, pt: "Sintetizar Magnésio (12Mg)", en: "Synthesize Magnesium (12Mg)",
              getProgress: () => Math.min(100, (this.maxProtonsSynthesized / 12) * 100),
              check: () => this.maxProtonsSynthesized >= 12 },

            { id: 21, pt: "Aumentar Velocidade Orbital (+30%)", en: "Increase Orbital Speed (+30%)",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.speedBonus / 0.30) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.speedBonus >= 0.30 },

            { id: 22, pt: "Fundir Enxofre: 8O + 8O -> 16S", en: "Fuse Sulfur: 8O + 8O -> 16S",
              getProgress: () => this.maxProtonsSynthesized >= 16 ? 100 : (this.maxProtonsSynthesized / 16) * 100,
              check: () => this.maxProtonsSynthesized >= 16 },

            { id: 23, pt: "Melhorar Injetor para Carbono (Z=6)", en: "Upgrade Injector to Carbon (Z=6)",
              getProgress: () => this.currentInjectorZ >= 6 ? 100 : (this.currentInjectorZ / 6) * 100,
              check: () => this.currentInjectorZ >= 6 },

            { id: 24, pt: "Instalar o 5º Detector Laser", en: "Install 5th Laser Detector",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.detectors.length / 5) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.detectors.length >= 5 },

            { id: 25, pt: "Evoluir o AURORA para Síntese Nível 5", en: "Upgrade AURORA to Synthesis Level 5",
              getProgress: () => this.fusionLevel >= 5 ? 100 : 0,
              check: () => this.fusionLevel >= 5 },

            { id: 26, pt: "Manter 6 átomos no circuito", en: "Hold 6 atoms in loop",
              getProgress: () => Math.min(100, (this.countActiveAtoms() / 6) * 100),
              check: () => this.countActiveAtoms() >= 6 },

            { id: 27, pt: "Sintetizar Cálcio (20Ca)", en: "Synthesize Calcium (20Ca)",
              getProgress: () => Math.min(100, (this.maxProtonsSynthesized / 20) * 100),
              check: () => this.maxProtonsSynthesized >= 20 },

            { id: 28, pt: "Acumular 100.000 Moedas Quânticas", en: "Accumulate 100,000 Quantum Coins",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.coins / 100000) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.coins >= 100000 },

            { id: 29, pt: "Sintetizar Ferro (26Fe)", en: "Synthesize Iron (26Fe)",
              getProgress: () => Math.min(100, (this.maxProtonsSynthesized / 26) * 100),
              check: () => this.maxProtonsSynthesized >= 26 },

            { id: 30, pt: "Aumentar Velocidade Orbital (+40%)", en: "Increase Orbital Speed (+40%)",
              getProgress: () => window.gameEngine ? Math.min(100, (window.gameEngine.speedBonus / 0.40) * 100) : 0,
              check: () => window.gameEngine && window.gameEngine.speedBonus >= 0.40 },

            // Pós-ferro: cada alvo só aparece depois da AURORA e dos dois
            // módulos alcançarem a faixa que realmente permite produzi-lo.
            { id:31, pt:"Instalar os dois módulos pós-ferro no Tier 1", en:"Install both post-iron modules at Tier 1", getProgress:()=>Math.min(100,Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)*100), check:()=>Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)>=1 },
            { id:32, pt:"Sintetizar Gálio — Z=31", en:"Synthesize Gallium — Z=31", getProgress:()=>Math.min(100,this.maxProtonsSynthesized/31*100), check:()=>this.maxProtonsSynthesized>=31 },
            { id:33, pt:"Evoluir a AURORA para Síntese Nível 6", en:"Upgrade AURORA to Synthesis Level 6", getProgress:()=>this.fusionLevel>=6?100:0, check:()=>this.fusionLevel>=6 },
            { id:34, pt:"Elevar os dois módulos ao Tier 2", en:"Raise both modules to Tier 2", getProgress:()=>Math.min(100,Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)/2*100), check:()=>Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)>=2 },
            { id:35, pt:"Sintetizar Criptônio — Z=36", en:"Synthesize Krypton — Z=36", getProgress:()=>Math.min(100,this.maxProtonsSynthesized/36*100), check:()=>this.maxProtonsSynthesized>=36 },
            { id:36, pt:"Evoluir a AURORA para Síntese Nível 8", en:"Upgrade AURORA to Synthesis Level 8", getProgress:()=>Math.min(100,this.fusionLevel/8*100), check:()=>this.fusionLevel>=8 },
            { id:37, pt:"Elevar os dois módulos ao Tier 4", en:"Raise both modules to Tier 4", getProgress:()=>Math.min(100,Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)/4*100), check:()=>Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)>=4 },
            { id:38, pt:"Sintetizar Cádmio — Z=48", en:"Synthesize Cadmium — Z=48", getProgress:()=>Math.min(100,this.maxProtonsSynthesized/48*100), check:()=>this.maxProtonsSynthesized>=48 },
            { id:39, pt:"Evoluir a AURORA para Síntese Nível 10", en:"Upgrade AURORA to Synthesis Level 10", getProgress:()=>Math.min(100,this.fusionLevel/10*100), check:()=>this.fusionLevel>=10 },
            { id:40, pt:"Elevar os dois módulos ao Tier 6", en:"Raise both modules to Tier 6", getProgress:()=>Math.min(100,Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)/6*100), check:()=>Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)>=6 },
            { id:41, pt:"Sintetizar Gadolínio — Z=64", en:"Synthesize Gadolinium — Z=64", getProgress:()=>Math.min(100,this.maxProtonsSynthesized/64*100), check:()=>this.maxProtonsSynthesized>=64 },
            { id:42, pt:"Evoluir a AURORA para Síntese Nível 11", en:"Upgrade AURORA to Synthesis Level 11", getProgress:()=>Math.min(100,this.fusionLevel/11*100), check:()=>this.fusionLevel>=11 },
            { id:43, pt:"Elevar os dois módulos ao Tier 7", en:"Raise both modules to Tier 7", getProgress:()=>Math.min(100,Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)/7*100), check:()=>Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)>=7 },
            { id:44, pt:"Sintetizar Tungstênio — Z=74", en:"Synthesize Tungsten — Z=74", getProgress:()=>Math.min(100,this.maxProtonsSynthesized/74*100), check:()=>this.maxProtonsSynthesized>=74 },
            { id:45, pt:"Evoluir a AURORA para Síntese Nível 12", en:"Upgrade AURORA to Synthesis Level 12", getProgress:()=>Math.min(100,this.fusionLevel/12*100), check:()=>this.fusionLevel>=12 },
            { id:46, pt:"Elevar os dois módulos ao Tier 8", en:"Raise both modules to Tier 8", getProgress:()=>Math.min(100,Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)/8*100), check:()=>Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)>=8 },
            { id:47, pt:"Sintetizar Polônio — Z=84", en:"Synthesize Polonium — Z=84", getProgress:()=>Math.min(100,this.maxProtonsSynthesized/84*100), check:()=>this.maxProtonsSynthesized>=84 },
            { id:48, pt:"AURORA N13, módulos Tier 9 e Férmio — Z=100", en:"AURORA L13, Tier 9 modules and Fermium — Z=100", getProgress:()=>Math.min(100,Math.min(this.fusionLevel/13,Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)/9,this.maxProtonsSynthesized/100)*100), check:()=>this.fusionLevel>=13&&Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)>=9&&this.maxProtonsSynthesized>=100 },
            { id:49, pt:"Evoluir a AURORA para Síntese Nível 14", en:"Upgrade AURORA to Synthesis Level 14", getProgress:()=>Math.min(100,this.fusionLevel/14*100), check:()=>this.fusionLevel>=14 },
            { id:50, pt:"Tier 10 e Oganessônio — Z=118: calibração final", en:"Tier 10 and Oganesson — Z=118: final calibration", getProgress:()=>Math.min(100,Math.min(Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)/10,this.synthesizedElements?.has(118)?1:0)*100), check:()=>Math.min(this.postIronModules?.cryo||0,this.postIronModules?.toroidal||0)>=10&&Boolean(this.synthesizedElements?.has(118)) }
        ];

        this.secondaryPool = [
            { type: "fusion_count", target: 15, reward: 2, pt: "Realizar 15 sínteses na câmara", en: "Perform 15 chamber syntheses" },
            { type: "detector_hits", target: 80, reward: 3, pt: "Registrar 80 passagens no laser", en: "Register 80 laser hits" },
            { type: "earn_coins", target: 1500, reward: 3, pt: "Acumular 1.500 Moedas em voltas", en: "Collect 1,500 Coins in laps" },
            { type: "fusion_count", target: 30, reward: 4, pt: "Realizar 30 sínteses na câmara", en: "Perform 30 chamber syntheses" },
            { type: "detector_hits", target: 180, reward: 5, pt: "Registrar 180 passagens no laser", en: "Register 180 laser hits" },
            { type: "heavy_fusion", target: 1, reward: 5, pt: "Sintetizar elemento Z >= 26 (Ferro+)", en: "Synthesize element Z >= 26 (Iron+)" }
        ];

        this.activeBounty = null;
        this.bountyProgress = 0;

        this.initNextBounty();
        this.bindEvents();
        this.updateHUD();
    }

    applyPermanentUpgrades() {
        if (!window.gameEngine) return;
        const offlineHours = [1, 2, 4, 8, 12, 18, 24][this.offlineHoursLevel] || 1;
        window.gameEngine.maxOfflineHours = offlineHours;
        window.gameEngine.permanentLuck = (this.quantumLuckLevel || 0) * 0.05;
    }

    getMaxAllowedFusionZ() {
        const tier = this.fusionTiers.find(t => t.level === this.fusionLevel);
        return tier ? tier.maxZ : 2;
    }

    getMaxAllowedInjectorZ() {
        const maxFusionZ = this.getMaxAllowedFusionZ();
        const levelMax = Math.floor(1 + (this.playerLevel - 1) * 2.4);
        return Math.min(118, Math.min(maxFusionZ, Math.max(1, levelMax)));
    }

    getRequiredPlayerLevelForInjector(nextZ) {
        if (nextZ <= 1) return 1;
        const reqByFormula = Math.ceil((nextZ - 1) / 2.4) + 1;
        const tierNeeded = this.fusionTiers.find(t => t.maxZ >= nextZ);
        const reqByFusion = tierNeeded ? tierNeeded.reqPlayerLv : 1;
        return Math.max(reqByFormula, reqByFusion);
    }

    initNextBounty() {
        const rand = Math.floor(Math.random() * this.secondaryPool.length);
        this.activeBounty = Object.assign({}, this.secondaryPool[rand]);
        this.bountyProgress = 0;
        this.updateBountyProgressHUD();
    }

    bindEvents() {
        const btnBuyAtom = document.getElementById('btn-buy-current-atom');
        if (btnBuyAtom) {
            btnBuyAtom.addEventListener('click', () => {
                const cost = this.getCurrentAtomCost();
                if (window.fusionGrid && window.fusionGrid.buyAndSpawnElement(this.currentInjectorZ, cost)) {
                    this.atomPurchases++;
                    this.updateUpgradesUI();
                    this.checkMissions();
                }
            });
        }

        const btnUpgradeInj = document.getElementById('btn-upgrade-injection');
        if (btnUpgradeInj) {
            btnUpgradeInj.addEventListener('click', () => {
                const nextZ = this.currentInjectorZ + 1;
                if (nextZ > 118) return;

                const maxAllowed = this.getMaxAllowedInjectorZ();
                if (nextZ > maxAllowed) {
                    const reqLv = this.getRequiredPlayerLevelForInjector(nextZ);
                    this.showToast(i18n.currentLang === 'pt' 
                        ? `Bloqueado! Requer Nível de Jogador ${reqLv} ou Acelerador superior!` 
                        : `Locked! Requires Player Level ${reqLv} or higher Accelerator!`
                    );
                    return;
                }

                const cost = this.getInjectorUpgradeCost();
                if (window.gameEngine && window.gameEngine.coins >= cost) {
                    window.gameEngine.coins -= cost;
                    this.currentInjectorZ++;
                    this.injectorUpgrades++;
                    window.gameEngine.updateHud();
                    this.updateUpgradesUI();
                    this.checkMissions();

                    const newAtom = ATOM_REGISTRY[this.currentInjectorZ];
                    this.showToast(i18n.currentLang === 'pt' 
                        ? `INJETOR: Agora injeta ${newAtom.namePt} (${newAtom.symbol})`
                        : `INJECTOR: Now injecting ${newAtom.symbol}`
                    );
                }
            });
        }

        const btnUpgradeFusion = document.getElementById('btn-upgrade-fusion-level');
        if (btnUpgradeFusion) {
            btnUpgradeFusion.addEventListener('click', () => {
                const nextTier = this.fusionTiers.find(t => t.level === this.fusionLevel + 1);
                if (!nextTier) return;

                if (this.playerLevel < nextTier.reqPlayerLv) {
                    this.showToast(i18n.currentLang === 'pt'
                        ? `Bloqueado! Requer Nível de Jogador ${nextTier.reqPlayerLv}!`
                        : `Locked! Requires Player Level ${nextTier.reqPlayerLv}!`
                    );
                    return;
                }

                const cost = nextTier.cost;
                if (window.gameEngine && window.gameEngine.coins >= cost) {
                    window.gameEngine.coins -= cost;
                    this.fusionLevel++;

                    if (typeof QuantumAudio !== 'undefined' && QuantumAudio.playFusionSuccess) {
                        QuantumAudio.playFusionSuccess();
                    }

                    window.gameEngine.updateHud();
                    this.updateHUD();
                    this.updateUpgradesUI();
                    this.checkMissions();

                    this.showToast(i18n.currentLang === 'pt'
                        ? `AURORA EVOLUÍDO! Síntese Nível ${this.fusionLevel} (Contém até Z=${nextTier.maxZ})`
                        : `AURORA UPGRADED! Synthesis Level ${this.fusionLevel} (Contains up to Z=${nextTier.maxZ})`
                    );
                }
            });
        }

        const btnSpeed = document.getElementById('btn-upgrade-speed');
        if (btnSpeed) {
            btnSpeed.addEventListener('click', () => {
                const tier = this.speedTiers[this.speedPurchases];
                if (!tier) return;

                if (this.playerLevel < tier.reqLv) {
                    this.showToast(i18n.currentLang === 'pt'
                        ? `Bloqueado! Requer Nível de Jogador ${tier.reqLv}!`
                        : `Locked! Requires Player Level ${tier.reqLv}!`
                    );
                    return;
                }

                if (window.gameEngine && window.gameEngine.coins >= tier.cost) {
                    if (window.gameEngine.upgradeSpeed(0.10)) {
                        window.gameEngine.coins -= tier.cost;
                        this.speedPurchases++;
                        window.gameEngine.updateHud();
                        this.updateUpgradesUI();
                        this.checkMissions();
                    }
                }
            });
        }

        const btnDet = document.getElementById('btn-upgrade-detector');
        if (btnDet) {
            btnDet.addEventListener('click', () => {
                const tier = this.detectorTiers[this.detectorPurchases];
                if (!tier) return;

                if (this.playerLevel < tier.reqLv) {
                    this.showToast(i18n.currentLang === 'pt'
                        ? `Bloqueado! Requer Nível de Jogador ${tier.reqLv}!`
                        : `Locked! Requires Player Level ${tier.reqLv}!`
                    );
                    return;
                }

                if (window.gameEngine && window.gameEngine.coins >= tier.cost) {
                    if (window.gameEngine.addDetectorStation()) {
                        window.gameEngine.coins -= tier.cost;
                        this.detectorPurchases++;
                        window.gameEngine.updateHud();
                        this.updateUpgradesUI();
                        this.checkMissions();
                    }
                }
            });
        }

        const btnBuyProton = document.getElementById('btn-buy-proton');
        if (btnBuyProton) {
            btnBuyProton.addEventListener('click', () => {
                const cost = this.getProtonCost();
                if (window.fusionGrid && window.fusionGrid.buyAndSpawnElement(1, cost)) {
                    this.protonPurchases++;
                    window.gameEngine.updateHud();
                    this.updateShopUI();
                    this.checkMissions();
                    this.showToast(i18n.currentLang === 'pt' ? "Próton (1H) injetado!" : "Proton (1H) injected!");
                }
            });
        }

        this.bindShopEvents();

        const btnOpenModal = document.getElementById('btn-open-config');
        const modal = document.getElementById('modal-system');
        const btnCloseModal = document.getElementById('btn-close-modal');
        const btnPrestige = document.getElementById('btn-trigger-prestige');
        const selectTheme = document.getElementById('modal-theme-select');
        const btnEmergency = document.getElementById('btn-emergency-inject');
        const btnResetSave = document.getElementById('btn-reset-save');

        if (btnOpenModal && modal) {
            btnOpenModal.addEventListener('click', () => {
                this.updatePrestigeModal();
                SaveManager.updateEmergencyButtonState();
                modal.classList.remove('hidden');
            });
        }
        if (btnCloseModal && modal) {
            btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));
        }
        if (btnPrestige) {
            btnPrestige.addEventListener('click', () => this.triggerPrestigeAscension());
        }
        if (btnEmergency) {
            btnEmergency.addEventListener('click', () => SaveManager.emergencyInject());
        }
        if (btnResetSave) {
            btnResetSave.addEventListener('click', () => SaveManager.resetAll());
        }

        if (selectTheme) {
            selectTheme.value = document.documentElement.getAttribute('data-theme') || 'dark';
            selectTheme.addEventListener('change', (e) => {
                if (typeof window.applyThemeGlobal === 'function') {
                    window.applyThemeGlobal(e.target.value);
                }
            });
        }
    }

    bindShopEvents() {
        const bindBuffBtn = (btnId, buffKey, photonCost) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;

            btn.addEventListener('click', () => {
                if (!window.gameEngine || window.gameEngine.buffTimers[buffKey] > 0) return;

                if (window.gameEngine.photons >= photonCost) {
                    window.gameEngine.photons -= photonCost;
                    window.gameEngine.activateBuff(buffKey, 900);
                    window.gameEngine.updateHud();
                    this.updateShopUI();
                    SaveManager.save();
                    this.showToast(i18n.currentLang === 'pt' ? "Buff ativado (15m)!" : "Buff activated (15m)!");
                }
            });
        };

        bindBuffBtn('btn-buy-collider', 'collider', 3);
        bindBuffBtn('btn-buy-cryo', 'cryo', 4);
        bindBuffBtn('btn-buy-condenser', 'condenser', 5);

        const btnOffline = document.getElementById('btn-buy-offline');
        if (btnOffline) {
            btnOffline.addEventListener('click', () => {
                if (this.offlineHoursLevel >= 6) return;
                const costs = [2, 4, 7, 11, 15, 20];
                const cost = costs[this.offlineHoursLevel];

                if (window.gameEngine && window.gameEngine.photons >= cost) {
                    window.gameEngine.photons -= cost;
                    this.offlineHoursLevel++;
                    this.applyPermanentUpgrades();
                    window.gameEngine.updateHud();
                    this.updateShopUI();
                    SaveManager.save();

                    const newCap = [1, 2, 4, 8, 12, 18, 24][this.offlineHoursLevel];
                    this.showToast(i18n.currentLang === 'pt'
                        ? `EXPANSÃO OFFLINE: Teto aumentado para ${newCap} horas!`
                        : `OFFLINE EXPANSION: Cap increased to ${newCap} hours!`
                    );
                }
            });
        }

        const btnLuck = document.getElementById('btn-buy-luck');
        if (btnLuck) {
            btnLuck.addEventListener('click', () => {
                if (this.quantumLuckLevel >= 10) return;
                const costs = [2, 3, 4, 5, 7, 9, 11, 14, 17, 20];
                const cost = costs[this.quantumLuckLevel];

                if (window.gameEngine && window.gameEngine.photons >= cost) {
                    window.gameEngine.photons -= cost;
                    this.quantumLuckLevel++;
                    this.applyPermanentUpgrades();
                    window.gameEngine.updateHud();
                    this.updateShopUI();
                    SaveManager.save();

                    const pct = this.quantumLuckLevel * 5;
                    this.showToast(i18n.currentLang === 'pt'
                        ? `SORTE QUÂNTICA: ${pct}% de chance de dobrar (2x) ganhos!`
                        : `QUANTUM LUCK: ${pct}% chance of double (2x) yield!`
                    );
                }
            });
        }

        const btnTimeskip = document.getElementById('btn-buy-timeskip');
        if (btnTimeskip) {
            btnTimeskip.addEventListener('click', () => {
                const cost = this.getTimeSkipCost();
                if (window.gameEngine && window.gameEngine.photons >= cost) {
                    const payout = this.getTimeSkipYield();
                    window.gameEngine.photons -= cost;
                    window.gameEngine.coins += payout;

                    if (typeof QuantumAudio !== 'undefined' && QuantumAudio.playFusionSuccess) {
                        QuantumAudio.playFusionSuccess();
                    }

                    window.gameEngine.updateHud();
                    this.updateShopUI();
                    SaveManager.save();

                    this.showToast(i18n.currentLang === 'pt'
                        ? `SALTO TEMPORAL: +${formatQuantumNumber(payout)} Moedas (1h instantânea)!`
                        : `TIME SKIP: +${formatQuantumNumber(payout)} Coins (instant 1h)!`
                    );
                }
            });
        }
    }

    getTimeSkipCost() {
        return Math.min(20, Math.max(1, Math.round(1 + (this.playerLevel - 1) * (19 / 49))));
    }

    getTimeSkipYield() {
        if (!window.gameEngine || !window.fusionGrid) return 3600;
        const detCount = window.gameEngine.detectors.length;
        const activeAtoms = window.fusionGrid.slots.filter(s => s !== null);
        const massSum = activeAtoms.reduce((acc, curr) => acc + (ATOM_REGISTRY[curr.protons]?.mass || 0), 0);
        if (massSum === 0) return 3600;
        const revPerSec = (massSum * (window.gameEngine.prestigeLevel + 1) * detCount) * 0.12;
        return Math.floor(revPerSec * 3600);
    }

    updateShopUI() {
        if (!window.gameEngine) return;

        const protonBtn = document.getElementById('btn-buy-proton');
        const protonLabel = document.getElementById('label-proton-cost');
        if (protonBtn && protonLabel) {
            const cost = this.getProtonCost();
            protonLabel.textContent = formatQuantumNumber(cost);
            protonBtn.disabled = window.gameEngine.coins < cost;
        }

        const updateBuff = (cardId, timerId, btnId, buffKey, photonCost) => {
            const card = document.getElementById(cardId);
            const timerEl = document.getElementById(timerId);
            const btn = document.getElementById(btnId);
            if (!card || !timerEl || !btn) return;

            const remaining = window.gameEngine.buffTimers[buffKey];
            if (remaining > 0) {
                card.classList.add('buff-active');
                const m = Math.floor(remaining / 60);
                const s = Math.floor(remaining % 60);
                timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                btn.disabled = true;
                btn.innerHTML = "<span>ATIVO</span>";
            } else {
                card.classList.remove('buff-active');
                timerEl.textContent = "INATIVO";
                btn.disabled = window.gameEngine.photons < photonCost;
                btn.innerHTML = `<span>${photonCost}</span><img src="${ASSET_PATHS.image('foton.png')}" class="btn-currency-icon photon" alt="" onerror="this.style.display='none';">`;
            }
        };

        updateBuff('shop-item-collider', 'timer-collider', 'btn-buy-collider', 'collider', 3);
        updateBuff('shop-item-cryo', 'timer-cryo', 'btn-buy-cryo', 'cryo', 4);
        updateBuff('shop-item-condenser', 'timer-condenser', 'btn-buy-condenser', 'condenser', 5);

        const descOffline = document.getElementById('desc-offline-cap');
        const costOffline = document.getElementById('cost-buy-offline');
        const btnOffline = document.getElementById('btn-buy-offline');
        const offlineCaps = [1, 2, 4, 8, 12, 18, 24];
        const offlineCosts = [2, 4, 7, 11, 15, 20];

        if (this.offlineHoursLevel >= 6) {
            if (descOffline) descOffline.textContent = "Teto: 24h (MÁX)";
            if (costOffline) costOffline.textContent = "MAX";
            if (btnOffline) btnOffline.disabled = true;
        } else {
            const currentH = offlineCaps[this.offlineHoursLevel];
            const nextH = offlineCaps[this.offlineHoursLevel + 1];
            const nextC = offlineCosts[this.offlineHoursLevel];
            if (descOffline) descOffline.textContent = `${currentH}h ➜ ${nextH}h Max`;
            if (costOffline) costOffline.textContent = nextC;
            if (btnOffline) btnOffline.disabled = window.gameEngine.photons < nextC;
        }

        const descLuck = document.getElementById('desc-luck-val');
        const costLuck = document.getElementById('cost-buy-luck');
        const btnLuck = document.getElementById('btn-buy-luck');
        const luckCosts = [2, 3, 4, 5, 7, 9, 11, 14, 17, 20];

        if (this.quantumLuckLevel >= 10) {
            if (descLuck) descLuck.textContent = "Sorte: 50% (MÁX)";
            if (costLuck) costLuck.textContent = "MAX";
            if (btnLuck) btnLuck.disabled = true;
        } else {
            const currentPct = this.quantumLuckLevel * 5;
            const nextPct = (this.quantumLuckLevel + 1) * 5;
            const nextC = luckCosts[this.quantumLuckLevel];
            if (descLuck) descLuck.textContent = `${currentPct}% ➜ ${nextPct}% (2x)`;
            if (costLuck) costLuck.textContent = nextC;
            if (btnLuck) btnLuck.disabled = window.gameEngine.photons < nextC;
        }

        const descTimeskip = document.getElementById('desc-timeskip-val');
        const costTimeskip = document.getElementById('cost-buy-timeskip');
        const btnTimeskip = document.getElementById('btn-buy-timeskip');
        const skipCost = this.getTimeSkipCost();
        const skipYield = this.getTimeSkipYield();

        if (descTimeskip) descTimeskip.textContent = `+${formatQuantumNumber(skipYield)} Moedas`;
        if (costTimeskip) costTimeskip.textContent = skipCost;
        if (btnTimeskip) btnTimeskip.disabled = window.gameEngine.photons < skipCost;
    }

    getEffectiveBaseCost(originalBase) {
        const p = window.gameEngine ? window.gameEngine.prestigeLevel : 0;
        return originalBase * (1.0 + 0.35 * p);
    }

    getCurrentAtomCost() {
        const base = this.getEffectiveBaseCost(ATOM_REGISTRY[this.currentInjectorZ].baseCost);
        return Math.floor(base * Math.pow(1.08, this.atomPurchases));
    }

    getInjectorUpgradeCost() {
        const nextZ = this.currentInjectorZ + 1;
        const base = this.getEffectiveBaseCost(Math.floor(35 * Math.pow(nextZ, 1.55)));
        return Math.floor(base * Math.pow(1.06, this.injectorUpgrades));
    }

    getProtonCost() {
        const prestige = window.gameEngine ? window.gameEngine.prestigeLevel : 0;
        return AtomicRules.protonCost(this.protonPurchases, prestige);
    }

    countActiveAtoms() {
        if (!window.fusionGrid) return 0;
        return window.fusionGrid.slots.filter(s => s !== null).length;
    }

    recordAtomAdded(protons) {
        if (protons > this.maxProtonsSynthesized) {
            this.maxProtonsSynthesized = protons;
        }
        this.checkMissions();
        this.updateMissionProgressBar();
        SaveManager.updateEmergencyButtonState();
    }

    recordAtomSold() {
        this.totalSold++;
        this.checkMissions();
        this.updateMissionProgressBar();
        SaveManager.updateEmergencyButtonState();
    }

    recordFusion(resultProtons) {
        this.totalFusions++;
        if (resultProtons > this.maxProtonsSynthesized) {
            this.maxProtonsSynthesized = resultProtons;
        }

        if (this.dynamicSubstitute && this.dynamicSubstitute.type === 'fusions') {
            this.dynamicSubstitute.current++;
            this.checkMissions();
        }

        if (this.activeBounty) {
            if (this.activeBounty.type === 'fusion_count') {
                this.bountyProgress++;
                this.checkBountyCompletion();
            } else if (this.activeBounty.type === 'heavy_fusion' && resultProtons >= 26) {
                this.bountyProgress = 1;
                this.checkBountyCompletion();
            }
        }

        this.checkMissions();
        this.updateMissionProgressBar();
        SaveManager.updateEmergencyButtonState();
    }

    recordDetection(atomData, coinsEarned) {
        this.totalDetections++;

        if (this.dynamicSubstitute) {
            if (this.dynamicSubstitute.type === 'hits') {
                this.dynamicSubstitute.current++;
                this.checkMissions();
            } else if (this.dynamicSubstitute.type === 'coins') {
                this.dynamicSubstitute.current += Number(coinsEarned) || 0;
                this.checkMissions();
            }
        }

        if (this.activeBounty) {
            if (this.activeBounty.type === 'detector_hits') {
                this.bountyProgress++;
                this.checkBountyCompletion();
            } else if (this.activeBounty.type === 'earn_coins') {
                this.bountyProgress += Number(coinsEarned) || 0;
                this.checkBountyCompletion();
            }
        }
    }

    checkBountyCompletion() {
        if (!this.activeBounty) return;

        if (this.bountyProgress >= this.activeBounty.target) {
            const reward = Number(this.activeBounty.reward) || 2;

            if (window.gameEngine) {
                window.gameEngine.photons = (Number(window.gameEngine.photons) || 0) + reward;
                window.gameEngine.updateHud();

                if (typeof QuantumAudio !== 'undefined' && QuantumAudio.playFusionSuccess) {
                    QuantumAudio.playFusionSuccess();
                }
            }

            this.showToast(i18n.currentLang === 'pt'
                ? `MISSÃO SECUNDÁRIA CONCLUÍDA! +${reward} Fótons 🌌`
                : `BOUNTY COMPLETED! +${reward} Photons 🌌`
            );

            this.initNextBounty();
            SaveManager.save();
        } else {
            this.updateBountyProgressHUD();
        }
    }

    createDynamicSubstitute() {
        const types = ['fusions', 'hits', 'coins'];
        const type = types[this.currentMissionIndex % 3];

        if (type === 'fusions') {
            const target = Math.max(5, Math.floor(6 + this.playerLevel * 0.8));
            this.dynamicSubstitute = {
                type: 'fusions',
                target: target,
                current: 0,
                pt: `Pesquisa Contínua: Realize ${target} novas sínteses na câmara`,
                en: `Continuous Research: Perform ${target} new chamber syntheses`
            };
        } else if (type === 'hits') {
            const target = Math.max(25, Math.floor(25 + this.playerLevel * 4));
            this.dynamicSubstitute = {
                type: 'hits',
                target: target,
                current: 0,
                pt: `Calibração Magnética: Registre ${target} passagens no laser`,
                en: `Magnetic Tuning: Register ${target} laser hits`
            };
        } else {
            const target = Math.max(500, Math.floor(600 * Math.pow(1.22, this.playerLevel - 1)));
            this.dynamicSubstitute = {
                type: 'coins',
                target: target,
                current: 0,
                pt: `Sobrecarga: Gere +${formatQuantumNumber(target)} moedas em voltas`,
                en: `Power Surge: Generate +${formatQuantumNumber(target)} coins in laps`
            };
        }
    }

    checkMissions() {
        if (this.currentMissionIndex >= this.missions.length) return;

        if (this.dynamicSubstitute) {
            if (this.dynamicSubstitute.current >= this.dynamicSubstitute.target) {
                this.completeCurrentMission();
            }
            return;
        }

        const current = this.missions[this.currentMissionIndex];
        if (current && current.check()) {
            this.completeCurrentMission();
        }
    }

    completeCurrentMission() {
        this.currentMissionIndex++;
        this.playerLevel = Math.min(50, this.playerLevel + 1);
        this.dynamicSubstitute = null;

        this.showToast(i18n.currentLang === 'pt'
            ? `MISSÃO CUMPRIDA! Você alcançou o Nível ${this.playerLevel}!`
            : `MISSION COMPLETE! You reached Level ${this.playerLevel}!`
        );

        if (this.currentMissionIndex < this.missions.length) {
            const nextMission = this.missions[this.currentMissionIndex];
            if (nextMission.check()) {
                this.createDynamicSubstitute();
            }
        }

        this.updateHUD();
        this.updateUpgradesUI();
        SaveManager.save();
    }

    updateHUD() {
        const elLevel = document.getElementById('display-player-level');
        if (elLevel) elLevel.textContent = `LV ${this.playerLevel}`;

        const p = window.gameEngine ? window.gameEngine.prestigeLevel : 0;
        const elPrestigeTag = document.getElementById('display-prestige-tag');
        const elPrestigeMult = document.getElementById('display-prestige-multiplier');
        if (elPrestigeTag) elPrestigeTag.textContent = `LV ${p}`;
        if (elPrestigeMult) elPrestigeMult.textContent = `BÔNUS ${(p + 1).toFixed(1)}x`;

        const elMission = document.getElementById('display-current-mission');
        const elPrestigeProgress = document.getElementById('display-prestige-progress');

        if (this.dynamicSubstitute) {
            if (elMission) elMission.textContent = i18n.currentLang === 'pt' ? this.dynamicSubstitute.pt : this.dynamicSubstitute.en;
        } else if (this.currentMissionIndex < this.missions.length) {
            const m = this.missions[this.currentMissionIndex];
            if (elMission) elMission.textContent = i18n.currentLang === 'pt' ? m.pt : m.en;
        } else {
            if (elMission) elMission.textContent = "Ascensão Disponível (Nível 50)";
        }

        if (elPrestigeProgress) {
            const prestigePct = Math.min(100, Math.floor((this.playerLevel / 50) * 100));
            elPrestigeProgress.textContent = `PRESTÍGIO ${prestigePct}%`;
        }

        this.updateMissionProgressBar();
        this.updateBountyProgressHUD();
    }

    updateMissionProgressBar() {
        const progressBar = document.getElementById('mission-progress-bar');
        if (!progressBar) return;

        if (this.dynamicSubstitute) {
            const pct = Math.max(0, Math.min(100, Math.floor((this.dynamicSubstitute.current / this.dynamicSubstitute.target) * 100)));
            progressBar.style.width = `${pct}%`;
        } else if (this.currentMissionIndex < this.missions.length) {
            const m = this.missions[this.currentMissionIndex];
            const pct = Math.max(0, Math.min(100, Math.floor(m.getProgress())));
            progressBar.style.width = `${pct}%`;
        } else {
            progressBar.style.width = '100%';
        }
    }

    updateBountyProgressHUD() {
        const elSecTitle = document.getElementById('display-secondary-mission');
        const elSecReward = document.getElementById('display-bounty-reward');
        const secProgressBar = document.getElementById('secondary-progress-bar');

        if (!this.activeBounty) return;

        if (elSecTitle) {
            elSecTitle.textContent = i18n.currentLang === 'pt' ? this.activeBounty.pt : this.activeBounty.en;
        }
        if (elSecReward) {
            elSecReward.textContent = `+${this.activeBounty.reward}`;
        }
        if (secProgressBar) {
            const pct = Math.min(100, Math.floor((this.bountyProgress / this.activeBounty.target) * 100));
            secProgressBar.style.width = `${pct}%`;
        }
    }

    updateUpgradesUI() {
        if (!window.gameEngine) return;
        const coins = window.gameEngine.coins;

        // 1. Acelerador Tokamak
        const btnUpgradeFusion = document.getElementById('btn-upgrade-fusion-level');
        const fusionCostLabel = document.getElementById('cost-upgrade-fusion-level');
        const fusionBadge = document.getElementById('display-fusion-level-tag');
        const fusionHint = document.getElementById('fusion-limit-hint');
        const currentTier = this.fusionTiers.find(t => t.level === this.fusionLevel);
        const nextTier = this.fusionTiers.find(t => t.level === this.fusionLevel + 1);

        if (fusionBadge) fusionBadge.textContent = `SÍNTESE NÍVEL ${this.fusionLevel}`;
        if (fusionHint && currentTier) {
            fusionHint.textContent = `Contém até Z=${currentTier.maxZ} (${currentTier.name})`;
        }

        if (nextTier) {
            const isLevelLocked = this.playerLevel < nextTier.reqPlayerLv;
            if (isLevelLocked) {
                if (fusionCostLabel) fusionCostLabel.textContent = `REQ. NV. ${nextTier.reqPlayerLv}`;
                if (btnUpgradeFusion) {
                    btnUpgradeFusion.disabled = true;
                    btnUpgradeFusion.classList.add('is-locked-btn');
                }
            } else {
                if (fusionCostLabel) fusionCostLabel.textContent = `EVOLUIR ${formatQuantumNumber(nextTier.cost)}`;
                if (btnUpgradeFusion) {
                    btnUpgradeFusion.disabled = coins < nextTier.cost;
                    btnUpgradeFusion.classList.remove('is-locked-btn');
                }
            }
        } else {
            if (fusionCostLabel) fusionCostLabel.textContent = `[MÁXIMO]`;
            if (btnUpgradeFusion) btnUpgradeFusion.disabled = true;
        }

        // 2. Injetar Átomo Atual
        const currentAtom = ATOM_REGISTRY[this.currentInjectorZ];
        const costAtom = this.getCurrentAtomCost();
        const labelBuyAtom = document.getElementById('label-buy-atom');
        const descBuyAtom = document.getElementById('desc-buy-atom');
        const costBuyAtomLabel = document.getElementById('cost-buy-current-atom');
        const btnBuyAtom = document.getElementById('btn-buy-current-atom');

        if (labelBuyAtom) labelBuyAtom.textContent = `Injetor de ${currentAtom.symbol}`;
        if (descBuyAtom) descBuyAtom.textContent = `Adiciona ${currentAtom.symbol} — Z=${currentAtom.protons} à câmara`;
        if (costBuyAtomLabel) costBuyAtomLabel.textContent = formatQuantumNumber(costAtom);
        if (btnBuyAtom) btnBuyAtom.disabled = coins < costAtom;

        // 3. Melhorar Injetor
        const cardUpgradeInj = document.getElementById('card-upgrade-injection');
        const labelUpgradeInj = document.getElementById('label-upgrade-injection');
        const descUpgradeInj = document.getElementById('desc-upgrade-injection');
        const costUpgradeInjLabel = document.getElementById('cost-upgrade-injection');
        const btnUpgradeInj = document.getElementById('btn-upgrade-injection');

        if (this.currentInjectorZ < 118) {
            const nextZ = this.currentInjectorZ + 1;
            const nextAtom = ATOM_REGISTRY[nextZ];
            const maxAllowedZ = this.getMaxAllowedInjectorZ();
            const costInj = this.getInjectorUpgradeCost();

            if (nextZ > maxAllowedZ) {
                const reqLv = this.getRequiredPlayerLevelForInjector(nextZ);
                if (cardUpgradeInj) cardUpgradeInj.classList.add('is-locked-level');
                if (labelUpgradeInj) labelUpgradeInj.textContent = `Calibração do Injetor`;
                if (descUpgradeInj) descUpgradeInj.innerHTML = `Libera Z=${nextZ} · <span class="lock-indicator">requer NV ${reqLv}</span>`;
                if (costUpgradeInjLabel) costUpgradeInjLabel.textContent = `BLOQ. NV. ${reqLv}`;
                if (btnUpgradeInj) {
                    btnUpgradeInj.disabled = true;
                    btnUpgradeInj.classList.remove('is-maxed');
                }
            } else {
                if (cardUpgradeInj) cardUpgradeInj.classList.remove('is-locked-level');
                if (labelUpgradeInj) labelUpgradeInj.textContent = `Calibração do Injetor`;
                if (descUpgradeInj) descUpgradeInj.textContent = `Libera ${nextAtom.symbol} — Z=${nextZ}`;
                if (costUpgradeInjLabel) costUpgradeInjLabel.textContent = formatQuantumNumber(costInj);
                if (btnUpgradeInj) {
                    btnUpgradeInj.disabled = coins < costInj;
                    btnUpgradeInj.classList.remove('is-maxed');
                }
            }
        } else {
            if (cardUpgradeInj) cardUpgradeInj.classList.remove('is-locked-level');
            if (labelUpgradeInj) labelUpgradeInj.textContent = `Calibração do Injetor`;
            if (descUpgradeInj) descUpgradeInj.textContent = `Todos os núcleos liberados`;
            if (costUpgradeInjLabel) costUpgradeInjLabel.textContent = `[MÁXIMO]`;
            if (btnUpgradeInj) {
                btnUpgradeInj.disabled = true;
                btnUpgradeInj.classList.add('is-maxed');
            }
        }

        // 4. Eletroímãs
        const cardSpeed = document.getElementById('card-upgrade-speed');
        const btnSpeed = document.getElementById('btn-upgrade-speed');
        const costSpeedLabel = document.getElementById('cost-upgrade-speed');
        const descSpeed = document.getElementById('desc-upgrade-speed');
        const speedTier = this.speedTiers[this.speedPurchases];

        if (!speedTier) {
            if (cardSpeed) cardSpeed.classList.remove('is-locked-level');
            if (costSpeedLabel) costSpeedLabel.textContent = `[MÁXIMO]`;
            if (descSpeed) descSpeed.textContent = `Circulação duplicada · máximo`;
            if (btnSpeed) {
                btnSpeed.disabled = true;
                btnSpeed.classList.add('is-maxed');
            }
        } else {
            const isSpeedLocked = this.playerLevel < speedTier.reqLv;
            if (isSpeedLocked) {
                if (cardSpeed) cardSpeed.classList.add('is-locked-level');
                if (descSpeed) descSpeed.innerHTML = `Acelera detecções · <span class="lock-indicator">requer NV ${speedTier.reqLv}</span>`;
                if (costSpeedLabel) costSpeedLabel.textContent = `BLOQ. NV. ${speedTier.reqLv}`;
                if (btnSpeed) {
                    btnSpeed.disabled = true;
                    btnSpeed.classList.remove('is-maxed');
                }
            } else {
                if (cardSpeed) cardSpeed.classList.remove('is-locked-level');
                const speedPct = (this.speedPurchases + 1) * 10;
                if (descSpeed) descSpeed.textContent = `Acelera detecções · total +${speedPct}%`;
                if (costSpeedLabel) costSpeedLabel.textContent = formatQuantumNumber(speedTier.cost);
                if (btnSpeed) {
                    btnSpeed.disabled = coins < speedTier.cost;
                    btnSpeed.classList.remove('is-maxed');
                }
            }
        }

        // 5. Detectores
        const cardDet = document.getElementById('card-upgrade-detector');
        const btnDet = document.getElementById('btn-upgrade-detector');
        const costDetLabel = document.getElementById('cost-upgrade-detector');
        const descDet = document.getElementById('desc-upgrade-detector');
        const detTier = this.detectorTiers[this.detectorPurchases];

        if (!detTier) {
            if (cardDet) cardDet.classList.remove('is-locked-level');
            if (costDetLabel) costDetLabel.textContent = `[MÁXIMO]`;
            if (descDet) descDet.textContent = `10 pontos de renda · máximo`;
            if (btnDet) {
                btnDet.disabled = true;
                btnDet.classList.add('is-maxed');
            }
        } else {
            const isDetLocked = this.playerLevel < detTier.reqLv;
            if (isDetLocked) {
                if (cardDet) cardDet.classList.add('is-locked-level');
                if (descDet) descDet.innerHTML = `Mais pontos de renda · <span class="lock-indicator">requer NV ${detTier.reqLv}</span>`;
                if (costDetLabel) costDetLabel.textContent = `BLOQ. NV. ${detTier.reqLv}`;
                if (btnDet) {
                    btnDet.disabled = true;
                    btnDet.classList.remove('is-maxed');
                }
            } else {
                if (cardDet) cardDet.classList.remove('is-locked-level');
                const targetDets = this.detectorPurchases + 2;
                if (descDet) descDet.textContent = `Instala o ${targetDets}º ponto de renda`;
                if (costDetLabel) costDetLabel.textContent = formatQuantumNumber(detTier.cost);
                if (btnDet) {
                    btnDet.disabled = coins < detTier.cost;
                    btnDet.classList.remove('is-maxed');
                }
            }
        }

        this.updateShopUI();
    }

    updatePrestigeModal() {
        const curLevel = document.getElementById('prestige-current-level');
        const curMult = document.getElementById('prestige-current-mult');
        const reqText = document.getElementById('prestige-requirement-text');
        const btnPrestige = document.getElementById('btn-trigger-prestige');

        const p = window.gameEngine ? window.gameEngine.prestigeLevel : 0;
        if (curLevel) curLevel.textContent = p;
        if (curMult) curMult.textContent = `${(p + 1).toFixed(1)}x`;

        if (this.playerLevel >= 50) {
            if (reqText) reqText.textContent = "CONDIÇÃO ATINGIDA! Pronto para ascender.";
            if (btnPrestige) btnPrestige.disabled = false;
        } else {
            if (reqText) reqText.textContent = `Requer Nível 50 (Atual: LV ${this.playerLevel})`;
            if (btnPrestige) btnPrestige.disabled = true;
        }
    }

    triggerPrestigeAscension() {
        if (this.playerLevel < 50 || !window.gameEngine || !window.fusionGrid) return;

        window.gameEngine.prestigeLevel++;
        const p = window.gameEngine.prestigeLevel;

        this.playerLevel = 1;
        this.currentMissionIndex = 0;
        this.currentInjectorZ = 1;
        this.fusionLevel = 1;
        this.atomPurchases = 0;
        this.injectorUpgrades = 0;
        this.speedPurchases = 0;
        this.detectorPurchases = 0;
        this.protonPurchases = 0;
        this.maxProtonsSynthesized = 1;
        this.totalSold = 0;
        this.dynamicSubstitute = null;

        this.applyPermanentUpgrades();

        window.gameEngine.coins = 50 * (p + 1);
        window.gameEngine.speedBonus = 0.0;
        window.gameEngine.detectors = [{ angle: 0, pulseTimer: 0, label: "DET-01" }];

        window.fusionGrid.slots = new Array(8).fill(null);
        window.fusionGrid.addAtomToSlot(0, 1);

        const modal = document.getElementById('modal-system');
        if (modal) modal.classList.add('hidden');

        this.showToast(`ASCENSÃO CONCLUÍDA! Prestígio ${p} Ativado (${p + 1}x Moedas)`);

        window.gameEngine.updateHud();
        this.updateHUD();
        this.updateUpgradesUI();
        SaveManager.updateEmergencyButtonState();
        SaveManager.save();
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        const photonReward = message.includes('🌌');
        const coinReward = message.includes('⚛️');
        const label = document.createElement('span');
        label.textContent = message.replaceAll('🌌', '').replaceAll('⚛️', '').replace(/\s{2,}/g, ' ').trim();
        toast.appendChild(label);
        if (photonReward || coinReward) {
            const icon = document.createElement('img');
            icon.className = 'toast-currency-icon';
            icon.src = photonReward ? ASSET_PATHS.image('foton.png') : ASSET_PATHS.image('moeda.png');
            icon.alt = photonReward ? 'Fóton' : 'Moeda quântica';
            icon.onerror = () => { icon.onerror = null; icon.remove(); };
            toast.appendChild(icon);
        }
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3200);
    }
}
