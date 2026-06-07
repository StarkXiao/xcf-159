import { store } from './src/game/Store';
const allClues = (store as any).clues;
const missing = allClues.filter((c: any) => c.mechanismPurpose === undefined);
console.log('缺少mechanismPurpose的线索:');
missing.forEach((c: any) => console.log(' -', c.id, c.name, c.chapterId));
console.log('总计:', missing.length, '/', allClues.length);
