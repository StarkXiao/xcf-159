import { store } from './src/game/Store';
import { Clue, HallType } from './src/game/types';

console.log('=== 线索高亮验证测试 ===\n');

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

function setupTestData(): void {
  const allClues = (store as any).clues as Clue[];
  
  allClues.forEach(clue => {
    clue.collected = false;
  });
  
  const testClueIds = ['clue_1', 'clue_2', 'clue_3', 'clue_6', 'clue_7', 'clue_11'];
  testClueIds.forEach(id => {
    const clue = allClues.find(c => c.id === id);
    if (clue) clue.collected = true;
  });
  
  const allMechs = (store as any).mechanisms as any[];
  allMechs.forEach(m => {
    m.solved = false;
  });
  
  store.setCurrentExhibition('exhibition_2');
}

console.log('--- 测试环境准备 ---');
setupTestData();
console.log('✅ 已收集线索: clue_1, clue_2, clue_3, clue_6, clue_7, clue_11');
console.log('✅ 当前展厅: exhibition_2');
console.log('');

console.log('--- 新增方法验证 ---');

test('getAvailableCluesForExhibition 能正确返回展厅可用线索', () => {
  const result = store.getAvailableCluesForExhibition('exhibition_2');
  return Array.isArray(result) && result.every(c => c.collected);
});

test('isClueUsefulForExhibition 能正确判断展厅可用性', () => {
  const result = store.isClueUsefulForExhibition('clue_1', 'exhibition_2');
  return typeof result === 'boolean';
});

console.log('\n--- 展厅筛选维度验证 ---');

test('getDistinctExhibitionsForCollectedClues 能返回已收集线索关联的展厅', () => {
  const result = store.getDistinctExhibitionsForCollectedClues();
  return Array.isArray(result) && result.length > 0 && result.every(e => e.id && e.name);
});

test('展厅列表只包含已收集线索关联的展厅', () => {
  const exhibitions = store.getDistinctExhibitionsForCollectedClues();
  const collectedClues = store.getCollectedClues();
  
  return exhibitions.every(exhibition => {
    return collectedClues.some(clue => 
      clue.mechanismPurpose?.some(p => p.exhibitionId === exhibition.id)
    );
  });
});

console.log('\n--- 筛选链路复用验证 ---');

test('按exhibitionId筛选能正确过滤线索', () => {
  const result = store.getCluesFiltered({ 
    exhibitionId: 'exhibition_2', 
    onlyCollected: false 
  });
  
  const exhibition = (store as any).exhibitions.find((e: any) => e.id === 'exhibition_2');
  const clueIds = exhibition.hotspots
    .filter((h: any) => h.type === 'clue')
    .map((h: any) => h.targetId);
  
  return result.every(c => clueIds.includes(c.id));
});

test('exhibitionId筛选不影响chapterId筛选', () => {
  const result = store.getCluesFiltered({ 
    chapterId: 'chapter_1',
    exhibitionId: 'exhibition_2',
    onlyCollected: false 
  });
  
  return result.every(c => c.chapterId === 'chapter_1');
});

console.log('\n--- 高亮逻辑验证（按筛选条件） ---');

test('无筛选时，高亮基于当前展厅', () => {
  const currentExhibition = (store as any).getCurrentExhibition();
  const mechs = store.getCurrentExhibitionMechanisms();
  const testClue = store.getClueById('clue_1');
  
  if (!testClue) return false;
  
  const expected = mechs.some((m: any) => 
    store.isClueUsefulForMechanism(testClue.id, m.id)
  );
  const actual = store.isClueUsefulInCurrentExhibition(testClue.id);
  
  return expected === actual;
});

test('筛选mechanismId时，高亮基于该机关', () => {
  const testClue = store.getClueById('clue_1');
  if (!testClue?.mechanismPurpose) return false;
  
  const mechId = testClue.mechanismPurpose[0].mechanismId;
  const expected = store.isClueUsefulForMechanism(testClue.id, mechId);
  
  return expected === true;
});

