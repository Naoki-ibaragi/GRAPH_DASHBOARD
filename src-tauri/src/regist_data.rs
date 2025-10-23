use rusqlite::{Connection, Result};
use std::collections::HashMap;
use std::collections::BTreeMap;
use std::error::Error;
use std::thread;
use std::env;
use std::fs::File;
use std::io::{self,BufRead,BufReader};
use std::string;


//各データの構造体を定義したenum
enum UnitData{
    Arm(ArmInfo),
    Test(TestInfo),
    LD(LDInfo),
    PreHeat(PreHeatInfo),
    PocketInsp(PocketInspInfo),
    ChipInsp(ChipInspInfo),
}

//アームの状態を入れる構造体
struct ArmInfo{
    ArmNumber:String,
    PF:String,
    LotName:String,
    Serial:String,
    Count:String
}

impl ArmInfo{
    fn new(arm_number:&str,pf:&str,lot_name:&str,serial:&str,count:&str)->Self{
        ArmInfo { ArmNumber: arm_number.to_string(), PF: pf.to_string(), LotName: lot_name.to_string(), Serial: serial.to_string(), Count: count.to_string() }
    }
}

//ステージ関係の状態を入れる構造体
struct TestInfo{
    PF:String,
    LotName:String,
    Serial:String,
    StageSerial:String,
    StageCount:String,
    ProbeSerial:String,
    ProbeCount:String,
    ProbeAlign1X:String,
    ProbeAlign1Y:String,
    ProbeAlign2X:String,
    ProbeAlign2Y:String,
    ChipAlignX:String,
    ChipAlignY:String,
    ChipAlignT:String,
}

impl TestInfo{ //コンストラクタのみ定義
    fn new(
        pf:String,
        lot_name:String,
        serial:String,
        stage_serial:String,
        stage_count:String,
        probe_serial:String,
        probe_count:String,
        probe_align_1x:String,
        probe_align_1y:String,
        probe_align_2x:String,
        probe_align_2y:String,
        chip_align_x:String,
        chip_align_y:String,
        chip_align_t:String,
    )->Self{
        TestInfo { 
            PF: pf, 
            LotName: lot_name, 
            Serial: serial, 
            StageSerial: stage_serial, 
            StageCount: stage_count, 
            ProbeSerial: probe_serial, 
            ProbeCount: probe_count, 
            ProbeAlign1X: probe_align_1x, 
            ProbeAlign1Y: probe_align_1y, 
            ProbeAlign2X: probe_align_2x, 
            ProbeAlign2Y: probe_align_2y, 
            ChipAlignX: chip_align_x, 
            ChipAlignY: chip_align_y, 
            ChipAlignT: chip_align_t,
        }
    }
}

//予熱テーブル関係の情報を入れる構造体
struct PreHeatInfo{
    PF:String,
    LotName:String,
    Serial:String,
    AlignX:String,
    AlignY:String,
    AlignT:String,
}

impl PreHeatInfo{ //コンストラクタのみ定義
    fn new(pf:String,lot_name:String,serial:String,align_x:String,align_y:String,align_t:String)->Self{
        PreHeatInfo { PF: pf, LotName: lot_name, Serial: serial, AlignX: align_x, AlignY: align_y, AlignT: align_t }
    }
}

//LDテーブル関係の情報を入れる構造体
struct LDInfo{
    PF:String,
    LotName:String,
    Serial:String,
    TrayArm:String, //oku or temae
    PocketX:String,
    PocketY:String,
    PocketAlignX:String,
    PocketAlignY:String
}

impl LDInfo{ //コンストラクタのみ定義
    fn new( 
        pf:String,
        lot_name:String,
        serial:String,
        tray_arm:String,
        pocket_x:String,
        pocket_y:String,
        pocket_align_x:String,
        pocket_align_y:String
    )->Self{
        LDInfo { PF: pf, LotName: lot_name, Serial: serial, TrayArm: tray_arm, PocketX: pocket_x, PocketY: pocket_y, PocketAlignX: pocket_align_x, PocketAlignY: pocket_align_y }
    }
}

//ULDのポケットアライメントの情報を入れる構造体
struct PocketInspInfo{
    PF:String,
    LotName:String,
    Serial:String,
    PocketX:String,
    PocketY:String,
    AlignX:String,
    AlignY:String,
}

impl PocketInspInfo{ //コンストラクタのみ定義
    fn new(pf:String,lot_name:String,serial:String,pocket_x:String,pocket_y:String,align_x:String,align_y:String)->Self
    {
        PocketInspInfo { PF: pf, LotName: lot_name, Serial: serial, PocketX: pocket_x, PocketY: pocket_y, AlignX: align_x, AlignY: align_y }
    }
}

//挿入後チップ認識の情報を入れる構造体
struct ChipInspInfo{
    PF:String,
    LotName:String,
    Serial:String,
    PocketX:String,
    PocketY:String,
    AlignX:String,
    AlignY:String,
}

impl ChipInspInfo{ //コンストラクタのみ定義
    fn new(pf:String,lot_name:String,serial:String,pocket_x:String,pocket_y:String,align_x:String,align_y:String)->Self
    {
        ChipInspInfo { PF: pf, LotName: lot_name, Serial: serial, PocketX: pocket_x, PocketY: pocket_y, AlignX: align_x, AlignY: align_y }
    }
}

