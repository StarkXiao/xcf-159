import { store } from './src/game/Store';
import { Clue } from './src/game/types';

const HR = '═'.repeat(80);
const SEP = '─'.repeat(80);

function logHeader(title: string, step: number): void {
  console.log(`\n${HR}`);
  console.log(`【第${step}步】${title}`);
  console.log(HR);
}

function logSection(title: string): void {
  console.log(`\n${SEP}`);
  console.log(`  ▸ ${title}`);
  console.log(SEP);
}

function formatClueList(clues: Clue[], checkAvailable?: (c: Clue) => boolean): string[] {
  return clues.map(clue => {
    const isAvailable = checkAvailable ? checkAvailable(clue) : false;
    const statusIcon = isAvailable ? '🟡' : '⚪';
    const statusText = isAvailable ? '[高亮]' : '[普通]';
    return `  ${statusIcon} ${statusText} ${clue.id.padEnd(20)} ${clue.name}`;
  });
}

function printClueList(title: string, clues: Clue[], checkAvailable?: (c: Clue) => boolean): void {
  logSection(title);
  console.log(`  共 ${clues.length} 条线索`);
  const lines = formatClueList(clues, checkAvailable);
  lines.forEach(line => console.log(line));
}

function printDiff(before: Clue[], after: Clue[], title: string): void {
  const beforeIds = new Set(before.map(c => c.id));
  const afterIds = new Set(after.map(c => c.id));
  
  const added = after.filter(c => !beforeIds.has(c.id));
  const removed = before.filter(c => !afterIds.has(c.id));
  const kept = after.filter(c => beforeIds.has(c.id));
  
  logSection(`${title} - 筛选差异`);
  console.log(`  筛选前: ${before.length}条 | 筛选后: ${after.length}条`);
  console.log(`  新增: ${added.length}条 | 移除: ${removed.length}条 | 保留: ${kept.length}条`);
  
  if (added.length > 0) {
    console.log(`\n  ✚ 新增线索:`);
    added.forEach(c => console.log(`     + ${c.id} - ${c.name}`));
  }
  if (removed.length > 0) {
    console.log(`\n  ✖ 移除线索:`);
    removed.forEach(c => console.log(`     - ${c.id} - ${c.name}`));
  }
}

function checkHighlightSync(
  filteredClues: Clue[],
  availableClueIds: string[],
  checkAvailable: (c: Clue) => boolean
): { passed: boolean; mismatched: string[] } {
  const mismatched: string[] = [];
  
  filteredClues.forEach(clue => {
    const shouldHighlight = availableClueIds.includes(clue.id);
    const isHighlighted = checkAvailable(clue);
    
    if (shouldHighlight !== isHighlighted) {
      mismatched.push(
        `${clue.id}: 应该${shouldHighlight ? '高亮' : '不高亮'}, 实际${isHighlighted ? '高亮' : '不高亮'}`
      );
    }
  });
  
  return {
    passed: mismatched.length === 0,
    mismatched
  };
}

function setupTestEnvironment(): void {
  console.log(HR);
  console.log('🎯 线索背包功能调试入口');
  console.log(HR);
  console.log('\n【初始化】设置测试环境...');
  
  const allClues = (store as any).clues as Clue[];
  allClues.forEach(clue => { clue.collected = false; });
  
  const allMechs = (store as any).mechanisms as any[];
  allMechs.forEach(m => { m.solved = false; });
  
  store.setCurrentExhibition('exhibition_2');
  (store as any).state.unlockedExhibitions = ['exhibition_1', 'exhibition_2', 'exhibition_3'];
  
  const collectClueIds = ['clue_1', 'clue_2', 'clue_3', 'clue_6', 'clue_7', 'clue_11', 'clue_h1', 'clue_shared_1'];
  collectClueIds.forEach(id => {
    const clue = allClues.find(c => c.id === id);
    if (clue) clue.collected = true;
  });
  
  console.log('\n  ✓ 当前展厅: exhibition_2 (西侧展厅)');
  console.log('  ✓ 已解锁展厅: exhibition_1, exhibition_2, exhibition_3');
  console.log(`  ✓ 已收集线索: ${collectClueIds.join(', ')}`);
  
  const collectedClues = store.getCollectedClues();
  printClueList('初始已收集线索列表', collectedClues, 
    c => store.isClueUsefulInCurrentExhibition(c.id)
  );
}

function runStep1_ChapterFilter(): void {
  logHeader('按章节筛选', 1);
  
  const allCollected = store.getCollectedClues();
  
  logSection('筛选条件');
  console.log('  筛选: chapterId = "chapter_1"');
  console.log('  说明: 只显示第一章收集的线索');
  
  const filtered = store.getCluesFiltered({
    chapterId: 'chapter_1',
    onlyCollected: true
  });
  
  printDiff(allCollected, filtered, '章节筛选');
  
  const checkAvailable = (c: Clue) => store.isClueUsefulInCurrentExhibition(c.id);
  printClueList('筛选后线索列表（按当前展厅判断高亮）', filtered, checkAvailable);
  
  const availableIds = store.getAvailableCluesForCurrentExhibition().map(c => c.id);
  const syncResult = checkHighlightSync(filtered, availableIds, checkAvailable);
  
  logSection('高亮同步验证');
  if (syncResult.passed) {
    console.log('  ✅ 高亮状态与当前场景可用物件完全同步');
    console.log(`     可用线索ID: ${availableIds.join(', ')}`);
  } else {
    console.log('  ❌ 高亮状态不同步:');
    syncResult.mismatched.forEach(m => console.log(`     - ${m}`));
  }
}

