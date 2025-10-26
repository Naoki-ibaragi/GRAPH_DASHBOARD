use tauri::{command,Emitter,Window};
use std::thread;

mod alarm_log;
use alarm_log::{read_jsondata,get_alarmdata};

mod lot_log;
use lot_log::{get_lotdata};

mod graph_data;
use graph_data::{get_graphdata_from_db,GraphCondition};

mod regist_data;
use regist_data::{read_textdata};

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
fn report_progress(window:&Window,event:&str,step:&str,progress:u32,message:&str){
    let _ = window.emit(event, ProgressPayload {
        step: step.to_string(),
        progress: progress,
        message: message.to_string(),
    });
}

//フロントエンドに完了を送信
fn report_complete(window:&Window,event:&str,success:bool,data:Option<serde_json::Value>,error:Option<String>){
    let _ = window.emit(event, CompletionPayload {
        success: success,
        data: data,
        error: error,
    });
}

//1ロット分のデータを取得して返す
#[command]
async fn download_lot(window:Window,lotName: String) -> Result<(),String> {
    thread::spawn(move || {

        let db_path = "C:\\workspace\\ULD_analysis\\chiptest.db";
        let data=match get_lotdata(&window,db_path, &lotName){
            Ok(data)=>{
                data
            },
            Err(e)=>{
                //エラーをフロントエンドに返す
                report_complete(&window, "lot_log-complete", false, None, Some(format!("Failed to readd DB:{}",e)));
                return;
            }  
        };

        //データ成形を実施
        let response = serde_json::json!({
            "lot_header": data.0,
            "lot_data": data.1
        });
        
        // フロントエンドに状況を通知
        report_progress(&window, "lot_log-progress", "complete", 100, "処理完了");

        // 完了通知
        report_complete(&window, "lot_log-complete", true, Some(response), None);

    });

    Ok(())
}


//装置単位のアラームをまとめて返す
#[command]
async fn download_alarm(window:Window, machine_name: String) -> Result<(), String> {

    thread::spawn(move || {
        let json_path = "D:\\testspace\\alarm.json";
        let db_path = "D:\\testspace\\chiptest.db";
        // ステップ1: JSON読み込み開始
        report_progress(&window, "alarm-progress", "json_loading", 10, "JSON読み込み中"); // フロントエンドに状況を通知
        
        let alarm_data = match read_jsondata(json_path) {
            Ok(data) => {
                report_progress(&window, "alarm-progress", "json_loaded", 30, "JSON読み込み完了"); // フロントエンドに状況を通知
                data
            },
            Err(e) => {
                report_complete(&window, "alarm-complete", false, None, Some(format!("Failed to read json:{}",e))); //エラーをフロントエンドに返す
                return;
            }
        };
        
        // ステップ2: DB処理開始
        report_progress(&window, "alarm-progress", "db_loading", 50, "データベースからデータ取得中"); // フロントエンドに状況を通知
        let return_hashmap = match get_alarmdata(db_path, &machine_name, &alarm_data) {
            Ok(data) => {
                report_progress(&window, "alarm-progress", "db_loaded", 90, "データベース読込完了");
                data
            },
            Err(e) => {
                report_complete(&window, "alarm-complete", false, None, Some(format!("Failed to get alarm data:{}",e)));
                return;
            }
        };

        //serde_json::value形式に変換 
        let response = serde_json::json!({
            "alarm_codes": alarm_data,
            "lot_unit_alarm_data": return_hashmap
        });
        
        // 完了通知
        report_complete(&window, "alarm-complete", true, Some(response), None);
        
    });
    
    Ok(())
}

//グラフ条件からデータを取得して返す
#[command]
async fn get_graphdata(window:Window,graphCondition: GraphCondition) -> Result<(),String> {
    thread::spawn( move || {
        //let db_path = "C:\\workspace\\ULD_analysis\\chiptest.db";
        let db_path = "D:\\testspace\\chiptest.db";

        let graph_data=match get_graphdata_from_db(&window,db_path,graphCondition){
            Ok(d)=>d,
            Err(e)=>{
                report_complete(&window, "graph_data-complete", false, None, Some(format!("Failed to get graph data:{}",e))); //エラーをフロントエンドに返す
                return;
            }
        };

        //serde_json::value形式に変換
        let response = serde_json::json!({
            "graph_data":graph_data
        });

        // 完了通知
        report_complete(&window, "graph_data-complete", true, Some(response), None);

    });

    Ok(())
}

//txtファイルのデータをDBに登録する
#[command]
fn regist_data(window:Window,file_path:String,type_name:String)->Result<(),String>{
    println!("register_data @ main.rs");
    thread::spawn(move || {
        let db_path = "D:\\testspace\\chiptest.db";
        match read_textdata(&window,&file_path, db_path, &type_name){
            Ok(v)=>{},
            Err(e)=>report_complete(&window, "regist_data-complete", true, None, None)
        }

        // 完了通知
        report_complete(&window, "regist_data-complete", true, None, None);
    });

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![download_lot, download_alarm,get_graphdata,regist_data])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}