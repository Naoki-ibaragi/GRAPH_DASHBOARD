use rusqlite::{Connection, Result};
use serde::Serialize;
use std::collections::{BTreeMap, HashMap};
use serde_json;
use std::{fs};

#[derive(Debug)]
pub struct ChipRecord {
    machine_name: String,
    type_name: String,
    lot_name: String,
    ld_tray_time: String,
    ld_alarm: String,
    dc1_alarm: String,
    ac1_alarm: String,
    ac2_alarm: String,
    dc2_alarm: String,
    ip_alarm: String,
    uld_alarm: String,
}

#[derive(Debug,Serialize)]
pub struct AlarmCounts {
    ld_alarm: BTreeMap<String, u32>,
    dc1_alarm: BTreeMap<String, u32>,
    ac1_alarm: BTreeMap<String, u32>,
    ac2_alarm: BTreeMap<String, u32>,
    dc2_alarm: BTreeMap<String, u32>,
    ip_alarm: BTreeMap<String, u32>,
    uld_alarm: BTreeMap<String, u32>,
}

impl AlarmCounts {
    fn new(
        ld_keys:Vec<String>,
        dc1_keys:Vec<String>,
        ac1_keys:Vec<String>,
        ac2_keys:Vec<String>,
        dc2_keys:Vec<String>,
        ip_keys:Vec<String>,
        uld_keys:Vec<String>,
    ) -> Self {
        let ld_map:BTreeMap<String,u32>=ld_keys.into_iter().map(|k| (k,0)).collect();
        let dc1_map:BTreeMap<String,u32>=dc1_keys.into_iter().map(|k| (k,0)).collect();
        let ac1_map:BTreeMap<String,u32>=ac1_keys.into_iter().map(|k| (k,0)).collect();
        let ac2_map:BTreeMap<String,u32>=ac2_keys.into_iter().map(|k| (k,0)).collect();
        let dc2_map:BTreeMap<String,u32>=dc2_keys.into_iter().map(|k| (k,0)).collect();
        let ip_map:BTreeMap<String,u32>=ip_keys.into_iter().map(|k| (k,0)).collect();
        let uld_map:BTreeMap<String,u32>=uld_keys.into_iter().map(|k| (k,0)).collect();
        AlarmCounts {
            ld_alarm: ld_map,
            dc1_alarm: dc1_map,
            ac1_alarm: ac1_map,
            ac2_alarm: ac2_map,
            dc2_alarm: dc2_map,
            ip_alarm: ip_map,
            uld_alarm: uld_map,
        }
    }
}

#[derive(Debug,Serialize)]
pub struct LotUnitData {
    machine_name: String,
    type_name: String,
    lot_start_time: String,
    lot_end_time: String,
    alarm_list: AlarmCounts,
}

#[derive(Debug, serde::Deserialize,Serialize)]
pub struct AlarmDetail{
    ld_alarm:HashMap<String,String>,
    dc1_alarm:HashMap<String,String>,
    ac1_alarm:HashMap<String,String>,
    ac2_alarm:HashMap<String,String>,
    dc2_alarm:HashMap<String,String>,
    ip_alarm:HashMap<String,String>,
    uld_alarm:HashMap<String,String>,
}

impl LotUnitData {
    fn new(machine_name: &str, 
        type_name: &str, 
        lot_start_time: &str, 
        lot_end_time: &str,
        ld_alarm_vec:Vec<String>,
        dc1_alarm_vec:Vec<String>,
        ac1_alarm_vec:Vec<String>,
        ac2_alarm_vec:Vec<String>,
        dc2_alarm_vec:Vec<String>,
        ip_alarm_vec:Vec<String>,
        uld_alarm_vec:Vec<String>
        ) -> Self {
        LotUnitData {
            machine_name: machine_name.to_string(),
            type_name: type_name.to_string(),
            lot_start_time: lot_start_time.to_string(),
            lot_end_time: lot_end_time.to_string(),
            alarm_list: AlarmCounts::new(
                ld_alarm_vec.clone(),
                dc1_alarm_vec.clone(),
                ac1_alarm_vec.clone(),
                ac2_alarm_vec.clone(),
                dc2_alarm_vec.clone(),
                ip_alarm_vec.clone(),
                uld_alarm_vec.clone()
            ),
        }
    }

    fn check_date(&mut self, ld_time: &str) {
        if self.lot_start_time.is_empty(){
            self.lot_start_time=ld_time.to_string();
        }else if self.lot_start_time > ld_time.to_string() {
            self.lot_start_time = ld_time.to_string();
        }

        if self.lot_end_time.is_empty(){
            self.lot_end_time=ld_time.to_string();
        }else if self.lot_end_time < ld_time.to_string() {
            self.lot_end_time = ld_time.to_string();
        }
    }
}

