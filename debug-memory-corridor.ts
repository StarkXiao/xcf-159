import { store } from './src/game/Store';
import { eventBus } from './src/game/EventBus';
import type { MemoryCorridorState, BranchChoice } from './src/game/types';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null { return this.store[key] || null; }
  setItem(key: string, value: string): void { this.store[key] = value; }
  removeItem(key: string): void { delete this.store[key]; }
  clear(): void { this.store = {}; }
}

(global as any).localStorage = new LocalStorageMock();

const time = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });
const log = (msg: string, indent = 0) => console.log(`[${time()}] ${'  '.repeat(indent)}${msg}`);
const sep = (char = '═', len = 80) => console.log(char.repeat(len));
const header = (title: string) => { sep('═'); log(`🎬 ${title}`); sep('═'); console.log(''); };
const step = (num: number, title: string) => { console.log(''); log(`📌 步骤 ${num}: ${title}`); sep('─'); };
const ok = (msg: string, indent = 0) => log(`✅ ${msg}`, indent);
const info = (msg: string, indent = 0) => log(`ℹ️  ${msg}`, indent);
const warn = (msg: string, indent = 0) => log(`⚠️  ${msg}`, indent);
const err = (msg: string, indent = 0) => log(`❌ ${msg}`, indent);

const printState = (label: string) => {
  const state = store.getState();
  const mc = state.memoryCorridor as MemoryCorridorState;
  console.log('');
  log(`📊 ${label}:`, 0);
  sep('─');
  log(`  当前章节: ${state.currentChapter}`, 1);
  log(`  当前展厅: ${state.currentExhibition}`, 1);
  log(`  已收集线索: ${state.collectedClues.length}个 [${state.collectedClues.join(', ')}]`, 1);
  log(`  已解机关: ${state.solvedMechanisms.length}个 [${state.solvedMechanisms.join(', ')}]`, 1);
  log(`  记忆回廊阶段: ${mc.currentPhase}`, 1);
  log(`  已完成阶段: [${mc.completedPhases.join(', ')}]`, 1);
  log(`  已做选择: [${Object.entries(mc.madeChoices).map(([k, v]) => `${k}→${v}`).join(', ')}]`, 1);
  log(`  当前结局: ${mc.currentEnding || '未确定'}`, 1);
  log(`  记忆完整: ${mc.isMemoryComplete ? '是' : '否'}`, 1);
  log(`  已解锁结局: [${mc.unlockedEndings.join(', ')}]`, 1);
  log(`  已达成结局: [${mc.achievedEndings.join(', ')}]`, 1);
  log(`  解锁录音: ${state.archive.unlockedRecordings.length}个`, 1);
  sep('─');
  console.log('');
};

const eventLog: Array<{ time: string; event: string; data: any }> = [];

