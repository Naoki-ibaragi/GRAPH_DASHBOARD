use tauri::command;

#[command]
fn download_lot(lot: String) -> String {
    println!("受け取ったロット番号: {}", lot);
    // ここでDBからデータ取得やファイル生成などを行う
    format!("Lot {} のデータを生成しました", lot)
}

#[command]
fn download_alarm() -> String {
    println!("全ロットのアラームデータを生成します");
    "アラームデータを生成しました".to_string()
}

#[command]
fn regist_data(folder_path: String) -> String {
    println!("DB登録処理を開始します");
    format!("Lot {} のデータを生成しました", folder_path)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![download_lot, download_alarm,regist_data])
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}