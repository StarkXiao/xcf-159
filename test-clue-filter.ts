import { store } from './src/game/Store';
import { Clue, MechanismPurpose, HallType } from './src/game/types';

console.log('=== 线索背包关联检索功能测试 ===\n');

function test(description: string, fn: () => boolean): void {
  try {
    const result = fn();
    console.log(`${result ? '✅' : '❌'} ${description}`);
    if (!result) {
      console.log('   测试失败！');
    }
  } catch (e) {
    console.log(`❌ ${description}`);
    console.log(`   错误: ${e}`);
  }
}

console.log('--- 数据结构测试 ---');

test('所有线索都有mechanismPurpose字段', () => {
  const allClues = (store as any).clues as Clue[];
  return allClues.every(clue => clue.mechanismPurpose !== undefined);
});

test('至少有一个线索有关联的机关用途', () => {
  const allClues = (store as any).clues as Clue[];
  return allClues.some(clue => clue.mechanismPurpose && clue.mechanismPurpose.length > 0);
});

test('mechanismPurpose字段结构正确', () => {
  const allClues = (store as any).clues as Clue[];
  const cluesWithPurpose = allClues.filter(c => c.mechanismPurpose && c.mechanismPurpose.length > 0);
  if (cluesWithPurpose.length === 0) return false;
  
  return cluesWithPurpose.every(clue => 
    clue.mechanismPurpose!.every(p => 
      p.mechanismId && p.mechanismName && p.purpose
    )
  );
});

console.log('\n--- 筛选方法测试 ---');

test('getCluesByExhibition 能返回展厅相关线索', () => {
  const result = store.getCluesByExhibition('exhibition_2');
  return Array.isArray(result);
});

test('getCluesByMechanism 能返回机关相关线索', () => {
  const result = store.getCluesByMechanism('mech_1');
  return Array.isArray(result);
});

test('getAvailableCluesForMechanism 能返回可用线索', () => {
  const result = store.getAvailableCluesForMechanism('mech_1');
  return Array.isArray(result);
});

test('getCluesFiltered 空筛选返回所有已收集线索', () => {
  const result = store.getCluesFiltered({ onlyCollected: false });
  const allClues = (store as any).clues as Clue[];
  return result.length === allClues.length;
});

test('getCluesFiltered 按章节筛选', () => {
  const result = store.getCluesFiltered({ chapterId: 'chapter_1', onlyCollected: false });
  return result.every(clue => clue.chapterId === 'chapter_1');
});

test('getCluesFiltered 按展厅筛选', () => {
  const result = store.getCluesFiltered({ hallType: 'history' as HallType, onlyCollected: false });
  return result.length > 0;
});

test('getCluesFiltered 按机关筛选', () => {
  const result = store.getCluesFiltered({ mechanismId: 'mech_1', onlyCollected: false });
  return Array.isArray(result);
});

test('getCluesFiltered 多条件组合筛选', () => {
  const result = store.getCluesFiltered({ 
    chapterId: 'chapter_1', 
    hallType: 'history' as HallType,
    onlyCollected: false 
  });
  return result.every(clue => clue.chapterId === 'chapter_1');
});

console.log('\n--- 关联查询测试 ---');

test('getMechanismsByClue 能返回线索关联的机关', () => {
  const result = store.getMechanismsByClue('clue_1');
  return Array.isArray(result);
});

test('isClueUsefulForMechanism 能正确判断关联性', () => {
  const result = store.isClueUsefulForMechanism('clue_1', 'mech_1');
  return typeof result === 'boolean';
});

test('isClueUsefulInCurrentExhibition 能正确判断当前展厅可用性', () => {
  const result = store.isClueUsefulInCurrentExhibition('clue_1');
  return typeof result === 'boolean';
});

test('getClueMechanismPurpose 能返回用途信息', () => {
  const result = store.getClueMechanismPurpose('clue_1');
  return Array.isArray(result);
});

test('getCluePurposeDisplay 能返回用途描述', () => {
  const result = store.getCluePurposeDisplay('clue_1');
  return typeof result === 'string';
});

console.log('\n--- 筛选选项测试 ---');

test('getDistinctMechanismPurposes 能返回不重复的机关用途', () => {
  const result = store.getDistinctMechanismPurposes();
  return Array.isArray(result) && result.length > 0;
});

test('getDistinctExhibitionsForCollectedClues 能返回展厅列表', () => {
  const result = store.getDistinctExhibitionsForCollectedClues();
  return Array.isArray(result);
});

console.log('\n--- 综合测试 ---');

test('模拟收集线索后筛选功能正常', () => {
  const testClueId = 'clue_1';
  const clue = store.getClueById(testClueId);
  if (!clue) return false;
  
  (store as any).clues.find((c: Clue) => c.id === testClueId).collected = true;
  
  const collected = store.getCollectedClues();
  const hasClue = collected.some(c => c.id === testClueId);
  
  const filtered = store.getCluesFiltered({ chapterId: 'chapter_1', onlyCollected: true });
  const hasFiltered = filtered.some(c => c.id === testClueId);
  
  (store as any).clues.find((c: Clue) => c.id === testClueId).collected = false;
  
  return hasClue && hasFiltered;
});

test('筛选结果正确关联mechanismPurpose', () => {
  const allClues = (store as any).clues as Clue[];
  const cluesWithPurpose = allClues.filter(c => c.mechanismPurpose && c.mechanismPurpose.length > 0);
  
  if (cluesWithPurpose.length === 0) return false;
  
  const testClue = cluesWithPurpose[0];
  const mechId = testClue.mechanismPurpose![0].mechanismId;
  
  const filtered = store.getCluesFiltered({ mechanismId: mechId, onlyCollected: false });
  
  return filtered.some(c => c.id === testClue.id);
});

console.log('\n=== 测试完成 ===');