function runStep2_ExhibitionFilter(): void {
  logHeader('按展厅筛选', 2);
  
  const afterChapter = store.getCluesFiltered({
    chapterId: 'chapter_1',
    onlyCollected: true
  });
  
  logSection('筛选条件');
  console.log('  筛选: exhibitionId = "exhibition_2"');
  console.log('  说明: 只显示与西侧展厅关联的线索（复用exhibitionId过滤链路）');
  
  const filtered = store.getCluesFiltered({
    chapterId: 'chapter_1',
    exhibitionId: 'exhibition_2',
    onlyCollected: true
  });
  
  printDiff(afterChapter, filtered, '展厅筛选');
  
  const checkAvailable = (c: Clue) => store.isClueUsefulForExhibition(c.id, 'exhibition_2');
  printClueList('筛选后线索列表（按当前展厅判断高亮）', filtered, checkAvailable);
  
  const availableIds = store.getAvailableCluesForExhibition('exhibition_2').map(c => c.id);
  const syncResult = checkHighlightSync(filtered, availableIds, checkAvailable);
  
  logSection('高亮同步验证');
  console.log(`  筛选器展厅: exhibition_2`);
  if (syncResult.passed) {
    console.log('  ✅ 高亮状态与展厅可用物件完全同步');
    console.log(`     该展厅可用线索ID: ${availableIds.join(', ')}`);
  } else {
    console.log('  ❌ 高亮状态不同步:');
    syncResult.mismatched.forEach(m => console.log(`     - ${m}`));
  }
  
  logSection('过滤链路验证');
  const exhibition = (store as any).exhibitions.find((e: any) => e.id === 'exhibition_2');
  const hotspotClueIds = exhibition.hotspots
    .filter((h: any) => h.type === 'clue')
    .map((h: any) => h.targetId);
  const filteredIds = filtered.map(c => c.id).sort();
  const expectedIds = [...hotspotClueIds].sort();
  
  if (JSON.stringify(filteredIds) === JSON.stringify(expectedIds)) {
    console.log('  ✅ 正确复用exhibitionId过滤链路');
    console.log(`     展厅hotspot线索: ${hotspotClueIds.join(', ')}`);
    console.log(`     筛选结果线索: ${filteredIds.join(', ')}`);
  } else {
    console.log('  ❌ 过滤链路异常');
    console.log(`     期望: ${expectedIds.join(', ')}`);
    console.log(`     实际: ${filteredIds.join(', ')}`);
  }
}

function runStep3_MechanismFilter(): void {
  logHeader('按机关用途筛选', 3);
  
  const afterExhibition = store.getCluesFiltered({
    chapterId: 'chapter_1',
    exhibitionId: 'exhibition_2',
    onlyCollected: true
  });
  
  const mechId = 'mech_1';
  const mech = (store as any).mechanisms.find((m: any) => m.id === mechId);
  
  logSection('筛选条件');
  console.log(`  筛选: mechanismId = "${mechId}"`);
  console.log(`  机关名称: ${mech?.name || '未知'}`);
  console.log('  说明: 只显示可用于该机关的线索');
  
  const filtered = store.getCluesFiltered({
    chapterId: 'chapter_1',
    exhibitionId: 'exhibition_2',
    mechanismId: mechId,
    onlyCollected: true
  });
  
  printDiff(afterExhibition, filtered, '机关用途筛选');
  
  const checkAvailable = (c: Clue) => store.isClueUsefulForMechanism(c.id, mechId);
  printClueList('筛选后线索列表（按机关判断高亮）', filtered, checkAvailable);
  
  const availableIds = store.getAvailableCluesForMechanism(mechId).map(c => c.id);
  const syncResult = checkHighlightSync(filtered, availableIds, checkAvailable);
  
  logSection('高亮同步验证');
  console.log(`  目标机关: ${mechId} (${mech?.name || '未知'})`);
  if (syncResult.passed) {
    console.log('  ✅ 高亮状态与机关可用物件完全同步');
    console.log(`     该机关可用线索ID: ${availableIds.join(', ')}`);
  } else {
    console.log('  ❌ 高亮状态不同步:');
    syncResult.mismatched.forEach(m => console.log(`     - ${m}`));
  }
}

