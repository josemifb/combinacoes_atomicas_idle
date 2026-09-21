'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'dados','dados_elementos'),output=path.join(root,'js','element-profiles.generated.js');
const profiles={};
for(const file of fs.readdirSync(dir).filter(name=>name.endsWith('.md')).sort()){
    const z=Number(file.slice(0,3));
    if(!Number.isInteger(z)||z<1||z>118)throw new Error(`Nome de perfil inválido: ${file}`);
    profiles[z]=fs.readFileSync(path.join(dir,file),'utf8');
}
if(Object.keys(profiles).length!==118)throw new Error('A geração exige exatamente 118 perfis.');
const source=`'use strict';\n/* ARQUIVO GERADO de dados/dados_elementos/*.md. Não edite diretamente. */\nglobalThis.ELEMENT_PROFILE_MARKDOWN=Object.freeze(${JSON.stringify(profiles)});\n`;
fs.writeFileSync(output,source,'utf8');
console.log(`Perfis embarcados gerados: ${Object.keys(profiles).length}.`);
