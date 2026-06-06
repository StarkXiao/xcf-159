import { RestorationMaterial, Relic, RestorationStep } from '../types';

export const RESTORATION_MATERIALS: RestorationMaterial[] = [
  {
    id: 'material_1',
    name: '精细砂纸',
    icon: '📜',
    description: '用于打磨文物表面的氧化层和锈迹，粒度均匀，不会损伤文物本体。',
    collected: false
  },
  {
    id: 'material_2',
    name: '文物修复胶',
    icon: '🧪',
    description: '特制的可逆性粘合剂，用于粘结断裂的文物部件，日后可安全溶解去除。',
    collected: false
  },
  {
    id: 'material_3',
    name: '青铜补配粉',
    icon: '✨',
    description: '与青铜鼎成分相近的金属粉末，用于填补缺失的部分，使修复处浑然一体。',
    collected: false
  },
  {
    id: 'material_4',
    name: '抛光软布',
    icon: '🧻',
    description: '超细纤维材质的软布，用于最后抛光，恢复文物原有的光泽。',
    collected: false
  },
  {
    id: 'material_5',
    name: '专业镊子',
    icon: '🔧',
    description: '精密不锈钢镊子，用于处理细小的碎片和残留物。',
    collected: false
  }
];

const BRONZE_DING_STEPS: RestorationStep[] = [
  {
    id: 'step_1',
    order: 1,
    name: '表面清理',
    description: '用精细砂纸轻轻打磨青铜鼎表面，去除岁月留下的氧化层和锈迹，露出原本的青铜底色。',
    materialId: 'material_1',
    icon: '📜'
  },
  {
    id: 'step_2',
    order: 2,
    name: '碎片拼接',
    description: '使用专业镊子将散落的青铜碎片逐一归位，确认每一块的正确位置。',
    materialId: 'material_5',
    icon: '🔧'
  },
  {
    id: 'step_3',
    order: 3,
    name: '粘结固定',
    description: '在拼接处小心涂抹文物修复胶，将断裂的部件牢固地粘合在一起。',
    materialId: 'material_2',
    icon: '🧪'
  },
  {
    id: 'step_4',
    order: 4,
    name: '缺损填补',
    description: '用青铜补配粉填补文物上缺失的部分，塑形后等待干燥固化。',
    materialId: 'material_3',
    icon: '✨'
  },
  {
    id: 'step_5',
    order: 5,
    name: '抛光成型',
    description: '用抛光软布仔细打磨整个青铜鼎表面，使其恢复原有的温润光泽。',
    materialId: 'material_4',
    icon: '🧻'
  }
];

export const RELICS: Relic[] = [
  {
    id: 'relic_bronze_ding',
    name: '商周青铜鼎',
    description: '商周时期的青铜礼器，是古代祭祀和宴飨的重要器物。此鼎造型庄重，纹饰精美，具有极高的历史价值。',
    damagedDescription: '青铜鼎表面布满了厚重的铜绿和氧化层，鼎身有明显的裂纹，一角缺失，纹饰模糊不清，仿佛在低声诉说着千年的沧桑。',
    restoredDescription: '青铜鼎恢复了原本的青铜光泽，纹饰清晰可见，三足稳固，气势恢宏。修复之处与原器浑然一体，仿佛从未破损过一般，静静诉说着那段辉煌的历史。',
    damagedIcon: '🏺',
    restoredIcon: '✨',
    steps: BRONZE_DING_STEPS,
    chapterId: 'chapter_3',
    restored: false
  }
];
