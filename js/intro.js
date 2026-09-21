/**
 * ARQUIVO: js/intro.js
 * FINALIDADE: Máquina de diálogo, troca de temas dinâmicos e controle
 *             de botões de início e retomada.
 */

window.gameEngine = null;
window.fusionGrid = null;
window.missionManager = null;

document.addEventListener('DOMContentLoaded', () => {
    let currentTheme = 'dark';
    try {
        currentTheme = localStorage.getItem('particle_idle_theme') || 'dark';
    } catch (e) {}
    
    window.applyThemeGlobal = function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('particle_idle_theme', theme);
        } catch (err) {}

        const startThemeSelect = document.getElementById('start-theme-select');
        const modalThemeSelect = document.getElementById('modal-theme-select');
        if (startThemeSelect) startThemeSelect.value = theme;
        if (modalThemeSelect) modalThemeSelect.value = theme;

        if (window.gameEngine) window.gameEngine.resize();
    };

    window.applyThemeGlobal(currentTheme);

    const screenMenu = document.getElementById('screen-menu');
    const screenIntro = document.getElementById('screen-intro');
    const screenHud = document.getElementById('screen-hud');

    const btnStart = document.getElementById('btn-start');
    const btnResume = document.getElementById('btn-resume-game');
    const btnNewGame = document.getElementById('btn-new-game');

    const languageSelect = document.getElementById('language-select');
    const modalLanguageSelect = document.getElementById('modal-language-select');
    const startThemeSelect = document.getElementById('start-theme-select');
    const modalThemeSelect = document.getElementById('modal-theme-select');

    const dialogueText = document.getElementById('dialogue-text');
    const playerNameInput = document.getElementById('player-name-input');
    const btnDialogueAction = document.getElementById('btn-dialogue-action');
    const displayPlayerName = document.getElementById('display-player-name');

    let dialogueStep = 1;
    let playerName = "";

    CharacterRegistry.get('01').then(character => {
        const avatar = document.getElementById('npc-avatar');
        const title = document.getElementById('speaker-title');
        const role = document.querySelector('#screen-intro .speaker-role');
        if (avatar) avatar.style.backgroundImage = `url('${character.image}')`;
        if (title) title.textContent = character.name.toUpperCase();
        if (role) role.textContent = i18n.currentLang === 'pt' ? character.role : i18n.t('speaker_role');
    }).catch(error => console.warn('[Combinações Atômicas][intro] Falha ao preparar personagem.', error));

    function refreshMenuButtons() {
        const hasSave = typeof SaveManager !== 'undefined' && SaveManager.hasSave();
        
        if (hasSave) {
            if (btnStart) btnStart.classList.add('hidden');
            if (btnResume) btnResume.classList.remove('hidden');
            if (btnNewGame) btnNewGame.classList.remove('hidden');
            try { playerName = localStorage.getItem('particle_idle_player_name') || "Dr. Hélio"; }
            catch (error) { console.warn('[Atomic Idle][storage name]', error); playerName = "Dr. Hélio"; }
        } else {
            if (btnStart) btnStart.classList.remove('hidden');
            if (btnResume) btnResume.classList.add('hidden');
            if (btnNewGame) btnNewGame.classList.add('hidden');
        }
    }

    refreshMenuButtons();

    if (startThemeSelect) {
        startThemeSelect.addEventListener('change', (e) => window.applyThemeGlobal(e.target.value));
    }
    if (modalThemeSelect) {
        modalThemeSelect.addEventListener('change', (e) => window.applyThemeGlobal(e.target.value));
    }

    if (languageSelect) {
        languageSelect.value = i18n.currentLang;
        languageSelect.addEventListener('change', (e) => {
            i18n.setLanguage(e.target.value);
            if (modalLanguageSelect) modalLanguageSelect.value = e.target.value;
            refreshMenuButtons();
            updateDialogueView();
            window.tutorialManager?.refreshLanguage();
        });
    }

    if (modalLanguageSelect) {
        modalLanguageSelect.value = i18n.currentLang;
        modalLanguageSelect.addEventListener('change', (e) => {
            i18n.setLanguage(e.target.value);
            if (languageSelect) languageSelect.value = e.target.value;
            if (window.missionManager) window.missionManager.updateHUD();
            window.tutorialManager?.refreshLanguage();
        });
    }

    i18n.updateDOM();

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            screenMenu.classList.remove('active');
            screenMenu.classList.add('hidden');

            screenIntro.classList.remove('hidden');
            screenIntro.classList.add('active');
            dialogueStep = 1;
            updateDialogueView();
        });
    }

    if (btnResume) {
        btnResume.addEventListener('click', () => {
            screenMenu.classList.remove('active');
            screenMenu.classList.add('hidden');
            transitionToHud();
        });
    }

    if (btnNewGame) {
        btnNewGame.addEventListener('click', () => {
            if (typeof SaveManager !== 'undefined') {
                SaveManager.resetAll();
            }
        });
    }

    function handleNameSubmission() {
        const rawName = playerNameInput.value.trim();
        if (rawName.length > 0) {
            playerName = rawName;
        } else {
            playerName = i18n.currentLang === 'pt' ? "Dr. Hélio" : "Dr. Helium";
        }

        try {
            localStorage.setItem('particle_idle_player_name', playerName);
        } catch (error) { console.warn('[Atomic Idle][storage name]', error); window.AtomicStorage?.fail(error); }

        dialogueStep = 3;
        updateDialogueView();
    }

    if (btnDialogueAction) {
        btnDialogueAction.addEventListener('click', () => {
            if (dialogueStep === 1) {
                dialogueStep = 2;
                updateDialogueView();
            } else if (dialogueStep === 2) {
                handleNameSubmission();
            } else if (dialogueStep === 3) {
                transitionToHud();
            }
        });
    }

    if (playerNameInput) {
        playerNameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && dialogueStep === 2) {
                handleNameSubmission();
            }
        });
    }

    function updateDialogueView() {
        if (!dialogueText || !btnDialogueAction) return;

        if (dialogueStep === 1) {
            dialogueText.textContent = i18n.t('dialogue_1');
            if (playerNameInput) playerNameInput.classList.add('hidden');
            btnDialogueAction.textContent = i18n.t('btn_next');
        } else if (dialogueStep === 2) {
            dialogueText.textContent = i18n.t('dialogue_2');
            if (playerNameInput) {
                playerNameInput.classList.remove('hidden');
                setTimeout(() => playerNameInput.focus(), 100);
            }
            btnDialogueAction.textContent = i18n.t('btn_next');
        } else if (dialogueStep === 3) {
            if (playerNameInput) playerNameInput.classList.add('hidden');
            dialogueText.textContent = i18n.t('dialogue_welcome', { name: playerName });
            btnDialogueAction.textContent = i18n.t('btn_enter_lab');
        }
    }

    function transitionToHud() {
        screenIntro.classList.remove('active');
        screenIntro.classList.add('hidden');

        screenHud.classList.remove('hidden');
        screenHud.classList.add('active');

        if (!playerName) {
            try { playerName = localStorage.getItem('particle_idle_player_name') || "Dr. Hélio"; }
            catch (error) { console.warn('[Atomic Idle][storage name]', error); playerName = "Dr. Hélio"; }
        }
        if (displayPlayerName) {
            displayPlayerName.textContent = playerName;
        }

        initGameSubsystems();
        setTimeout(() => window.tutorialManager?.maybeStart(), 120);
    }

    function initGameSubsystems() {
        if (!window.gameEngine) {
            try {
                window.gameEngine = new ParticleEngine('accelerator-canvas');
            } catch (error) {
                console.error("[ERRO ENGINE]:", error);
            }
        }

        if (!window.fusionGrid) {
            try {
                window.fusionGrid = new FusionGridManager();
            } catch (error) {
                console.error("[ERRO FUSION]:", error);
            }
        }

        if (!window.missionManager) {
            try {
                window.missionManager = new MissionManager();
            } catch (error) {
                console.error("[ERRO MISSIONS]:", error);
            }
        }

        window.ensureAtomicSession?.();
        const loaded = SaveManager.load();
        if (!loaded) {
            if (window.fusionGrid && window.fusionGrid.slots[0] === null) {
                window.fusionGrid.addAtomToSlot(0, 1);
            }
        }
        window.dispatchEvent(new CustomEvent('atomic-save-applied', { detail: { loaded } }));
        window.periodicTableController?.sync(false);

        if (window.gameEngine) {
            setTimeout(() => {
                window.gameEngine.resize();
                window.gameEngine.updateHud();
                if (window.missionManager) {
                    window.missionManager.updateUpgradesUI();
                }
                // Os módulos pós-ferro pertencem à camada endurecida da sessão.
                window.atomicSession?.updateModuleUi?.();
                SaveManager.updateEmergencyButtonState();
            }, 60);
        }
    }
});
