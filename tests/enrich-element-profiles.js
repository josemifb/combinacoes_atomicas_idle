'use strict';
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../dados/dados_elementos');
const family=(z,group,classification)=>{if(z>=57&&z<=71)return'Lantanídeos';if(z>=89&&z<=103)return'Actinídeos';return({1:'Metais alcalinos',2:'Metais alcalino-terrosos',13:'Família do boro',14:'Família do carbono',15:'Pnictogênios',16:'Calcogênios',17:'Halogênios',18:'Gases nobres'})[group]||classification||'Metal de transição';};
const block=(z,group)=>((z>=57&&z<=71)||(z>=89&&z<=103))?'f':(z===2||group<=2)?'s':group>=13?'p':'d';
let changed=0;
for(const file of fs.readdirSync(dir).filter(name=>name.endsWith('.md'))){const full=path.join(dir,file);let text=fs.readFileSync(full,'utf8');if(text.includes('| Família / bloco |'))continue;const z=Number((text.match(/Número atômico \(Z\) \|\s*(\d+)/)||[])[1]);const position=text.match(/Grupo \/ Período \|\s*([^|/]+?)\s*\/\s*(\d+)/);const classification=(text.match(/Classificação \|\s*([^|\r\n]+)/)||[])[1]?.trim();if(!z||!position)throw new Error(`Perfil sem posição periódica: ${file}`);const group=/^\d+$/.test(position[1].trim())?Number(position[1]):3;const line=`| Família / bloco | ${family(z,group,classification)} / bloco ${block(z,group)} |`;text=text.replace(/(\| Grupo \/ Período \|[^\r\n]+\|)/,`$1\n${line}`);fs.writeFileSync(full,text,'utf8');changed++;}
console.log(`Perfis enciclopédicos complementados: ${changed}.`);
