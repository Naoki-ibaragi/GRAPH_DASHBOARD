use tauri::{command,Emitter,Window};
use std::thread;

mod alarm_log;
use alarm_log::{read_jsondata,get_alarmdata};

#[command]
fn download_lot(lot: String) -> String {
    println!("受け取ったロット番号: {}", lot);
    // ここでDBからデータ取得やファイル生成などを行う
    format!("Lot {} のデータを生成しました", lot)
}

// 進捗報告用のイベントペイロード
#[derive(Clone, serde::Serialize)]
struct ProgressPayload {
    step: String,
    progress: u32,
    message: String,
}

// 完了イベントのペイロード
#[derive(Clone, serde::Serialize)]
struct CompletionPayload {
    success: bool,
    data: Option<serde_json::Value>,
    error: Option<String>,
}

#[command]
async fn download_alarm(window: Window, machine_name: String) -> Result<(), String> {
    // 別スレッドで処理を実行
    thread::spawn(move || {
        let json_path = "D:\\testspace\\alarm.json";
        let db_path = "D:\\testspace\\chiptest.db";
        // ステップ1: JSON読み込み開始
        let _ = window.emit("alarm-progress", ProgressPayload {
            step: "json_loading".to_string(),
            progress: 10,
            message: "JSON読み込み中...".to_string(),
        });
        
        let alarm_data = match read_jsondata(json_path) {
            Ok(data) => {
                let _ = window.emit("alarm-progress", ProgressPayload {
                    step: "json_loaded".to_string(),
                    progress: 30,
                    message: "JSON読み込み完了".to_string(),
                });
                data
            },
            Err(e) => {
                let _ = window.emit("alarm-complete", CompletionPayload {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to read json: {}", e)),
                });
                return;
            }
        };
        
        // ステップ2: DB処理開始
        let _ = window.emit("alarm-progress", ProgressPayload {
            step: "db_loading".to_string(),
            progress: 50,
            message: "データベースからデータ取得中...".to_string(),
        });
        
        let return_hashmap = match get_alarmdata(db_path, &machine_name, &alarm_data) {
            Ok(data) => {
                let _ = window.emit("alarm-progress", ProgressPayload {
                    step: "db_loaded".to_string(),
                    progress: 80,
                    message: "データベース読み込み完了".to_string(),
                });
                data
            },
            Err(e) => {
                let _ = window.emit("alarm-complete", CompletionPayload {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to get alarmdata: {}", e)),
                });
                return;
            }
        };
        
        // ステップ3: データ整形
        let _ = window.emit("alarm-progress", ProgressPayload {
            step: "formatting".to_string(),
            progress: 90,
            message: "データ整形中...".to_string(),
        });
        
        let response = serde_json::json!({
            "alarm_codes": alarm_data,
            "lot_unit_alarm_data": return_hashmap
        });
        
        // 完了通知
        let _ = window.emit("alarm-complete", CompletionPayload {
            success: true,
            data: Some(response),
            error: None,
        });
        
        let _ = window.emit("alarm-progress", ProgressPayload {
            step: "complete".to_string(),
            progress: 100,
            message: "処理完了".to_string(),
        });
    });
    
    Ok(())
}


#[command]
fn regist_data(folder_path: String) -> Result<String,String> {
    println!("DB登録処理を開始します path:{}",folder_path);
    Ok("OK".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![download_lot, download_alarm,regist_data])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}