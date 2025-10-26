import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
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

  // ロットデータのダウンロード処理(invoke)
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

    // 進捗イベントのリスナーを設定
    const unlistenProgress = await listen('lot_log-progress', (event) => {
      const payload = event.payload;
      console.log(`進捗: ${payload.progress}% - ${payload.message}`);
      
      // プログレスバーの更新
      setDownloadsState(`${payload.message}`);
    });
    
    // 完了イベントのリスナーを設定
    const unlistenComplete = await listen('lot_log-complete', (event) => {
      const payload = event.payload;
      
      if (payload.success) {
        console.log('処理成功:', payload.data);
        setColumnHeader(payload.data.lot_header);
        setLotUnitData(payload.data.lot_data);
        setDownloads(false);
      } else {
        console.error('処理失敗:', payload.error);
        setIsError(true);
        setDownloads(false);
        setDownloadsState('処理失敗:', payload.error);
      }
      
      // リスナーをクリーンアップ
      unlistenProgress();
      unlistenComplete();
    });
    
    try {
      // バックエンドのコマンドを呼び出し（即座に戻る）
      await invoke('download_lot', { lotName:lotNumber });
    } catch (error) {
      console.error('コマンド呼び出しエラー:', error);
      unlistenProgress();
      unlistenComplete();
    }
  }

  //テーブルをcsvで出力
  const exportCSV=async ()=>{

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

        {/* ダウンロード中リスト */}
        {downloads||isError ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {`処理状況 - ${downloadsState}`}
              </Typography>
          </CardContent>
        </Card>
        ):null}
      </Box>
      {isTable ? <Button onClick={exportCSV}>テーブルをCSVに出力</Button>:null}
      {isTable ? <LotDataTable columnHeader={columnHeader} lotUnitData={lotUnitData}></LotDataTable>:null}
    </>
  );
}

