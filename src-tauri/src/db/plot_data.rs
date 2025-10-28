use rusqlite::{Statement};
use std::error::Error;
use tauri::{Window};
use std::collections::HashMap;

use crate::models::graph_model::*;
use crate::utils::events::{report_progress};

//プロット分割しない散布図のデータを取得
pub fn plot_scatterplot_without_unit(window:&Window,total_count:i64,data_map:&mut HashMap<String,Vec<PlotData>>,stmt:&mut Statement)->Result<(),Box<dyn Error>>{
    data_map.entry("data".to_string()).or_insert(vec![]);

    let query_rows: Vec<Vec<i32>> = stmt.query_map([], |row| {
        let x_value: String = row.get(0)?;
        let y_value: String = row.get(1)?;
        Ok((x_value, y_value))
    })?
    .filter_map(|r| {
        let (x_val, y_val) = r.ok()?;
        let x = x_val.parse::<i32>().ok()?;
        let y = y_val.parse::<i32>().ok()?;
        Some(vec![x, y])
    })
    .collect();

    // 最初に全ての行をカウント（オプション：パフォーマンスが心配な場合は別途COUNT(*)で取得）
    // 以下のコードでは処理しながら報告していく方式を使用
    let rows= data_map.get_mut("data").unwrap();
    for (index,record) in query_rows.into_iter().enumerate(){
        rows.push(PlotData::Number(NumberData::new(record[0],record[1])));

        // 1000行ごとに進捗を報告
        if (index+1) % 1000 == 0 {
            report_progress(
                &window,
                "processing",
                40,
                &format!("{}/{} 処理完了", index+1,total_count)
            );
        }
    }

    Ok(())
}

//プロット分割する散布図のデータを取得
pub fn plot_scatterplot_with_unit(window:&Window,total_count:i64,data_map:&mut HashMap<String,Vec<PlotData>>,stmt:&mut Statement)->Result<(),Box<dyn Error>>{
    let query_rows: Vec<TmpData> = stmt.query_map([], |row| {
        let unit_name: String=row.get(0)?;
        let x_value: String = row.get(1)?;
        let y_value: String = row.get(2)?;
        Ok((unit_name,x_value, y_value))
    })?
    .filter_map(|r| {
        let (unit_name,x_val, y_val) = r.ok()?;
        let x = x_val.parse::<i32>().ok()?;
        let y = y_val.parse::<i32>().ok()?;
        let plot_data=PlotData::Number(NumberData::new(x,y));
        Some(TmpData::new(unit_name,plot_data))
    })
    .collect();

    for (index,record) in query_rows.into_iter().enumerate(){

        //unitがHashMapになければ追加
        if data_map.contains_key(&record.unit){
            let rows=data_map.get_mut(&record.unit).unwrap();
            rows.push(match record.data{
                PlotData::Number(num_data)=>PlotData::Number(NumberData::new(num_data.x,num_data.y)),
                PlotData::Calendar(calender_data)=>PlotData::Calendar(CalenderData::new(calender_data.x,calender_data.y))
            });
        }else{
            data_map.entry(record.unit).or_insert(
        match record.data{
                    PlotData::Number(num_data)=>vec![PlotData::Number(NumberData::new(num_data.x,num_data.y))],
                    PlotData::Calendar(calender_data)=>vec![PlotData::Calendar(CalenderData::new(calender_data.x,calender_data.y))],
                }
            );
        }

        // 1000行ごとに進捗を報告
        if (index+1) % 1000 == 0 {
            report_progress(
                &window,
                "processing",
                40,
                &format!("{}/{} 処理完了", index+1,total_count)
            );
        }
    }

    Ok(())

}

//プロット分割しない折れ線グラフのデータを取得
pub fn plot_lineplot_without_unit(window:&Window,total_count:i64,data_map:&mut HashMap<String,Vec<PlotData>>,stmt:&mut Statement,graph_condition:&GraphCondition)->Result<(),Box<dyn Error>>{
    data_map.entry("data".to_string()).or_insert(vec![]);

    let query_rows:Vec<PlotData>=stmt.query_map([], |row| {
        let x_value: String = row.get(0)?;
        let y_value: String = row.get(1)?;
        Ok((x_value, y_value))
    })?
    .filter_map(|r| {
        if graph_condition.graph_x_item.contains("TIME"){
            let (x_val, y_val) = r.ok()?;
            if x_val.is_empty(){
                return None; 
            }
            let y = y_val.parse::<i32>().ok()?;
            Some(PlotData::Calendar(CalenderData::new(x_val,y)))
        }else{
            let (x_val, y_val) = r.ok()?;
            let x = x_val.parse::<i32>().ok()?;
            let y = y_val.parse::<i32>().ok()?;
            Some(PlotData::Number(NumberData::new(x, y)))
        }
    })
    .collect();

    //HashMapのvecに書き込む
    let rows= data_map.get_mut("data").unwrap();
    for (index,record) in query_rows.into_iter().enumerate(){
        rows.push(match record{
            PlotData::Number(num_data)=>PlotData::Number(NumberData::new(num_data.x,num_data.y)),
            PlotData::Calendar(calender_data)=>PlotData::Calendar(CalenderData::new(calender_data.x,calender_data.y))
        });

        // 1000行ごとに進捗を報告
        if (index+1) % 1000 == 0 {
            report_progress(
                &window,
                "processing",
                40,
                &format!("{}/{} 処理完了", index+1,total_count)
            );
        }
    }

    Ok(())
}

//プロット分割する折れ線グラフのデータを取得
pub fn plot_lineplot_with_unit(window:&Window,total_count:i64,data_map:&mut HashMap<String,Vec<PlotData>>,stmt:&mut Statement)->Result<(),Box<dyn Error>>{
    let query_rows: Vec<TmpData> = stmt.query_map([], |row| {
        let unit_name: String=row.get(0)?;
        let x_value: String = row.get(1)?;
        let y_value: String = row.get(2)?;
        Ok((unit_name,x_value, y_value))
    })?
    .filter_map(|r| {
        let (unit_name,x_val, y_val) = r.ok()?;
        let x = x_val.parse::<i32>().ok()?;
        let y = y_val.parse::<i32>().ok()?;
        let plot_data=PlotData::Number(NumberData::new(x,y));
        Some(TmpData::new(unit_name,plot_data))
    })
    .collect();

    for (index,record) in query_rows.into_iter().enumerate(){

        //unitがHashMapになければ追加
        if data_map.contains_key(&record.unit){
            let rows=data_map.get_mut(&record.unit).unwrap();
            rows.push(match record.data{
                PlotData::Number(num_data)=>PlotData::Number(NumberData::new(num_data.x,num_data.y)),
                PlotData::Calendar(calender_data)=>PlotData::Calendar(CalenderData::new(calender_data.x,calender_data.y))
            });
        }else{
            data_map.entry(record.unit).or_insert(
        match record.data{
                    PlotData::Number(num_data)=>vec![PlotData::Number(NumberData::new(num_data.x,num_data.y))],
                    PlotData::Calendar(calender_data)=>vec![PlotData::Calendar(CalenderData::new(calender_data.x,calender_data.y))],
                }
            );
        }

        // 1000行ごとに進捗を報告
        if (index+1) % 1000 == 0 {
            report_progress(
                &window,
                "processing",
                40,
                &format!("{}/{} 処理完了", index+1,total_count)
            );
        }
    }

    Ok(())

}

