use rusqlite::{Connection, Result};
use std::error::Error;

#[derive(Debug)]
struct Condition{ //グラフ描画に必要な情報を全て入れる構造体
    graph_type:String,          //グラフ種類
    graph_x_item:String,        //x軸の項目
    graph_y_item:String,        //y軸の項目
    start_date:String,          //データ取得開始日
    end_date:String,            //データ取得終了日
    filters:Vec<Filter>,        //filter一覧
    filter_conjunction:String   //filterの接続方法AND or OR
}

#[derive(Debug)]
struct Filter{ //各フィルターの内容を入れる構造体
    item:String,
    value:String,
    comparison:String

}

impl Filter{
    fn new(item:String,value:String,comparison:String)->Self{
        Filter{item:item,value:value,comparison:comparison}
    }
}

// グラフ条件から適切なSQL文を作成
fn create_sql(graph_condition: &Condition) -> String {
    let mut sql = String::from("SELECT ");

    // X, Yデータ取得
    if graph_condition.graph_type == "LINE_PLOT" {
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

    sql
}

//DBからデータを取得してHighChartで使用可能なデータに成形する
fn get_graphdata_from_db(db_path:&str,graph_condition:Condition)->Result<Vec<Vec<String>>,Box<dyn Error>>{
    //DBに接続
    let conn=Connection::open(db_path);

    //接続に成功すればdbにConnectionを格納する
    let db=match conn{
        Ok(db)=>db,
        Err(e)=>panic!("")
    };

    let sql=create_sql(&graph_condition);
    let mut stmt=db.prepare(&sql)?;

    let rows=stmt.query_map([],|row|{
        let x_value:String=row.get(0)?;
        let y_value:String=row.get(1)?;
        Ok(vec![x_value,y_value])
    })?;

    let data_vec: Vec<Vec<String>> = rows.filter_map(Result::ok).collect();
    //SQL文を定義
    Ok(data_vec)

}


fn main() -> Result<(),Box<dyn Error>> {

    let path_to_db = "C:\\workspace\\ULD_analysis\\chiptest.db";
    let graph_condition:Condition=Condition { 
        graph_type: "LINE_PLOT".to_string(), 
        graph_x_item: "AC1_TEST_ALIGN_X".to_string(), 
        graph_y_item: "AC1_TEST_ALIGN_Y".to_string(), 
        start_date: "2025-07-02 00:00:00".to_string(), 
        end_date: "2025-07-31 00:00:00".to_string(), 
        filters:vec![],
        filter_conjunction: "AND".to_string()
    };

    let res=get_graphdata_from_db(path_to_db, graph_condition)?;
    println!("{:?}",res);
    Ok(())

}