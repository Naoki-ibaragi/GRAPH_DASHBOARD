use rusqlite::{Connection, Result,params};
use std::error::Error;
use std::fs::File;
use std::io::{self,BufRead,BufReader};

//各データの構造体を定義したenum
enum UnitData{
    Arm1(Arm1Info),
    Arm2(Arm2Info),
    Test(TestInfo),
    LD(LDInfo),
    PreHeat(PreHeatInfo),
    PocketInsp(PocketInspInfo),
    ChipInsp(ChipInspInfo),
}

//上流アームの状態を入れる構造体
struct Arm1Info{
    PF:String,
    LotName:String,
    Serial:String,
    Count:String
}

impl Arm1Info{
    fn new(pf:&str,lot_name:&str,serial:&str,count:&str)->Self{
        Arm1Info { PF: pf.to_string(), LotName: lot_name.to_string(), Serial: serial.to_string(), Count: count.to_string() }
    }
}

//下流アームの状態を入れる構造体
struct Arm2Info{
    PF:String,
    LotName:String,
    Serial:String,
    Count:String
}

impl Arm2Info{
    fn new(pf:&str,lot_name:&str,serial:&str,count:&str)->Self{
        Arm2Info { PF: pf.to_string(), LotName: lot_name.to_string(), Serial: serial.to_string(), Count: count.to_string() }
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
        pf:&str,
        lot_name:&str,
        serial:&str,
        stage_serial:&str,
        stage_count:&str,
        probe_serial:&str,
        probe_count:&str,
        probe_align_1x:&str,
        probe_align_1y:&str,
        probe_align_2x:&str,
        probe_align_2y:&str,
        chip_align_x:&str,
        chip_align_y:&str,
        chip_align_t:&str,
    )->Self{
        TestInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            StageSerial: stage_serial.to_string(), 
            StageCount: stage_count.to_string(), 
            ProbeSerial: probe_serial.to_string(), 
            ProbeCount: probe_count.to_string(), 
            ProbeAlign1X: probe_align_1x.to_string(), 
            ProbeAlign1Y: probe_align_1y.to_string(), 
            ProbeAlign2X: probe_align_2x.to_string(), 
            ProbeAlign2Y: probe_align_2y.to_string(), 
            ChipAlignX: chip_align_x.to_string(), 
            ChipAlignY: chip_align_y.to_string(), 
            ChipAlignT: chip_align_t.to_string(),
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
    fn new(pf:&str,lot_name:&str,serial:&str,align_x:&str,align_y:&str,align_t:&str)->Self{
        PreHeatInfo { PF: pf.to_string(), LotName: lot_name.to_string(), Serial: serial.to_string(), AlignX: align_x.to_string(), AlignY: align_y.to_string(), AlignT: align_t.to_string() }
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
        pf:&str,
        lot_name:&str,
        serial:&str,
        tray_arm:&str,
        pocket_x:&str,
        pocket_y:&str,
        pocket_align_x:&str,
        pocket_align_y:&str
    )->Self{
        LDInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            TrayArm: tray_arm.to_string(), 
            PocketX: pocket_x.to_string(), 
            PocketY: pocket_y.to_string(), 
            PocketAlignX: pocket_align_x.to_string(), 
            PocketAlignY: pocket_align_y.to_string()
        }
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
    fn new(pf:&str,lot_name:&str,serial:&str,pocket_x:&str,pocket_y:&str,align_x:&str,align_y:&str)->Self
    {
        PocketInspInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            PocketX: pocket_x.to_string(), 
            PocketY: pocket_y.to_string(), 
            AlignX: align_x.to_string(), 
            AlignY: align_y.to_string(),
        }
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
    fn new(pf:&str,lot_name:&str,serial:&str,pocket_x:&str,pocket_y:&str,align_x:&str,align_y:&str)->Self
    {
        ChipInspInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            PocketX: pocket_x.to_string(), 
            PocketY: pocket_y.to_string(), 
            AlignX: align_x.to_string(), 
            AlignY: align_y.to_string(),
        }
    }
}