function runStep4_CurrentSceneHighlight(): void {
  logHeader('当前场景可用高亮', 4);
  
  logSection('切换前场景');
  console.log('  当前展厅: exhibition_2 (西侧展厅)');
  const beforeAvailable = store.getAvailableCluesForCurrentExhibition();
  console.log(`  可用线索: ${beforeAvailable.map(c => c.id).join(', ')}`);
  
  const beforeFiltered = store.getCluesFiltered({ onlyCollected: true });
  const beforeCheck = (c: Clue) => store.isClueUsefulInCurrentExhibition(c.id);
  printClueList('切换前列索列表与高亮状态', beforeFiltered, beforeCheck);
  
  const beforeSync = checkHighlightSync(beforeFiltered, beforeAvailable.map(c => c.id), beforeCheck);
  if (beforeSync.passed) {
    console.log('\n  ✅ 切换前高亮同步');
  } else {
    console.log('\n  ❌ 切换前高亮不同步');
    beforeSync.mismatched.forEach(m => console.log(`     - ${m}`));
  }
  
  logSection('切换当前展厅');
  console.log('  从: exhibition_2 (西侧展厅)');
  console.log('  到: exhibition_1 (博物馆大厅)');
  store.setCurrentExhibition('exhibition_1');
  
  const afterAvailable = store.getAvailableCluesForCurrentExhibition();
  console.log(`  新展厅可用线索: ${afterAvailable.map(c => c.id).join(', ')}`);
  
  const afterFiltered = store.getCluesFiltered({ onlyCollected: true });
  const afterCheck = (c: Clue) => store.isClueUsefulInCurrentExhibition(c.id);
  printClueList('切换后线索列表与高亮状态', afterFiltered, afterCheck);
  
  const afterSync = checkHighlightSync(afterFiltered, afterAvailable.map(c => c.id), afterCheck);
  if (afterSync.passed) {
    console.log('\n  ✅ 切换后高亮同步更新');
  } else {
    console.log('\n  ❌ 切换后高亮未同步');
    afterSync.mismatched.forEach(m => console.log(`     - ${m}`));
  }
  
  logSection('onlyAvailable模式验证');
  console.log('  开启"仅显示可用"筛选');
  const onlyAvailable = store.getCluesFiltered({
    onlyAvailable: true,
    onlyCollected: true
  });
  
  const onlyAvailableCheck = (c: Clue) => store.isClueUsefulInCurrentExhibition(c.id);
  printClueList('仅显示可用线索', onlyAvailable, onlyAvailableCheck);
  
  const onlyAvailableSync = checkHighlightSync(onlyAvailable, afterAvailable.map(c => c.id), onlyAvailableCheck);
  const allAvailable = onlyAvailable.every(c => afterAvailable.some(a => a.id === c.id));
  
  if (onlyAvailableSync.passed && allAvailable) {
    console.log('\n  ✅ onlyAvailable模式工作正常，仅显示当前场景可用线索');
  } else {
    console.log('\n  ❌ onlyAvailable模式异常');
    if (!allAvailable) {
      const invalid = onlyAvailable.filter(c => !afterAvailable.some(a => a.id === c.id));
      console.log(`     包含不可用线索: ${invalid.map(c => c.id).join(', ')}`);
    }
  }
}

function printSummary(results: boolean[]): void {
  console.log(`\n${HR}`);
  console.log('📊 调试结果汇总');
  console.log(HR);
  
  const steps = [
    '按章节筛选',
    '按展厅筛选',
    '按机关用途筛选',
    '当前场景可用高亮'
  ];
  
  let passed = 0;
  results.forEach((result, i) => {
    const status = result ? '✅' : '❌';
    console.log(`  ${status} 第${i + 1}步: ${steps[i]}`);
    if (result) passed++;
  });
  
  console.log(`\n${SEP}`);
  console.log(`  总计: ${passed}/${results.length} 通过`);
  console.log(HR);
  
  if (passed === results.length) {
    console.log('\n🎉 所有调试步骤通过！线索背包筛选与高亮同步功能正常。');
    console.log('\n💡 复跑命令: npx tsx debug-clue-backpack.ts');
  } else {
    console.log(`\n⚠️  有 ${results.length - passed} 个步骤失败，请检查。`);
    process.exit(1);
  }
}

function runDebug(): void {
  setupTestEnvironment();
  
  const results: boolean[] = [];
  
  try {
    runStep1_ChapterFilter();
    results.push(true);
  } catch (e) {
    console.log('  ❌ 步骤1执行失败:', e);
    results.push(false);
  }
  
  try {
    runStep2_ExhibitionFilter();
    results.push(true);
  } catch (e) {
    console.log('  ❌ 步骤2执行失败:', e);
    results.push(false);
  }
  
  try {
    runStep3_MechanismFilter();
    results.push(true);
  } catch (e) {
    console.log('  ❌ 步骤3执行失败:', e);
    results.push(false);
  }
  
  try {
    runStep4_CurrentSceneHighlight();
    results.push(true);
  } catch (e) {
    console.log('  ❌ 步骤4执行失败:', e);
    results.push(false);
  }
  
  printSummary(results);
}

runDebug();
