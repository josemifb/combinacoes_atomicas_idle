/**
 * ARQUIVO: js/engine.js
 * FINALIDADE: Motor gráfico Tokamak com suporte a moedinha PNG nos pop-ups flutuantes,
 *             fonte Chakra Petch de 15px nos ganhos e anel magnético de alto contraste.
 */

function formatQuantumNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    if (num < 1000) return Math.floor(num).toLocaleString();

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const i = Math.floor(Math.log10(num) / 3);

    if (i >= suffixes.length) {
        return num.toExponential(2);
    }

    const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
    return `${formatted} ${suffixes[i]}`;
}

class QuantumAudio {
    static ctx = null;

    static init() {
        if (!QuantumAudio.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                QuantumAudio.ctx = new AudioContext();
            }
        }
    }

    static playLaserHit() {
        try {
            QuantumAudio.init();
            if (!QuantumAudio.ctx) return;
            if (QuantumAudio.ctx.state === 'suspended') QuantumAudio.ctx.resume();

            const osc = QuantumAudio.ctx.createOscillator();
            const gain = QuantumAudio.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, QuantumAudio.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(240, QuantumAudio.ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.02, QuantumAudio.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, QuantumAudio.ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(QuantumAudio.ctx.destination);

            osc.start();
            osc.stop(QuantumAudio.ctx.currentTime + 0.05);
            osc.addEventListener('ended', () => { osc.disconnect(); gain.disconnect(); }, { once: true });
        } catch (e) {}
    }

    static playFusionSuccess() {
        try {
            QuantumAudio.init();
            if (!QuantumAudio.ctx) return;
            if (QuantumAudio.ctx.state === 'suspended') QuantumAudio.ctx.resume();

            const osc = QuantumAudio.ctx.createOscillator();
            const gain = QuantumAudio.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, QuantumAudio.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(640, QuantumAudio.ctx.currentTime + 0.18);

            gain.gain.setValueAtTime(0.08, QuantumAudio.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, QuantumAudio.ctx.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(QuantumAudio.ctx.destination);

            osc.start();
            osc.stop(QuantumAudio.ctx.currentTime + 0.18);
            osc.addEventListener('ended', () => { osc.disconnect(); gain.disconnect(); }, { once: true });
        } catch (e) {}
    }
}

class ParticleEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`[ERRO CRÍTICO]: Canvas #${canvasId} não encontrado.`);
        }
        this.ctx = this.canvas.getContext('2d');

        this.coinImg = new Image();
        this.coinImg.src = ASSET_PATHS.image('moeda.png');

        this.coins = 15;
        this.photons = 0;
        this.prestigeLevel = 0;

        this.permanentLuck = 0.0;
        this.maxOfflineHours = 1.0;

        this.baseAngularSpeed = 1.35;
        this.speedBonus = 0.0;
        this.maxSpeedBonus = 1.0;

        this.particles = [];
        this.floatingTexts = [];

        this.buffTimers = {
            collider: 0,
            cryo: 0,
            condenser: 0
        };
        this.buffExpiresAt = { collider: 0, cryo: 0, condenser: 0 };
        this.abortController = new AbortController();
        this.rafId = null;
        this.resizeTimeoutId = null;
        this.uiDirty = true;
        this.lastUiUpdate = 0;
        this.running = false;
        this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;

        this.maxDetectors = 10;
        this.detectors = [
            { angle: 0, pulseTimer: 0, label: "DET-01" }
        ];

        this.track = {
            centerX: 250,
            centerY: 200,
            radiusX: 160,
            radiusY: 120,
            tubeWidth: 34
        };

        this.lastFrameTime = performance.now();
        this.initResize();
        this.initClickEvent();
        this.start();
    }

    initClickEvent() {
        this.canvas.addEventListener('click', (e) => this.handleManualPulse(e), { signal: this.abortController.signal });
        this.canvas.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.handleManualPulse({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
        }, { signal: this.abortController.signal });
    }

    handleManualPulse(e) {
        const activeCount = this.particles.length;
        const boost = activeCount === 0 ? 5 : 1;
        const earned = Math.max(1, (this.prestigeLevel + 1) * boost);

        this.coins += earned;
        this.markUiDirty();

        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        this.floatingTexts.push({
            x: clickX,
            y: clickY,
            text: `+${earned}`,
            alpha: 1.0,
            speedY: 42,
            color: "#4ce6e6"
        });

        QuantumAudio.playLaserHit();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const w = Math.max(Math.floor(rect.width), 260);
        const h = Math.max(Math.floor(rect.height), 200);

        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        this.track.centerX = w / 2;
        this.track.centerY = h / 2;
        this.track.radiusX = Math.max(80, (w / 2) * 0.82);
        this.track.radiusY = Math.max(60, (h / 2) * 0.74);
    }

    initResize() {
        window.addEventListener('resize', () => this.resize(), { signal: this.abortController.signal });
        this.resizeTimeoutId = setTimeout(() => this.resize(), 100);
    }

    syncParticles(activeAtoms) {
        const updated = [];

        activeAtoms.forEach(atom => {
            const data = ATOM_REGISTRY[atom.protons];
            if (!data) return;

            const existing = this.particles.find(p => p.uuid === atom.uuid);

            if (existing) {
                existing.data = data;
                updated.push(existing);
            } else {
                updated.push({
                    uuid: atom.uuid,
                    data: data,
                    angle: Math.random() * Math.PI * 2,
                    speedFactor: 0.95 + Math.random() * 0.1,
                    size: 42
                });
            }
        });

        this.particles = updated;
        this.markUiDirty();
    }

    getEffectiveSpeed() {
        const cryoBonus = this.isBuffActive('cryo') ? 0.15 : 0.0;
        return this.baseAngularSpeed * (1.0 + Math.min(this.speedBonus + cryoBonus, this.maxSpeedBonus + cryoBonus));
    }

    getIncomePerSecond() {
        if (!this.particles.length || !this.detectors.length) return 0;
        const particleYield = this.particles.reduce((total, particle) => {
            const mass = Number(particle.data.massValue || particle.data.mass) || particle.data.protons || 0;
            return total + mass * (particle.speedFactor || 1);
        }, 0);
        return AtomicRules.incomePerSecond({particleYield,angularSpeed:this.getEffectiveSpeed(),detectors:this.detectors.length,prestigeMultiplier:this.prestigeLevel+1,collider:this.isBuffActive('collider'),condenser:this.isBuffActive('condenser'),luck:this.permanentLuck||0});
    }

    formatIncomeRate(value) {
        if (!Number.isFinite(value) || value <= 0) return '0';
        if (value < 10) return value.toFixed(2);
        if (value < 1000) return value.toFixed(1);
        return formatQuantumNumber(value);
    }

    addDetectorStation() {
        if (this.detectors.length >= this.maxDetectors) return false;

        const total = this.detectors.length + 1;
        this.detectors = [];

        for (let i = 0; i < total; i++) {
            const angle = (i * (Math.PI * 2)) / total;
            this.detectors.push({
                angle: angle,
                pulseTimer: 0,
                label: `DET-${String(i + 1).padStart(2, '0')}`
            });
        }

        this.updateSensorOverlay();
        return true;
    }

    upgradeSpeed(increment = 0.10) {
        if (this.speedBonus >= this.maxSpeedBonus) return false;

        this.speedBonus = Math.min(this.maxSpeedBonus, this.speedBonus + increment);
        this.markUiDirty();
        this.updateSensorOverlay();
        return true;
    }

    activateBuff(key, durationSeconds = 900) {
        if (this.buffTimers.hasOwnProperty(key)) {
            this.buffExpiresAt[key] = Date.now() + durationSeconds * 1000;
            this.buffTimers[key] = durationSeconds;
            this.markUiDirty();
        }
    }

    updateSensorOverlay() {
        const speed=document.getElementById('sensor-speed'),income=document.getElementById('sensor-income');
        const detectors=document.getElementById('sensor-detectors');
        const temporarySpeed=this.isBuffActive('cryo')?15:0,baseSpeed=Math.round(this.speedBonus*100),totalSpeed=baseSpeed+temporarySpeed;
        const collider=this.isBuffActive('collider'),condenser=this.isBuffActive('condenser');
        if(detectors)detectors.textContent=`DETECTORES: ${this.detectors.length}/${this.maxDetectors}`;
        if(speed){speed.textContent=`VELOCIDADE: +${totalSpeed}%${temporarySpeed?` (${baseSpeed}% + 15%)`:''}`;speed.classList.toggle('is-boosted',temporarySpeed>0);}
        if(income){const effects=[collider?'+25%':null,condenser?'×1,5':null].filter(Boolean).join(' ');income.textContent=`RENDA/S: ${this.formatIncomeRate(this.getIncomePerSecond())}${effects?` (${effects})`:''}`;income.classList.toggle('is-boosted',collider||condenser);}
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastFrameTime = performance.now();
        this.rafId = requestAnimationFrame(ts => this.loop(ts));
    }

    isBuffActive(key) { return (this.buffExpiresAt[key] || 0) > Date.now(); }
    markUiDirty() { this.uiDirty = true; }

    loop(currentTimestamp) {
        if (!this.running) return;
        try {
            let dt = (currentTimestamp - this.lastFrameTime) / 1000;
            if (!Number.isFinite(dt) || dt <= 0) dt = 0;
            dt = Math.min(dt, 0.1);
            this.lastFrameTime = currentTimestamp;

            this.update(dt);
            this.render();
        } catch (error) {
            console.error("[RECUPERAÇÃO ENGINE]:", error);
        }

        if (this.uiDirty && currentTimestamp - this.lastUiUpdate >= 150) {
            this.updateHud(); this.lastUiUpdate = currentTimestamp; this.uiDirty = false;
        }
        this.rafId = requestAnimationFrame(ts => this.loop(ts));
    }

    update(dt) {
        let buffChanged = false;
        for (const key of Object.keys(this.buffTimers)) {
            const remaining = Math.max(0, ((this.buffExpiresAt[key] || 0) - Date.now()) / 1000);
            if ((this.buffTimers[key] > 0) !== (remaining > 0)) buffChanged = true;
            this.buffTimers[key] = remaining;
        }
        if (buffChanged) this.markUiDirty();

        this.detectors.forEach(det => {
            if (det.pulseTimer > 0) {
                det.pulseTimer = Math.max(0, det.pulseTimer - dt * 4.5);
            }
        });

        const TWO_PI = Math.PI * 2;

        this.particles.forEach(p => {
            const prevAngle = p.angle;
            const visualFactor = this.reducedMotion ? 0.08 : 1;
            p.angle = (p.angle + this.getEffectiveSpeed() * (p.speedFactor || 1) * dt * visualFactor) % TWO_PI;

            this.detectors.forEach(det => {
                if (this.hasCrossedSensor(prevAngle, p.angle, det.angle)) {
                    this.onParticleCrossDetector(p, det);
                }
            });
        });

        if (this.floatingTexts.length > 18) {
            this.floatingTexts.splice(0, this.floatingTexts.length - 18);
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y -= ft.speedY * dt;
            ft.alpha -= dt * 1.3;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    hasCrossedSensor(prevAngle, currentAngle, targetAngle) {
        const TWO_PI = Math.PI * 2;
        let p = ((prevAngle % TWO_PI) + TWO_PI) % TWO_PI;
        let c = ((currentAngle % TWO_PI) + TWO_PI) % TWO_PI;
        let t = ((targetAngle % TWO_PI) + TWO_PI) % TWO_PI;

        let diff = c - p;
        if (diff < 0) diff += TWO_PI;

        let toTarget = t - p;
        if (toTarget < 0) toTarget += TWO_PI;

        return toTarget > 0 && toTarget <= diff;
    }

    onParticleCrossDetector(particle, detector) {
        detector.pulseTimer = 1.0;

        const prestigeMult = this.prestigeLevel + 1;
        const colliderMult = this.buffTimers.collider > 0 ? 1.25 : 1.0;
        const condenserMult = this.buffTimers.condenser > 0 ? 1.5 : 1.0;

        let luckMultiplier = 1.0;
        let isLucky = false;
        if (this.permanentLuck > 0 && Math.random() < this.permanentLuck) {
            luckMultiplier = 2.0;
            isLucky = true;
        }

        const earned = particle.data.mass * prestigeMult * colliderMult * condenserMult * luckMultiplier;
        this.coins += earned;
        this.markUiDirty();

        QuantumAudio.playLaserHit();

        if (window.missionManager) {
            window.missionManager.recordDetection(particle.data, earned);
        }

        const detX = this.track.centerX + Math.cos(detector.angle) * this.track.radiusX;
        const detY = this.track.centerY + Math.sin(detector.angle) * this.track.radiusY;

        this.floatingTexts.push({
            x: detX + (Math.random() - 0.5) * 20,
            y: detY - 14,
            text: isLucky ? `+${formatQuantumNumber(earned)} (2X!)` : `+${formatQuantumNumber(earned)}`,
            alpha: 1.0,
            speedY: 34,
            color: isLucky ? "#f1c40f" : (particle.data.color || "#4ce6e6")
        });
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.clientWidth || 300;
        const h = this.canvas.clientHeight || 240;

        ctx.clearRect(0, 0, w, h);

        this.renderVacuumChamber(ctx);
        this.renderMachineDetails(ctx);
        this.renderDetectorStations(ctx);
        this.renderParticles(ctx);
        this.renderFloatingEffects(ctx);
    }

    renderVacuumChamber(ctx) {
        const { centerX, centerY, radiusX, radiusY, tubeWidth } = this.track;
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

        ctx.save();
        const w=this.canvas.clientWidth||300,h=this.canvas.clientHeight||240;
        const bg=ctx.createRadialGradient(centerX,centerY,20,centerX,centerY,Math.max(w,h)*.7);
        bg.addColorStop(0,isLightTheme?'#dbeafe':'#111d32');bg.addColorStop(.55,isLightTheme?'#cbd5e1':'#07111f');bg.addColorStop(1,isLightTheme?'#94a3b8':'#02050b');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
        ctx.strokeStyle=isLightTheme?'rgba(30,64,175,.12)':'rgba(76,230,230,.08)';ctx.lineWidth=1;
        for(let x=16;x<w;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
        for(let y=16;y<h;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
        const shell=ctx.createLinearGradient(centerX-radiusX,centerY-radiusY,centerX+radiusX,centerY+radiusY);shell.addColorStop(0,isLightTheme?'#64748b':'#111827');shell.addColorStop(.5,isLightTheme?'#e2e8f0':'#334155');shell.addColorStop(1,isLightTheme?'#475569':'#050a12');
        ctx.beginPath();ctx.ellipse(centerX,centerY,radiusX,radiusY,0,0,Math.PI*2);ctx.lineWidth=tubeWidth+18;ctx.strokeStyle=isLightTheme?'#64748b':'#050912';ctx.stroke();
        ctx.beginPath();ctx.ellipse(centerX,centerY,radiusX,radiusY,0,0,Math.PI*2);ctx.lineWidth=tubeWidth+8;ctx.strokeStyle=shell;ctx.stroke();
        ctx.beginPath();ctx.ellipse(centerX,centerY,radiusX,radiusY,0,0,Math.PI*2);ctx.lineWidth=tubeWidth;ctx.strokeStyle=isLightTheme?'#1e293b':'#08101d';ctx.stroke();
        const beam=isLightTheme?'#075985':'#67e8f9';ctx.beginPath();ctx.ellipse(centerX,centerY,radiusX,radiusY,0,0,Math.PI*2);ctx.lineWidth=3;ctx.strokeStyle=beam;ctx.shadowColor=beam;ctx.shadowBlur=isLightTheme?3:12;ctx.stroke();
        ctx.shadowBlur=0;ctx.setLineDash([3,7]);ctx.beginPath();ctx.ellipse(centerX,centerY,radiusX,radiusY,0,0,Math.PI*2);ctx.lineWidth=1;ctx.strokeStyle=isLightTheme?'#bae6fd':'rgba(255,255,255,.65)';ctx.stroke();ctx.setLineDash([]);
        ctx.restore();
    }

    renderMachineDetails(ctx) {
        const {centerX,centerY,radiusX,radiusY,tubeWidth}=this.track,isLight=document.documentElement.getAttribute('data-theme')==='light';
        ctx.save();
        // Estruturas de suporte e bobinas segmentadas dão escala industrial ao anel.
        for(let i=0;i<16;i++){const a=i*Math.PI/8,c=Math.cos(a),s=Math.sin(a),ix=centerX+c*(radiusX-tubeWidth*.9),iy=centerY+s*(radiusY-tubeWidth*.9),ox=centerX+c*(radiusX+tubeWidth*.9),oy=centerY+s*(radiusY+tubeWidth*.9);ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(ox,oy);ctx.lineWidth=5;ctx.strokeStyle=isLight?'#475569':'#1e293b';ctx.stroke();ctx.beginPath();ctx.arc(ox,oy,4,0,Math.PI*2);ctx.fillStyle=i%2?'#0ea5e9':'#a855f7';ctx.fill();}
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=isLight?'#0f172a':'#e0f2fe';ctx.font="700 16px 'Chakra Petch', sans-serif";ctx.fillText('AURORA',centerX,centerY-7);ctx.fillStyle=isLight?'#334155':'#94a3b8';ctx.font="700 9px 'Share Tech Mono', monospace";ctx.fillText('ANEL DE SÍNTESE',centerX,centerY+12);
        ctx.restore();
    }

    renderDetectorStations(ctx) {
        const { centerX, centerY, radiusX, radiusY, tubeWidth } = this.track;
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

        this.detectors.forEach(det => {
            const x = centerX + Math.cos(det.angle) * radiusX;
            const y = centerY + Math.sin(det.angle) * radiusY;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(det.angle + Math.PI / 2);

            const isPulsing = det.pulseTimer > 0;

            const detectorGradient=ctx.createLinearGradient(-18,0,18,0);detectorGradient.addColorStop(0,isLightTheme?'#334155':'#05070c');detectorGradient.addColorStop(.5,isPulsing?'#166534':(isLightTheme?'#e2e8f0':'#293548'));detectorGradient.addColorStop(1,isLightTheme?'#334155':'#05070c');
            ctx.fillStyle=detectorGradient;ctx.strokeStyle=isPulsing?'#4ade80':(isLightTheme?'#075985':'#38bdf8');ctx.lineWidth=2;
            ctx.beginPath();ctx.roundRect(-18,-tubeWidth/2-11,36,tubeWidth+22,6);ctx.fill();ctx.stroke();
            ctx.fillStyle=isLightTheme?'#0f172a':'#cbd5e1';ctx.font="700 7px 'Share Tech Mono', monospace";ctx.textAlign='center';ctx.fillText(det.label,0,-tubeWidth/2-15);

            ctx.beginPath();
            ctx.moveTo(0, -tubeWidth / 2);
            ctx.lineTo(0, tubeWidth / 2);
            ctx.lineWidth = isPulsing ? 5 : 2;
            ctx.strokeStyle = isPulsing ? "#2ecc71" : "#ff3366";
            ctx.shadowColor = isPulsing ? "#2ecc71" : "#ff3366";
            ctx.shadowBlur = isPulsing ? 18 : 6;
            ctx.stroke();

            ctx.restore();
        });
    }

    renderParticles(ctx) {
        const { centerX, centerY, radiusX, radiusY } = this.track;

        this.particles.forEach(p => {
            const x = centerX + Math.cos(p.angle) * radiusX;
            const y = centerY + Math.sin(p.angle) * radiusY;

            ctx.save();
            ctx.translate(x, y);

            const texture = atomTextures.getTexture(p.data);

            if (texture && texture.complete && texture.naturalWidth > 0 && !texture._isFailed) {
                const s = p.size;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(texture, -s / 2, -s / 2, s, s);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.fillStyle = p.data.color;
                ctx.shadowColor = p.data.color;
                ctx.shadowBlur = 8;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();

                ctx.font = "bold 9px 'Chakra Petch', sans-serif";
                ctx.fillStyle = "#000000";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(p.data.symbol, 0, 1);
            }

            ctx.restore();
        });
    }

    renderFloatingEffects(ctx) {
        if (!this.floatingTexts || this.floatingTexts.length === 0) return;

        ctx.save();
        ctx.font = "bold 15px 'Chakra Petch', 'Share Tech Mono', sans-serif";
        ctx.textBaseline = "middle";

        const iconSize = 16;
        const gap = 4;

        this.floatingTexts.forEach(ft => {
            ctx.globalAlpha = Math.max(0, ft.alpha);

            const text = ft.text || "";
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const totalWidth = textWidth + gap + iconSize;
            const startX = ft.x - totalWidth / 2;

            ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
            ctx.shadowBlur = 6;
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
            ctx.strokeText(text, startX, ft.y);

            ctx.fillStyle = ft.color;
            ctx.fillText(text, startX, ft.y);

            const iconX = startX + textWidth + gap;
            const iconY = ft.y - iconSize / 2;

            if (this.coinImg && this.coinImg.complete && this.coinImg.naturalWidth > 0) {
                ctx.drawImage(this.coinImg, iconX, iconY, iconSize, iconSize);
            } else {
                ctx.beginPath();
                ctx.arc(iconX + iconSize / 2, ft.y, iconSize / 2 - 1, 0, Math.PI * 2);
                ctx.fillStyle = "#f1c40f";
                ctx.fill();
            }
        });

        ctx.restore();
    }

    updateHud() {
        const elCoins = document.getElementById('display-coins');
        if (elCoins) elCoins.textContent = formatQuantumNumber(this.coins);

        const elPhotons = document.getElementById('display-photons');
        if (elPhotons) elPhotons.textContent = formatQuantumNumber(this.photons);

        this.updateSensorOverlay();

        window.atomicSession?.renderUi?.();
    }

    destroy() {
        this.running = false;
        if (this.rafId !== null) cancelAnimationFrame(this.rafId);
        if (this.resizeTimeoutId !== null) clearTimeout(this.resizeTimeoutId);
        this.abortController.abort();
        this.particles.length = 0; this.floatingTexts.length = 0;
        this.canvas = null; this.ctx = null;
    }
}
