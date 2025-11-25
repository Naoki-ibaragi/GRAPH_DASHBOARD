import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import AlarmTable from "../TableComponents/AlarmTable";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { alarmCodes } from "../Variables/AlarmNumber";
import { useAlarmData } from "../contexts/AlarmDataContext";
import { useConfig } from "../contexts/ConfigContext";

export default function AlarmDataDownloads() {
  // 設定を取得
  const { config } = useConfig();

  // グローバルステートから取得
  const { machineUnitData, setMachineUnitData } = useAlarmData();

  // ローカルステート
  const [machineName, setMachineName] = useState(""); //バックエンドに送信する装置名
  const [validationError, setValidationError] = useState(false); //設備名入力時のエラーの有無
  const [downloads, setDownloads] = useState(false); //ダウンロード中かどうか
  const [isError, setIsError] = useState(false); //ダウンロードタスク中にエラーがでたかどうか
  const [errorMessage, setErrorMessage] = useState(""); //ダウンロード失敗時のメッセージを表示
  const [downloadsState, setDownloadsState] = useState(""); //ダウンロード状況表示
  const [isTable, setIsTable] = useState(false); //データを受け取ってテーブルを表示するかどうか
  const [machineList, setMachineList] = useState([]); //設備名一覧

  //一番最初にバックエンドから設備名一覧を取得する
  useEffect(() => {
    const fetchMachineList = async () => {
      //tauri invokeからバックエンドapiへのfetchに仕様変更
      try {
        const response = await fetch(config.machine_list_url, {
          method: "POST",
        });

        const data = await response.json();
        if (data.success) {
          console.log("処理成功:", data);
          setMachineList(data.machine_list);
          setMachineName(data.machine_list[0]);
        } else {
          console.log("処理失敗:", data);
          setIsError(`設備名一覧の取得に失敗しました:${data.message}`);
        }
      } catch (error) {
        console.error("コマンド呼び出しエラー:", error);
        setIsError(true);
        setErrorMessage("設備名一覧の取得に失敗しました");
      }
    };

    fetchMachineList();
  }, []);

  // アラームダウンロードを実行する関数
  const downloadAlarm = async () => {
    setMachineUnitData(null);
    setIsError(false);
    setErrorMessage("");

    //設備名のバリデーションを入れる
    if (!/^CLT_\d+$/.test(machineName)) {
      setValidationError(true);
      return;
    } else {
      setValidationError(false);
    }

    //ダウンロードタスクをセットする
    setDownloads(true);
    setDownloadsState("ダウンロード開始");

    //tauri invokeからバックエンドapiへのfetchに仕様変更
    try {
      const response = await fetch(config.alarm_data_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ machine_name: machineName }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("処理成功:", data);
        setMachineUnitData(data.alarm_data);
        setDownloads(false);
        setIsTable(true);
      } else {
        console.log("処理失敗:", data);
        setDownloads(false);
        setIsError(true);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage(error);
      console.error("コマンド呼び出しエラー:", error);
    }
  };

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
        const unitAlarmData = d.alarm_counts?.[`${unit}_alarm`];
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
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
      defaultPath: "alarm_data.csv",
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
      <div className="mt-8 max-w-2xl">
        {/* アラームデータ */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">アラームデータのダウンロード</h2>
            <p className="text-sm text-gray-600 mb-6">対象装置のアラームデータをダウンロードします。</p>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-base font-medium text-gray-700">装置名</label>
              <select
                className="h-10 w-80 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
              >
                {machineList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                disabled={downloads}
                onClick={() => downloadAlarm()}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                ダウンロード開始
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ダウンロード中リスト */}
      {downloads ? (
        <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <h3 className="text-xl font-semibold text-gray-800">グラフデータを取得中...</h3>
            <p className="text-sm text-gray-600">{downloadsState}</p>
          </div>
        </div>
      ) : null}

      {/* エラー発生時表示 */}
      {isError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-8 mt-6">
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800">{`エラーが発生しました:${errorMessage}`}</h3>
          </div>
        </div>
      ) : null}

      {isTable ? (
        <button
          onClick={exportCSV}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          テーブルをCSVに出力
        </button>
      ) : null}
      {isTable ? <AlarmTable alarmCodes={alarmCodes} machineUnitData={machineUnitData}></AlarmTable> : null}
    </>
  );
}
