import { store } from './src/game/Store';
import { CLUES } from './src/game/data/clues';
import { eventBus } from './src/game/EventBus';
import type { Mechanism } from './src/game/types';

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock() as unknown as Storage;

console.log('========================================');
console.log('🧪 记忆回廊完整流程测试');
console.log('========================================\n');

const log = (emoji: string, message: string) => {
  const timestamp = new Date().toLocaleTimeString('zh-CN');
  console.log(`[${timestamp}] ${emoji} ${message}`);
};

const logStep = (step: number, title: string) => {
  console.log(`\n========== 步骤 ${step}: ${title} ==========\n`);
};

const logResult = (success: boolean, message: string) => {
  if (success) {
    console.log(`  ✅ ${message}`);
  } else {
    console.log(`  ❌ ${message}`);
  }
};

const setupEventListeners = () => {
  const events: Array<{ type: string; data: unknown; timestamp: number }> = [];
  const unsubscribeFns: Array<() => void> = [];

  const eventTypes = [
    'chapter:enter',
    'exhibition:enter',
    'mechanism:solve',
    'mechanism:interact',
    'clue:collect',
    'recording:unlock',
    'recording:play',
    'memorycorridor:start',
    'memorycorridor:phase-complete',
    'memorycorridor:choice-made',
    'memorycorridor:sort-progress',
    'memorycorridor:memory-complete',
    'memorycorridor:ending-unlocked',
    'memorycorridor:ending-achieved',
    'memorycorridor:branch-unlocked',
    'ending:unlock',
    'ending:achieve'
  ];

  eventTypes.forEach(type => {
    const fn = (data: unknown) => {
      events.push({ type, data, timestamp: Date.now() });
      log('📡', `事件触发: ${type}${data ? ` - ${JSON.stringify(data).slice(0, 80)}` : ''}`);
    };
    eventBus.on(type, fn);
    unsubscribeFns.push(() => eventBus.off(type, fn));
  });

  return {
    events,
    getEventsByType: (type: string) => events.filter(e => e.type === type),
    cleanup: () => unsubscribeFns.forEach(fn => fn())
  };
};

interface ScenarioChoices {
  choice1: string;
  choice2: string;
}

interface TestResult {
  success: boolean;
  scenario: string;
  ending?: { id: string; title: string };
  unlockedEndings?: string[];
  eventCount?: number;
  error?: string;
}

