import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';

export class ReadingRoomTest {
  private static log(message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 📚 ${message}`, data || '');
  }

  static async runAllTests(): Promise<void> {
    console.log('========================================');
    console.log('  档案阅览室功能测试');
    console.log('========================================\n');

    store.resetGame();
    this.log('游戏已重置');

    await this.testNormalChapterClueCollection();
    await this.testDualHallClueCollection();

    console.log('\n========================================');
    console.log('  所有测试完成！');
    console.log('========================================');
  }

  private static async testNormalChapterClueCollection(): Promise<void> {
    console.log('\n--- 测试1: 普通章节线索收集 ---');

    const initialUnread = store.getUnreadCount();
    this.log(`初始未读计数: ${initialUnread}`);

    const chapter1Clues = ['clue_2', 'clue_3', 'clue_4'];
    const charactersBefore = store.getUnlockedCharacters().length;
    const eventsBefore = store.getUnlockedTimelineEvents().length;
    this.log(`收集前已解锁人物: ${charactersBefore}, 事件: ${eventsBefore}`);

    let unlockEventCount = 0;
    let unlockCharacterCount = 0;
    const characterUnlockHandler = () => { unlockCharacterCount++; };
    const eventUnlockHandler = () => { unlockEventCount++; };
    eventBus.on('readingroom:character-unlock', characterUnlockHandler);
    eventBus.on('readingroom:event-unlock', eventUnlockHandler);

    for (const clueId of chapter1Clues) {
      const collected = store.collectClue(clueId);
      this.log(`收集线索 ${clueId}: ${collected ? '✓ 成功' : '✗ 已收集'}`);
      await this.delay(100);
    }

    eventBus.off('readingroom:character-unlock', characterUnlockHandler);
    eventBus.off('readingroom:event-unlock', eventUnlockHandler);

    const charactersAfter = store.getUnlockedCharacters().length;
    const eventsAfter = store.getUnlockedTimelineEvents().length;
    const unreadAfter = store.getUnreadCount();

    this.log(`收集后已解锁人物: ${charactersAfter} (新增: ${charactersAfter - charactersBefore})`);
    this.log(`收集后已解锁事件: ${eventsAfter} (新增: ${eventsAfter - eventsBefore})`);
    this.log(`未读计数: ${unreadAfter} (新增: ${unreadAfter - initialUnread})`);
    this.log(`收到人物解锁事件: ${unlockCharacterCount} 次`);
    this.log(`收到事件解锁事件: ${unlockEventCount} 次`);

    const unlockedChars = store.getUnlockedCharacters();
    this.log('已解锁人物:', unlockedChars.map(c => c.name));

    const unlockedEvents = store.getUnlockedTimelineEvents();
    this.log('已解锁事件:', unlockedEvents.slice(0, 5).map(e => e.title));

    const searchResults = store.searchClues('琥珀');
    this.log(`搜索"琥珀"找到 ${searchResults.length} 条线索`);

    const chapter1 = store.getChapters()[0];
    const chapterProgress = store.getCollectedCluesByChapter('chapter_1').length;
    this.log(`第一章收集进度: ${chapterProgress}/${chapter1.requiredClues.length}`);

    const allPassed = charactersAfter > charactersBefore && 
                      eventsAfter > eventsBefore && 
                      unreadAfter > initialUnread;
    this.log(`普通章节测试: ${allPassed ? '✓ 通过' : '✗ 失败'}`);
  }

  private static async testDualHallClueCollection(): Promise<void> {
    console.log('\n--- 测试2: 双馆章节线索收集 ---');

    store.resetGame();
    this.log('游戏已重置');

    const chapter1Clues = ['clue_2', 'clue_3', 'clue_4', 'clue_7', 'clue_8', 'clue_9', 'clue_11', 'clue_12', 'clue_13', 'clue_14', 'clue_15'];
    this.log('先完成前三章...');
    for (const clueId of chapter1Clues) {
      store.collectClue(clueId);
      await this.delay(50);
    }

    const initialUnread = store.getUnreadCount();
    const charactersBefore = store.getUnlockedCharacters().filter(c => c.chapterId === 'chapter_4').length;
    const eventsBefore = store.getUnlockedTimelineEvents().filter(e => e.chapterId === 'chapter_4').length;
    this.log(`双馆初始 - 未读: ${initialUnread}, 人物: ${charactersBefore}, 事件: ${eventsBefore}`);

    const historyClues = ['clue_h1', 'clue_h2', 'clue_h3'];
    const artClues = ['clue_a1', 'clue_a2', 'clue_a3'];

    let unlockCharacterCount = 0;
    let unlockEventCount = 0;
    let clueCollectCount = 0;

    const characterUnlockHandler = () => { unlockCharacterCount++; };
    const eventUnlockHandler = () => { unlockEventCount++; };
    const clueCollectHandler = () => { clueCollectCount++; };

    eventBus.on('readingroom:character-unlock', characterUnlockHandler);
    eventBus.on('readingroom:event-unlock', eventUnlockHandler);
    eventBus.on('clue:collect', clueCollectHandler);

    this.log('收集历史馆线索...');
    for (const clueId of historyClues) {
      const collected = store.collectDualHallClue(clueId);
      this.log(`  收集 ${clueId}: ${collected ? '✓' : '✗'}`);
      await this.delay(200);

      const currentChars = store.getUnlockedCharacters().filter(c => c.chapterId === 'chapter_4').length;
      const currentEvents = store.getUnlockedTimelineEvents().filter(e => e.chapterId === 'chapter_4').length;
      this.log(`    当前 - 人物: ${currentChars}, 事件: ${currentEvents}, 未读: ${store.getUnreadCount()}`);
    }

    this.log('收集艺术馆线索...');
    for (const clueId of artClues) {
      const collected = store.collectDualHallClue(clueId);
      this.log(`  收集 ${clueId}: ${collected ? '✓' : '✗'}`);
      await this.delay(200);

      const currentChars = store.getUnlockedCharacters().filter(c => c.chapterId === 'chapter_4').length;
      const currentEvents = store.getUnlockedTimelineEvents().filter(e => e.chapterId === 'chapter_4').length;
      this.log(`    当前 - 人物: ${currentChars}, 事件: ${currentEvents}, 未读: ${store.getUnreadCount()}`);
    }

    this.log('测试交叉取证（收集共享线索）...');
    const sharedClues = ['clue_shared_1', 'clue_shared_2'];
    for (const clueId of sharedClues) {
      const collected = store.collectDualHallClue(clueId);
      this.log(`  收集 ${clueId}: ${collected ? '✓' : '✗'}`);
      await this.delay(200);
    }

    eventBus.off('readingroom:character-unlock', characterUnlockHandler);
    eventBus.off('readingroom:event-unlock', eventUnlockHandler);
    eventBus.off('clue:collect', clueCollectHandler);

    const charactersAfter = store.getUnlockedCharacters().filter(c => c.chapterId === 'chapter_4').length;
    const eventsAfter = store.getUnlockedTimelineEvents().filter(e => e.chapterId === 'chapter_4').length;
    const unreadAfter = store.getUnreadCount();

    console.log('\n--- 双馆测试结果 ---');
    this.log(`线索收集事件: ${clueCollectCount} 次`);
    this.log(`人物解锁事件: ${unlockCharacterCount} 次`);
    this.log(`事件解锁事件: ${unlockEventCount} 次`);
    this.log(`第四章人物: ${charactersAfter} (新增: ${charactersAfter - charactersBefore})`);
    this.log(`第四章事件: ${eventsAfter} (新增: ${eventsAfter - eventsBefore})`);
    this.log(`最终未读: ${unreadAfter} (新增: ${unreadAfter - initialUnread})`);

    const dualHallChars = store.getUnlockedCharacters().filter(c => c.chapterId === 'chapter_4');
    this.log('第四章已解锁人物:', dualHallChars.map(c => c.name));

    const dualHallEvents = store.getUnlockedTimelineEvents().filter(e => e.chapterId === 'chapter_4');
    this.log('第四章已解锁事件:', dualHallEvents.map(e => e.title));

    const searchResults = store.searchCharacters('怀素');
    this.log(`搜索"怀素"找到 ${searchResults.length} 个角色`);

    const timelineResults = store.searchTimelineEvents('青铜');
    this.log(`搜索"青铜"找到 ${timelineResults.length} 个事件`);

    const chapter4Progress = store.getCollectedCluesByChapter('chapter_4').length;
    const chapter4Total = store.getCluesByChapter('chapter_4').length;
    this.log(`第四章收集进度: ${chapter4Progress}/${chapter4Total}`);

    const allPassed = charactersAfter > charactersBefore && 
                      eventsAfter > eventsBefore && 
                      unreadAfter > initialUnread &&
                      dualHallChars.length > 0 &&
                      dualHallEvents.length > 0;
    this.log(`双馆章节测试: ${allPassed ? '✓ 通过' : '✗ 失败'}`);

    console.log('\n--- 各功能验证 ---');
    this.log('🔍 线索检索: ' + (store.searchClues('').length > 0 ? '✓ 可用' : '✗ 无数据'));
    this.log('📅 事件时间轴: ' + (store.getUnlockedTimelineEvents().length > 0 ? '✓ 可用' : '✗ 无数据'));
    this.log('👥 人物关系: ' + (store.getUnlockedCharacters().length > 0 ? '✓ 可用' : '✗ 无数据'));
    this.log('📖 章节回顾: ' + (store.getChapters().filter(c => c.completed).length > 0 || store.getCollectedClues().length > 0 ? '✓ 可用' : '✗ 无数据'));
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (typeof window !== 'undefined') {
  (window as any).ReadingRoomTest = ReadingRoomTest;
}
