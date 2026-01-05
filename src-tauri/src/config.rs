use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// アプリケーションのURL設定
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// グラフデータ取得先URL
    pub graph_data_url: String,
    /// ロットデータダウンロードURL
    pub lot_data_url: String,
    /// 装置一覧取得URL
    pub machine_list_url: String,
    /// アラームデータダウンロードURL
    pub alarm_data_url: String,
    /// 稼働データダウンロードURL
    pub operation_data_url: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            graph_data_url: "http://127.0.0.1:8080/get_graphdata".to_string(),
            lot_data_url: "http://127.0.0.1:8080/download_lot".to_string(),
            machine_list_url: "http://127.0.0.1:8080/get_machine_list".to_string(),
            alarm_data_url: "http://127.0.0.1:8080/download_alarm".to_string(),
            operation_data_url: "http://127.0.0.1:8080/download_operating_data".to_string(),
        }
    }
}

impl AppConfig {
    /// 設定ファイルのパスを取得
    fn get_config_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
        // リリースビルドの場合はexeファイルと同じ階層に配置
        #[cfg(not(debug_assertions))]
        {
            let exe_dir = env::current_exe()
                .map_err(|e| format!("Failed to get executable path: {}", e))?
                .parent()
                .ok_or_else(|| "Failed to get executable directory".to_string())?
                .to_path_buf();

            Ok(exe_dir.join("app_config.json"))
        }

        // デバッグビルドの場合は従来通りapp_data_dirに配置
        #[cfg(debug_assertions)]
        {
            let app_data_dir = app_handle
                .path()
                .app_data_dir()
                .map_err(|e| format!("Failed to get app data dir: {}", e))?;

            // ディレクトリが存在しない場合は作成
            if !app_data_dir.exists() {
                fs::create_dir_all(&app_data_dir)
                    .map_err(|e| format!("Failed to create app data dir: {}", e))?;
            }

            Ok(app_data_dir.join("app_config.json"))
        }
    }

    /// 設定ファイルを読み込む
    pub fn load(app_handle: &tauri::AppHandle) -> Result<Self, String> {
        let config_path = Self::get_config_path(app_handle)?;

        // ファイルが存在しない場合はデフォルト設定を返す
        if !config_path.exists() {
            let default_config = Self::default();
            // デフォルト設定をファイルに保存
            default_config.save(app_handle)?;
            return Ok(default_config);
        }

        // ファイルから読み込み
        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config file: {}", e))?;

        let config: Self = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse config file: {}", e))?;

        Ok(config)
    }

    /// 設定ファイルに保存
    pub fn save(&self, app_handle: &tauri::AppHandle) -> Result<(), String> {
        let config_path = Self::get_config_path(app_handle)?;

        let content = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize config: {}", e))?;

        fs::write(&config_path, content)
            .map_err(|e| format!("Failed to write config file: {}", e))?;

        Ok(())
    }
}