const runEndingScenario = async (
  scenarioName: string,
  choices: ScenarioChoices,
  expectedEnding: string
): Promise<TestResult> => {
  console.log(`\n\n========================================`);
  console.log(`🎭 测试结局: ${scenarioName}`);
  console.log(`========================================\n`);

  store.resetGame();
  const eventTracker = setupEventListeners();

  try {
    logStep(1, '进入第五章鉴定室');
    store.unlockChapter('chapter_5');
    (store.state as { currentChapter: string }).currentChapter = 'chapter_5';
    store.unlockExhibition('exhibition_auth_1');
    store.unlockExhibition('exhibition_auth_final');

    const chapter5 = store.getCurrentChapter();
    logResult(chapter5?.id === 'chapter_5', `当前章节: ${chapter5?.title}`);

    logStep(2, '解开第五章终局机关（密码：永恒）');
    const result1 = store.solveMechanism('mech_auth_final', '永恒');
    logResult(result1, '终局机关解开');

    const chapter6 = store.getCurrentChapter();
    logResult(chapter6?.id === 'chapter_6', `自动进入第六章: ${chapter6?.title}`);

    const corridorState = store.getMemoryCorridorState();
    logResult(corridorState.currentPhase === 1, `记忆回廊已启动，当前阶段: ${corridorState.currentPhase}`);

    logStep(3, '阶段1：解开记忆回廊入口');
    const result2 = store.solveMechanism('mech_cor_entrance', '记忆');
    logResult(result2, '入口密码正确');
    logResult(store.state.unlockedExhibitions.includes('exhibition_corridor_childhood'), '童年回廊已解锁');

    logStep(4, '阶段2：收集童年记忆碎片');
    const phase2Clues = ['clue_cor_2', 'clue_cor_3'];
    phase2Clues.forEach(clueId => {
      const result = store.collectClue(clueId);
      const clue = CLUES.find(c => c.id === clueId);
      logResult(result, `收集线索: ${clue?.name}`);
    });

    logStep(5, '阶段2：童年记忆排序');
    const interactResult1 = store.interactWithMechanism('mech_cor_memory_1');
    logResult(interactResult1.success && interactResult1.type === 'memory_sort', `机关交互类型: ${interactResult1.type}`);

    const correctOrderPhase2 = ['clue_cor_2', 'clue_cor_3'];
    const sortResult1 = store.submitMemorySort('mech_cor_memory_1', correctOrderPhase2);
    logResult(sortResult1.success && sortResult1.correct, '童年记忆排序正确');

    const corridorState2 = store.getMemoryCorridorState();
    logResult(corridorState2.completedPhases.includes(2), `阶段2完成，已完成阶段: [${corridorState2.completedPhases}]`);
    logResult(store.state.unlockedExhibitions.includes('exhibition_corridor_youth'), '青春回廊已解锁');

    logStep(6, '阶段3：收集青春记忆碎片');
    const phase3Clues = ['clue_cor_3', 'clue_cor_4'];
    phase3Clues.forEach(clueId => {
      const result = store.collectClue(clueId);
      const clue = CLUES.find(c => c.id === clueId);
      logResult(result, `收集线索: ${clue?.name}`);
    });

    logStep(7, '阶段3：青春抉择分支选择');
    const interactResult2 = store.interactWithMechanism('mech_cor_branch_1');
    logResult(interactResult2.success && interactResult2.type === 'branch_choice', `机关交互类型: ${interactResult2.type}`);
    logResult(interactResult2.branch?.unlocked === true, '分支已解锁');

    const choice1 = choices.choice1;
    const choiceResult1 = store.submitBranchChoice('mech_cor_branch_1', choice1);
    logResult(choiceResult1.success, `选择: ${choice1}`);
    log('📝', `结果: ${choiceResult1.consequence}`);

    if (choiceResult1.unlocksClue) {
      const clue = CLUES.find(c => c.id === choiceResult1.unlocksClue);
      logResult(true, `获得线索: ${clue?.name}`);
    }

    logStep(8, '阶段4：收集此刻记忆碎片');
    const phase4Clues = ['clue_cor_1', 'clue_cor_4', 'clue_cor_5', 'clue_cor_6', 'clue_cor_7', 'clue_cor_8'];
    phase4Clues.forEach(clueId => {
      const result = store.collectClue(clueId);
      const clue = CLUES.find(c => c.id === clueId);
      logResult(result, `收集线索: ${clue?.name}`);
    });

    logStep(9, '阶段4：完整记忆拼图');
    const interactResult3 = store.interactWithMechanism('mech_cor_memory_final');
    logResult(interactResult3.success && interactResult3.type === 'memory_sort', `机关交互类型: ${interactResult3.type}`);
    logResult(interactResult3.memorySortData?.collectedCount === 8, `已收集全部8个记忆碎片`);

    const correctOrderPhase4 = ['clue_cor_1', 'clue_cor_2', 'clue_cor_3', 'clue_cor_4', 'clue_cor_5', 'clue_cor_6', 'clue_cor_7', 'clue_cor_8'];
    const sortResult2 = store.submitMemorySort('mech_cor_memory_final', correctOrderPhase4);
    logResult(sortResult2.success && sortResult2.correct, '完整记忆拼图排序正确');

    const isMemoryComplete = store.isMemoryComplete();
    logResult(isMemoryComplete, '记忆完整性确认');

    logStep(10, '阶段5：最终抉择');
    const interactResult4 = store.interactWithMechanism('mech_cor_branch_final');
    logResult(interactResult4.success && interactResult4.type === 'branch_choice', `机关交互类型: ${interactResult4.type}`);

    const choice2 = choices.choice2;
    const choiceResult2 = store.submitBranchChoice('mech_cor_branch_final', choice2);
    logResult(choiceResult2.success, `选择: ${choice2}`);
    log('📝', `结果: ${choiceResult2.consequence}`);

    logStep(11, '解锁终章回廊');
    const result3 = store.solveMechanism('mech_cor_ending', '永恒');
    logResult(result3, '结局之门已打开');
    logResult(store.state.unlockedExhibitions.includes('exhibition_corridor_ending'), '终章回廊已解锁');

    logStep(12, '结局判定');
    const currentEnding = store.getCurrentEnding();
    const achievedEndings = store.getAchievedEndings();
    const unlockedEndings = store.getUnlockedEndings();

    log('🏆', `达成结局: ${currentEnding?.title || '无'}`);
    log('📊', `已解锁结局: ${unlockedEndings.length}个`);
    log('📊', `已达成结局: ${achievedEndings.length}个`);

    const endingMatch = currentEnding?.id === expectedEnding;
    logResult(endingMatch, `预期结局达成: ${expectedEnding}`);

    const unlockedEndingIds = unlockedEndings.map(e => e.id);
    log('📋', `已解锁结局ID: [${unlockedEndingIds.join(', ')}]`);

    const achieveEvents = eventTracker.getEventsByType('memorycorridor:ending-achieved');
    logResult(achieveEvents.length > 0, `结局达成事件触发次数: ${achieveEvents.length}`);

    const recordingEvents = eventTracker.getEventsByType('recording:unlock');
    log('🎙️', `解锁录音数量: ${recordingEvents.length}个`);

    const phaseEvents = eventTracker.getEventsByType('memorycorridor:phase-complete');
    log('🚪', `场景切换次数: ${phaseEvents.length}次`);

    console.log('\n📊 完整事件统计:');
    const eventCounts: Record<string, number> = {};
    eventTracker.events.forEach(e => {
      eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
    });
    Object.entries(eventCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}次`);
    });

    logStep(13, '测试错误场景验证');
    const wrongSortResult = store.submitMemorySort('mech_cor_memory_1', ['clue_cor_3', 'clue_cor_2']);
    logResult(wrongSortResult.success && !wrongSortResult.correct, '错误排序正确返回');

    const alreadySolved = store.interactWithMechanism('mech_cor_entrance');
    logResult(!alreadySolved.success && alreadySolved.type === 'already_solved', '已解开机关正确返回');

    console.log(`\n🎉 ${scenarioName} 测试完成!`);

    eventTracker.cleanup();

    return {
      success: endingMatch,
      scenario: scenarioName,
      ending: currentEnding ? { id: currentEnding.id, title: currentEnding.title } : undefined,
      unlockedEndings: unlockedEndingIds,
      eventCount: eventTracker.events.length
    };

  } catch (error) {
    console.error('❌ 测试出错:', error);
    eventTracker.cleanup();
    return {
      success: false,
      scenario: scenarioName,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

const main = async () => {
  console.log('🚀 开始记忆回廊完整流程测试...\n');

  const scenarios = [
    {
      name: '🌟 真结局·永恒的守护者',
      choices: { choice1: 'choice_study_art', choice2: 'choice_remember_forever' },
      expectedEnding: 'ending_true'
    },
    {
      name: '💫 好结局·薪火相传',
      choices: { choice1: 'choice_study_art', choice2: 'choice_pass_on' },
      expectedEnding: 'ending_good'
    },
    {
      name: '🌙 普通结局·时光的过客',
      choices: { choice1: 'choice_study_major', choice2: 'choice_let_go' },
      expectedEnding: 'ending_neutral'
    },
    {
      name: '💔 坏结局·遗忘的代价',
      choices: { choice1: 'choice_give_up_dream', choice2: 'choice_forget_everything' },
      expectedEnding: 'ending_bad'
    }
  ];

  const results: TestResult[] = [];

  for (const scenario of scenarios) {
    const result = await runEndingScenario(
      scenario.name,
      scenario.choices,
      scenario.expectedEnding
    );
    results.push(result);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n\n========================================');
  console.log('📊 测试结果汇总');
  console.log('========================================\n');

  results.forEach((result, index) => {
    const status = result.success ? '✅ 通过' : '❌ 失败';
    console.log(`${index + 1}. ${result.scenario}: ${status}`);
    if (result.ending) {
      console.log(`   结局: ${result.ending.title} (${result.ending.id})`);
      console.log(`   解锁结局: ${result.unlockedEndings?.length || 0}个`);
      console.log(`   触发事件: ${result.eventCount || 0}次`);
    }
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    console.log('');
  });

  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\n总计: ${passed}/${total} 测试通过`);

  if (passed === total) {
    console.log('\n🎉 所有测试通过！记忆回廊完整流程验证成功！');
  } else {
    console.log(`\n⚠️  有 ${total - passed} 个测试失败，请检查！`);
  }

  process.exit(passed === total ? 0 : 1);
};

main().catch(console.error);