pub fn get_alarmdata(db_path: &str, machine_name: &str, alarm_detail: &AlarmDetail) -> Result<HashMap<String, LotUnitData>> {
    //alarm_detailから各ユニット毎のキー一覧を追加する
    let ld_alarmcode_vec:Vec<String>=alarm_detail.ld_alarm.keys().cloned().collect();
    let dc1_alarmcode_vec:Vec<String>=alarm_detail.dc1_alarm.keys().cloned().collect();
    let ac1_alarmcode_vec:Vec<String>=alarm_detail.ac1_alarm.keys().cloned().collect();
    let ac2_alarmcode_vec:Vec<String>=alarm_detail.ac2_alarm.keys().cloned().collect();
    let dc2_alarmcode_vec:Vec<String>=alarm_detail.dc2_alarm.keys().cloned().collect();
    let ip_alarmcode_vec:Vec<String>=alarm_detail.ip_alarm.keys().cloned().collect();
    let uld_alarmcode_vec:Vec<String>=alarm_detail.uld_alarm.keys().cloned().collect();

    let db = Connection::open(db_path)?;

    let mut stmt = db.prepare(
        "SELECT machine_name, type_name, lot_name, ld_tray_time,
            ld_alarm, dc1_alarm, ac1_alarm, ac2_alarm, dc2_alarm, ip_alarm, uld_alarm
         FROM chipdata
         WHERE machine_name = ?",
    )?;

    // lot_name をキーに LotUnitData を格納
    let mut return_hashmap: HashMap<String, LotUnitData> = HashMap::new();

    let chip_iter = stmt.query_map([machine_name], |row| {
        Ok(ChipRecord {
            machine_name: row.get(0)?,
            type_name: row.get(1)?,
            lot_name: row.get(2)?,
            ld_tray_time: row.get(3)?,
            ld_alarm: row.get(4)?,
            dc1_alarm: row.get(5)?,
            ac1_alarm: row.get(6)?,
            ac2_alarm: row.get(7)?,
            dc2_alarm: row.get(8)?,
            ip_alarm: row.get(9)?,
            uld_alarm: row.get(10)?,
        })
    })?;

    for chip in chip_iter {
        let chip = chip?;
        let lot_name = chip.lot_name.clone();

        // HashMapにキーが無ければ新規作成
        let lot_entry = return_hashmap
            .entry(lot_name.clone())
            .or_insert_with(|| {
                LotUnitData::new(
                    &chip.machine_name,
                    &chip.type_name,
                    &chip.ld_tray_time.clone(),
                    &chip.ld_tray_time.clone(),
                    ld_alarmcode_vec.clone(),
                    dc1_alarmcode_vec.clone(),
                    ac1_alarmcode_vec.clone(),
                    ac2_alarmcode_vec.clone(),
                    dc2_alarmcode_vec.clone(),
                    ip_alarmcode_vec.clone(),
                    uld_alarmcode_vec.clone(),
                )
            });

        // lot_start_time / lot_end_time を更新
        lot_entry.check_date(&chip.ld_tray_time);

        // 例: 各アラームの非空文字列をカウントに追加（必要に応じて拡張）
        if !chip.ld_alarm.is_empty() {
            *lot_entry
                .alarm_list
                .ld_alarm
                .entry(chip.ld_alarm.clone())
                .or_insert(0) += 1;
        }

        if !chip.dc1_alarm.is_empty() {
            *lot_entry
                .alarm_list
                .dc1_alarm
                .entry(chip.dc1_alarm.clone())
                .or_insert(0) += 1;
        }

        if !chip.ac1_alarm.is_empty() {
            *lot_entry
                .alarm_list
                .ac1_alarm
                .entry(chip.ac1_alarm.clone())
                .or_insert(0) += 1;
        }

        if !chip.ac2_alarm.is_empty() {
            *lot_entry
                .alarm_list
                .ac2_alarm
                .entry(chip.ac2_alarm.clone())
                .or_insert(0) += 1;
        }

        if !chip.dc2_alarm.is_empty() {
            *lot_entry
                .alarm_list
                .dc2_alarm
                .entry(chip.dc2_alarm.clone())
                .or_insert(0) += 1;
        }

        if !chip.ip_alarm.is_empty() {
            *lot_entry
                .alarm_list
                .ip_alarm
                .entry(chip.ip_alarm.clone())
                .or_insert(0) += 1;
        }

        if !chip.uld_alarm.is_empty() {
            *lot_entry
                .alarm_list
                .uld_alarm
                .entry(chip.uld_alarm.clone())
                .or_insert(0) += 1;
        }
    }

    Ok(return_hashmap)
}

pub fn read_jsondata(json_path:&str)->Result<AlarmDetail,Box<dyn std::error::Error>>{
    let data=fs::read_to_string(json_path)?;
    let alarms:AlarmDetail = serde_json::from_str(&data)?;
    Ok(alarms)
}
