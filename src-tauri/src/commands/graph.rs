/* グラフ描画時に呼ぶ関数 */
use rusqlite::{Connection, Result,Statement};
use std::error::Error;
use tauri::{Emitter,Window};
use serde::{Deserialize,Serialize};
use std::collections::HashMap;
use chrono::NaiveDateTime;

use crate::models::graph_model::{*};
use crate::utils::events::{report_complete,report_progress};
use crate::db::graph_sql::{create_alarm_sql,create_sql};

//DBからデータを取得してHighChartで使用可能なデータに成形する
pub fn get_graphdata_from_db(window:&Window,db_path:&str,graph_condition:GraphCondition)->Result<HashMap<String,Vec<PlotData>>,Box<dyn Error>>{
    //DBに接続
    let conn=Connection::open(db_path);

    //接続に成功すればdbにConnectionを格納する
    let db=match conn{
        Ok(db)=>db,
        Err(e)=>return Err(Box::new(e)),
    };

    report_progress(&window, "connect to db ", 10, "DBと接続完了"); //フロントエンドに報告

    //sql分を生成
    let sql=create_sql(&graph_condition);
    let mut stmt=db.prepare(&sql)?;

    report_progress(&window, "get data from db ", 30, "DBからデータ取得中"); //フロントエンドに報告

    // --- 件数を先に取得 ---
    let count_sql = format!(
        "SELECT COUNT(*) FROM ({}) AS subquery",
        sql
    );
    let total_count: i64 = db.query_row(&count_sql, [], |row| row.get(0))?;
    report_progress(&window, "count records", 25, &format!("総件数: {} 件", total_count));

    //ここにHighChartsで表示用のデータを全て入れる
    let mut data_map:HashMap<String,Vec<PlotData>>=HashMap::new();

    match graph_condition.plot_unit.as_str() {
        "None" => match graph_condition.graph_type.as_str() {
            "ScatterPlot" => plot_scatterplot_without_unit(window, total_count, &mut data_map, &mut stmt)?,
            "LinePlot" => plot_lineplot_without_unit(window, total_count, &mut data_map, &mut stmt, &graph_condition)?,
            _ => {},
        },
        _ => match graph_condition.graph_type.as_str() {
            "ScatterPlot" => plot_scatterplot_with_unit(window, total_count, &mut data_map, &mut stmt)?,
            _ => {}, 
        },
    };

    //アラームのプロットを重ねる場合の処理を入れる
    if !graph_condition.alarm.codes.is_empty(){
        report_progress(&window, "start get alarm plot data", 70, &format!("アラームデータの取得開始"));

        //sql分を生成
        let sql=create_alarm_sql(&graph_condition);
        let mut stmt=db.prepare(&sql)?;
        report_progress(&window, "get data from db ", 75, "DBからデータ取得中"); //フロントエンドに報告

        // --- 件数を先に取得 ---
        let count_sql = format!(
            "SELECT COUNT(*) FROM ({}) AS subquery",
            sql
        );
        let total_count: i64 = db.query_row(&count_sql, [], |row| row.get(0))?;
        report_progress(&window, "count records", 78, &format!("総件数: {} 件", total_count));

        //アラーム分のデータをdata_mapに追加する
        match graph_condition.plot_unit.as_str() {
            "None" => match graph_condition.graph_type.as_str() { //ユニット毎にデータをまとめない
                "ScatterPlot" => plot_scatterplot_without_unit_only_alarm_data(window, total_count, &mut data_map, &mut stmt)?,
                _ => {},
            },
            _ => match graph_condition.graph_type.as_str() { //ユニット毎にデータをまとめる
                _ => {}, 
        },
    };

    }

    report_progress(&window, "completed", 90, "グラフの描画を実施"); //フロントエンドに報告

    //SQL文を定義
    Ok(data_map)

}
