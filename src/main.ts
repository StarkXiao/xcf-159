import './style.css';
import { Game } from './game/Game';
import { eventBus } from './game/EventBus';
import { store } from './game/Store';
import { audioModule } from './modules/AudioModule';

let game: Game | null = null;

declare global {
  interface Window {
    __amberDebug: {
      audioModule: typeof audioModule;
      eventBus: typeof eventBus;
      store: typeof store;
      testAudio: () => string;
      simulateFullGame: () => string;
      collectAllClues: () => string;
      solveAllMechanisms: () => string;
      reset: () => void;
    };
  }
}

window.addEventListener('load', () => {
  game = new Game();

  window.__amberDebug = {
    audioModule,
    eventBus,
    store,

    testAudio: () => {
      console.log('=== 音频控制测试 ===');
      console.log('初始 BGM 静音:', audioModule.getBGMMuted());
      console.log('初始 BGM 音量:', audioModule.getBGMVolume());
      console.log('初始 SFX 静音:', audioModule.getSFXMuted());
      console.log('初始 SFX 音量:', audioModule.getSFXVolume());

      audioModule.playBGM('bgm_main');
      console.log('播放 BGM: bgm_main');

      setTimeout(() => {
        audioModule.playSFX('sfx_click');
        console.log('播放 SFX: sfx_click');
      }, 300);

      setTimeout(() => {
        audioModule.toggleBGM();
        console.log('静音 BGM, 状态:', audioModule.getBGMMuted());
        console.log('SFX 静音状态(应不变):', audioModule.getSFXMuted());
      }, 800);

      setTimeout(() => {
        audioModule.playSFX('sfx_collect');
        console.log('BGM 静音时播放 SFX');
      }, 1300);

      setTimeout(() => {
        audioModule.toggleBGM();
        console.log('恢复 BGM');
      }, 1800);

      setTimeout(() => {
        audioModule.setBGMVolume(0.2);
        console.log('设置 BGM 音量为 0.2');
        console.log('BGM 音量:', audioModule.getBGMVolume());
        console.log('SFX 音量(应不变):', audioModule.getSFXVolume());
      }, 2300);

      setTimeout(() => {
        audioModule.setSFXVolume(0.9);
        console.log('设置 SFX 音量为 0.9');
        console.log('SFX 音量:', audioModule.getSFXVolume());
        console.log('BGM 音量(应不变):', audioModule.getBGMVolume());
      }, 2800);

      setTimeout(() => {
        audioModule.setBGMVolume(0.5);
        audioModule.setSFXVolume(0.7);
        console.log('恢复默认音量');
      }, 3300);

      return '音频测试已启动，请查看控制台';
    },

    collectAllClues: () => {
      const clues = store.getClues();
      clues.forEach((clue: { id: string; collected: boolean }) => {
        if (!clue.collected) {
          store.collectClue(clue.id);
          eventBus.emit('clue:collect', { clueId: clue.id });
        }
      });
      return `已收集 ${store.getCollectedClues().length}/${clues.length} 个线索`;
    },

    solveAllMechanisms: () => {
      const mechs = store.getMechanisms();
      mechs.forEach(mech => {
        if (!mech.solved) {
          store.solveMechanism(mech.id);
          if (mech.reward === 'ending') {
            eventBus.emit('game:complete');
          } else if (mech.reward.startsWith('exhibition_')) {
            store.unlockExhibition(mech.reward);
            eventBus.emit('exhibition:unlock', { exhibitionId: mech.reward });
          }
        }
      });
      return `已解开 ${mechs.filter(m => m.solved).length}/${mechs.length} 个机关`;
    },

    simulateFullGame: () => {
      store.resetGame();
      eventBus.emit('scene:change', { scene: 'game' });

      setTimeout(() => {
        store.setCurrentExhibition('exhibition_1');
        eventBus.emit('exhibition:enter', { exhibitionId: 'exhibition_1' });
        console.log('进入：博物馆大厅');
      }, 500);

      setTimeout(() => {
        store.collectClue('clue_1');
        eventBus.emit('clue:collect', { clueId: 'clue_1' });
        console.log('收集：老旧照片');
      }, 1200);

      setTimeout(() => {
        store.setCurrentExhibition('exhibition_2');
        eventBus.emit('exhibition:enter', { exhibitionId: 'exhibition_2' });
        console.log('进入：西侧展厅');
      }, 1800);

      setTimeout(() => {
        store.collectClue('clue_2');
        eventBus.emit('clue:collect', { clueId: 'clue_2' });
        console.log('收集：琥珀吊坠 (记忆1)');
      }, 2500);

      setTimeout(() => {
        store.collectClue('clue_3');
        eventBus.emit('clue:collect', { clueId: 'clue_3' });
        console.log('收集：日记残页 (记忆2)');
      }, 3200);

      setTimeout(() => {
        store.setCurrentExhibition('exhibition_3');
        eventBus.emit('exhibition:enter', { exhibitionId: 'exhibition_3' });
        console.log('进入：东侧展厅');
      }, 3900);

      setTimeout(() => {
        store.collectClue('clue_4');
        eventBus.emit('clue:collect', { clueId: 'clue_4' });
        console.log('收集：医院手环 (记忆3)');
        store.completeChapter('chapter_1');
        eventBus.emit('chapter:complete', { chapterId: 'chapter_1' });
        console.log('=== 第一章完成 ===');
      }, 4600);

      setTimeout(() => {
        eventBus.emit('memory:start', { chapterId: 'chapter_1' });
        console.log('记忆拼接：章节1');
      }, 5600);

      setTimeout(() => {
        eventBus.emit('memory:complete', { chapterId: 'chapter_1', success: true });
        console.log('记忆拼接完成');
      }, 6600);

      setTimeout(() => {
        store.setCurrentExhibition('exhibition_2');
        eventBus.emit('mechanism:open', { mechanismId: 'mech_1' });
        console.log('打开机关：古老密码锁');
      }, 7600);

      setTimeout(() => {
        store.solveMechanism('mech_1');
        store.unlockExhibition('exhibition_4');
        eventBus.emit('mechanism:solve', { mechanismId: 'mech_1' });
        eventBus.emit('exhibition:unlock', { exhibitionId: 'exhibition_4' });
        console.log('解开机关：密码 1998，解锁珍藏馆');
      }, 8600);

      setTimeout(() => {
        store.setCurrentExhibition('exhibition_4');
        eventBus.emit('exhibition:enter', { exhibitionId: 'exhibition_4' });
        eventBus.emit('chapter:enter', { chapterId: 'chapter_2' });
        console.log('进入：珍藏馆，第二章开始');
      }, 9600);

      setTimeout(() => {
        store.collectClue('clue_7');
        eventBus.emit('clue:collect', { clueId: 'clue_7' });
        console.log('收集：旧信件 (记忆1)');
      }, 10300);

      setTimeout(() => {
        store.collectClue('clue_8');
        eventBus.emit('clue:collect', { clueId: 'clue_8' });
        console.log('收集：画作草稿 (记忆2)');
      }, 11000);

      setTimeout(() => {
        store.collectClue('clue_9');
        eventBus.emit('clue:collect', { clueId: 'clue_9' });
        console.log('收集：怀表 (记忆3)');
        store.completeChapter('chapter_2');
        eventBus.emit('chapter:complete', { chapterId: 'chapter_2' });
        console.log('=== 第二章完成 ===');
      }, 11700);

      setTimeout(() => {
        eventBus.emit('memory:start', { chapterId: 'chapter_2' });
        console.log('记忆拼接：章节2');
      }, 12700);

      setTimeout(() => {
        eventBus.emit('memory:complete', { chapterId: 'chapter_2', success: true });
        console.log('记忆拼接完成');
      }, 13700);

      setTimeout(() => {
        eventBus.emit('mechanism:open', { mechanismId: 'mech_2' });
        console.log('打开机关：记忆机关');
      }, 14700);

      setTimeout(() => {
        store.solveMechanism('mech_2');
        store.unlockExhibition('exhibition_5');
        eventBus.emit('mechanism:solve', { mechanismId: 'mech_2' });
        eventBus.emit('exhibition:unlock', { exhibitionId: 'exhibition_5' });
        console.log('解开机关：顺序 [1,2,3]，解锁回忆长廊');
      }, 15700);

      setTimeout(() => {
        store.setCurrentExhibition('exhibition_5');
        eventBus.emit('exhibition:enter', { exhibitionId: 'exhibition_5' });
        console.log('进入：回忆长廊');
      }, 16700);

      setTimeout(() => {
        eventBus.emit('mechanism:open', { mechanismId: 'mech_3' });
        console.log('打开最终之门');
      }, 17700);

      setTimeout(() => {
        store.solveMechanism('mech_3');
        eventBus.emit('mechanism:solve', { mechanismId: 'mech_3' });
        eventBus.emit('game:complete');
        console.log('=== 游戏通关！===');
      }, 18700);

      return '完整流程模拟已启动，预计19秒完成，请查看控制台';
    },

    reset: () => {
      store.resetGame();
      eventBus.emit('game:reset');
      eventBus.emit('scene:change', { scene: 'start' });
      console.log('游戏已重置');
    }
  };
});

window.addEventListener('beforeunload', () => {
  if (game) {
    game.destroy();
    game = null;
  }
});
