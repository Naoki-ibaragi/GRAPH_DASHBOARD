/**
 * グラフ設定関連の定数
 */

// グラフの種類
export const GRAPH_TYPES = {
  SCATTER: 'ScatterPlot',
  LINE: 'LinePlot',
  HISTOGRAM: 'Histogram',
  DENSITY: 'DensityPlot',
};

// グラフタイプの表示名マッピング
export const GRAPH_TYPE_LABELS = {
  '散布図': GRAPH_TYPES.SCATTER,
  '折れ線グラフ': GRAPH_TYPES.LINE,
  'ヒストグラム': GRAPH_TYPES.HISTOGRAM,
  '密度プロット': GRAPH_TYPES.DENSITY,
};

// アラームユニット
export const ALARM_UNITS = {
  LD: 'LD',
  DC1: 'DC1',
  AC1: 'AC1',
  AC2: 'AC2',
  DC2: 'DC2',
  IP: 'IP',
  ULD: 'ULD',
};

// 比較演算子
export const COMPARISON_OPERATORS = {
  'に等しい': '=',
  'に等しくない': '<>',
  'より大きい': '>',
  'より小さい': '<',
};

// プロット分割単位
export const PLOT_UNITS = {
  NONE: 'None',
  LOT: 'Lot',
  MACHINE: 'Machine',
  TYPE: 'Type',
  WAFER: 'Wafer',
  LD_ARM: 'LD_ARM',
  STAGE_DC1:'Stage_dc1',
  STAGE_AC1:'Stage_ac1',
  STAGE_AC2:'Stage_ac2',
  STAGE_DC2:'Stage_dc2',
  PROBE_DC1:'Probe_dc1',
  PROBE_AC1:'Probe_ac1',
  PROBE_AC2:'Probe_ac2',
  PROBE_DC2:'Probe_dc2',
};

export const PLOT_UNIT_LABELS = {
  '分割なし': PLOT_UNITS.NONE,
  'ロット単位': PLOT_UNITS.LOT,
  '設備単位': PLOT_UNITS.MACHINE,
  '機種名単位': PLOT_UNITS.TYPE,
  'Wa番号単位': PLOT_UNITS.WAFER,
  'LDトレイ保持アーム単位': PLOT_UNITS.LD_ARM,
  'DC1測定ステージ単位': PLOT_UNITS.STAGE_DC1,
  'AC1測定ステージ単位': PLOT_UNITS.STAGE_AC1,
  'AC2測定ステージ単位': PLOT_UNITS.STAGE_AC2,
  'DC2測定ステージ単位': PLOT_UNITS.STAGE_DC2,
  'DC1測定コンタクタ単位': PLOT_UNITS.PROBE_DC1,
  'AC1測定コンタクタ単位': PLOT_UNITS.PROBE_AC1,
  'AC2測定コンタクタ単位': PLOT_UNITS.PROBE_AC2,
  'DC2測定コンタクタ単位': PLOT_UNITS.PROBE_DC2,
};

// フィルター結合方法
export const FILTER_CONJUNCTIONS = {
  AND: 'and',
  OR: 'or',
};

// デフォルト値
export const DEFAULT_VALUES = {
  BIN_NUMBER: 50,
  BINS_X: 50,
  BINS_Y: 50,
  DATE_RANGE_MONTHS: 1,
};
