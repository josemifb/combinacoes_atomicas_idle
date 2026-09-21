/**
 * REGRAS PURAS DO JOGO
 * Funções deste arquivo não dependem do DOM. Isso permite testar fusões,
 * preços, limites e saves sem abrir o navegador.
 */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.AtomicRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // A versão 6 acrescenta a coleção histórica permanente ao save.
    const MAX_SLOTS = 8, BASE_SLOTS = 4, SAVE_VERSION = 6;
    const TIER_RANGES = Object.freeze([null,[27,31],[32,36],[37,42],[43,48],[49,54],[55,64],[65,74],[75,84],[85,100],[101,118]]);
    const TIER_ACCELERATOR = Object.freeze([0,5,6,7,8,9,10,11,12,13,14]);
    const ACCELERATOR_MAX_Z = Object.freeze([0,2,6,12,26,31,36,42,48,54,64,74,84,100,118]);
    const finite = (v,min,max,int=false) => typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max&&(!int||Number.isInteger(v));
    const safeUuid = () => globalThis.crypto?.randomUUID?.() || `atom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    const unlockedForLevel = level => Math.min(MAX_SLOTS, BASE_SLOTS + Math.max(0, Math.min(4, level - 1)));
    const slotCost = (n,p=0) => Math.ceil(600*Math.pow(2.25,n-5)*Math.pow(1.18,p));
    const moduleCost = (n,p=0) => Math.ceil(2500*Math.pow(2.1,n-1)*Math.pow(1.18,p));
    /** Preço do H: crescimento por compra limitado pelo teto da rodada. */
    const protonCost = (purchases=0,prestige=0) => {
        const safePurchases=Math.max(0,Math.trunc(Number(purchases)||0));
        const safePrestige=Math.max(0,Math.trunc(Number(prestige)||0));
        const scale=1+0.35*safePrestige;
        return Math.min(Math.floor(30000*scale),Math.floor(60*scale*Math.pow(1.15,safePurchases)));
    };
    const postIronTierForZ = z => z<=26?0:TIER_RANGES.findIndex(r=>r&&z>=r[0]&&z<=r[1]);
    function canSynthesize(leftZ,rightZ,c={}) {
        const resultZ=(leftZ===1||rightZ===1)?Math.max(leftZ,rightZ)+1:leftZ===rightZ?leftZ+rightZ:0;
        if(!resultZ||resultZ>118)return{ok:false,reason:'Combinação incompatível.',resultZ};
        const level=Math.max(1,Math.min(14,c.acceleratorLevel||1));
        if(resultZ>ACCELERATOR_MAX_Z[level])return{ok:false,reason:`Acelerador suporta até Z=${ACCELERATOR_MAX_Z[level]}.`,resultZ};
        const tier=postIronTierForZ(resultZ),joint=Math.min(c.cryoLevel||0,c.toroidalLevel||0);
        if(tier>joint)return{ok:false,reason:`Síntese assistida requer ambos os módulos no Tier ${tier}.`,resultZ};
        return{ok:true,resultZ,tier};
    }
    const canBuyModule=(next,mods,level)=>finite(next,1,10,true)&&level>=TIER_ACCELERATOR[next]&&(next===1||Math.min(mods.cryo||0,mods.toroidal||0)>=next-1);
    const reactionKey=(a,b,r)=>`${Math.min(a,b)}+${Math.max(a,b)}=${r}`;
    const isNewDiscovery=(z,known,source)=>source==='fusion'&&finite(z,1,118,true)&&known instanceof Set&&!known.has(z);
    const migratePreviousSave=d=>d&&[3,4,5].includes(d.saveVersion)?{...d,saveVersion:6,discoveredZLifetime:[...new Set([1,...(Array.isArray(d.discoveredZLifetime)?d.discoveredZLifetime:[]),...(Array.isArray(d.synthesizedZ)?d.synthesizedZ:[])].filter(z=>finite(z,1,118,true)))],hydrogenCardPresented:Boolean(d.hydrogenCardPresented),historyUnlockedIds:Array.isArray(d.historyUnlockedIds)?d.historyUnlockedIds:[],historySeenIds:Array.isArray(d.historySeenIds)?d.historySeenIds:[],pendingHistoryFragmentId:typeof d.pendingHistoryFragmentId==='string'?d.pendingHistoryFragmentId:null}:null;
    const replacementTarget=(base,p,cap=1e9)=>Math.min(cap,Math.max(1,Math.ceil(base*Math.pow(1.18,p))));
    const effectiveSpeed=(base,bonus,buffActive,factor=1)=>base*(1+Math.min(bonus+(buffActive?.15:0),1+(buffActive?.15:0)))*factor;
    const incomePerSecond=({particleYield=0,angularSpeed=0,detectors=0,prestigeMultiplier=1,collider=false,condenser=false,luck=0})=>particleYield*(angularSpeed/(Math.PI*2))*detectors*prestigeMultiplier*(collider?1.25:1)*(condenser?1.5:1)*(1+Math.max(0,luck));
    function createSafeStorage(backend,onFailure=()=>{}){let available=true;const fail=e=>{available=false;onFailure(e);};return{get available(){return available;},get(k){try{return backend.getItem(k);}catch(e){fail(e);return null;}},set(k,v){try{backend.setItem(k,v);return true;}catch(e){fail(e);return false;}},remove(k){try{backend.removeItem(k);return true;}catch(e){fail(e);return false;}}};}
    function validateSave(d,registry){
        if(!d||typeof d!=='object'||d.saveVersion!==SAVE_VERSION)return{ok:false,error:'Versão de save incompatível.'};
        const ok=[finite(d.coins,0,1e300),finite(d.photons,0,1e12),finite(d.prestigeLevel,0,10000,true),finite(d.playerLevel,1,50,true),finite(d.currentMissionIndex,0,49,true),finite(d.fusionLevel,1,14,true),finite(d.unlockedSlots,4,8,true),finite(d.revision,0,Number.MAX_SAFE_INTEGER,true),finite(d.savedAt,0,Number.MAX_SAFE_INTEGER,true)].every(Boolean);
        if(!ok||d.unlockedSlots>unlockedForLevel(d.fusionLevel))return{ok:false,error:'Campos numéricos fora dos limites.'};
        if(!Array.isArray(d.slots)||d.slots.length!==8)return{ok:false,error:'O save deve conter exatamente oito slots.'};
        for(let i=0;i<8;i++){const a=d.slots[i];if(i>=d.unlockedSlots&&a!==null)return{ok:false,error:'Há átomo em slot bloqueado.'};if(a!==null&&(!a||!finite(a.protons,1,118,true)||!registry[a.protons]))return{ok:false,error:'Elemento inexistente no registro.'};}
        const m=d.modules;if(!m||!finite(m.cryo,0,10,true)||!finite(m.toroidal,0,10,true))return{ok:false,error:'Módulos inválidos.'};
        if((m.cryo&&d.fusionLevel<TIER_ACCELERATOR[m.cryo])||(m.toroidal&&d.fusionLevel<TIER_ACCELERATOR[m.toroidal]))return{ok:false,error:'Módulo excede o acelerador.'};
        if(!d.round||!finite(d.round.detections,0,1e15,true)||!finite(d.round.fusions,0,1e15,true)||!finite(d.round.detectedCoins,0,1e300))return{ok:false,error:'Contadores inválidos.'};
        if(!Array.isArray(d.synthesizedZ)||d.synthesizedZ.some(z=>!finite(z,1,118,true)))return{ok:false,error:'Sínteses inválidas.'};
        if(!Array.isArray(d.discoveredZLifetime)||!d.discoveredZLifetime.includes(1)||d.discoveredZLifetime.some(z=>!finite(z,1,118,true))||new Set(d.discoveredZLifetime).size!==d.discoveredZLifetime.length)return{ok:false,error:'Descobertas vitalícias inválidas.'};
        if(typeof d.hydrogenCardPresented!=='boolean')return{ok:false,error:'Estado da apresentação do hidrogênio inválido.'};
        if(!Array.isArray(d.historyUnlockedIds)||!Array.isArray(d.historySeenIds))return{ok:false,error:'Coleção histórica inválida.'};
        if(![...d.historyUnlockedIds,...d.historySeenIds].every(id=>typeof id==='string'&&id.length>0&&id.length<100))return{ok:false,error:'Identificador histórico inválido.'};
        if(d.pendingHistoryFragmentId!==null&&typeof d.pendingHistoryFragmentId!=='string')return{ok:false,error:'Recompensa histórica pendente inválida.'};
        if(!d.reactionCounts||typeof d.reactionCounts!=='object'||Object.values(d.reactionCounts).some(v=>!finite(v,0,1e15,true)))return{ok:false,error:'Reações inválidas.'};
        if(!finite(d.speedBonus,0,1)||!finite(d.detectorsCount,1,10,true)||!finite(d.currentInjectorZ,1,118,true)||!finite(d.offlineHoursLevel,0,10,true)||!finite(d.quantumLuckLevel,0,10,true))return{ok:false,error:'Melhorias inválidas.'};
        if(!d.buffExpiresAt||['collider','cryo','condenser'].some(k=>!finite(d.buffExpiresAt[k],0,Number.MAX_SAFE_INTEGER)))return{ok:false,error:'Buffs inválidos.'};
        if(!['active','completed','replacement_active','prestige_ready'].includes(d.missionState))return{ok:false,error:'Estado de missão inválido.'};
        if(d.replacementMission!==null&&(!d.replacementMission||!['fusions','hits','coins','slot_purchase','module_purchase'].includes(d.replacementMission.type)||!finite(d.replacementMission.target,1,1e9)||!finite(d.replacementMission.current,0,1e9)))return{ok:false,error:'Missão substituta inválida.'};
        return{ok:true};
    }
    return{MAX_SLOTS,BASE_SLOTS,SAVE_VERSION,TIER_RANGES,TIER_ACCELERATOR,ACCELERATOR_MAX_Z,finite,safeUuid,unlockedForLevel,slotCost,moduleCost,protonCost,postIronTierForZ,canSynthesize,canBuyModule,reactionKey,isNewDiscovery,migratePreviousSave,replacementTarget,effectiveSpeed,incomePerSecond,createSafeStorage,validateSave};
});
