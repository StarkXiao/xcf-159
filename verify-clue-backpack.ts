import { store } from './src/game/Store';
import { Clue } from './src/game/types';

const LOG_PREFIX = '🔍';

function log(section: string, message: string, data?: any): void {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${LOG_PREFIX} [${section}] ${message}`);
  if (data !== undefined) {
    console.log('  ', JSON.stringify(data, null, 2).replace(/\n/g, '\n   '));
  }
}

function logSuccess(section: string, message: string): void {
  console.log(`✅ [${section}] ${message}`);
}

function logError(section: string, message: string, expected?: any, actual?: any): void {
  console.log(`❌ [${section}] ${message}`);
  if (expected !== undefined) {
    console.log(`   期望: ${JSON.stringify(expected)}`);
  }
  if (actual !== undefined) {
    console.log(`   实际: ${JSON.stringify(actual)}`);
  }
}

function setupTestEnvironment(): void {
  log('初始化', '开始设置测试环境...');
  
  const allClues = (store as any).clues as Clue[];
  allClues.forEach(clue => { clue.collected = false; });
  
  const allMechs = (store as any).mechanisms as any[];
  allMechs.forEach(m => { m.solved = false; });
  
  store.setCurrentExhibition('exhibition_2');
  
  (store as any).state.unlockedExhibitions = ['exhibition_1', 'exhibition_2', 'exhibition_3'];
  
  const collectClueIds = ['clue_1', 'clue_2', 'clue_3', 'clue_6', 'clue_7', 'clue_11'];
  collectClueIds.forEach(id => {
    const clue = allClues.find(c => c.id === id);
    if (clue) clue.collected = true;
  });
  
  log('初始化', '测试环境设置完成', {
    currentExhibition: 'exhibition_2',
    unlockedExhibitions: (store as any).state.unlockedExhibitions,
    collectedClues: collectClueIds
  });
}

function verifyExhibitionList(): boolean {
  log('展厅列表验证', '开始验证展厅列表...');
  
  const unlockedExhibitions = store.getUnlockedExhibitions();
  log('展厅列表验证', '已解锁展厅', unlockedExhibitions.map(e => ({ id: e.id, name: e.name })));
  
  const collectedClues = store.getCollectedClues();
  const clueRelatedExhibitionIds = new Set<string>();
  collectedClues.forEach(clue => {
    clue.mechanismPurpose?.forEach(p => {
      if (p.exhibitionId) {
        clueRelatedExhibitionIds.add(p.exhibitionId);
      }
    });
  });
  log('展厅列表验证', '已收集线索关联展厅', Array.from(clueRelatedExhibitionIds));
  
  const filterExhibitions = store.getDistinctExhibitionsForCollectedClues();
  log('展厅列表验证', '筛选器显示展厅', filterExhibitions.map(e => ({ id: e.id, name: e.name, chapterId: e.chapterId })));
  
  const allExpectedIds = new Set<string>();
  unlockedExhibitions.forEach(e => allExpectedIds.add(e.id));
  clueRelatedExhibitionIds.forEach(id => allExpectedIds.add(id));
  
  const actualIds = new Set(filterExhibitions.map(e => e.id));
  
  let allPassed = true;
  
  if (actualIds.size !== allExpectedIds.size) {
    logError('展厅列表验证', '展厅数量不匹配', 
      Array.from(allExpectedIds), 
      Array.from(actualIds)
    );
    allPassed = false;
  }
  
  for (const id of allExpectedIds) {
    if (!actualIds.has(id)) {
      logError('展厅列表验证', `缺少展厅: ${id}`);
      allPassed = false;
    }
  }
  
  let isSorted = true;
  for (let i = 1; i < filterExhibitions.length; i++) {
    const prev = filterExhibitions[i - 1];
    const curr = filterExhibitions[i];
    const chapterCompare = prev.chapterId.localeCompare(curr.chapterId);
    if (chapterCompare > 0 || 
        (chapterCompare === 0 && prev.name.localeCompare(curr.name, 'zh-CN') > 0)) {
      isSorted = false;
      break;
    }
  }
  
  if (!isSorted) {
    logError('展厅列表验证', '展厅未按章节和名称排序');
    allPassed = false;
  } else {
    logSuccess('展厅列表验证', '展厅排序正确（按章节ID → 名称）');
  }
  
  if (allPassed) {
    logSuccess('展厅列表验证', '所有验证通过！');
  }
  
  return allPassed;
}

function verifyFilterCombination(
  description: string,
  filters: { chapterId?: string; exhibitionId?: string; mechanismId?: string; onlyAvailable?: boolean }
): boolean {
  log('筛选组合验证', `测试: ${description}`, filters);
  
  const filteredClues = store.getCluesFiltered({ ...filters, onlyCollected: true });
  log('筛选组合验证', `筛选结果: ${filteredClues.length}条`, 
    filteredClues.map(c => ({ id: c.id, name: c.name }))
  );
  
  let availableCount = 0;
  let notAvailableCount = 0;
  let allCorrect = true;
  
  for (const clue of filteredClues) {
    let isAvailable: boolean;
    let checkMethod: string;
    
    if (filters.mechanismId) {
      isAvailable = store.isClueUsefulForMechanism(clue.id, filters.mechanismId);
      checkMethod = 'isClueUsefulForMechanism';
    } else if (filters.exhibitionId) {
      isAvailable = store.isClueUsefulForExhibition(clue.id, filters.exhibitionId);
      checkMethod = 'isClueUsefulForExhibition';
    } else {
      isAvailable = store.isClueUsefulInCurrentExhibition(clue.id);
      checkMethod = 'isClueUsefulInCurrentExhibition';
    }
    
    if (isAvailable) {
      availableCount++;
      log('筛选组合验证', `  🟡 [高亮] ${clue.id} - ${clue.name} (${checkMethod})`);
    } else {
      notAvailableCount++;
      log('筛选组合验证', `  ⚪ [普通] ${clue.id} - ${clue.name} (${checkMethod})`);
    }
    
    if (filters.onlyAvailable && !isAvailable) {
      logError('筛选组合验证', `onlyAvailable模式下出现不可用线索: ${clue.id}`);
      allCorrect = false;
    }
  }
  
  log('筛选组合验证', `统计: 高亮${availableCount}条, 普通${notAvailableCount}条`);
  
  if (filters.onlyAvailable && notAvailableCount > 0) {
    logError('筛选组合验证', 'onlyAvailable模式失败');
    allCorrect = false;
  }
  
  if (allCorrect) {
    logSuccess('筛选组合验证', `${description} - 通过`);
  }
  
  return allCorrect;
}

function verifyHighlightSync(): boolean {
  log('高亮同步验证', '开始验证高亮与可用物件同步...');
  
  let allPassed = true;
  
  log('高亮同步验证', '当前展厅: exhibition_2');
  const availableCurrent = store.getAvailableCluesForCurrentExhibition();
  log('高亮同步验证', '当前展厅可用线索', availableCurrent.map(c => ({ id: c.id, name: c.name })));
  
  const filteredNoFilter = store.getCluesFiltered({ onlyCollected: true });
  const highlightedNoFilter = filteredNoFilter.filter(c => 
    store.isClueUsefulInCurrentExhibition(c.id)
  );
  const highlightedIdsNoFilter = highlightedNoFilter.map(c => c.id).sort();
  const availableIdsCurrent = availableCurrent.map(c => c.id).sort();
  
  if (JSON.stringify(highlightedIdsNoFilter) !== JSON.stringify(availableIdsCurrent)) {
    logError('高亮同步验证', '无筛选时高亮与当前展厅可用不同步', 
      availableIdsCurrent, highlightedIdsNoFilter
    );
    allPassed = false;
  } else {
    logSuccess('高亮同步验证', '无筛选时高亮与当前展厅可用同步');
  }
  
  const mechId = 'mech_1';
  log('高亮同步验证', `筛选机关: ${mechId}`);
  const availableMech = store.getAvailableCluesForMechanism(mechId);
  log('高亮同步验证', '该机关可用线索', availableMech.map(c => ({ id: c.id, name: c.name })));
  
  const filteredMech = store.getCluesFiltered({ mechanismId: mechId, onlyCollected: true });
  const highlightedMech = filteredMech.filter(c => 
    store.isClueUsefulForMechanism(c.id, mechId)
  );
  const highlightedIdsMech = highlightedMech.map(c => c.id).sort();
  const availableIdsMech = availableMech.map(c => c.id).sort();
  
  if (JSON.stringify(highlightedIdsMech) !== JSON.stringify(availableIdsMech)) {
    logError('高亮同步验证', '筛选机关时高亮与该机关可用不同步', 
      availableIdsMech, highlightedIdsMech
    );
    allPassed = false;
  } else {
    logSuccess('高亮同步验证', '筛选机关时高亮与该机关可用同步');
  }
  
  const exhibitionId = 'exhibition_2';
  log('高亮同步验证', `筛选展厅: ${exhibitionId}`);
  const availableExhibition = store.getAvailableCluesForExhibition(exhibitionId);
  log('高亮同步验证', '该展厅可用线索', availableExhibition.map(c => ({ id: c.id, name: c.name })));
  
  const filteredExhibition = store.getCluesFiltered({ exhibitionId, onlyCollected: true });
  const highlightedExhibition = filteredExhibition.filter(c => 
    store.isClueUsefulForExhibition(c.id, exhibitionId)
  );
  const highlightedIdsExhibition = highlightedExhibition.map(c => c.id).sort();
  const availableIdsExhibition = availableExhibition.map(c => c.id).sort();
  
  const allHighlightedAreAvailable = highlightedIdsExhibition.every(id => 
    availableIdsExhibition.includes(id)
  );
  
  if (!allHighlightedAreAvailable) {
    logError('高亮同步验证', '筛选展厅时高亮线索不在该展厅可用列表中', 
      availableIdsExhibition, highlightedIdsExhibition
    );
    allPassed = false;
  } else {
    logSuccess('高亮同步验证', '筛选展厅时高亮线索都在该展厅可用列表中');
  }
  
  return allPassed;
}

function verifyScenarioSwitching(): boolean {
  log('场景切换验证', '开始验证场景切换...');
  
  let allPassed = true;
  
  log('场景切换验证', '初始当前展厅: exhibition_2');
  const initialAvailable = store.getAvailableCluesForCurrentExhibition();
  log('场景切换验证', '初始可用线索', initialAvailable.map(c => c.id));
  
  store.setCurrentExhibition('exhibition_3');
  log('场景切换验证', '切换到: exhibition_3');
  
  const afterSwitchAvailable = store.getAvailableCluesForCurrentExhibition();
  log('场景切换验证', '切换后可用线索', afterSwitchAvailable.map(c => c.id));
  
  const filteredAfterSwitch = store.getCluesFiltered({ onlyCollected: true });
  const highlightedAfterSwitch = filteredAfterSwitch.filter(c => 
    store.isClueUsefulInCurrentExhibition(c.id)
  );
  const highlightedIds = highlightedAfterSwitch.map(c => c.id).sort();
  const availableIds = afterSwitchAvailable.map(c => c.id).sort();
  
  if (JSON.stringify(highlightedIds) !== JSON.stringify(availableIds)) {
    logError('场景切换验证', '切换展厅后高亮不同步', availableIds, highlightedIds);
    allPassed = false;
  } else {
    logSuccess('场景切换验证', '切换展厅后高亮同步更新');
  }
  
  store.setCurrentExhibition('exhibition_2');
  log('场景切换验证', '切回: exhibition_2');
  
  const onlyAvailableAfterSwitch = store.getCluesFiltered({ 
    onlyAvailable: true, 
    onlyCollected: true 
  });
  log('场景切换验证', 'onlyAvailable筛选结果', onlyAvailableAfterSwitch.map(c => c.id));
  
  const expectedAvailable = store.getAvailableCluesForCurrentExhibition();
  const expectedIds = expectedAvailable.map(c => c.id).sort();
  const actualIds = onlyAvailableAfterSwitch.map(c => c.id).sort();
  
  if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) {
    logError('场景切换验证', 'onlyAvailable筛选结果不同步', expectedIds, actualIds);
    allPassed = false;
  } else {
    logSuccess('场景切换验证', 'onlyAvailable筛选与当前展厅同步');
  }
  
  return allPassed;
}

function verifyExhibitionIdFilterReuse(): boolean {
  log('过滤链路复用验证', '验证exhibitionId过滤链路复用...');
  
  let allPassed = true;
  
  const exhibitionId = 'exhibition_2';
  
  const exhibition = (store as any).exhibitions.find((e: any) => e.id === exhibitionId);
  const hotspotClueIds = exhibition.hotspots
    .filter((h: any) => h.type === 'clue')
    .map((h: any) => h.targetId);
  log('过滤链路复用验证', `展厅${exhibitionId}的hotspot线索`, hotspotClueIds);
  
  const filtered = store.getCluesFiltered({ exhibitionId, onlyCollected: false });
  const filteredIds = filtered.map(c => c.id).sort();
  
  if (JSON.stringify(filteredIds) !== JSON.stringify([...hotspotClueIds].sort())) {
    logError('过滤链路复用验证', 'exhibitionId过滤结果与hotspot不一致', 
      hotspotClueIds, filteredIds
    );
    allPassed = false;
  } else {
    logSuccess('过滤链路复用验证', 'exhibitionId过滤链路正确复用');
  }
  
  const withChapterFilter = store.getCluesFiltered({ 
    chapterId: 'chapter_1', 
    exhibitionId, 
    onlyCollected: false 
  });
  const allChapter1 = withChapterFilter.every(c => c.chapterId === 'chapter_1');
  const allInHotspot = withChapterFilter.every(c => hotspotClueIds.includes(c.id));
  
  if (!allChapter1 || !allInHotspot) {
    logError('过滤链路复用验证', '多条件组合筛选不正确', 
      { chapter1: allChapter1, inHotspot: allInHotspot }
    );
    allPassed = false;
  } else {
    logSuccess('过滤链路复用验证', '多条件组合筛选正确（章节+展厅）');
  }
  
  return allPassed;
}

function runAllTests(): void {
  console.log('\n' + '='.repeat(80));
  console.log('📋 线索背包功能完整验证报告');
  console.log('='.repeat(80) + '\n');
  
  setupTestEnvironment();
  
  console.log('\n' + '-'.repeat(80));
  const test1 = verifyExhibitionList();
  
  console.log('\n' + '-'.repeat(80));
  const test2 = verifyFilterCombination('无筛选（默认）', {});
  
  console.log('\n' + '-'.repeat(80));
  const test3 = verifyFilterCombination('按章节筛选', { chapterId: 'chapter_1' });
  
  console.log('\n' + '-'.repeat(80));
  const test4 = verifyFilterCombination('按展厅筛选', { exhibitionId: 'exhibition_2' });
  
  console.log('\n' + '-'.repeat(80));
  const test5 = verifyFilterCombination('按机关用途筛选', { mechanismId: 'mech_1' });
  
  console.log('\n' + '-'.repeat(80));
  const test6 = verifyFilterCombination('章节+展厅', { chapterId: 'chapter_1', exhibitionId: 'exhibition_2' });
  
  console.log('\n' + '-'.repeat(80));
  const test7 = verifyFilterCombination('展厅+机关用途', { exhibitionId: 'exhibition_2', mechanismId: 'mech_1' });
  
  console.log('\n' + '-'.repeat(80));
  const test8 = verifyFilterCombination('章节+展厅+机关用途', { 
    chapterId: 'chapter_1', 
    exhibitionId: 'exhibition_2', 
    mechanismId: 'mech_1' 
  });
  
  console.log('\n' + '-'.repeat(80));
  const test9 = verifyFilterCombination('仅显示可用（无筛选）', { onlyAvailable: true });
  
  console.log('\n' + '-'.repeat(80));
  const test10 = verifyFilterCombination('仅显示可用+展厅筛选', { 
    exhibitionId: 'exhibition_2', 
    onlyAvailable: true 
  });
  
  console.log('\n' + '-'.repeat(80));
  const test11 = verifyHighlightSync();
  
  console.log('\n' + '-'.repeat(80));
  const test12 = verifyScenarioSwitching();
  
  console.log('\n' + '-'.repeat(80));
  const test13 = verifyExhibitionIdFilterReuse();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(80));
  
  const results = [
    { name: '展厅列表验证', passed: test1 },
    { name: '无筛选（默认）', passed: test2 },
    { name: '按章节筛选', passed: test3 },
    { name: '按展厅筛选', passed: test4 },
    { name: '按机关用途筛选', passed: test5 },
    { name: '章节+展厅', passed: test6 },
    { name: '展厅+机关用途', passed: test7 },
    { name: '章节+展厅+机关用途', passed: test8 },
    { name: '仅显示可用（无筛选）', passed: test9 },
    { name: '仅显示可用+展厅筛选', passed: test10 },
    { name: '高亮同步验证', passed: test11 },
    { name: '场景切换验证', passed: test12 },
    { name: '过滤链路复用验证', passed: test13 },
  ];
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach((r, i) => {
    console.log(`${r.passed ? '✅' : '❌'} ${String(i + 1).padStart(2)}. ${r.name}`);
  });
  
  console.log('\n' + '-'.repeat(80));
  console.log(`总计: ${passed}/${total} 测试通过`);
  console.log('='.repeat(80) + '\n');
  
  if (passed === total) {
    console.log('🎉 所有测试通过！线索背包功能运行正常。\n');
  } else {
    console.log(`⚠️  有 ${total - passed} 个测试失败，请检查。\n`);
    process.exit(1);
  }
}

runAllTests();
