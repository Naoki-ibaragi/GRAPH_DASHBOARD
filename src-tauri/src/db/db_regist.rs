use rusqlite::{Connection, Result,params};

use crate::models::regist_data_model::*;

//アラームデータをDBに登録する
pub fn add_alarmdata_to_db(conn:&Connection,unit:&str,lot_name:&str,type_name:&str,alarm_code:&str,serial:&str){

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
pub fn add_uld_chipinspdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
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
pub fn add_pocketinspdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
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
pub fn add_preheatdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
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
pub fn add_ipdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
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
pub fn add_tsdata_to_db(conn:&Connection,unit:&str,type_name:&str,time:&str,unit_struct: UnitData){
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
pub fn add_lddata_to_db(conn:&Connection,machine_name:&str,type_name:&str,time:&str,unit_struct:UnitData){
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
        "INSERT INTO chipdata (lot_name, serial, type_name, ld_tray_time, ld_tray_pf, ld_tray_pos,ld_tray_pocket_x,ld_tray_pocket_y,ld_tray_align_x,ld_tray_align_y,machine_name)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
        ON CONFLICT(lot_name, serial)
        DO UPDATE SET 
        {c1} = excluded.{c1}, 
        {c2} = excluded.{c2}, 
        {c3} = excluded.{c3}, 
        {c4} = excluded.{c4}, 
        {c5} = excluded.{c5},
        {c6} = excluded.{c6}, 
        {c7} = excluded.{c7}, 
        {c8} = excluded.{c8}, 
        {c9} = excluded.{c9};", 
         c1 = "type_name", 
         c2 = "ld_tray_time", 
         c3 = "ld_tray_pf",
         c4 = "ld_tray_pos",
         c5 = "ld_tray_pocket_x",
         c6 = "ld_tray_pocket_y",
         c7 = "ld_tray_align_x",
         c8 = "ld_tray_align_y",
         c9 = "machine_name",
    );

    match conn.execute(&sql, params![lot_name, serial, type_name, time, pf, tray_arm,pocket_x,pocket_y,pocket_align_x,pocket_align_y,machine_name]) {
        Err(e) => println!("SQL Error: {}", e),
        Ok(_) => {},
    }
}

//アーム1データをDBに登録する
pub fn add_arm1data_to_db(conn: &Connection,unit: &str,type_name: &str,time: &str,unit_struct: UnitData) {
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

pub fn add_arm2data_to_db(conn: &Connection,unit: &str,type_name: &str,time: &str,unit_struct: UnitData) {

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

