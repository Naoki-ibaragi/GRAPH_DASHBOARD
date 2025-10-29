use std::fs::File;
use std::io::{BufRead,BufReader};
use std::error::Error;

//Fileオブジェクトをもらって中身のカンマ区切りしたvecを返す
pub fn txt_to_string_vec(file:File)->Result<Vec<String>,Box<dyn Error>>{
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

    Ok(v)

}