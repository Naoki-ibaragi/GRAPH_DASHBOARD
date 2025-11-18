import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress
} from "@mui/material";
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import LotDataTable from "../TableComponents/LotDataTable";

export default function LotDataDownloads() {
  const [lotNumber, setLotNumber] = useState(""); //バックエンドに送信するロット番号
  const [validationError,setValidationError]=useState(false); //設備名入力時のエラーの有無
  const [downloads, setDownloads] = useState(false); //ダウンロード中かどうか
  const [isError, setIsError] = useState(false); //ダウンロードタスク中にエラーがでたかどうか
  const [downloadsState, setDownloadsState] = useState(""); //ダウンロード状況表示
  const [columnHeader,setColumnHeader]=useState(null); //バックエンドから受け取った各カラムのヘッダー名
  const [lotUnitData,setLotUnitData]=useState(null); //バックエンドから受け取った設備単位のアラームデータ一覧
  const [isTable,setIsTable]=useState(false); //データを受け取ってテーブルを表示するかどうか

  //invoke処理が完了するとテーブルを表示する
  useEffect(()=>{
    if(lotUnitData==null || columnHeader==null){
      setIsTable(false);
      return; 
    }
    setIsTable(true);
  },[lotUnitData,columnHeader]);

  // ロットデータのダウンロード処理(REST API)
  const downloadLotData=async ()=> {

    //ロット名のバリデーションを入れる
    if(lotNumber.length!=10){
      setValidationError(true);
      return;
    }else{
      setValidationError(false);
    }

    setColumnHeader(null); //データの初期化
    setLotUnitData(null); //データの初期化
    setIsTable(false); //テーブルの削除

    //ダウンロードタスクをセットする
    setDownloads(true);
    setDownloadsState("データ取得開始");

    try {
      // REST APIにリクエストを送信
      const response = await fetch('http://127.0.0.1:8080/download_lot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lot_name: lotNumber }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('処理成功:', data);
      setColumnHeader(data.lot_header);
      setLotUnitData(data.lot_data);
      setDownloads(false);
      setIsError(false);

    } catch (error) {
      console.error('データ取得エラー:', error);
      setIsError(true);
      setDownloads(false);
      setDownloadsState(`処理失敗: ${error.message}`);
    }
  }

  //テーブルをcsvで出力
  const exportCSV = async () => {
    // ヘッダー行
    const header = columnHeader.join(",");
    
    // データ行（各行を個別にカンマ区切りにしてから改行で結合）
    const rows = lotUnitData.map(row => row.join(","));
    
    // ヘッダーとデータを結合
    const csvContent = [header, ...rows].join("\n");

    // ファイル保存ダイアログを開く
    const filePath = await save({
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      defaultPath: `${lotNumber}_data.csv`,
    });

    if (filePath) {
      try {
        // plugin-fs を使ってファイルに書き込む
        await writeTextFile(filePath, csvContent);
        alert("CSVを保存しました！");
      } catch (error) {
        console.error("CSV保存エラー:", error);
        alert(`保存に失敗しました: ${error}`);
      }
    }
  }

  return (
    <>
      <Box sx={{ mt: 4, display: "grid", gap: 3, maxWidth: 600 }}>
        {/* ロット単位稼働データのダウンロード */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ロットデータのダウンロード
            </Typography>
            <Typography variant="body2" color="text.secondary">
              1ロット分の稼働データをダウンロードします。
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              下記にロット番号を入力後、ダウンロード開始ボタンを押してください。
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                label="ロット番号"
                fullWidth
                value={lotNumber}
                error={validationError}
                helperText={validationError ? "ロット名は10文字で記入してください" : null}
                onChange={(e) => setLotNumber(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() =>downloadLotData()}
                disabled={downloads}
                sx={{width:200}}
              >
                ダウンロード開始
              </Button>
            </Stack>
          </CardContent>
        </Card>
        </Box>
        {/* ダウンロード中リスト */}
        {downloads||isError ?
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                gap: 2,
              }}
            >
              <CircularProgress size={60} />
              <Typography variant="h6" gutterBottom>
                グラフデータを取得中...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {downloadsState}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        :null
        }
      {isTable ? <Button onClick={exportCSV}>テーブルをCSVに出力</Button>:null}
      {isTable ? <LotDataTable columnHeader={columnHeader} lotUnitData={lotUnitData}></LotDataTable>:null}
    </>
  );
}

