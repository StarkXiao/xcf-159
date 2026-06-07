import { store } from '../game/Store';
import { Clue } from '../game/types';

const HR = '═'.repeat(70);
const SEP = '─'.repeat(70);

interface DebugResult {
  step: number;
  name: string;
  filters: Record<string, any>;
  before: Clue[];
  after: Clue[];
  availableIds: string[];
  highlightCheck: (c: Clue) => boolean;
  syncPassed: boolean;
}

const clueBackpackDebug = {
  setupTestEnvironment(): void {
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
  },

  formatClue(clue: Clue, isAvailable: boolean): string {
    const icon = isAvailable ? '🟡' : '⚪';
    const status = isAvailable ? '[高亮]' : '[普通]';
    return `  ${icon} ${status} ${clue.id.padEnd(20)} ${clue.name}`;
  },

  checkSync(
    filteredClues: Clue[],
    availableIds: string[],
    checkAvailable: (c: Clue) => boolean
  ): { passed: boolean; mismatched: string[] } {
    const mismatched: string[] = [];
    filteredClues.forEach(clue => {
      const shouldHighlight = availableIds.includes(clue.id);
      const isHighlighted = checkAvailable(clue);
      if (shouldHighlight !== isHighlighted) {
        mismatched.push(
          `${clue.id}: 应该${shouldHighlight ? '高亮' : '不高亮'}, 实际${isHighlighted ? '高亮' : '不高亮'}`
        );
      }
    });
    return { passed: mismatched.length === 0, mismatched };
  },

  printHeader(step: number, title: string): void {
    console.log(`\n${HR}`);
    console.log(`【第${step}步】${title}`);
    console.log(HR);
  },

  printSection(title: string): void {
    console.log(`\n${SEP}`);
    console.log(`  ▸ ${title}`);
    console.log(SEP);
  },

  printDiff(before: Clue[], after: Clue[]): void {
    const beforeIds = new Set(before.map(c => c.id));
    const afterIds = new Set(after.map(c => c.id));
    const added = after.filter(c => !beforeIds.has(c.id));
    const removed = before.filter(c => !afterIds.has(c.id));

    console.log(`  筛选前: ${before.length}条 | 筛选后: ${after.length}条`);
    console.log(`  新增: ${added.length}条 | 移除: ${removed.length}条 | 保留: ${after.length - added.length}条`);

    if (added.length > 0) {
      console.log(`\n  ✚ 新增线索:`);
      added.forEach(c => console.log(`     + ${c.id} - ${c.name}`));
    }
    if (removed.length > 0) {
      console.log(`\n  ✖ 移除线索:`);
      removed.forEach(c => console.log(`     - ${c.id} - ${c.name}`));
    }
  },

  printClueList(clues: Clue[], checkAvailable: (c: Clue) => boolean): void {
    console.log(`  共 ${clues.length} 条线索`);
    clues.forEach(c => console.log(this.formatClue(c, checkAvailable(c))));
  },

  runStep1_ChapterFilter(): DebugResult {
    this.printHeader(1, '按章节筛选');

    const allCollected = store.getCollectedClues();
    const filters = { chapterId: 'chapter_1', onlyCollected: true };
    const filtered = store.getCluesFiltered(filters);
    const checkAvailable = (c: Clue) => store.isClueUsefulInCurrentExhibition(c.id);
    const availableIds = store.getAvailableCluesForCurrentExhibition().map(c => c.id);
    const syncResult = this.checkSync(filtered, availableIds, checkAvailable);

    this.printSection('筛选条件');
    console.log('  chapterId = "chapter_1"');

    this.printSection('筛选前后对比');
    this.printDiff(allCollected, filtered);

    this.printSection('筛选后线索列表（高亮判断：当前展厅）');
    this.printClueList(filtered, checkAvailable);

    this.printSection('高亮同步验证');
    console.log(`  可用线索ID: ${availableIds.join(', ')}`);
    console.log(`  ${syncResult.passed ? '✅' : '❌'} 同步验证${syncResult.passed ? '通过' : '失败'}`);
    if (!syncResult.passed) {
      syncResult.mismatched.forEach(m => console.log(`     - ${m}`));
    }

    return {
      step: 1,
      name: '按章节筛选',
      filters,
      before: allCollected,
      after: filtered,
      availableIds,
      highlightCheck: checkAvailable,
      syncPassed: syncResult.passed
    };
  },

  runStep2_ExhibitionFilter(prevAfter: Clue[]): DebugResult {
    this.printHeader(2, '按展厅筛选');

    const filters = { chapterId: 'chapter_1', exhibitionId: 'exhibition_2', onlyCollected: true };
    const filtered = store.getCluesFiltered(filters);
    const checkAvailable = (c: Clue) => store.isClueUsefulForExhibition(c.id, 'exhibition_2');
    const availableIds = store.getAvailableCluesForExhibition('exhibition_2').map(c => c.id);
    const syncResult = this.checkSync(filtered, availableIds, checkAvailable);

    const exhibition = (store as any).exhibitions.find((e: any) => e.id === 'exhibition_2');
    const hotspotClueIds = exhibition.hotspots
      .filter((h: any) => h.type === 'clue')
      .map((h: any) => h.targetId);
    const filteredIds = filtered.map(c => c.id).sort();
    const expectedIds = [...hotspotClueIds].sort();
    const filterReused = JSON.stringify(filteredIds) === JSON.stringify(expectedIds);

    this.printSection('筛选条件');
    console.log('  chapterId = "chapter_1", exhibitionId = "exhibition_2"');

    this.printSection('筛选前后对比');
    this.printDiff(prevAfter, filtered);

    this.printSection('筛选后线索列表（高亮判断：展厅exhibition_2）');
    this.printClueList(filtered, checkAvailable);

    this.printSection('高亮同步验证');
    console.log(`  展厅可用线索ID: ${availableIds.join(', ')}`);
    console.log(`  ${syncResult.passed ? '✅' : '❌'} 同步验证${syncResult.passed ? '通过' : '失败'}`);

    this.printSection('过滤链路验证');
    console.log(`  展厅hotspot线索: ${hotspotClueIds.join(', ')}`);
    console.log(`  筛选结果线索: ${filteredIds.join(', ')}`);
    console.log(`  ${filterReused ? '✅' : '❌'} 过滤链路${filterReused ? '正确复用' : '异常'}`);

    return {
      step: 2,
      name: '按展厅筛选',
      filters,
      before: prevAfter,
      after: filtered,
      availableIds,
      highlightCheck: checkAvailable,
      syncPassed: syncResult.passed && filterReused
    };
  },

  runStep3_MechanismFilter(prevAfter: Clue[]): DebugResult {
    this.printHeader(3, '按机关用途筛选');

    const mechId = 'mech_1';
    const mech = (store as any).mechanisms.find((m: any) => m.id === mechId);
    const filters = { chapterId: 'chapter_1', exhibitionId: 'exhibition_2', mechanismId: mechId, onlyCollected: true };
    const filtered = store.getCluesFiltered(filters);
    const checkAvailable = (c: Clue) => store.isClueUsefulForMechanism(c.id, mechId);
    const availableIds = store.getAvailableCluesForMechanism(mechId).map(c => c.id);
    const syncResult = this.checkSync(filtered, availableIds, checkAvailable);

    this.printSection('筛选条件');
    console.log(`  chapterId = "chapter_1", exhibitionId = "exhibition_2", mechanismId = "${mechId}"`);
    console.log(`  机关名称: ${mech?.name || '未知'}`);

    this.printSection('筛选前后对比');
    this.printDiff(prevAfter, filtered);

    this.printSection('筛选后线索列表（高亮判断：机关mech_1）');
    this.printClueList(filtered, checkAvailable);

    this.printSection('高亮同步验证');
    console.log(`  机关可用线索ID: ${availableIds.join(', ')}`);
    console.log(`  ${syncResult.passed ? '✅' : '❌'} 同步验证${syncResult.passed ? '通过' : '失败'}`);

    return {
      step: 3,
      name: '按机关用途筛选',
      filters,
      before: prevAfter,
      after: filtered,
      availableIds,
      highlightCheck: checkAvailable,
      syncPassed: syncResult.passed
    };
  },

  runStep4_CurrentSceneHighlight(): DebugResult {
    this.printHeader(4, '当前场景可用高亮');

    this.printSection('切换前场景');
    console.log('  当前展厅: exhibition_2 (西侧展厅)');
    const beforeAvailable = store.getAvailableCluesForCurrentExhibition();
    console.log(`  可用线索: ${beforeAvailable.map(c => c.id).join(', ')}`);

    const beforeFiltered = store.getCluesFiltered({ onlyCollected: true });
    const beforeCheck = (c: Clue) => store.isClueUsefulInCurrentExhibition(c.id);
    this.printSection('切换前列索列表与高亮状态');
    this.printClueList(beforeFiltered, beforeCheck);
    const beforeSync = this.checkSync(beforeFiltered, beforeAvailable.map(c => c.id), beforeCheck);
    console.log(`\n  ${beforeSync.passed ? '✅' : '❌'} 切换前同步${beforeSync.passed ? '通过' : '失败'}`);

    this.printSection('切换当前展厅');
    console.log('  从: exhibition_2 (西侧展厅)');
    console.log('  到: exhibition_1 (博物馆大厅)');
    store.setCurrentExhibition('exhibition_1');

    const afterAvailable = store.getAvailableCluesForCurrentExhibition();
    console.log(`  新展厅可用线索: ${afterAvailable.map(c => c.id).join(', ')}`);

    const afterFiltered = store.getCluesFiltered({ onlyCollected: true });
    const afterCheck = (c: Clue) => store.isClueUsefulInCurrentExhibition(c.id);
    this.printSection('切换后线索列表与高亮状态');
    this.printClueList(afterFiltered, afterCheck);
    const afterSync = this.checkSync(afterFiltered, afterAvailable.map(c => c.id), afterCheck);
    console.log(`\n  ${afterSync.passed ? '✅' : '❌'} 切换后同步${afterSync.passed ? '通过' : '失败'}`);

    this.printSection('onlyAvailable模式验证');
    console.log('  开启"仅显示可用"筛选');
    const onlyAvailable = store.getCluesFiltered({ onlyAvailable: true, onlyCollected: true });
    this.printClueList(onlyAvailable, afterCheck);
    const allAvailable = onlyAvailable.every(c => afterAvailable.some(a => a.id === c.id));
    console.log(`\n  ${allAvailable ? '✅' : '❌'} onlyAvailable模式${allAvailable ? '正常' : '异常'}`);

    return {
      step: 4,
      name: '当前场景可用高亮',
      filters: { onlyAvailable: true },
      before: beforeFiltered,
      after: afterFiltered,
      availableIds: afterAvailable.map(c => c.id),
      highlightCheck: afterCheck,
      syncPassed: beforeSync.passed && afterSync.passed && allAvailable
    };
  },

  runAll(): boolean[] {
    console.log('\n' + HR);
    console.log('🎯 线索背包专项调试入口');
    console.log(HR);
    console.log('\n【初始化】设置测试环境...');
    this.setupTestEnvironment();
    console.log('  ✓ 已收集: clue_1, clue_2, clue_3, clue_6, clue_7, clue_11, clue_h1, clue_shared_1');
    console.log('  ✓ 当前展厅: exhibition_2');
    console.log('  ✓ 已解锁展厅: exhibition_1, exhibition_2, exhibition_3');

    const results: boolean[] = [];

    try {
      const r1 = this.runStep1_ChapterFilter();
      results.push(r1.syncPassed);

      const r2 = this.runStep2_ExhibitionFilter(r1.after);
      results.push(r2.syncPassed);

      const r3 = this.runStep3_MechanismFilter(r2.after);
      results.push(r3.syncPassed);

      const r4 = this.runStep4_CurrentSceneHighlight();
      results.push(r4.syncPassed);

      this.printSummary(results);
    } catch (e) {
      console.log('❌ 调试执行出错:', e);
    }

    return results;
  },

  printSummary(results: boolean[]): void {
    const steps = ['按章节筛选', '按展厅筛选', '按机关用途筛选', '当前场景可用高亮'];
    const passed = results.filter(r => r).length;

    console.log(`\n${HR}`);
    console.log('📊 调试结果汇总');
    console.log(HR);
    steps.forEach((name, i) => {
      console.log(`  ${results[i] ? '✅' : '❌'} 第${i + 1}步: ${name}`);
    });
    console.log(`\n${SEP}`);
    console.log(`  总计: ${passed}/${results.length} 通过`);
    console.log(HR);

    if (passed === results.length) {
      console.log('\n🎉 所有调试步骤通过！线索背包筛选与高亮同步功能正常。');
    }
  },

  mount(): void {
    if (typeof window !== 'undefined') {
      window.__amberDebug = window.__amberDebug || {};
      window.__amberDebug.clueBackpack = this;
      console.log('✅ 线索背包调试工具已挂载到 window.__amberDebug.clueBackpack');
      console.log('💡 调用方式: window.__amberDebug.clueBackpack.runAll()');
    }
  }
};

export default clueBackpackDebug;
