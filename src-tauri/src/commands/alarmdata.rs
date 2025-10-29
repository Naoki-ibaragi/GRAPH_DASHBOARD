use rusqlite::{Connection, Result};
use std::collections::{HashMap};
use serde_json;
use std::{fs};
use std::error::Error;

use crate::models::alarmdata_model::*;

pub fn get_alarmdata(db_path: &str, machine_name: &str, json_path:&str) -> Result<(HashMap<String, LotUnitData>,AlarmDetail),Box<dyn Error>> {

    let data=fs::read_to_string(json_path)?;
    let alarm_detail:AlarmDetail = serde_json::from_str(&data)?;

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

    Ok((return_hashmap,alarm_detail))
}