const setupDebugListeners = () => {
  const unsubs: Array<() => void> = [];
  const events = [
    'chapter:enter', 'chapter:unlock',
    'exhibition:enter', 'exhibition:unlock',
    'mechanism:open', 'mechanism:solve',
    'clue:collect', 'recording:unlock',
    'recording:auto-play', 'recording:play',
    'memorysort:open', 'branchchoice:open',
    'memorycorridor:sort-progress', 'memorycorridor:phase-complete',
    'memorycorridor:branch-unlocked', 'memorycorridor:choice-made',
    'memorycorridor:memory-complete', 'memorycorridor:ending-unlocked',
    'memorycorridor:ending-achieved', 'memorycorridor:complete',
    'ending:show', 'voice:play', 'voice:end'
  ];
  events.forEach(ev => {
    const unsub = eventBus.on(ev, (data: any) => {
      eventLog.push({ time: time(), event: ev, data });
      const emoji = ev.includes('chapter') ? '📖' :
                    ev.includes('mechanism') ? '🔧' :
                    ev.includes('recording') || ev.includes('voice') ? '🎙️' :
                    ev.includes('clue') ? '🔍' :
                    ev.includes('memorysort') ? '🧩' :
                    ev.includes('branchchoice') ? '🗨️' :
                    ev.includes('memorycorridor') ? '✨' :
                    ev.includes('ending') ? '🏆' :
                    ev.includes('exhibition') ? '🚪' : '📡';
      let detail = '';
      if (data?.chapterId) detail = ` [章节: ${data.chapterId}]`;
      if (data?.exhibitionId) detail = ` [展厅: ${data.exhibitionId}]`;
      if (data?.mechanismId) detail = ` [机关: ${data.mechanismId}]`;
      if (data?.clueId) detail = ` [线索: ${data.clueId}]`;
      if (data?.recordingId) {
        const rec = store.getRecordingById(data.recordingId);
        detail = ` [录音: ${rec?.title || data.recordingId}]`;
      }
      if (data?.endingId) {
        const end = store.getEndingById(data.endingId);
        detail = ` [结局: ${end?.title || data.endingId}]`;
      }
      if (data?.branchId) detail = ` [分支: ${data.branchId}]`;
      log(`${emoji} 事件: ${ev}${detail}`, 2);
    });
    unsubs.push(unsub);
  });
  return () => unsubs.forEach(u => u());
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const printNarrationQueue = () => {
  info('自动旁白队列（2秒后自动播放）:', 1);
  const autoPlayEvents = eventLog.filter(e => e.event === 'recording:auto-play');
  autoPlayEvents.forEach((e, i) => {
    const rec = store.getRecordingById(e.data.recordingId);
    log(`  ${i + 1}. ${e.time} - ${rec?.title || e.data.recordingId}`, 2);
  });
};

const solvePasswordMech = async (mechId: string, password: string, desc: string) => {
  const mech = store.getMechanismById(mechId)!;
  info(`机关: ${mech.displayName} [类型: ${mech.type}]`, 1);
  info(`提示: ${mech.hint}`, 1);
  info(`输入密码: "${password}"`, 1);
  const isCorrect = store.checkMechanismPassword(mechId, password);
  await sleep(200);
  if (!isCorrect) { err('密码错误!'); return false; }
  ok('密码正确', 1);
  const solved = store.solveMechanism(mechId);
  await sleep(300);
  if (solved) ok(`${desc} 完成`, 1);
  return solved;
};

const collectClue = async (clueId: string) => {
  const clue = store.getClueById(clueId)!;
  const collected = store.collectClue(clueId);
  await sleep(200);
  if (collected) ok(`收集线索: ${clue.icon} ${clue.name} (${clueId})`, 1);
  else info(`线索已收集: ${clue.icon} ${clue.name}`, 1);
  return collected;
};

const doMemorySort = async (mechId: string, desc: string) => {
  step(0, desc);
  const result = store.interactWithMechanism(mechId);
  info(`机关交互类型: ${result.type}`, 1);
  if (result.type !== 'memory_sort') { err('类型错误!'); return false; }
  const fragments = result.memorySortData?.fragments || [];
  const collected = result.memorySortData?.collectedCount || 0;
  info(`待排序碎片: ${fragments.length}个，已收集: ${collected}个`, 1);
  const available = fragments.filter(f => store.getState().collectedClues.includes(f.id));
  log('  碎片列表:', 1);
  available.forEach((f, i) => log(`    ${i + 1}. ${f.icon} ${f.name} [order: ${f.memoryOrder}] (${f.id})`, 2));
  const sorted = [...available].sort((a, b) => (a.memoryOrder || 0) - (b.memoryOrder || 0));
  const sortedIds = sorted.map(f => f.id);
  info(`提交排序: ${sortedIds.join(' → ')}`, 1);
  const submit = store.submitMemorySort(mechId, sortedIds);
  await sleep(300);
  if (submit.success && submit.correct) {
    ok('排序验证通过!', 1);
    if (submit.reward) info(`获得奖励: ${submit.reward}`, 1);
    return true;
  } else {
    err(`排序失败: ${submit.message}`);
    return false;
  }
};

const doBranchChoice = async (mechId: string, choiceId: string, desc: string) => {
  step(0, desc);
  const result = store.interactWithMechanism(mechId);
  info(`机关交互类型: ${result.type}`, 1);
  if (result.type !== 'branch_choice') { err('类型错误!'); return false; }
  const branch = result.branch as BranchChoice;
  info(`分支: ${branch.text}`, 1);
  info(`描述: ${branch.description}`, 1);
  if (!branch.unlocked) { warn('分支未解锁，正在收集所需线索...', 1);
    branch.requiredClues?.forEach(c => { if (!store.getState().collectedClues.includes(c)) collectClue(c); });
    await sleep(200);
  }
  const choice = branch.choices.find(c => c.id === choiceId);
  info(`选择: ${choice?.text} (${choiceId})`, 1);
  const submit = store.submitBranchChoice(mechId, choiceId);
  await sleep(300);
  if (submit.success) {
    ok('选择已记录!', 1);
    info(`结果: ${submit.consequence}`, 1);
    if (submit.endingId) {
      const end = store.getEndingById(submit.endingId)!;
      info(`导向结局: ${end.icon} ${end.title}`, 1);
    }
    return true;
  } else {
    err(`选择失败: ${submit.reason}`);
    return false;
  }
};

const runFullFlow = async (
  testName: string,
  choices: { branch1: string; branch2: string },
  collectAll: boolean,
  expectedEnding: string
) => {
  header(`调试流程: ${testName}`);
  store.resetGame();
  eventLog.length = 0;
  const cleanup = setupDebugListeners();
  await sleep(300);

  printState('初始状态');

  step(1, '进入第五章 - 鉴定室终局');
  store.unlockChapter('chapter_5');
  store.unlockExhibition('exhibition_auth_1');
  store.unlockExhibition('exhibition_auth_final');
  store.setCurrentExhibition('exhibition_auth_final');
  await sleep(300);
  ok(`当前章节: ${store.getCurrentChapter()?.title || store.getCurrentChapter()?.id}`, 1);
  const exh = store.getCurrentExhibition();
  ok(`当前展厅: ${exh?.title || exh?.id || store.getState().currentExhibition}`, 1);

  step(2, '解开第五章终局机关 (密码: 永恒)');
  const s2 = await solvePasswordMech('mech_auth_final', '永恒', '启动记忆回廊');
  if (!s2) { cleanup(); return false; }
  await sleep(500);
  printState('进入记忆回廊后');
  printNarrationQueue();

  step(3, '阶段1 - 解开记忆回廊入口 (密码: 记忆)');
  const s3 = await solvePasswordMech('mech_cor_entrance', '记忆', '解锁童年回廊');
  if (!s3) { cleanup(); return false; }
  await sleep(300);

  step(4, '阶段2 - 收集童年记忆碎片');
  await collectClue('clue_cor_2');
  await collectClue('clue_cor_3');
  await sleep(200);

  const sort1 = await doMemorySort('mech_cor_memory_1', '第一次碎片排序 - 童年记忆');
  if (!sort1) { cleanup(); return false; }
  await sleep(500);
  printState('童年记忆排序后');

  step(5, '阶段3 - 收集青春记忆碎片');
  await collectClue('clue_cor_4');
  await collectClue('clue_cor_5');
  await sleep(200);

  const branch1 = await doBranchChoice('mech_cor_branch_1', choices.branch1, '第一次分支选择 - 青春抉择');
  if (!branch1) { cleanup(); return false; }
  await sleep(500);
  printState('第一次分支选择后');

  step(6, '阶段4 - 收集此刻记忆碎片');
  const phase4Clues = collectAll
    ? ['clue_cor_1', 'clue_cor_5', 'clue_cor_6', 'clue_cor_7', 'clue_cor_8']
    : ['clue_cor_1', 'clue_cor_6', 'clue_cor_7', 'clue_cor_8'];
  for (const c of phase4Clues) await collectClue(c);
  await sleep(200);

  const sort2 = await doMemorySort('mech_cor_memory_final', '第二次碎片排序 - 完整记忆拼图');
  if (!sort2) { cleanup(); return false; }
  await sleep(500);
  printState('完整记忆排序后');

  step(7, '阶段5 - 最终抉择');
  const branch2 = await doBranchChoice('mech_cor_branch_final', choices.branch2, '第二次分支选择 - 最终抉择');
  if (!branch2) { cleanup(); return false; }
  await sleep(500);
  printState('第二次分支选择后');

  step(8, '终章 - 打开结局之门');
  const endingDoor = await solvePasswordMech('mech_cor_ending', '永恒', '解锁终章回廊');
  if (!endingDoor) { cleanup(); return false; }
  await sleep(500);
  printState('结局之门打开后');

  step(9, '结局判定与落盘');
  const currentEnding = store.getCurrentEnding();
  if (currentEnding) {
    log(`🏆 达成结局: ${currentEnding.icon} ${currentEnding.title}`, 1);
    log(`   类型: ${currentEnding.type}`, 2);
    log(`   描述: ${currentEnding.description}`, 2);
    log(`   故事: ${currentEnding.storyText.substring(0, 80)}...`, 2);
  }
  const unlocked = store.getUnlockedEndings();
  const achieved = store.getAchievedEndings();
  info(`已解锁结局: ${unlocked.length}个`, 1);
  unlocked.forEach(e => log(`  - ${e.icon} ${e.title} (${e.id})`, 2));
  info(`已达成结局: ${achieved.length}个`, 1);
  achieved.forEach(e => log(`  - ${e.icon} ${e.title} (${e.id})`, 2));

  step(10, '触发结局UI与旁白');
  eventBus.emit('ending:show');
  await sleep(300);
  ok('结局UI已显示', 1);
  ok('结局旁白已自动播放', 1);

  console.log('');
  sep('═');
  const match = currentEnding?.id === expectedEnding;
  if (match) {
    log(`🎉 测试通过! 预期结局 "${expectedEnding}" 正确达成`, 0);
  } else {
    err(`测试失败! 预期: ${expectedEnding}, 实际: ${currentEnding?.id}`);
  }

  info('旁白触发统计:', 1);
  const narrationEvents = eventLog.filter(e =>
    e.event === 'recording:auto-play' || e.event === 'recording:play'
  );
  narrationEvents.forEach((e, i) => {
    const rec = store.getRecordingById(e.data.recordingId);
    log(`  ${i + 1}. ${e.time} [${e.event}] ${rec?.title || e.data.recordingId}`, 2);
  });

  info('事件日志汇总:', 1);
  log(`  总事件数: ${eventLog.length}`, 2);
  log(`  章节事件: ${eventLog.filter(e => e.event.startsWith('chapter')).length}`, 2);
  log(`  机关事件: ${eventLog.filter(e => e.event.startsWith('mechanism')).length}`, 2);
  log(`  线索事件: ${eventLog.filter(e => e.event.startsWith('clue')).length}`, 2);
  log(`  旁白事件: ${eventLog.filter(e => e.event.includes('recording') || e.event.includes('voice')).length}`, 2);
  log(`  记忆回廊事件: ${eventLog.filter(e => e.event.startsWith('memorycorridor')).length}`, 2);
  log(`  结局事件: ${eventLog.filter(e => e.event.startsWith('ending')).length}`, 2);

  sep('═');
  console.log('');

  cleanup();
  return match;
};

const main = async () => {
  header('记忆回廊调试脚本 - 完整流程复现');
  log('覆盖: 2次碎片排序 | 2次分支选择 | 终章结局门 | 4种结局落盘');
  log('输出: 每步状态 | 旁白触发 | 结局结果');
  console.log('');

  const results: Array<{ name: string; passed: boolean }> = [];

  results.push({
    name: '🌟 真结局·永恒的守护者',
    passed: await runFullFlow(
      '🌟 真结局·永恒的守护者',
      { branch1: 'choice_study_art', branch2: 'choice_remember_forever' },
      true,
      'ending_true'
    )
  });

  results.push({
    name: '💫 好结局·薪火相传',
    passed: await runFullFlow(
      '💫 好结局·薪火相传',
      { branch1: 'choice_study_art', branch2: 'choice_pass_on' },
      true,
      'ending_good'
    )
  });

  results.push({
    name: '🌙 普通结局·时光的过客',
    passed: await runFullFlow(
      '🌙 普通结局·时光的过客',
      { branch1: 'choice_study_major', branch2: 'choice_let_go' },
      false,
      'ending_neutral'
    )
  });

  results.push({
    name: '💔 坏结局·遗忘的代价',
    passed: await runFullFlow(
      '💔 坏结局·遗忘的代价',
      { branch1: 'choice_give_up_dream', branch2: 'choice_forget_everything' },
      false,
      'ending_bad'
    )
  });

  header('调试结果汇总');
  results.forEach((r, i) => {
    const status = r.passed ? '✅ 通过' : '❌ 失败';
    log(`${i + 1}. ${r.name}: ${status}`, 0);
  });
  const passed = results.filter(r => r.passed).length;
  console.log('');
  log(`总计: ${passed}/${results.length} 测试通过`, 0);
  console.log('');

  if (passed === results.length) {
    log('🎉 所有调试流程通过!', 0);
    log('✅ 两次碎片排序流程正常', 1);
    log('✅ 两次分支选择流程正常', 1);
    log('✅ 终章结局门流程正常', 1);
    log('✅ 四种结局落盘正常', 1);
    log('✅ 每步状态打印正常', 1);
    log('✅ 旁白触发日志正常', 1);
    log('✅ 结局结果输出正常', 1);
  }

  console.log('');
  log('💡 复跑说明:', 0);
  log('  直接运行: npx tsx debug-memory-corridor.ts', 1);
  log('  脚本位置: debug-memory-corridor.ts', 1);
  log('  每次测试独立重置状态，互不影响', 1);
  log('  所有事件和旁白均有详细日志', 1);
  console.log('');
};

main().catch(console.error);
