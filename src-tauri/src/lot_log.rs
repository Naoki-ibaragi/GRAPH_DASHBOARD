use rusqlite::{Connection,Result};

pub fn get_lotdata(db_path: &str, lot_name: &str) -> Result<(Vec<String>, Vec<Vec<String>>), Box<dyn std::error::Error>> {
    let db = Connection::open(db_path)?;
    let mut stmt = db.prepare(
        "SELECT *
         FROM chipdata
         WHERE lot_name = ?",
    )?;
    
    // カラム名を取得
    let column_names: Vec<String> = stmt.column_names()
        .iter()
        .map(|&name| name.to_string())
        .collect();
    
    let mut lot_unit_vec: Vec<Vec<String>> = Vec::new();
    
    let rows = stmt.query_map([lot_name], |row| {
        let column_count = row.as_ref().column_count();
        let mut row_data = Vec::new();
        
        for i in 0..column_count {
            let value: Result<String, _> = row.get(i);
            match value {
                Ok(v) => row_data.push(v),
                Err(_) => {
                    // NULL や他の型の場合は空文字列で代用
                    row_data.push(String::new());
                }
            }
        }
        Ok(row_data)
    })?;
    
    for row in rows {
        lot_unit_vec.push(row?);
    }
    
    Ok((column_names, lot_unit_vec))
}
