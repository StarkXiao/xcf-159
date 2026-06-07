import { PowerOutageEvent, HiddenHotspot, TimedMechanism } from '../types';

export const HIDDEN_HOTSPOTS: HiddenHotspot[] = [
  {
    id: 'hs_hidden_1',
    x: 150,
    y: 250,
    width: 100,
    height: 100,
    type: 'clue',
    targetId: 'clue_dark_1',
    hint: '黑暗中似乎有什么东西在发光...',
    activated: false,
    visibleInDark: true,
    requiredLighting: 'dark'
  },
  {
    id: 'hs_hidden_2',
    x: 450,
    y: 380,
    width: 100,
    height: 100,
    type: 'clue',
    targetId: 'clue_dark_2',
    hint: '应急灯的光芒照亮了某个角落...',
    activated: false,
    visibleInDark: true,
    requiredLighting: 'emergency'
  },
  {
    id: 'hs_hidden_3',
    x: 300,
    y: 550,
    width: 120,
    height: 120,
    type: 'mechanism',
    targetId: 'mech_timed_emergency',
    hint: '一个紧急开关，在黑暗中闪烁着红色光芒...',
    activated: false,
    visibleInDark: true,
    requiredLighting: 'dark'
  },
  {
    id: 'hs_hidden_4',
    x: 550,
    y: 700,
    width: 100,
    height: 100,
    type: 'story',
    targetId: 'story_dark_memory',
    hint: '黑暗中，一段记忆浮现在脑海...',
    activated: false,
    visibleInDark: true,
    requiredLighting: 'dim'
  },
  {
    id: 'hs_hidden_5',
    x: 200,
    y: 800,
    width: 100,
    height: 100,
    type: 'clue',
    targetId: 'clue_dark_3',
    hint: '在手电筒的光照下，你发现了什么...',
    activated: false,
    visibleInDark: true,
    requiredLighting: 'dark'
  },
  {
    id: 'hs_hidden_6',
    x: 400,
    y: 900,
    width: 110,
    height: 110,
    type: 'mechanism',
    targetId: 'mech_timed_generator',
    hint: '发电机的控制面板，需要快速操作...',
    activated: false,
    visibleInDark: true,
    requiredLighting: 'emergency'
  }
];

export const TIMED_MECHANISMS: TimedMechanism[] = [
  {
    id: 'timed_mech_1',
    mechanismId: 'mech_timed_emergency',
    exhibitionId: 'exhibition_1',
    timeLimit: 60,
    startTime: 0,
    endTime: 0,
    active: false,
    completed: false,
    failed: false,
    reward: 'clue_dark_4',
    penalty: 'reset_some_events'
  },
  {
    id: 'timed_mech_2',
    mechanismId: 'mech_timed_generator',
    exhibitionId: 'exhibition_2',
    timeLimit: 90,
    startTime: 0,
    endTime: 0,
    active: false,
    completed: false,
    failed: false,
    reward: 'unlock_emergency_exit',
    penalty: 'blackout_extended'
  },
  {
    id: 'timed_mech_3',
    mechanismId: 'mech_timed_final',
    exhibitionId: 'exhibition_3',
    timeLimit: 120,
    startTime: 0,
    endTime: 0,
    active: false,
    completed: false,
    failed: false,
    reward: 'clue_dark_5',
    penalty: 'lose_progress'
  }
];

