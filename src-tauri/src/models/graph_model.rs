use serde::{Deserialize,Serialize};

/*グラフ作成条件*/
#[derive(Debug,Deserialize)]
pub struct GraphCondition{ //グラフ描画に必要な情報を全て入れる構造体
    pub graph_type:String,          //グラフ種類
    pub graph_x_item:String,        //x軸の項目
    pub graph_y_item:String,        //y軸の項目
    pub start_date:String,          //データ取得開始日
    pub end_date:String,            //データ取得終了日
    pub plot_unit:String,           //plotの分割設定
    pub alarm:AlarmInfo,            //alarm関係の情報
    pub filters:Vec<Filter>,        //filter一覧
    pub filter_conjunction:String   //filterの接続方法AND or OR
}

#[derive(Debug,Deserialize)]
pub struct Filter{ //各フィルターの内容を入れる構造体
    item:String,
    value:String,
    comparison:String
}

#[derive(Debug,Deserialize)]
pub struct AlarmInfo{ //アラームプロットを重ねる場合：アラームの内容を入れる構造体
    unit:String,
    codes:Vec<String>,
}

/* ------------------------------------------- */

/*プロットデータ型の定義 */
//x,yともに数値型の場合のプロットデータ
#[derive(Debug,Serialize)]
pub struct NumberData{
    x:i32,
    y:i32,
}

impl NumberData{
    pub fn new(x:i32,y:i32)->Self{
        NumberData{x:x,y:y}
    }
}

//xが日付の場合のプロットデータ
#[derive(Debug,Serialize)]
pub struct CalenderData{
    x:String,
    y:i32,
}

impl CalenderData{
    pub fn new(x:String,y:i32)->Self{
        CalenderData{x:x,y:y}
    }
}

//各プロット型をまとめた列挙型
#[derive(Debug,Serialize)]
#[serde(untagged)] // JSON出力時に型名を省略
pub enum PlotData {
    Number(NumberData),
    Calendar(CalenderData),
}

//plot分割する場合のunit付データ
#[derive(Debug,Serialize)]
pub struct TmpData{
    unit:String,
    data:PlotData,
}

impl TmpData{
    pub fn new(unit:String,data:PlotData)->Self{
        TmpData{unit:unit,data}
    }
}
