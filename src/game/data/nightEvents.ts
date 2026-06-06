import { NightEvent } from '../types';

export const NIGHT_EVENTS: NightEvent[] = [
  {
    id: 'night_event_1',
    exhibitionId: 'exhibition_1',
    name: '移动的影子',
    description: '你看到大厅中央有一道黑影一闪而过，似乎有什么东西在陈列柜之间穿梭...',
    type: 'figure',
    hotspot: { x: 300, y: 600, width: 150, height: 150 },
    triggered: false,
    resolved: false,
    reward: 'clue_1',
    icon: '👤',
    sfx: 'sfx_footsteps'
  },
  {
    id: 'night_event_2',
    exhibitionId: 'exhibition_1',
    name: '低语声',
    description: '空气中传来模糊的低语声，似乎有人在呼唤着"琥珀"这个名字...',
    type: 'whisper',
    hotspot: { x: 450, y: 350, width: 120, height: 120 },
    triggered: false,
    resolved: false,
    icon: '👂',
    sfx: 'sfx_whisper'
  },
  {
    id: 'night_event_3',
    exhibitionId: 'exhibition_2',
    name: '闪烁的吊坠',
    description: '西侧展厅的琥珀吊坠突然开始闪烁，发出不寻常的光芒...',
    type: 'anomaly',
    hotspot: { x: 200, y: 400, width: 120, height: 120 },
    triggered: false,
    resolved: false,
    icon: '💫',
    sfx: 'sfx_glow'
  },
  {
    id: 'night_event_4',
    exhibitionId: 'exhibition_2',
    name: '自动弹奏的音乐盒',
    description: '不知从何处传来音乐盒的旋律，曲调是那首熟悉的摇篮曲...',
    type: 'sound',
    hotspot: { x: 500, y: 500, width: 120, height: 120 },
    triggered: false,
    resolved: false,
    icon: '🎵',
    sfx: 'sfx_musicbox'
  },
  {
    id: 'night_event_5',
    exhibitionId: 'exhibition_3',
    name: '异动的病历',
    description: '东侧展厅的病历本无风自动，一页页地翻动着...',
    type: 'anomaly',
    hotspot: { x: 300, y: 500, width: 120, height: 120 },
    triggered: false,
    resolved: false,
    icon: '📄',
    sfx: 'sfx_pages'
  },
  {
    id: 'night_event_6',
    exhibitionId: 'exhibition_3',
    name: '走廊的脚步声',
    description: '走廊尽头传来缓慢的脚步声，一步一步，越来越近...',
    type: 'sound',
    hotspot: { x: 100, y: 700, width: 120, height: 120 },
    triggered: false,
    resolved: false,
    icon: '🚶',
    sfx: 'sfx_footsteps'
  },
  {
    id: 'night_event_7',
    exhibitionId: 'exhibition_4',
    name: '漂浮的信件',
    description: '珍藏馆中，一封信件缓缓漂浮在空中，仿佛被无形的手托举着...',
    type: 'anomaly',
    hotspot: { x: 150, y: 450, width: 120, height: 120 },
    triggered: false,
    resolved: false,
    icon: '✉️',
    sfx: 'sfx_float'
  },
  {
    id: 'night_event_8',
    exhibitionId: 'exhibition_4',
    name: '画布中的身影',
    description: '那幅未完成的画作中，小女孩的身影似乎在微微移动...',
    type: 'figure',
    hotspot: { x: 400, y: 350, width: 120, height: 120 },
    triggered: false,
    resolved: false,
    icon: '🖼️',
    sfx: 'sfx_breath'
  },
  {
    id: 'night_event_9',
    exhibitionId: 'exhibition_5',
    name: '怀表的滴答声',
    description: '已经停止的怀表突然发出滴答声，指针开始逆时针转动...',
    type: 'sound',
    hotspot: { x: 550, y: 550, width: 120, height: 120 },
    triggered: false,
    resolved: false,
    reward: 'clue_9',
    icon: '⏱️',
    sfx: 'sfx_ticktock'
  },
  {
    id: 'night_event_10',
    exhibitionId: 'exhibition_5',
    name: '琥珀中的记忆',
    description: '长廊尽头的巨大琥珀中，似乎浮现出一个小女孩的身影...',
    type: 'figure',
    hotspot: { x: 350, y: 800, width: 150, height: 150 },
    triggered: false,
    resolved: false,
    icon: '✨',
    sfx: 'sfx_amber'
  }
];
