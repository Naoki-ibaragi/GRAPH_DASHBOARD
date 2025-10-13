use std::fs::File;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use csv::Reader;
use serde::Deserialize;
use thiserror::Error;

// エラー型の定義
#[derive(Error, Debug)]
pub enum CsvError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("CSV parsing error: {0}")]
    Csv(#[from] csv::Error),
    #[error("Directory not found: {0}")]
    DirectoryNotFound(String),
}

// CSVファイル情報の構造体
#[derive(Debug, Clone)]
pub struct CsvFileInfo {
    pub path: PathBuf,
    pub filename: String,
    pub record_count: usize,
}

// CSVレコードの例（実際のデータ構造に合わせて修正してください）
#[derive(Debug, Deserialize)]
pub struct CsvRecord {
    // 例：ロット情報の場合
    // pub lot_number: String,
    // pub date: String,
    // pub value: f64,
    // 実際のCSVの列に合わせて定義してください
}

// CSVファイル一覧を取得する関数
pub fn get_csv_files(folder_path: &str) -> Result<Vec<CsvFileInfo>, CsvError> {
    let path = Path::new(folder_path);
    
    if !path.exists() || !path.is_dir() {
        return Err(CsvError::DirectoryNotFound(folder_path.to_string()));
    }

    let mut csv_files = Vec::new();

    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        let file_path = entry.path();
        
        // CSVファイルのみを対象とする
        if let Some(extension) = file_path.extension() {
            if extension.to_str().unwrap_or("").to_lowercase() == "csv" {
                let filename = file_path
                    .file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();

                // ファイルの行数をカウント（ヘッダー除く）
                let record_count = count_csv_records(file_path)?;

                csv_files.push(CsvFileInfo {
                    path: file_path.to_path_buf(),
                    filename,
                    record_count,
                });

            }
        }
    }

    Ok(csv_files)
}

// CSVファイルのレコード数をカウントする関数
fn count_csv_records(file_path: &Path) -> Result<usize, CsvError> {
    let file = File::open(file_path)?;
    let mut reader = Reader::from_reader(file);
    let mut count = 0;

    for result in reader.records() {
        let _ = result?; // エラーチェック
        count += 1;
    }

    Ok(count)
}

// CSVファイルの内容を読み取る関数（汎用版）
pub fn read_csv_content(file_path: &Path) -> Result<Vec<Vec<String>>, CsvError> {
    let file = File::open(file_path)?;
    let mut reader = Reader::from_reader(file);
    let mut records = Vec::new();

    // ヘッダーを取得
    let headers = reader.headers()?.clone();
    records.push(headers.iter().map(|h| h.to_string()).collect());

    // データレコードを取得
    for result in reader.records() {
        let record = result?;
        records.push(record.iter().map(|field| field.to_string()).collect());
    }

    Ok(records)
}

// 特定のCSVファイルの内容を構造体として読み取る関数（型付き版）
// 実際のデータ構造が分かったらこちらを使用
pub fn read_csv_typed<T>(file_path: &Path) -> Result<Vec<T>, CsvError>
where
    T: for<'de> Deserialize<'de>,
{
    let file = File::open(file_path)?;
    let mut reader = Reader::from_reader(file);
    let mut records = Vec::new();

    for result in reader.deserialize() {
        let record: T = result?;
        records.push(record);
    }

    Ok(records)
}

// すべてのCSVファイルを処理する関数
pub fn process_all_csv_files(folder_path: &str) -> Result<String, CsvError> {
    println!("Processing CSV files in: {}", folder_path);
    
    let csv_files = get_csv_files(folder_path)?;
    
    if csv_files.is_empty() {
        println!("No CSV files found in the specified directory.");
        return Ok("No CSV files found".to_string());
    }

    println!("Found {} CSV files:", csv_files.len());
    
    let mut total_records = 0;
    for file_info in &csv_files {
        println!("  - {} ({} records)", file_info.filename, file_info.record_count);
        total_records += file_info.record_count;

        // 各ファイルの内容を読み取り（デモ用に最初の数行のみ表示）
        match read_csv_content(&file_info.path) {
            Ok(content) => {
                println!("    First few rows:");
                for (i, row) in content.iter().take(3).enumerate() {
                    println!("      Row {}: {:?}", i, row);
                }
            }
            Err(e) => {
                println!("    Error reading file: {}", e);
            }
        }
    }

    let summary = format!(
        "Processing completed: {} files, {} total records", 
        csv_files.len(), 
        total_records
    );
    
    println!("{}", summary);
    Ok(summary)
}