export const POWER_OUTAGE_EVENTS: PowerOutageEvent[] = [
  {
    id: 'po_warning_1',
    exhibitionId: 'exhibition_1',
    phase: 'warning',
    name: '电压不稳',
    description: '灯光开始闪烁，似乎电力系统出现了问题。空气中弥漫着一种不安的气息...',
    triggered: false,
    completed: false,
    lightingState: 'flickering',
    duration: 3000,
    revealHiddenHotspots: ['hs_hidden_4'],
    triggerTimedMechanisms: [],
    audioTransition: {
      from: 'bgm_night',
      to: 'bgm_power_outage',
      sfx: 'sfx_power_flicker'
    },
    icon: '⚡'
  },
  {
    id: 'po_outage_1',
    exhibitionId: 'exhibition_1',
    phase: 'outage',
    name: '突然停电',
    description: '所有灯光突然熄灭，你陷入了一片黑暗中。只有应急指示灯在微弱地闪烁。抓紧时间，在黑暗中寻找线索！',
    triggered: false,
    completed: false,
    lightingState: 'dark',
    duration: 60000,
    revealHiddenHotspots: ['hs_hidden_1', 'hs_hidden_5'],
    triggerTimedMechanisms: ['timed_mech_1'],
    audioTransition: {
      from: 'bgm_power_outage',
      to: 'bgm_power_outage',
      sfx: 'sfx_power_failure'
    },
    icon: '💡'
  },
  {
    id: 'po_outage_2',
    exhibitionId: 'exhibition_1',
    phase: 'outage',
    name: '应急照明启动',
    description: '应急灯缓缓亮起，昏黄的红色光芒照亮了部分区域。你可以看清周围的环境了，但时间紧迫！',
    triggered: false,
    completed: false,
    lightingState: 'emergency',
    duration: 30000,
    revealHiddenHotspots: ['hs_hidden_2'],
    triggerTimedMechanisms: [],
    audioTransition: {
      from: 'bgm_power_outage',
      to: 'bgm_emergency',
      sfx: 'sfx_emergency_light'
    },
    icon: '🔦'
  },
  {
    id: 'po_outage_3',
    exhibitionId: 'exhibition_1',
    phase: 'outage',
    name: '西侧展厅异动',
    description: '西侧展厅传来奇怪的声响，似乎有什么东西在黑暗中移动。那边可能隐藏着重要的线索...',
    triggered: false,
    completed: false,
    lightingState: 'dim',
    duration: 20000,
    revealHiddenHotspots: ['hs_hidden_3', 'hs_hidden_6'],
    triggerTimedMechanisms: ['timed_mech_2'],
    audioTransition: {
      from: 'bgm_emergency',
      to: 'bgm_power_outage',
      sfx: 'sfx_creak'
    },
    icon: '🌑'
  },
  {
    id: 'po_recovery_1',
    exhibitionId: 'exhibition_1',
    phase: 'recovery',
    name: '电力开始恢复',
    description: '你听到发电机启动的声音，灯光开始闪烁着恢复。抓住最后的机会，完成未完成的探索！',
    triggered: false,
    completed: false,
    lightingState: 'flickering',
    duration: 10000,
    revealHiddenHotspots: [],
    triggerTimedMechanisms: ['timed_mech_3'],
    audioTransition: {
      from: 'bgm_power_outage',
      to: 'bgm_emergency',
      sfx: 'sfx_fuse_blow'
    },
    icon: '⚡'
  },
  {
    id: 'po_recovery_2',
    exhibitionId: 'exhibition_1',
    phase: 'recovery',
    name: '灯光渐亮',
    description: '光线越来越亮，停电事件即将结束。你在黑暗中发现的秘密，将永远改变一切...',
    triggered: false,
    completed: false,
    lightingState: 'dim',
    duration: 5000,
    revealHiddenHotspots: [],
    triggerTimedMechanisms: [],
    audioTransition: {
      from: 'bgm_emergency',
      to: 'bgm_night',
      sfx: 'sfx_power_restore'
    },
    icon: '🌅'
  },
  {
    id: 'po_complete_1',
    exhibitionId: 'exhibition_1',
    phase: 'complete',
    name: '电力完全恢复',
    description: '所有灯光重新亮起，博物馆恢复了正常。恭喜你度过了这个惊心动魄的停电夜！',
    triggered: false,
    completed: false,
    lightingState: 'normal',
    duration: 3000,
    revealHiddenHotspots: [],
    triggerTimedMechanisms: [],
    audioTransition: {
      from: 'bgm_night',
      to: 'bgm_explore',
      sfx: 'sfx_success'
    },
    icon: '✨'
  }
];

