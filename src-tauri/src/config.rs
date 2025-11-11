use std::env;

/// データベースパスの設定
pub struct Config {
    pub db_path: String,
    pub alarm_json_path: String,
}

impl Config {
    /// 環境変数または デフォルト値から設定を読み込む
    pub fn new() -> Self {
        let db_path = env::var("DB_PATH")
            .unwrap_or_else(|_| "C:\\workspace\\ULD_analysis\\chiptest.db".to_string());

        let alarm_json_path = env::var("ALARM_JSON_PATH")
            .unwrap_or_else(|_| "./assets/alarm.json".to_string());

        Config {
            db_path,
            alarm_json_path,
        }
    }

    /// デフォルトのデータベースパスを取得
    pub fn get_db_path(&self) -> &str {
        &self.db_path
    }

    /// アラームJSONファイルのパスを取得
    pub fn get_alarm_json_path(&self) -> &str {
        &self.alarm_json_path
    }
}

impl Default for Config {
    fn default() -> Self {
        Self::new()
    }
}
