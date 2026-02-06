// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Emitter};
use tauri::menu::MenuBuilder;
use tauri_plugin_dialog::{DialogExt,MessageDialogKind};

// 独自クレートの定義
mod commands;
mod config;

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
                        .message(format!("バージョン:0.3.0\n作成者:Takahashi Naoki"))
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
            commands::config::get_app_config,
            commands::config::save_app_config,
            commands::config::get_config_file_path
        ])
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}