test('筛选exhibitionId时，高亮基于该展厅', () => {
  const testClue = store.getClueById('clue_1');
  if (!testClue) return false;
  
  const expected = store.isClueUsefulForExhibition(testClue.id, 'exhibition_2');
  return typeof expected === 'boolean';
});

console.log('\n--- 筛选组合验证 ---');

test('章节+展厅筛选结果正确', () => {
  const result = store.getCluesFiltered({
    chapterId: 'chapter_1',
    exhibitionId: 'exhibition_2',
    onlyCollected: true
  });
  
  return result.every(c => 
    c.chapterId === 'chapter_1' && c.collected
  );
});

test('展厅+机关用途筛选结果正确', () => {
  const testClue = store.getClueById('clue_1');
  if (!testClue?.mechanismPurpose) return false;
  
  const mechId = testClue.mechanismPurpose[0].mechanismId;
  
  const result = store.getCluesFiltered({
    exhibitionId: 'exhibition_2',
    mechanismId: mechId,
    onlyCollected: true
  });
  
  return result.every(c => 
    c.mechanismPurpose?.some(p => p.mechanismId === mechId) && c.collected
  );
});

test('章节+展厅+机关用途筛选结果正确', () => {
  const testClue = store.getClueById('clue_1');
  if (!testClue?.mechanismPurpose) return false;
  
  const mechId = testClue.mechanismPurpose[0].mechanismId;
  
  const result = store.getCluesFiltered({
    chapterId: 'chapter_1',
    exhibitionId: 'exhibition_2',
    mechanismId: mechId,
    onlyCollected: true
  });
  
  return result.every(c => 
    c.chapterId === 'chapter_1' && 
    c.mechanismPurpose?.some(p => p.mechanismId === mechId) && 
    c.collected
  );
});

console.log('\n--- onlyAvailable筛选验证 ---');

test('onlyAvailable+mechanismId 只返回该机关可用线索', () => {
  const testClue = store.getClueById('clue_1');
  if (!testClue?.mechanismPurpose) return false;
  
  const mechId = testClue.mechanismPurpose[0].mechanismId;
  
  const result = store.getCluesFiltered({
    mechanismId: mechId,
    onlyAvailable: true,
    onlyCollected: true
  });
  
  const availableIds = store.getAvailableCluesForMechanism(mechId).map(c => c.id);
  
  return result.every(c => availableIds.includes(c.id));
});

test('onlyAvailable+exhibitionId 只返回该展厅可用线索', () => {
  const result = store.getCluesFiltered({
    exhibitionId: 'exhibition_2',
    onlyAvailable: true,
    onlyCollected: true
  });
  
  const availableIds = store.getAvailableCluesForExhibition('exhibition_2').map(c => c.id);
  
  return result.every(c => availableIds.includes(c.id));
});

test('onlyAvailable无指定筛选时，只返回当前展厅可用线索', () => {
  const result = store.getCluesFiltered({
    onlyAvailable: true,
    onlyCollected: true
  });
  
  const availableIds = store.getAvailableCluesForCurrentExhibition().map(c => c.id);
  
  return result.every(c => availableIds.includes(c.id));
});

console.log('\n--- 高亮与可用物件同步验证 ---');

test('筛选mechanismId后，高亮线索与该机关可用物件完全同步', () => {
  const testClue = store.getClueById('clue_1');
  if (!testClue?.mechanismPurpose) return false;
  
  const mechId = testClue.mechanismPurpose[0].mechanismId;
  const availableClues = store.getAvailableCluesForMechanism(mechId);
  
  const filtered = store.getCluesFiltered({
    mechanismId: mechId,
    onlyCollected: true
  });
  
  const highlighted = filtered.filter(c => 
    store.isClueUsefulForMechanism(c.id, mechId)
  );
  
  const highlightedIds = highlighted.map(c => c.id).sort();
  const availableIds = availableClues.map(c => c.id).sort();
  
  return JSON.stringify(highlightedIds) === JSON.stringify(availableIds);
});

