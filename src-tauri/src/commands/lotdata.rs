use rusqlite::{Connection,Result};
use tauri::{Window};

use crate::utils::events::{report_progress};

pub fn get_lotdata(window:&Window, db_path: &str, lot_name: &str) -> Result<(Vec<String>, Vec<Vec<String>>), Box<dyn std::error::Error>> {
    let db = Connection::open(db_path)?;

    //フロントエンドに状況報告
    report_progress(&window,"lot_data-progress", "prepare sql", 10, "SQL文定義中");

    //1ロット分の全データを取得するSQL文を用意
    let mut stmt = db.prepare(
        "SELECT *
         FROM chipdata
         WHERE lot_name = ?",
    )?;

    // カラム名一覧を取得
    let mut column_names: Vec<String> = stmt.column_names()
        .iter()
        .map(|&name| name.to_string())
        .collect();

    //カラム名の最初(ID)と最後の3つ(裏面外観補正量X,Y,Θ)を削除する
    column_names.drain(..1);
    //column_names.drain(column_names.len()-3..);
    
    //フロントエンドに状況報告
    report_progress(&window,"lot_data-progress", "finish getting column name", 30, "カラム名取得完了");

    //これに全レコードの情報を入れて返す
    let mut lot_unit_vec: Vec<Vec<String>> = Vec::new();

    //フロントエンドに状況報告
    report_progress(&window,"lot_data-progress", "start data summarize", 30, "DBから取得したデータの成形を開始");
    
    let rows = stmt.query_map([lot_name], |row| {
        let column_count = row.as_ref().column_count();
        let mut row_data = Vec::new();
        
        for i in 0..column_count {
            let value: Result<String, _> = row.get(i);
            match value {
                Ok(v) => row_data.push(v),
                Err(_) => {
                    // NULL や他の型の場合は空文字列で代用
                    row_data.push(String::new());
                }
            }
        }
        //row_dataも最初の要素と最後の3つの要素を取り除く
        row_data.drain(..1);
        row_data.drain(row_data.len()-3..);
        Ok(row_data)
    })?;
    
    //フロントエンドに状況報告
    report_progress(&window,"lot_data-progress", "start data summarize", 90, "DBから取得したデータの成形が完了");

    for row in rows {
        lot_unit_vec.push(row?);
    }
    
    Ok((column_names, lot_unit_vec))

}
