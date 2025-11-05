/// プログレス報告用のメッセージ定数

// イベント名
pub const EVENT_GRAPH_PROGRESS: &str = "graph_data-progress";
pub const EVENT_GRAPH_COMPLETE: &str = "graph_data-complete";
pub const EVENT_LOT_PROGRESS: &str = "lot_log-progress";
pub const EVENT_LOT_COMPLETE: &str = "lot_log-complete";
pub const EVENT_ALARM_PROGRESS: &str = "alarm-progress";
pub const EVENT_ALARM_COMPLETE: &str = "alarm-complete";
pub const EVENT_REGIST_COMPLETE: &str = "regist_data-complete";

// プログレスステージ
pub const STAGE_INIT: &str = "init";
pub const STAGE_DB_CONNECT: &str = "db_connect";
pub const STAGE_DB_LOADING: &str = "db_loading";
pub const STAGE_PROCESSING: &str = "processing";
pub const STAGE_COMPLETE: &str = "complete";

// エラーメッセージテンプレート
pub const ERROR_DB_READ: &str = "Failed to read DB";
pub const ERROR_DB_CONNECTION: &str = "Failed to connect to DB";
pub const ERROR_GRAPH_DATA: &str = "Failed to get graph data";
pub const ERROR_ALARM_DATA: &str = "Failed to get alarm data";
pub const ERROR_REGIST_DATA: &str = "Failed to register data";
