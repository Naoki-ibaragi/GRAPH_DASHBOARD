use rusqlite::{Connection, Result,params};
use std::error::Error;
use std::fs::File;
use std::io::{BufRead,BufReader};
use tauri::{command,Emitter,Window};

// 進捗報告用のイベントペイロード
#[derive(Clone, serde::Serialize)]
struct ProgressPayload {
    step: String,
    progress: u32,
    message: String,
}

fn report_progress(window:&Window,step:&str,progress:u32,message:&str){
    let _ = window.emit("regist_data-progress", ProgressPayload {
        step: step.to_string(),
        progress: progress,
        message: message.to_string(),
    });
}

//各データの構造体を定義したenum
enum UnitData{
    Arm1(Arm1Info),
    Arm2(Arm2Info),
    Test(TestInfo),
    IP(IPTestInfo),
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

//外観検査ステージ関係の状態を入れる構造体
struct IPTestInfo{
    PF:String,
    LotName:String,
    Serial:String,
    StageCount:String,
}

impl IPTestInfo{ //コンストラクタのみ定義
    fn new(
        pf:&str,
        lot_name:&str,
        serial:&str,
        stage_count:&str,
    )->Self{
        IPTestInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            StageCount: stage_count.to_string(), 
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

pub fn read_textdata(window:&Window,txt_path:&str,db_path:&str,type_name:&str)->Result<(),Box<dyn Error>>{
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
	CONSTRAINT uix_lot_serial UNIQUE(LOT_NAME,SERIAL))",
    [],
    ){
        Ok(v)=>{},
        Err(e)=>println!("{}",e)
    }

    //フロントエンドに報告
    report_progress(
        &window,
        "complete connect to db",
        10,
        &format!("DBへの接続が完了")
    );

    // ファイルを開く
    let file=File::open(txt_path)?;
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

    //フロントエンドに報告
    report_progress(
        &window,
        "complete read txt data",
        20,
        &format!("テキストデータの読み込みが完了")
    );

    let mut now_time=String::new();
    let unit_vec=vec![
        String::from("U1"),
        String::from("U2"),
        String::from("U3"),
        String::from("U4"),
        String::from("U5"),
        String::from("U6"),
        String::from("U7")];

