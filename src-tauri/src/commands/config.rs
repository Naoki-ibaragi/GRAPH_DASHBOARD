use crate::config::AppConfig;
use tauri::Manager;

/// アプリケーション設定を取得
#[tauri::command]
pub fn get_app_config(
    app_handle: tauri::AppHandle,
) -> Result<AppConfig, String> {
    AppConfig::load(&app_handle)
}

/// アプリケーション設定を保存
#[tauri::command]
pub fn save_app_config(
    app_handle: tauri::AppHandle,
    config: AppConfig,
) -> Result<(), String> {
    config.save(&app_handle)?;
    Ok(())
}

/// 設定ファイルのパスを取得（デバッグ用）
#[tauri::command]
pub fn get_config_file_path(
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let config_path = app_data_dir.join("app_config.json");
    Ok(config_path.to_string_lossy().to_string())
}
