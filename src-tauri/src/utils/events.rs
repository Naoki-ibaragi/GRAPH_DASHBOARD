use tauri::{Emitter,Window};
use serde;

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

//フロントエンドに進捗状況を送信
pub fn report_progress(window:&Window,event:&str,step:&str,progress:u32,message:&str){
    let _ = window.emit(event, ProgressPayload {
        step: step.to_string(),
        progress: progress,
        message: message.to_string(),
    });
}

//フロントエンドに完了を送信
pub fn report_complete(window:&Window,event:&str,success:bool,data:Option<serde_json::Value>,error:Option<String>){
    let _ = window.emit(event, CompletionPayload {
        success: success,
        data: data,
        error: error,
    });
}