    for (i,item) in v.iter().enumerate(){
        match item.as_str(){
            "TIME"=>now_time=v[i+1].clone(), //現在時刻の更新
            "U1"=> //ld
            match v[i+1].as_str(){
                "PH"=>add_lddata_to_db(&conn,"LD",type_name,now_time.as_str(),UnitData::LD(LDInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9]))),
                "A1"=>add_arm1data_to_db(&conn,"LD",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "AL"=>{
                    let alarm_code=v[i+2].clone();
                    let lot_name=v[i+3].clone();
                    let mut c=1;
                    let mut serial=String::from("0");
                    loop{
                        if unit_vec.contains(&v[i+3+c]){break;}
                        if v[i+3+c] != "0".to_string(){serial=v[i+3+c].clone(); break;}
                        if i+3+c >= (v.len()-1){break;} 
                        c+=1;
                    }
                    if serial!="0" {
                        add_alarmdata_to_db(&conn,"LD",&lot_name,type_name,&alarm_code,&serial);
                    }
                },
                _=>{}
            }
            "U2"=> //dc1
            match v[i+1].as_str(){
                "PH"=>add_preheatdata_to_db(&conn,"DC1",type_name,now_time.as_str(),UnitData::PreHeat(PreHeatInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7]))),
                "A1"=>add_arm1data_to_db(&conn,"DC1",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_tsdata_to_db(&conn,"DC1",type_name,now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                "A2"=>add_arm2data_to_db(&conn,"DC1",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "AL"=>{
                    let alarm_code=v[i+2].clone();
                    let lot_name=v[i+3].clone();
                    let mut c=1;
                    let mut serial=String::from("0");
                    loop{
                        if unit_vec.contains(&v[i+3+c]){break;}
                        if v[i+3+c] != "0".to_string(){serial=v[i+3+c].clone(); break;}
                        if i+3+c >= (v.len()-1){break;} 
                        c+=1;
                    }
                    if serial!="0" {
                        add_alarmdata_to_db(&conn,"DC1",&lot_name,type_name,&alarm_code,&serial);
                    }
                },
                _=>{}
            }
            "U3"=> //ac1
            match v[i+1].as_str(){
                "A1"=>add_arm1data_to_db(&conn,"AC1",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_tsdata_to_db(&conn,"AC1",type_name,now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                "A2"=>add_arm2data_to_db(&conn,"AC1",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "AL"=>{
                    let alarm_code=v[i+2].clone();
                    let lot_name=v[i+3].clone();
                    let mut c=1;
                    let mut serial=String::from("0");
                    loop{
                        if unit_vec.contains(&v[i+3+c]){break;}
                        if v[i+3+c] != "0".to_string(){serial=v[i+3+c].clone(); break;}
                        if i+3+c >= (v.len()-1){break;} 
                        c+=1;
                    }
                    if serial!="0" {
                        add_alarmdata_to_db(&conn,"AC1",&lot_name,type_name,&alarm_code,&serial);
                    }
                },
                _=>{}
            }
            "U4"=> //ac2
            match v[i+1].as_str(){
                "A1"=>add_arm1data_to_db(&conn,"AC2",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_tsdata_to_db(&conn,"AC2",type_name,now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                "A2"=>add_arm2data_to_db(&conn,"AC2",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "AL"=>{
                    let alarm_code=v[i+2].clone();
                    let lot_name=v[i+3].clone();
                    let mut c=1;
                    let mut serial=String::from("0");
                    loop{
                        if unit_vec.contains(&v[i+3+c]){break;}
                        if v[i+3+c] != "0".to_string(){serial=v[i+3+c].clone(); break;}
                        if i+3+c >= (v.len()-1){break;} 
                        c+=1;
                    }
                    if serial!="0" {
                        add_alarmdata_to_db(&conn,"AC2",&lot_name,type_name,&alarm_code,&serial);
                    }
                },
                _=>{}
            }
            "U5"=> //dc2
            match v[i+1].as_str(){
                "A1"=>add_arm1data_to_db(&conn,"DC2",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_tsdata_to_db(&conn,"DC2",type_name,now_time.as_str(),UnitData::Test(TestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9],&v[i+10],&v[i+11],&v[i+12],&v[i+13],&v[i+14],&v[i+15]))),
                "A2"=>add_arm2data_to_db(&conn,"DC2",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "AL"=>{
                    let alarm_code=v[i+2].clone();
                    let lot_name=v[i+3].clone();
                    let mut c=1;
                    let mut serial=String::from("0");
                    loop{
                        if unit_vec.contains(&v[i+3+c]){break;}
                        if v[i+3+c] != "0".to_string(){serial=v[i+3+c].clone(); break;}
                        if i+3+c >= (v.len()-1){break;} 
                        c+=1;
                    }
                    if serial!="0" {
                        add_alarmdata_to_db(&conn,"DC2",&lot_name,type_name,&alarm_code,&serial);
                    }
                },
                _=>{}
            }
            "U6"=> //ip
            match v[i+1].as_str(){
                "A1"=>add_arm1data_to_db(&conn,"IP",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "A2"=>add_arm2data_to_db(&conn,"IP",type_name,now_time.as_str(),UnitData::Arm2(Arm2Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "TS"=>add_ipdata_to_db(&conn,"IP",type_name,now_time.as_str(),UnitData::IP(IPTestInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "AL"=>{
                    let alarm_code=v[i+2].clone();
                    let lot_name=v[i+3].clone();
                    let mut c=1;
                    let mut serial=String::from("0");
                    loop{
                        if unit_vec.contains(&v[i+3+c]){break;}
                        if v[i+3+c] != "0".to_string(){serial=v[i+3+c].clone(); break;}
                        if i+3+c >= (v.len()-1){break;} 
                        c+=1;
                    }
                    if serial!="0" {
                        add_alarmdata_to_db(&conn,"IP",&lot_name,type_name,&alarm_code,&serial);
                    }

                }
                _=>{}
            }
            "U7"=> //uld
            match v[i+1].as_str(){
                "PH"=>add_preheatdata_to_db(&conn,"ULD",type_name,now_time.as_str(),UnitData::PreHeat(PreHeatInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7]))),
                "A1"=>add_arm1data_to_db(&conn,"ULD",type_name,now_time.as_str(),UnitData::Arm1(Arm1Info::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5]))),
                "PI"=>add_pocketinspdata_to_db(&conn,"ULD",type_name,now_time.as_str(),UnitData::PocketInsp(PocketInspInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8]))),
                "CI"=>add_uld_chipinspdata_to_db(&conn,"ULD",type_name,now_time.as_str(),UnitData::ChipInsp(ChipInspInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8]))),
                "AL"=>{
                    let alarm_code=v[i+2].clone();
                    let lot_name=v[i+3].clone();
                    let mut c=1;
                    let mut serial=String::from("0");
                    loop{
                        if unit_vec.contains(&v[i+3+c]){break;}
                        if v[i+3+c] != "0".to_string(){serial=v[i+3+c].clone(); break;}
                        if i+3+c >= (v.len()-1){break;} 
                        c+=1;
                    }
                    if serial!="0" {
                        add_alarmdata_to_db(&conn,"ULD",&lot_name,type_name,&alarm_code,&serial);
                    }

                }
                _=>{}
            }
            _=>{}
        }

        if (i+1)%5000==0{
            //フロントエンドに報告
            let progress:f32=((i+1) as f32/v.len() as f32)*100.0;
            report_progress(
                &window,
                "complete read txt data",
                progress as u32,
                &format!("DBにデータを登録中:{}/{}件完了",i+1,v.len())
            );
        }
    }

    println!("すべての処理が完了");
    Ok(())
}

//アラームデータをDBに登録する
fn add_alarmdata_to_db(conn:&Connection,unit:&str,lot_name:&str,type_name:&str,alarm_code:&str,serial:&str){

    let column1=format!("{}_ALARM",unit);

    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, {c1})
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(lot_name, serial)
         DO UPDATE SET 
         type_name=excluded.type_name,
         {c1}=excluded.{c1};",
         c1=column1,
    );
    //DBに登録
    match conn.execute(
        &sql, 
        params![
        lot_name, 
        serial, 
        type_name, 
        alarm_code,
        ]
    ) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }

}

//ULDポケット挿入後外観のデータをDBに登録する
fn add_uld_chipinspdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
    // データ取り出し
    let mut lot_name = String::new();
    let mut serial = String::new();
    let mut chip_align_x = String::new();
    let mut chip_align_y = String::new();

