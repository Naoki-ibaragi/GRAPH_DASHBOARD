use rusqlite::{Connection, Result,params};
use std::error::Error;
use std::fs::File;
use std::io::{BufRead,BufReader};
use tauri::{command,Emitter,Window};

//独自クレートの定義
use crate::utils::events::*;
use crate::utils::file_handle::txt_to_string_vec;
use crate::db::create_table::create_chipdata_table;
use crate::models::regist_data_model::*;
use crate::db::db_regist::*;

pub fn regist_txtdata_to_db(window:&Window,txt_path:&str,db_path:&str,type_name:&str)->Result<(),Box<dyn Error>>{
    //dbに接続しなければ作成する
    let conn=Connection::open(db_path)?;
    // テーブルが存在しない場合は作成
    match create_chipdata_table(&conn){
        Ok(v)=>{},
        Err(e)=>println!("{}",e)
    };

    conn.execute("BEGIN TRANSACTION",[])?;

    //フロントエンドに状況報告
    report_progress(
        &window,
        "regist_data-progress",
        "complete connect to db",
        10,
        &format!("DBへの接続が完了")
    );

    // ファイルの内容をカンマ区切りしたベクトルをもらう
    let file=File::open(txt_path)?;
    let mut v:Vec<String>=txt_to_string_vec(file)?;

    // 装置名を作成
    let num_part = if let Some(file_name) = txt_path.split('\\').last() {
        file_name
            .strip_suffix(".txt")
            .and_then(|s| s.split('_').last())
            .unwrap_or("")
    } else {
        ""
    };

    let machine_name = format!("CLT_{}", num_part);
    println!("{}", machine_name);

    //フロントエンドに状況報告
    report_progress(
        &window,
        "regist_data-progress",
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
        String::from("U7"),
        String::from("B1"),
        String::from("B2"),
        ];

    //1 itemずつ読み込んでDBに必要な情報を登録
    for (i,item) in v.iter().enumerate(){
        match item.as_str(){
            "TIME"=>now_time=v[i+1].clone(), //現在時刻の更新
            "U1"=> //ld
            match v[i+1].as_str(){
                "PH"=>add_lddata_to_db(&conn,machine_name.as_str(),type_name,now_time.as_str(),UnitData::LD(LDInfo::new(&v[i+2],&v[i+3],&v[i+4],&v[i+5],&v[i+6],&v[i+7],&v[i+8],&v[i+9]))),
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

        if (i+1)%1000==0{
            //フロントエンドに報告
            let progress:f32=((i+1) as f32/v.len() as f32)*100.0;
            let percent = (i + 1) as f32 / v.len() as f32 * 100.0;
            report_progress(
                &window,
        "regist_data-progress",
                "complete read txt data",
                progress as u32,
                &format!("DBにデータを登録中:{:.1}% 完了",percent)
            );
        }
    }

    conn.execute("COMMIT",[])?;
    println!("すべての処理が完了");
    Ok(())
}

