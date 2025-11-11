use std::collections::{HashMap,BTreeMap};
use serde::Serialize;

#[derive(Debug)]
pub struct ChipRecord {
    pub machine_name: Option<String>,
    pub type_name: Option<String>,
    pub lot_name: Option<String>,
    pub ld_tray_time: Option<String>,
    pub ld_alarm: Option<String>,
    pub dc1_alarm: Option<String>,
    pub ac1_alarm: Option<String>,
    pub ac2_alarm: Option<String>,
    pub dc2_alarm: Option<String>,
    pub ip_alarm: Option<String>,
    pub uld_alarm: Option<String>,
}

#[derive(Debug,Serialize)]
pub struct AlarmCounts {
    pub ld_alarm: BTreeMap<String, u32>,
    pub dc1_alarm: BTreeMap<String, u32>,
    pub ac1_alarm: BTreeMap<String, u32>,
    pub ac2_alarm: BTreeMap<String, u32>,
    pub dc2_alarm: BTreeMap<String, u32>,
    pub ip_alarm: BTreeMap<String, u32>,
    pub uld_alarm: BTreeMap<String, u32>,
}

impl AlarmCounts {
    pub fn new(
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

#[derive(Debug, serde::Deserialize,Serialize)]
pub struct AlarmDetail{
    pub ld_alarm:HashMap<String,String>,
    pub dc1_alarm:HashMap<String,String>,
    pub ac1_alarm:HashMap<String,String>,
    pub ac2_alarm:HashMap<String,String>,
    pub dc2_alarm:HashMap<String,String>,
    pub ip_alarm:HashMap<String,String>,
    pub uld_alarm:HashMap<String,String>,
}

#[derive(Debug,Serialize)]
pub struct LotUnitData {
    pub machine_name: String,
    pub type_name: String,
    pub lot_start_time: String,
    pub lot_end_time: String,
    pub alarm_list: AlarmCounts,
}

impl LotUnitData {
    pub fn new(machine_name: &str, 
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

    pub fn check_date(&mut self, ld_time: &str) {
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

