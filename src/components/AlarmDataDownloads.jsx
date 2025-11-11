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
import AlarmTable from "../TableComponents/AlarmTable";
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { useAlarmData } from "../contexts/AlarmDataContext";

export default function AlarmDataDownloads() {
  // グローバルステートから取得
  const { alarmCodes, setAlarmCodes, machineUnitData, setMachineUnitData } = useAlarmData();

  // ローカルステート
  const [machineName, setMachieName] = useState(""); //バックエンドに送信する装置名
  const [validationError,setValidationError]=useState(false); //設備名入力時のエラーの有無
  const [downloads, setDownloads] = useState(false); //ダウンロード中かどうか
  const [isError, setIsError] = useState(false); //ダウンロードタスク中にエラーがでたかどうか
  const [downloadsState, setDownloadsState] = useState(""); //ダウンロード状況表示
  const [isTable,setIsTable]=useState(true); //データを受け取ってテーブルを表示するかどうか

  //バックエンドからのアラームデータのダウンロードが完了するとテーブルを表示する
  useEffect(()=>{
    if(machineUnitData==null || alarmCodes==null){
      setIsTable(true);
      return;
    }
  },[machineUnitData,alarmCodes]);

  // アラームダウンロードを実行する関数
  const downloadAlarm=async ()=> {
    setAlarmCodes(null);
    setMachineUnitData(null);

    //設備名のバリデーションを入れる
    if(!/^CLT_\d+$/.test(machineName)){
      setValidationError(true);
      return;
    }else{
      setValidationError(false);
    }

    //ダウンロードタスクをセットする
    setDownloads(true);
    setDownloadsState("ダウンロード開始");

    // 進捗イベントのリスナーを設定
    const unlistenProgress = await listen('alarm-progress', (event) => {
      const payload = event.payload;
      console.log(`進捗: ${payload.progress}% - ${payload.message}`);
      
      // プログレスバーの更新
      setDownloadsState(`${payload.message}`);
    });
    
    // 完了イベントのリスナーを設定
    const unlistenComplete = await listen('alarm-complete', (event) => {
      const payload = event.payload;
      
      if (payload.success) {
        console.log('処理成功:', payload.data);
        setAlarmCodes(payload.data.alarm_codes);
        setMachineUnitData(payload.data.lot_unit_alarm_data);
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
      await invoke('download_alarm', { machineName });
    } catch (error) {
      console.error('コマンド呼び出しエラー:', error);
      unlistenProgress();
      unlistenComplete();
    }
  }

    // プラグイン不要のCSVエクスポート
  async function exportCSV() {
    const unit_list = ["ld", "dc1", "ac1", "ac2", "dc2", "ip", "uld"];
    let header_list = ["machine_name", "lot_name", "type_name", "lotstart_time", "lotend_time"];

    // ヘッダー作成
    unit_list.forEach((unit) => {
      const alarm_code_list = alarmCodes[`${unit}_alarm`];
      if (alarm_code_list) {
        Object.keys(alarm_code_list).forEach((alarm_code) => {
          header_list.push(`${unit}_${alarm_code}`);
        });
      }
    });

    // CSV本文作成
    const rows = Object.keys(machineUnitData).map((key) => {
      const d = machineUnitData[key];
      const base = [
        d.machine_name || "", //装置名
        key || "", //ロット名
        d.type_name || "", //機種名
        d.lot_start_time || "", //ロット開始時刻
        d.lot_end_time || "", //ロット終了時刻
      ];

      // 各ユニットのアラームデータを追加
      unit_list.forEach((unit) => {
        const unitAlarmData = d.alarm_list?.[`${unit}_alarm`];
        // undefinedチェックを追加
        if (unitAlarmData) {
          Object.values(unitAlarmData).forEach((alarm_num) => base.push(alarm_num));
        } else {
          // データがない場合は、ヘッダー分の空文字を追加
          const alarm_code_list = alarmCodes[`${unit}_alarm`];
          if (alarm_code_list) {
            const colCount = Object.keys(alarm_code_list).length;
            for (let i = 0; i < colCount; i++) {
              base.push("");
            }
          }
        }
      });
      return base.join(",");
    });

    const csvContent = [header_list.join(","), ...rows].join("\n");

    // ファイル保存ダイアログを開く
    const filePath = await save({
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      defaultPath: 'alarm_data.csv',
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
        {/* アラームデータ */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              アラームデータのダウンロード
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              対象装置のアラームデータをダウンロードします。
            </Typography>
            <Stack direction="row" alignItems="center" flexWrap="wrap">
              <Typography variant="h7" sx={{ pr:1}}>
                装置名
              </Typography>
              <TextField
                error={validationError}
                helperText={validationError ? "装置名はCLT_*で記入してください" : null}
                size="small"
                label="装置名"
                value={machineName}
                onChange={(e) =>
                    setMachieName(e.target.value)
                }
                sx={{pr:2}}
              />
              <Button
                variant="contained"
                disabled={downloads}
                onClick={() => downloadAlarm()}
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
                {`処理状況 ${downloadsState}`}
              </Typography>
              <Stack spacing={2}>
              </Stack>
          </CardContent>
        </Card>
        ):null}
      </Box>
      {isTable ? <Button onClick={exportCSV}>テーブルをCSVに出力</Button>:null}
      {isTable ? <AlarmTable alarmCodes={alarmCodes} machineUnitData={machineUnitData}></AlarmTable>:null}
    </>
  );
}