fn read_textdata(txt_path:&str,db_path:&str,type_name:&str)->Result<(),Box<dyn Error>>{
    //dbに接続しなければ作成する
    let conn=Connection::open(db_path)?;
    // テーブルが存在しない場合は作成
    match conn.execute(
    "CREATE TABLE chipdata (
	ID	INTEGER PRIMARY KEY AUTOINCREMENT,
	MACHINE_NAME	VARCHAR,
	TYPE_NAME	VARCHAR,
	LOT_NAME	VARCHAR,
	SERIAL	VARCHAR,
	LD_TRAY_TIME	VARCHAR,
	LD_TRAY_PF	VARCHAR,
	LD_TRAY_POS	VARCHAR,
	LD_TRAY_POCKET_X	VARCHAR,
	LD_TRAY_POCKET_Y	VARCHAR,
	LD_TRAY_ALIGN_X	VARCHAR,
	LD_TRAY_ALIGN_Y	VARCHAR,
	LD_ARM1_TIME	VARCHAR,
	LD_ARM1_PF	VARCHAR,
	LD_ARM1_COLLET_COUNT	VARCHAR,
	LD_ALARM	VARCHAR,
	DC1_PRE_TIME	VARCHAR,
	DC1_PRE_PF	VARCHAR,
	DC1_PRE_ALIGN_X	VARCHAR,
	DC1_PRE_ALIGN_Y	VARCHAR,
	DC1_PRE_ALIGN_T	VARCHAR,
	DC1_ARM1_TIME	VARCHAR,
	DC1_ARM1_PF	VARCHAR,
	DC1_ARM1_COLLET_COUNT	VARCHAR,
	DC1_TEST_TIME	VARCHAR,
	DC1_TEST_PF	VARCHAR,
	DC1_TEST_STAGE_SERIAL	VARCHAR,
	DC1_TEST_STAGE_COUNT	VARCHAR,
	DC1_TEST_PROBE_SERIAL	VARCHAR,
	DC1_TEST_PROBE_COUNT	VARCHAR,
	DC1_TEST_PROBE_1_X	VARCHAR,
	DC1_TEST_PROBE_1_Y	VARCHAR,
	DC1_TEST_PROBE_2_X	VARCHAR,
	DC1_TEST_PROBE_2_Y	VARCHAR,
	DC1_TEST_ALIGN_X	VARCHAR,
	DC1_TEST_ALIGN_Y	VARCHAR,
	DC1_TEST_ALIGN_T	VARCHAR,
	DC1_ARM2_TIME	VARCHAR,
	DC1_ARM2_PF	VARCHAR,
	DC1_ARM2_COLLET_COUNT	VARCHAR,
	DC1_ALARM	VARCHAR,
	AC1_ARM1_TIME	VARCHAR,
	AC1_ARM1_PF	VARCHAR,
	AC1_ARM1_COLLET_COUNT	VARCHAR,
	AC1_TEST_TIME	VARCHAR,
	AC1_TEST_PF	VARCHAR,
	AC1_TEST_STAGE_SERIAL	VARCHAR,
	AC1_TEST_STAGE_COUNT	VARCHAR,
	AC1_TEST_PROBE_SERIAL	VARCHAR,
	AC1_TEST_PROBE_COUNT	VARCHAR,
	AC1_TEST_PROBE_1_X	VARCHAR,
	AC1_TEST_PROBE_1_Y	VARCHAR,
	AC1_TEST_PROBE_2_X	VARCHAR,
	AC1_TEST_PROBE_2_Y	VARCHAR,
	AC1_TEST_ALIGN_X	VARCHAR,
	AC1_TEST_ALIGN_Y	VARCHAR,
	AC1_TEST_ALIGN_T	VARCHAR,
	AC1_ARM2_TIME	VARCHAR,
	AC1_ARM2_PF	VARCHAR,
	AC1_ARM2_COLLET_COUNT	VARCHAR,
	AC1_ALARM	VARCHAR,
	AC2_ARM1_TIME	VARCHAR,
	AC2_ARM1_PF	VARCHAR,
	AC2_ARM1_COLLET_COUNT	VARCHAR,
	AC2_TEST_TIME	VARCHAR,
	AC2_TEST_PF	VARCHAR,
	AC2_TEST_STAGE_SERIAL	VARCHAR,
	AC2_TEST_STAGE_COUNT	VARCHAR,
	AC2_TEST_PROBE_SERIAL	VARCHAR,
	AC2_TEST_PROBE_COUNT	VARCHAR,
	AC2_TEST_PROBE_1_X	VARCHAR,
	AC2_TEST_PROBE_1_Y	VARCHAR,
	AC2_TEST_PROBE_2_X	VARCHAR,
	AC2_TEST_PROBE_2_Y	VARCHAR,
	AC2_TEST_ALIGN_X	VARCHAR,
	AC2_TEST_ALIGN_Y	VARCHAR,
	AC2_TEST_ALIGN_T	VARCHAR,
	AC2_ARM2_TIME	VARCHAR,
	AC2_ARM2_PF	VARCHAR,
	AC2_ARM2_COLLET_COUNT	VARCHAR,
	AC2_ALARM	VARCHAR,
	DC2_ARM1_TIME	VARCHAR,
	DC2_ARM1_PF	VARCHAR,
	DC2_ARM1_COLLET_COUNT	VARCHAR,
	DC2_TEST_TIME	VARCHAR,
	DC2_TEST_PF	VARCHAR,
	DC2_TEST_STAGE_SERIAL	VARCHAR,
	DC2_TEST_STAGE_COUNT	VARCHAR,
	DC2_TEST_PROBE_SERIAL	VARCHAR,
	DC2_TEST_PROBE_COUNT	VARCHAR,
	DC2_TEST_PROBE_1_X	VARCHAR,
	DC2_TEST_PROBE_1_Y	VARCHAR,
	DC2_TEST_PROBE_2_X	VARCHAR,
	DC2_TEST_PROBE_2_Y	VARCHAR,
	DC2_TEST_ALIGN_X	VARCHAR,
	DC2_TEST_ALIGN_Y	VARCHAR,
	DC2_TEST_ALIGN_T	VARCHAR,
	DC2_ARM2_TIME	VARCHAR,
	DC2_ARM2_PF	VARCHAR,
	DC2_ARM2_COLLET_COUNT	VARCHAR,
	DC2_ALARM	VARCHAR,
	IP_ARM1_TIME	VARCHAR,
	IP_ARM1_PF	VARCHAR,
	IP_ARM1_COLLET_COUNT	VARCHAR,
	IP_TEST_TIME	VARCHAR,
	IP_TEST_PF	VARCHAR,
	IP_TEST_STAGE_COUNT	VARCHAR,
	IP_ARM2_TIME	VARCHAR,
	IP_ARM2_PF	VARCHAR,
	IP_ARM2_COLLET_COUNT	VARCHAR,
	IP_ALARM	VARCHAR,
	ULD_PRE_TIME	VARCHAR,
	ULD_PRE_PF	VARCHAR,
	ULD_PRE_ALIGN_X	VARCHAR,
	ULD_PRE_ALIGN_Y	VARCHAR,
	ULD_PRE_ALIGN_T	VARCHAR,
	ULD_TRAY_POCKET_TIME	VARCHAR,
	ULD_TRAY_POCKET_PF	VARCHAR,
	ULD_TRAY_POCKET_X	VARCHAR,
	ULD_TRAY_POCKET_Y	VARCHAR,
	ULD_TRAY_POCKET_ALIGN_X	VARCHAR,
	ULD_TRAY_POCKET_ALIGN_Y	VARCHAR,
	ULD_ARM1_TIME	VARCHAR,
	ULD_ARM1_PF	VARCHAR,
	ULD_ARM1_COLLET_COUNT	VARCHAR,
	ULD_TRAY_CHIP_TIME	VARCHAR,
	ULD_TRAY_CHIP_ALIGN_X	VARCHAR,
	ULD_TRAY_CHIP_ALIGN_Y	VARCHAR,
	ULD_TRAY_CHIP_ALIGN_NUM	INTEGER,
	ULD_ALARM	VARCHAR,
	IP_BACK_ALIGN_X	TEXT,
	IP_BACK_ALIGN_Y	TEXT,
	IP_BACK_ALIGN_T	TEXT,
	CONSTRAINT uix_lot_serial UNIQUE(LOT_NAME,SERIAL))",
    [],
    ){
        Ok(v)=>{},
        Err(e)=>println!("{}",e)
    }
    println!("complete create db");

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
            "TIME"=>now_time=v[i+1].clone(), //現在時刻の更新
            "U1"=>
            match v[i+1].as_str(){
                "PH"=>add_lddata_to_db(&conn,"LD",type_name,now_time.as_str(),UnitData::LD(LDInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9]))),
                "A1"=>add_arm1data_to_db(&conn,"LD",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                _=>{}
            }
            "U2"=>
            match v[i+1].as_str(){
                "PH"=>add_to_db(&conn,"DC1",now_time.as_str(),UnitData::PreHeat(PreHeatInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7]))),
                "A1"=>add_arm1data_to_db(&conn,"DC1",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_to_db(&conn,"DC1",now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                "A2"=>add_arm2data_to_db(&conn,"DC1",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                _=>{}
            }
            "U3"=>
            match v[i+1].as_str(){
                "A1"=>add_arm1data_to_db(&conn,"AC1",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "A2"=>add_arm2data_to_db(&conn,"AC1",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_to_db(&conn,"AC1",now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                _=>{}
            }
            "U4"=>
            match v[i+1].as_str(){
                "A1"=>add_arm1data_to_db(&conn,"AC2",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "A2"=>add_arm2data_to_db(&conn,"AC2",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_to_db(&conn,"AC2",now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                _=>{}
            }
            "U5"=>
            match v[i+1].as_str(){
                "A1"=>add_arm1data_to_db(&conn,"DC2",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "A2"=>add_arm2data_to_db(&conn,"DC2",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_to_db(&conn,"DC2",now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                _=>{}
            }
            "U6"=>
            match v[i+1].as_str(){
                "A1"=>add_arm1data_to_db(&conn,"IP",type_name,now_time.as_str(),UnitData::Arm1g(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "A2"=>add_arm2data_to_db(&conn,"IP",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_to_db(&conn,"IP",now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                _=>{}
            }
            "U7"=>
            match v[i+1].as_str(){
                "PH"=>add_to_db(&conn,"ULD",now_time.as_str(),UnitData::PreHeat(PreHeatInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7]))),
                "A1"=>add_arm1data_to_db(&conn,"ULD",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "PI"=>add_to_db(&conn,"ULD",now_time.as_str(),UnitData::PocketInsp(PocketInspInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8]))),
                "CI"=>add_to_db(&conn,"ULD",now_time.as_str(),UnitData::ChipInsp(ChipInspInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8]))),
                _=>{}
            }
            _=>{}
        }
    }

    Ok(())
}

fn add_to_db(conn:&Connection,unit:&str,time:&str,unit_struct: UnitData){

}

//LDデータをDBに登録する
fn add_lddata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct:UnitData){
    // データ取り出し
    let mut pf = String::new();
    let mut lot_name = String::new();
    let mut serial = String::new();
    let mut tray_arm = String::new();
    let mut pocket_x = String::new();
    let mut pocket_y = String::new();
    let mut pocket_align_x = String::new();
    let mut pocket_align_y = String::new();

    if let UnitData::LD(ref ld_info) = unit_struct {
        pf = ld_info.PF.clone();
        serial = ld_info.Serial.clone();
        lot_name = ld_info.LotName.clone();
        tray_arm = ld_info.TrayArm.clone();
        pocket_x = ld_info.PocketX.clone();
        pocket_y = ld_info.PocketY.clone();
        pocket_align_x = ld_info.PocketAlignX.clone();
        pocket_align_y = ld_info.PocketAlignY.clone();
    }

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, ld_tray_time, ld_tray_pf, ld_tray_pos,ld_tray_pocket_x,ld_tray_pocket_y,ld_tray_align_x,ld_tray_align_y)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
         ON CONFLICT(lot_name, serial)
         DO NOTHING;"
    );

    match conn.execute(&sql, params![lot_name, serial, type_name, time, pf, tray_arm,pocket_x,pocket_y,pocket_align_x,pocket_align_y]) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }
}

//アーム1データをDBに登録する
fn add_arm1data_to_db(conn: &Connection,unit: &str,type_name: &str,time: &str,unit_struct: UnitData) {
    // データ取り出し
    let mut pf = String::new();
    let mut serial = String::new();
    let mut lot_name = String::new();
    let mut count = String::new();

    if let UnitData::Arm1(ref arm1_info) = unit_struct {
        pf = arm1_info.PF.clone();
        serial = arm1_info.Serial.clone();
        lot_name = arm1_info.LotName.clone();
        count = arm1_info.Count.clone();
    }

    // カラム名を動的に生成
    let column1 = format!("{}_ARM1_TIME", unit);
    let column2 = format!("{}_ARM1_PF", unit);
    let column3 = format!("{}_ARM1_COLLET_COUNT", unit);

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, {c1}, {c2}, {c3})
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(lot_name, serial)
        DO NOTHING;",
        c1 = column1,
        c2 = column2,
        c3 = column3
    );

    match conn.execute(&sql, params![lot_name, serial, type_name, time, pf, count]) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }
}