    if let UnitData::ChipInsp(ref chip_info) = unit_struct {
        lot_name = chip_info.LotName.clone();
        serial = chip_info.Serial.clone();
        chip_align_x=chip_info.AlignX.clone();
        chip_align_y=chip_info.AlignY.clone();
    }

    //現在のalign_numを取得
    let result: Result<Option<i32>, rusqlite::Error> = conn.query_row(
        "SELECT ULD_TRAY_CHIP_ALIGN_NUM FROM chipdata WHERE lot_name = ?1 AND serial = ?2",
        params![lot_name, serial],
        |row| row.get(0),
    );

    let mut align_num:i32=match result {
        Ok(Some(value)) => value,
        _ => 0,
    };

    align_num=align_num+1; //+1した値を新たに登録

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, 
        uld_tray_chip_time,uld_tray_chip_align_x,uld_tray_chip_align_y,uld_tray_chip_align_num)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(lot_name, serial)
         DO UPDATE SET 
         type_name=excluded.type_name,
         uld_tray_chip_time = excluded.uld_tray_chip_time, 
         uld_tray_chip_align_x = excluded.uld_tray_chip_align_x, 
         uld_tray_chip_align_y = excluded.uld_tray_chip_align_y,
         uld_tray_chip_align_num = excluded.uld_tray_chip_align_num;", 
    );

    //DBに登録
    match conn.execute(
        &sql, 
        params![
        lot_name, 
        serial, 
        type_name, 
        time, 
        chip_align_x,
        chip_align_y,
        align_num.to_string(),
        ]
    ) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }
}