fn read_textdata(txt_path:&str,db_path:&str,type_name:&str)->Result<(),Box<dyn Error>>{
    //dbに接続
    let conn=Connection::open(db_path)?;

    let mut contents=String::new();
        // ファイルを開く
    let file = File::open(txt_path)?;
    let reader = BufReader::new(file);

    // 最終的な結果を入れるVec
    let mut v: Vec<String> = Vec::new();

    // 各行を読み込み
    for line in reader.lines() {
        // 改行を除去して安全にunwrap
        let line = line?.trim().to_string();

        // 空行はスキップ
        if line.is_empty() {
            continue;
        }

        // カンマで分割してVec<String>に変換
        let mut items: Vec<String> = line
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty()) // 空文字でないものだけ残す
        .collect();

        // 結果に追加（flatten的な扱い）
        v.append(&mut items);
    }

    let mut now_time=String::new();

    for (i,item) in v.iter().enumerate(){
        match item.as_str(){
            "TIME"=>now_time=v[i+1], //現在時刻の更新
            "U1"=>
            match v[i+1].as_str(){
                "A1"=>add_to_db(&conn,"U1",now_time.as_str(),UnitData::Arm(ArmInfo::new("1",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "A2"=>add_to_db(&conn,"U1",now_time.as_str(),UnitData::Arm(ArmInfo::new("2",v[i+2],v[i+3],v[i+4],v[i+5]))),
                _=>{}
            }
            "U2"=>
            match v[i+1].as_str(){
                "PH"=>add_to_db(&conn,"U2",now_time.as_str(),UnitData::PreHeat(PreHeatInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7]))),
                "A1"=>add_to_db(&conn,"U2",now_time.as_str(),UnitData::Arm(ArmInfo::new("1",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "TS"=>add_to_db(&conn,"U2",now_time.as_str(),UnitData::Test(TestInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7],v[i+8],v[i+9],v[i+10],v[i+11],v[i+12],v[i+13],v[i+14],v[i+15]))),
                "A2"=>add_to_db(&conn,"U2",now_time.as_str(),UnitData::Arm(ArmInfo::new("2",v[i+2],v[i+3],v[i+4],v[i+5]))),
                _=>{}
            }
            "U3"=>
            match v[i+1].as_str(){
                "A1"=>add_to_db(&conn,"U3",now_time.as_str(),UnitData::Arm(ArmInfo::new("1",&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "A2"=>add_to_db(&conn,"U3",now_time.as_str(),UnitData::Arm(ArmInfo::new("2",&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_to_db(&conn,"U3",now_time.as_str(),UnitData::Test(TestInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7],v[i+8],v[i+9],v[i+10],v[i+11],v[i+12],v[i+13],v[i+14],v[i+15]))),
                _=>{}
            }
            "U4"=>
            match v[i+1].as_str(){
                "A1"=>add_to_db(&conn,"U4",now_time.as_str(),UnitData::Arm(ArmInfo::new("1",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "A2"=>add_to_db(&conn,"U4",now_time.as_str(),UnitData::Arm(ArmInfo::new("2",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "TS"=>add_to_db(&conn,"U4",now_time.as_str(),UnitData::Test(TestInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7],v[i+8],v[i+9],v[i+10],v[i+11],v[i+12],v[i+13],v[i+14],v[i+15]))),
                _=>{}
            }
            "U5"=>
            match v[i+1].as_str(){
                "A1"=>add_to_db(&conn,"U5",now_time.as_str(),UnitData::Arm(ArmInfo::new("1",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "A2"=>add_to_db(&conn,"U5",now_time.as_str(),UnitData::Arm(ArmInfo::new("2",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "TS"=>add_to_db(&conn,"U5",now_time.as_str(),UnitData::Test(TestInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7],v[i+8],v[i+9],v[i+10],v[i+11],v[i+12],v[i+13],v[i+14],v[i+15]))),
                _=>{}
            }
            "U6"=>
            match v[i+1].as_str(){
                "A1"=>add_to_db(&conn,"U6",now_time.as_str(),UnitData::Arm(ArmInfo::new("1",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "A2"=>add_to_db(&conn,"U6",now_time.as_str(),UnitData::Arm(ArmInfo::new("2",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "TS"=>add_to_db(&conn,"U6",now_time.as_str(),UnitData::Test(TestInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7],v[i+8],v[i+9],v[i+10],v[i+11],v[i+12],v[i+13],v[i+14],v[i+15]))),
                _=>{}
            }
            "U7"=>
            match v[i+1].as_str(){
                "PH"=>add_to_db(&conn,"U7",now_time.as_str(),UnitData::PreHeat(PreHeatInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7]))),
                "A1"=>add_to_db(&conn,"U7",now_time.as_str(),UnitData::Arm(ArmInfo::new("1",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "A2"=>add_to_db(&conn,"U7",now_time.as_str(),UnitData::Arm(ArmInfo::new("2",v[i+2],v[i+3],v[i+4],v[i+5]))),
                "PI"=>add_to_db(&conn,"U7",now_time.as_str(),UnitData::PocketInsp(PocketInspInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7],v[i+8]))),
                "CI"=>add_to_db(&conn,"U7",now_time.as_str(),UnitData::ChipInsp(ChipInspInfo::new(v[i+2],v[i+3],v[i+4],v[i+5],v[i+6],v[i+7],v[i+8]))),
                _=>{}
            }
            _=>{}
        }
    }

    Ok(())
}

//データをDBに登録する
fn add_to_db(conn:&Connection,unit_number:&str,time:&str,unit_struct:UnitData){


}

fn add_armdata_to_db(conn:&Connection,unit_number:&str,time:&str,unit_struct:UnitData){
    
}


fn main() -> Result<(),Box<dyn Error>> {

    let db_path = "C:\\workspace\\ULD_analysis\\chiptest.db";
    let txt_path="C:\\workspace\\test_project\\2541F0532J_PLC_4.txt";
    let type_name="MH15376";

    read_textdata(txt_path, db_path, type_name);

    Ok(())

}