fn add_arm2data_to_db(conn: &Connection,unit: &str,type_name: &str,time: &str,unit_struct: UnitData) {

    // データ取り出し
    let mut pf = String::new();
    let mut serial = String::new();
    let mut lot_name = String::new();
    let mut count = String::new();

    if let UnitData::Arm2(ref arm1_info) = unit_struct {
        pf = arm1_info.PF.clone();
        serial = arm1_info.Serial.clone();
        lot_name = arm1_info.LotName.clone();
        count = arm1_info.Count.clone();
    }

    // カラム名を動的に生成
    let column1 = format!("{}_ARM2_TIME", unit);
    let column2 = format!("{}_ARM2_PF", unit);
    let column3 = format!("{}_ARM2_COLLET_COUNT", unit);

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, {c1}, {c2}, {c3})
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(lot_name, serial)
         DO NOTHING;",
        c1 = column1,
        c2 = column2,
        c3 = column3
    );

    match conn.execute(&sql, params![lot_name, serial, type_name, time, pf, count]) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }

}

fn main() -> Result<(),Box<dyn Error>> {
    let db_path = "./chiptest.db";
    let txt_path="C:\\workspace\\test_project\\2541F0532J_PLC_4.txt";
    let type_name="MH15376";

    match read_textdata(txt_path, db_path, type_name){
        Ok(v)=>{},
        Err(e)=>println!("{}",e)
    }

    Ok(())
}