//ULDポケット外観のデータをDBに登録する
fn add_pocketinspdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
    // データ取り出し
    let mut pf = String::new();
    let mut lot_name = String::new();
    let mut serial = String::new();
    let mut pocket_x = String::new();
    let mut pocket_y = String::new();
    let mut pocket_align_x = String::new();
    let mut pocket_align_y = String::new();

    if let UnitData::PocketInsp(ref pocketinsp_info) = unit_struct {
        pf = pocketinsp_info.PF.clone();
        lot_name = pocketinsp_info.LotName.clone();
        serial = pocketinsp_info.Serial.clone();
        pocket_x=pocketinsp_info.PocketX.clone();
        pocket_y=pocketinsp_info.PocketY.clone();
        pocket_align_x=pocketinsp_info.AlignX.clone();
        pocket_align_y=pocketinsp_info.AlignY.clone();
    }

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, 
        uld_tray_pocket_time, uld_tray_pocket_pf, uld_tray_pocket_x,uld_tray_pocket_y,uld_tray_pocket_align_x,uld_tray_pocket_align_y)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6,?7,?8,?9)
        ON CONFLICT(lot_name, serial)
         DO UPDATE SET 
         type_name=excluded.type_name,
         uld_tray_pocket_time = excluded.uld_tray_pocket_time, 
         uld_tray_pocket_pf = excluded.uld_tray_pocket_pf, 
         uld_tray_pocket_x = excluded.uld_tray_pocket_x, 
         uld_tray_pocket_y = excluded.uld_tray_pocket_y, 
         uld_tray_pocket_align_x = excluded.uld_tray_pocket_align_x, 
         uld_tray_pocket_align_y = excluded.uld_tray_pocket_align_y;",
    );

    //DBに登録
    match conn.execute(
        &sql, 
        params![
        lot_name, 
        serial, 
        type_name, 
        time, 
        pf,
        pocket_x,
        pocket_y,
        pocket_align_x,
        pocket_align_y,
        ]
    ) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }
}

//予熱テーブル関係のデータをDBに登録する
fn add_preheatdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
    // データ取り出し
    let mut pf = String::new();
    let mut lot_name = String::new();
    let mut serial = String::new();
    let mut pre_align_x = String::new();
    let mut pre_align_y = String::new();
    let mut pre_align_t = String::new();

    if let UnitData::PreHeat(ref preheat_info) = unit_struct {
        pf = preheat_info.PF.clone();
        lot_name = preheat_info.LotName.clone();
        serial = preheat_info.Serial.clone();
        pre_align_x=preheat_info.AlignX.clone();
        pre_align_y=preheat_info.AlignY.clone();
        pre_align_t=preheat_info.AlignT.clone();
    }

    // カラム名を動的に生成
    let column1 = format!("{}_PRE_TIME", unit);
    let column2 = format!("{}_PRE_PF", unit);
    let column3 = format!("{}_PRE_ALIGN_X", unit);
    let column4 = format!("{}_PRE_ALIGN_Y", unit);
    let column5 = format!("{}_PRE_ALIGN_T", unit);

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, {c1}, {c2}, {c3},{c4},{c5})
        VALUES (?1, ?2, ?3, ?4, ?5, ?6,?7,?8)
        ON CONFLICT(lot_name, serial)
         DO UPDATE SET 
         type_name=excluded.type_name,
         type_name = excluded.type_name, 
         {c1} = excluded.{c1}, 
         {c2} = excluded.{c2},
         {c3} = excluded.{c3},
         {c4} = excluded.{c4},
         {c5} = excluded.{c5};",
         c1 = column1, 
         c2 = column2, 
         c3 = column3, 
         c4 = column4, 
         c5 = column5, 
    );

    //DBに登録
    match conn.execute(
        &sql, 
        params![
        lot_name, 
        serial, 
        type_name, 
        time, 
        pf,
        pre_align_x,
        pre_align_y,
        pre_align_t,
        ]
    ) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }
}

