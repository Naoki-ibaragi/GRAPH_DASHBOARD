use rusqlite::{Connection, Result};
use std::error::Error;
use tauri::{Emitter,Window};
use serde::Deserialize;

#[derive(Debug,Deserialize)]
pub struct GraphCondition{ //グラフ描画に必要な情報を全て入れる構造体
    graph_type:String,          //グラフ種類
    graph_x_item:String,        //x軸の項目
    graph_y_item:String,        //y軸の項目
    start_date:String,          //データ取得開始日
    end_date:String,            //データ取得終了日
    plot_unit:String,           //plotの分割設定
    filters:Vec<Filter>,        //filter一覧
    filter_conjunction:String   //filterの接続方法AND or OR
}

#[derive(Debug,Deserialize)]
pub struct Filter{ //各フィルターの内容を入れる構造体
    item:String,
    value:String,
    comparison:String
}

impl Filter{
    fn new(item:String,value:String,comparison:String)->Self{
        Filter{item:item,value:value,comparison:comparison}
    }
}

// 進捗報告用のイベントペイロード
#[derive(Clone, serde::Serialize)]
struct ProgressPayload {
    step: String,
    progress: u32,
    message: String,
}

fn report_progress(window:&Window,step:&str,progress:u32,message:&str){
    let _ = window.emit("graph_data-progress", ProgressPayload {
        step: step.to_string(),
        progress: progress,
        message: message.to_string(),
    });
}

// グラフ条件から適切なSQL文を作成
pub fn create_sql(graph_condition: &GraphCondition) -> String {
    let mut sql = String::from("SELECT ");

    // X, Yデータ取得
    if graph_condition.graph_type == "LinePlot" || graph_condition.graph_type=="ScatterPlot" {
        sql += &format!(
            "{}, {} FROM chipdata WHERE LD_TRAY_TIME > '{}' AND LD_TRAY_TIME < '{}'",
            graph_condition.graph_x_item,
            graph_condition.graph_y_item,
            graph_condition.start_date,
            graph_condition.end_date
        );
    }

    // フィルター情報追加
    if !graph_condition.filters.is_empty() {
        sql += " AND ";
        for (index, filter) in graph_condition.filters.iter().enumerate() {
            let item = &filter.item;
            let value = &filter.value;
            let comparison = &filter.comparison;

            sql += &format!("{} {} '{}'", item, comparison, value);

            if index + 1 < graph_condition.filters.len() {
                sql += &format!(" {}", graph_condition.filter_conjunction);
            }
        }
    }

    println!("{}",sql);

    sql
}

//DBからデータを取得してHighChartで使用可能なデータに成形する
pub fn get_graphdata_from_db(window:&Window,db_path:&str,graph_condition:GraphCondition)->Result<Vec<Vec<i32>>,Box<dyn Error>>{
    //DBに接続
    let conn=Connection::open(db_path);

    //接続に成功すればdbにConnectionを格納する
    let db=match conn{
        Ok(db)=>db,
        Err(e)=>return Err(Box::new(e)),
    };

    report_progress(&window, "connect to db ", 10, "DBと接続完了"); //フロントエンドに報告

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

    let mut rows = Vec::new();

    let query_rows: Vec<Vec<i32>> = stmt.query_map([], |row| {
        let x_value: String = row.get(0)?;
        let y_value: String = row.get(1)?;
        Ok((x_value, y_value))
    })?
    .filter_map(|r| {
        let (x_val, y_val) = r.ok()?;
        let x = x_val.parse::<i32>().ok()?;
        let y = y_val.parse::<i32>().ok()?;
        Some(vec![x, y])
    })
    .collect();

    // 最初に全ての行をカウント（オプション：パフォーマンスが心配な場合は別途COUNT(*)で取得）
    // 以下のコードでは処理しながら報告していく方式を使用
    for (index,record) in query_rows.into_iter().enumerate(){
        rows.push(record);

        // 1000行ごとに進捗を報告
        if (index+1) % 1000 == 0 {
            report_progress(
                &window,
                "processing",
                40,
                &format!("{}/{} 処理完了", index+1,total_count)
            );
        }
    }

    report_progress(&window, "completed", 90, "グラフの描画を実施"); //フロントエンドに報告

    //SQL文を定義
    Ok(rows)

}