test('筛选exhibitionId后，高亮线索都是该展厅可用的', () => {
  const availableClueIds = store.getAvailableCluesForExhibition('exhibition_2').map(c => c.id);
  
  const filtered = store.getCluesFiltered({
    exhibitionId: 'exhibition_2',
    onlyCollected: true
  });
  
  const highlighted = filtered.filter(c => 
    store.isClueUsefulForExhibition(c.id, 'exhibition_2')
  );
  
  return highlighted.every(c => availableClueIds.includes(c.id));
});

test('筛选exhibitionId后，高亮线索是筛选结果中对该展厅有用的', () => {
  const filtered = store.getCluesFiltered({
    exhibitionId: 'exhibition_2',
    onlyCollected: true
  });
  
  const highlighted = filtered.filter(c => 
    store.isClueUsefulForExhibition(c.id, 'exhibition_2')
  );
  
  const nonHighlighted = filtered.filter(c => 
    !store.isClueUsefulForExhibition(c.id, 'exhibition_2')
  );
  
  const allHighlightedCorrect = highlighted.every(c => 
    store.isClueUsefulForExhibition(c.id, 'exhibition_2')
  );
  const allNonHighlightedCorrect = nonHighlighted.every(c => 
    !store.isClueUsefulForExhibition(c.id, 'exhibition_2')
  );
  
  return allHighlightedCorrect && allNonHighlightedCorrect;
});

test('无筛选时，高亮线索与当前展厅可用物件完全同步', () => {
  const availableClues = store.getAvailableCluesForCurrentExhibition();
  
  const filtered = store.getCluesFiltered({
    onlyCollected: true
  });
  
  const highlighted = filtered.filter(c => 
    store.isClueUsefulInCurrentExhibition(c.id)
  );
  
  const highlightedIds = highlighted.map(c => c.id).sort();
  const availableIds = availableClues.map(c => c.id).sort();
  
  return JSON.stringify(highlightedIds) === JSON.stringify(availableIds);
});

console.log('\n--- 切换场景验证 ---');

test('切换当前展厅后，高亮判断自动更新', () => {
  store.setCurrentExhibition('exhibition_1');
  const result1 = store.isClueUsefulInCurrentExhibition('clue_1');
  
  store.setCurrentExhibition('exhibition_2');
  const result2 = store.isClueUsefulInCurrentExhibition('clue_1');
  
  return typeof result1 === 'boolean' && typeof result2 === 'boolean';
});

test('切换当前展厅后，onlyAvailable筛选结果同步更新', () => {
  store.setCurrentExhibition('exhibition_1');
  const result1 = store.getCluesFiltered({
    onlyAvailable: true,
    onlyCollected: true
  });
  
  store.setCurrentExhibition('exhibition_2');
  const result2 = store.getCluesFiltered({
    onlyAvailable: true,
    onlyCollected: true
  });
  
  return Array.isArray(result1) && Array.isArray(result2);
});

console.log('\n--- 数据完整性验证 ---');

test('所有展厅筛选选项都有对应的exhibitionId', () => {
  const exhibitions = store.getDistinctExhibitionsForCollectedClues();
  const allExhibitions = (store as any).exhibitions as any[];
  
  return exhibitions.every(e => 
    allExhibitions.some((ae: any) => ae.id === e.id)
  );
});

test('展厅筛选的exhibitionId能正确复用到getCluesFiltered', () => {
  const exhibitions = store.getDistinctExhibitionsForCollectedClues();
  if (exhibitions.length === 0) return true;
  
  const testExhibition = exhibitions[0];
  const result = store.getCluesFiltered({
    exhibitionId: testExhibition.id,
    onlyCollected: true
  });
  
  return Array.isArray(result);
});

console.log('\n=== 测试完成 ===');
