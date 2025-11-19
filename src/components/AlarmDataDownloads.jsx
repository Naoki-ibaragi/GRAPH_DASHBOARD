import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  CircularProgress
} from "@mui/material";
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
  const [machineName, setMachineName] = useState("");            //バックエンドに送信する装置名
  const [validationError,setValidationError]=useState(false);   //設備名入力時のエラーの有無
  const [downloads, setDownloads] = useState(false);            //ダウンロード中かどうか
  const [isError, setIsError] = useState(false);                //ダウンロードタスク中にエラーがでたかどうか
  const [errorMessage, setErrorMessage] = useState("");         //ダウンロード失敗時のメッセージを表示
  const [downloadsState, setDownloadsState] = useState("");     //ダウンロード状況表示
  const [isTable,setIsTable]=useState(false);                   //データを受け取ってテーブルを表示するかどうか
  const [machineList,setMachineList]=useState([]);              //設備名一覧

  //一番最初にバックエンドから設備名一覧を取得する
  useEffect(() => {
    const fetchMachineList = async () => {
      //tauri invokeからバックエンドapiへのfetchに仕様変更
      try {
        const response = await fetch('http://127.0.0.1:8080/get_machine_list', {
          method: 'POST',
        });

        const data = await response.json();
        if (data.success) {
          console.log('処理成功:', data);
          setMachineList(data.machine_list);
          setMachineName(data.machine_list[0]);
        } else {
          console.log('処理失敗:', data);
          setIsError(`設備名一覧の取得に失敗しました:${data.message}`);
        }
      } catch (error) {
        console.error('コマンド呼び出しエラー:', error);
        setIsError("設備名一覧の取得に失敗しました");
      }
    };

    fetchMachineList();
  }, []);

  // アラームダウンロードを実行する関数
  const downloadAlarm=async ()=> {
    setAlarmCodes(null);
    setMachineUnitData(null);
    setIsError(false);
    setErrorMessage("");

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

    //tauri invokeからバックエンドapiへのfetchに仕様変更
    try {
      const response=await fetch('http://127.0.0.1:8080/download_alarm',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify({machine_name:machineName}),
      });

      const data= await response.json();
      if(data.success){
        console.log('処理成功:',data);
        setAlarmCodes(data.alarm_header);
        setMachineUnitData(data.alarm_data)
        setDownloads(false);
        setIsTable(true)
      }else{
        console.log('処理失敗:',data);
        setDownloads(false);
        setIsError(true);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage(error);
      console.error('コマンド呼び出しエラー:', error);
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
                <Select
                    size="small"
                    sx={{mr:3,height:32,width:300}}
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                >
                    {machineList.map((item) => (
                    <MenuItem key={item} value={item}>
                        {item}
                    </MenuItem>
                    ))}
                </Select>
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
      </Box>
      {/* ダウンロード中リスト */}
      {downloads ?
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
      {/* エラー発生時表示 */}
      {isError ?
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
            <Typography variant="h6" gutterBottom>
              {`エラーが発生しました:${errorMessage}`}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      :null
      }
      {isTable ? <Button onClick={exportCSV}>テーブルをCSVに出力</Button>:null}
      {isTable ? <AlarmTable alarmCodes={alarmCodes} machineUnitData={machineUnitData}></AlarmTable>:null}
    </>
  );
}
