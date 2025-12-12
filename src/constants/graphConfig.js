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
  'を含む': 'LIKE',
};

export const PLOT_UNITS = {
  NONE: 'None',
  LOT: 'lot_name',
  MACHINE: 'Machine',
  TYPE: 'type_name',
  WANO: 'WANO',
  WAX: 'WAX',
  WAY: 'WAY',
  LD_TRAYID: 'ld_trayid',
  LD_ARM: 'ld_tray_pos',
  STAGE_DC1:'dc1_test_stage_serial',
  STAGE_AC1:'ac1_test_stage_serial',
  STAGE_AC2:'ac2_test_stage_serial',
  STAGE_DC2:'dc2_test_stage_serial',
  PROBE_DC1:'dc1_test_probe_serial',
  PROBE_AC1:'ac1_test_probe_serial',
  PROBE_AC2:'ac2_test_probe_serial',
  PROBE_DC2:'dc2_test_probe_serial',
  ULD_TRAYID: 'uld_trayid',
};

export const PLOT_UNIT_LABELS = {
  '分割なし': "None",
  'ロット単位': "LOT_NAME",
  '設備単位': "MACHINE_ID",
  '機種名単位': "TYPE_NAME",
  'Wa番号単位': "WANO",
  'WaX座標単位': "WAX",
  'WaY座標単位': "WAY",
  'LDトレイID単位': "LD_TRAYID",
  'LDトレイ保持アーム単位': "LD_TRAY_ARM",
  'DC1測定ステージ単位': "DC1_STAGE_SERAIL",
  'AC1測定ステージ単位': "AC1_STAGE_SERAIL",
  'AC2測定ステージ単位': "AC2_STAGE_SERAIL",
  'DC2測定ステージ単位': "DC2_STAGE_SERAIL",
  'DC1測定コンタクタ単位': "DC1_PROBE_SERIAL",
  'AC1測定コンタクタ単位': "AC1_PROBE_SERIAL",
  'AC2測定コンタクタ単位': "AC2_PROBE_SERIAL",
  'DC2測定コンタクタ単位': "DC2_PROBE_SERIAL",
  'ULDトレイID単位': "ULD_TRAYID"
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