//測定ステージ周りのデータをDBに登録する(外観は別)
fn add_ipdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
    // データ取り出し
    let mut pf = String::new();
    let mut lot_name = String::new();
    let mut serial = String::new();
    let mut stage_count = String::new();

    if let UnitData::IP(ref ip_info) = unit_struct {
        pf = ip_info.PF.clone();
        lot_name = ip_info.LotName.clone();
        serial = ip_info.Serial.clone();
        stage_count=ip_info.StageCount.clone();
    }

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name,ip_test_time,ip_test_pf,ip_test_stage_count) 
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(lot_name, serial)
         DO UPDATE SET 
         type_name=excluded.type_name,
         type_name = excluded.type_name, 
         ip_test_time = excluded.ip_test_time, 
         ip_test_pf = excluded.ip_test_pf,
         ip_test_stage_count = excluded.ip_test_stage_count;",
    );

    //DBに登録
    match conn.execute(
        &sql, 
        params![
        lot_name, 
        serial, 
        type_name, 
        time, 
        pf,
        stage_count,
        ]
    ) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }
}


//測定ステージ周りのデータをDBに登録する(外観は別)
fn add_tsdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
    // データ取り出し
    let mut pf = String::new();
    let mut lot_name = String::new();
    let mut serial = String::new();
    let mut stage_serial = String::new();
    let mut stage_count = String::new();
    let mut probe_serial = String::new();
    let mut probe_count = String::new();
    let mut probe_align1_x = String::new();
    let mut probe_align1_y = String::new();
    let mut probe_align2_x = String::new();
    let mut probe_align2_y = String::new();
    let mut chip_align_x = String::new();
    let mut chip_align_y = String::new();
    let mut chip_align_t = String::new();

    if let UnitData::Test(ref test_info) = unit_struct {
        pf = test_info.PF.clone();
        lot_name = test_info.LotName.clone();
        serial = test_info.Serial.clone();
        stage_serial=test_info.StageSerial.clone();
        stage_count=test_info.StageCount.clone();
        probe_serial=test_info.ProbeSerial.clone();
        probe_count=test_info.ProbeCount.clone();
        probe_align1_x=test_info.ProbeAlign1X.clone();
        probe_align1_y=test_info.ProbeAlign1Y.clone();
        probe_align2_x=test_info.ProbeAlign2X.clone();
        probe_align2_y=test_info.ProbeAlign2Y.clone();
        chip_align_x=test_info.ChipAlignX.clone();
        chip_align_y=test_info.ChipAlignY.clone();
        chip_align_t=test_info.ChipAlignT.clone();
    }

    // カラム名を動的に生成
    let column1 = format!("{}_TEST_TIME", unit);
    let column2 = format!("{}_TEST_PF", unit);
    let column3 = format!("{}_TEST_STAGE_SERIAL", unit);
    let column4 = format!("{}_TEST_STAGE_COUNT", unit);
    let column5 = format!("{}_TEST_PROBE_SERIAL", unit);
    let column6 = format!("{}_TEST_PROBE_COUNT", unit);
    let column7 = format!("{}_TEST_PROBE_1_X", unit);
    let column8 = format!("{}_TEST_PROBE_1_Y", unit);
    let column9 = format!("{}_TEST_PROBE_2_X", unit);
    let column10 = format!("{}_TEST_PROBE_2_Y", unit);
    let column11 = format!("{}_TEST_ALIGN_X", unit);
    let column12 = format!("{}_TEST_ALIGN_Y", unit);
    let column13 = format!("{}_TEST_ALIGN_T", unit);

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, 
        {c1}, {c2}, {c3},{c4},{c5},{c6},{c7},{c8},{c9},{c10},{c11},{c12},{c13})
        VALUES (?1, ?2, ?3, ?4, ?5, ?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16)
        ON CONFLICT(lot_name, serial)
         DO UPDATE SET 
         type_name=excluded.type_name,
         {c1} = excluded.{c1}, 
         {c2} = excluded.{c2}, 
         {c3} = excluded.{c3},
         {c4} = excluded.{c4},
         {c5} = excluded.{c5},
         {c6} = excluded.{c6},
         {c7} = excluded.{c7},
         {c8} = excluded.{c8},
         {c9} = excluded.{c9},
         {c10} = excluded.{c10},
         {c11} = excluded.{c11},
         {c12} = excluded.{c12},
         {c13} = excluded.{c13};", 
         c1 = column1, 
         c2 = column2, 
         c3 = column3, 
         c4 = column4, 
         c5 = column5, 
         c6 = column6, 
         c7 = column7, 
         c8 = column8, 
         c9 = column9, 
         c10 = column10, 
         c11 = column11, 
         c12 = column12, 
         c13 = column13, 
    );

    //DBに登録
    match conn.execute(
        &sql, 
        params![
        lot_name, 
        serial, 
        type_name, 
        time, 
        pf,
        stage_serial,
        stage_count,
        probe_serial,
        probe_count,
        probe_align1_x,
        probe_align1_y,
        probe_align2_x,
        probe_align2_y,
        chip_align_x,
        chip_align_y,
        chip_align_t,
        ]
    ) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }
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

    //架空のY=19が存在することがあるので登録しないようにする
    if pocket_y==String::from("19"){
        return;
    }

    // SQL文字列をformat!で構築
    let sql = format!(
        "INSERT INTO chipdata (lot_name, serial, type_name, ld_tray_time, ld_tray_pf, ld_tray_pos,ld_tray_pocket_x,ld_tray_pocket_y,ld_tray_align_x,ld_tray_align_y)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        ON CONFLICT(lot_name, serial)
        DO UPDATE SET 
        {c1} = excluded.{c1}, 
        {c2} = excluded.{c2}, 
        {c3} = excluded.{c3}, 
        {c4} = excluded.{c4}, 
        {c5} = excluded.{c5},
        {c6} = excluded.{c6}, 
        {c7} = excluded.{c7}, 
        {c8} = excluded.{c8};", 
         c1 = "type_name", 
         c2 = "ld_tray_time", 
         c3 = "ld_tray_pf",
         c4 = "ld_tray_pos",
         c5 = "ld_tray_pocket_x",
         c6 = "ld_tray_pocket_y",
         c7 = "ld_tray_align_x",
         c8 = "ld_tray_align_y",
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
        "INSERT INTO chipdata (lot_name, serial, {c1}, {c2}, {c3}, {c4})
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(lot_name, serial)
         DO UPDATE SET 
         {c1} = excluded.{c1}, 
         {c2} = excluded.{c2}, 
         {c3} = excluded.{c3},
         {c4} = excluded.{c4};", 
         c1 = "type_name", 
         c2 = column1, 
         c3 = column2, 
         c4 = column3
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
        "INSERT INTO chipdata (lot_name, serial, {c1}, {c2}, {c3}, {c4})
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(lot_name, serial)
         DO UPDATE SET 
        {c1} = excluded.{c1}, 
        {c2} = excluded.{c2}, 
        {c3} = excluded.{c3},
        {c4} = excluded.{c4};", 
         c1 = "type_name", 
         c2 = column1, 
         c3 = column2, 
         c4 = column3
    );

    match conn.execute(&sql, params![lot_name, serial, type_name, time, pf, count]) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }

}

