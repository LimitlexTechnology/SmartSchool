const fs = require('fs');
const p = 'c:\\\\Users\\\\kobby\\\\OneDrive\\\\Documentos\\\\GitHub\\\\SmartSchool\\\\web\\\\src\\\\pages\\\\Diary.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/\\`ann-\\\${idx}\\`/g, '`ann-${idx}`');
c = c.replace(/className=\{\\`text-\[10px\]/g, 'className={`text-[10px]');
c = c.replace(/\\\$\{\n/g, '${\n');
c = c.replace(/\\\$\{alert\.color/g, '${alert.color');
c = c.replace(/\\\$\{status\.type/g, '${status.type');
c = c.replace(/\\\$\{newAnnouncement\.targetGroup/g, '${newAnnouncement.targetGroup');
c = c.replace(/}\`\}/g, '}`}');
c = c.replace(/\\`/g, '`');

fs.writeFileSync(p, c);
console.log('Fixed Diary.jsx');
