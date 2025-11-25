use tauri::{command,Window,Emitter};
use tauri::menu::MenuBuilder;
use tauri_plugin_dialog::{DialogExt,MessageDialogKind};
use std::thread;
use serde_json;

// 独自クレートの定義
mod commands;
mod db;
mod plot;
mod models;
mod utils;
mod config;
mod constants;

// 独自モジュールの定義
use crate::models::graph_model::{GraphCondition,SubData};
use crate::commands::graph::get_graphdata_from_db;
use crate::commands::regist::regist_txtdata_to_db;
use crate::commands::lotdata::get_lotdata;
use crate::commands::alarmdata::get_alarmdata;
use crate::utils::events::{report_progress,report_complete};
use crate::constants::*;

//1ロット分のデータを取得して返す
#[command]
async fn download_lot(window:Window,lotName: String) -> Result<(),String> {
    thread::spawn(move || {
        let config = config::Config::new();
        let db_path = config.get_db_path();

        let data=match get_lotdata(&window, db_path, &lotName){
            Ok(data)=>{
                data
            },
            Err(e)=>{
                //エラーをフロントエンドに返す
                report_complete(&window, EVENT_LOT_COMPLETE, false, None, Some(format!("{}: {}",ERROR_DB_READ, e)));
                return;
            }
        };

        //データ成形を実施
        let response = serde_json::json!({
            "lot_header": data.0,
            "lot_data": data.1
        });

        // フロントエンドに状況を通知
        report_progress(&window, EVENT_LOT_PROGRESS, STAGE_COMPLETE, 100, "処理完了");

        // 完了通知
        report_complete(&window, EVENT_LOT_COMPLETE, true, Some(response), None);

    });

    Ok(())
}


//装置単位のアラームをまとめて返す
#[command]
async fn download_alarm(window:Window, machine_name: String) -> Result<(), String> {
    thread::spawn(move || {
        let config = config::Config::new();
        let db_path = config.get_db_path();
        let json_path = config.get_alarm_json_path();

        //フロントエンドに状況報告
        report_progress(&window, EVENT_ALARM_PROGRESS, STAGE_DB_LOADING, 0, "処理開始");

        let (return_hashmap,alarm_data) = match get_alarmdata(db_path, &machine_name, json_path) {
            Ok(data) => {
                report_progress(&window, EVENT_ALARM_PROGRESS, STAGE_COMPLETE, 90, "データ取得完了");
                data
            },
            Err(e) => {
                report_complete(&window, EVENT_ALARM_COMPLETE, false, None, Some(format!("{}: {}", ERROR_ALARM_DATA, e)));
                return;
            }
        };

        //serde_json::value形式に変換
        let response = serde_json::json!({
            "alarm_codes": alarm_data,
            "lot_unit_alarm_data": return_hashmap
        });

        // 完了通知
        report_complete(&window, EVENT_ALARM_COMPLETE, true, Some(response), None);
        
    });
    
    Ok(())
}

//グラフ条件からデータを取得して返す
#[command]
async fn get_graphdata(window:Window,graphCondition: GraphCondition) -> Result<(),String> {
    thread::spawn( move || {
        let config = config::Config::new();
        let db_path = config.get_db_path();

        let (graph_data,sub_data)=match get_graphdata_from_db(&window, db_path, graphCondition){
            Ok(d)=>d,
            Err(e)=>{
                report_complete(&window, EVENT_GRAPH_COMPLETE, false, None, Some(format!("{}: {}", ERROR_GRAPH_DATA, e)));
                return;
            }
        };

        let grid_len_x:f64;
        let grid_len_y:f64;
        match sub_data{
            SubData::DensityPlot(data)=>{
                grid_len_x=data.grid_x;
                grid_len_y=data.grid_y;
            },
            _=>{
                grid_len_x=1.0;
                grid_len_y=1.0;
            }
        }

        //serde_json::value形式に変換
        let response = serde_json::json!({
            "graph_data":graph_data,
            "grid_len_x":grid_len_x,
            "grid_len_y":grid_len_y,
        });

        // 完了通知
        report_complete(&window, EVENT_GRAPH_COMPLETE, true, Some(response), None);

    });

    Ok(())
}

//txtファイルのデータをDBに登録する
#[command]
fn regist_data(window:Window,file_path:String,type_name:String)->Result<(),String>{
    thread::spawn(move || {
        let config = config::Config::new();
        let db_path = config.get_db_path();

        match regist_txtdata_to_db(&window, &file_path, db_path, &type_name){
            Ok(_)=>{},
            Err(e)=> {
                report_complete(&window, EVENT_REGIST_COMPLETE, false, None, Some(format!("{}: {}", ERROR_REGIST_DATA, e)));
                return;
            }
        }

        //serde_json::value形式に変換
        let response = serde_json::json!({
            "file_path":file_path
        });

        // 完了通知
        report_complete(&window, EVENT_REGIST_COMPLETE, true, Some(response), None);
    });

    Ok(())
}

#[tauri::command]
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let menu = MenuBuilder::new(app)
                .text("version", "Version")
                .text("manual", "Manual")
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(move |app_handle: &tauri::AppHandle, event| {
                match event.id().0.as_str() {
                    "version" => {
                        app_handle.dialog()
                        .message(format!("バージョン:0.0.1\n作成者:Takahashi Naoki"))
                        .kind(MessageDialogKind::Info)
                        .title("バージョン情報")
                        .blocking_show();
                    },
                    "manual"=>{ //manual pageをopenするようにトリガをかける
                       app_handle.emit("open-manual","open-manual") .unwrap();
                    },
                    _ => {
                        println!("unexpected menu event");
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            download_lot,
            download_alarm,
            get_graphdata,
            regist_data,
            commands::config::get_app_config,
            commands::config::save_app_config,
            commands::config::get_config_file_path
        ])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}