export const POWER_OUTAGE_CLUES = [
  {
    id: 'clue_dark_1',
    name: '紧急备用钥匙',
    description: '在黑暗中摸到的一把冰冷的钥匙，上面刻着"紧急出口"的字样。这应该是为突发情况准备的备用钥匙。',
    icon: '🔑',
    chapterId: 'chapter_1',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_timed_generator',
        mechanismName: '发电机控制面板',
        purpose: '用于解锁发电机控制面板，启动应急电力系统',
        exhibitionId: 'exhibition_1'
      }
    ]
  },
  {
    id: 'clue_dark_2',
    name: '应急灯使用说明',
    description: '一张泛黄的说明书，详细说明了应急照明系统的操作方法。上面有爷爷的笔迹："琥珀，记住，黑暗中永远不要放弃希望。"',
    icon: '📋',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 4,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_timed_emergency',
        mechanismName: '应急电源密码锁',
        purpose: '提供应急照明系统的操作指导，帮助理解密码提示',
        exhibitionId: 'exhibition_1'
      }
    ]
  },
  {
    id: 'clue_dark_3',
    name: '泛黄的老照片',
    description: '手电筒光照亮了一张老照片，照片中是年幼的琥珀和爷爷在博物馆的合影。背面写着："无论发生什么，爷爷永远在你身边。"',
    icon: '📷',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 5,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_timed_final',
        mechanismName: '主电源恢复开关',
        purpose: '唤起珍贵记忆，提供情感支持和精神力量',
        exhibitionId: 'exhibition_1'
      }
    ]
  },
  {
    id: 'clue_dark_4',
    name: '紧急开关操作记录',
    description: '成功启动紧急开关后找到的一份记录，详细记载了博物馆电力系统的布局。原来爷爷早就预料到可能会发生这种情况。',
    icon: '📜',
    chapterId: 'chapter_1',
    isMemory: false,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_timed_generator',
        mechanismName: '发电机控制面板',
        purpose: '提供电力系统布局图，帮助找到发电机位置和操作方法',
        exhibitionId: 'exhibition_1'
      },
      {
        mechanismId: 'mech_timed_final',
        mechanismName: '主电源恢复开关',
        purpose: '说明主电源恢复的操作步骤和注意事项',
        exhibitionId: 'exhibition_1'
      }
    ]
  },
  {
    id: 'clue_dark_5',
    name: '爷爷的最后留言',
    description: '在电力恢复前找到的一卷磁带，里面是爷爷的声音："琥珀，如果你听到这段录音，说明你已经通过了考验。记住，最黑暗的时刻，也是最接近光明的时刻。这座博物馆，以及我所有的记忆，现在都交给你了。"',
    icon: '📼',
    chapterId: 'chapter_1',
    isMemory: true,
    memoryOrder: 6,
    collected: false,
    mechanismPurpose: [
      {
        mechanismId: 'mech_timed_final',
        mechanismName: '主电源恢复开关',
        purpose: '提供最终的精神指引，确认博物馆传承的意义',
        exhibitionId: 'exhibition_1'
      }
    ]
  }
];

export const POWER_OUTAGE_MECHANISMS = [
  {
    id: 'mech_timed_emergency',
    type: 'password' as const,
    answer: '永恒',
    reward: 'clue_dark_4',
    hint: '爷爷常说，真正的什么能够穿越时间？（两个字）',
    solved: false,
    displayName: '应急电源密码锁'
  },
  {
    id: 'mech_timed_generator',
    type: 'password' as const,
    answer: '1937',
    reward: 'unlock_emergency_exit',
    hint: '纪念馆建成的年份（四位数字）',
    solved: false,
    displayName: '发电机控制面板'
  },
  {
    id: 'mech_timed_final',
    type: 'password' as const,
    answer: '记忆',
    reward: 'clue_dark_5',
    hint: '在最黑暗的时刻，是什么照亮你前行？（两个字）',
    solved: false,
    displayName: '主电源恢复开关'
  }
];
