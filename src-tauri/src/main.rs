use tauri::{command,Window};
use std::thread;
use serde_json;


// 独自クレートの定義
mod commands;
mod db;
mod plot;
mod models;
mod utils;

// 独自モジュールの定義
use crate::models::graph_model::GraphCondition;
use crate::commands::graph::get_graphdata_from_db;
use crate::commands::regist::regist_txtdata_to_db;
use crate::commands::lotdata::get_lotdata;
use crate::commands::alarmdata::get_alarmdata;
use crate::utils::events::{report_progress,report_complete};

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

        //フロントエンドに状況報告
        report_progress(&window, "alarm-progress", "db_loading", 0, "処理開始");

        let (return_hashmap,alarm_data) = match get_alarmdata(db_path, &machine_name, db_path) {
            Ok(data) => {
                report_progress(&window, "alarm-progress", "complete getting data", 90, "データ取得完了");
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
        let db_path = "C:\\workspace\\ULD_analysis\\chiptest.db";
        //let db_path = "D:\\testspace\\chiptest.db";

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
        //let db_path = "D:\\testspace\\chiptest.db";
        let db_path = "C:\\workspace\\ULD_analysis\\chiptest.db";
        match regist_txtdata_to_db(&window,&file_path, db_path, &type_name){
            Ok(v)=>{},
            Err(e)=>report_complete(&window, "regist_data-complete", false, None, None)
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