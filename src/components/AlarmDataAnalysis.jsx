import { useEffect } from "react";
import AlarmTable from "../TableComponents/AlarmTable";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { alarmCodes } from "../Variables/AlarmNumber";
import { useAlarmData } from "../contexts/AlarmDataContext";
import { useConfig } from "../contexts/ConfigContext";
import dayjs from "dayjs";
import { OriginalDatepicker } from "../utils/datepicker";
import AlarmHistogram from "./AlarmHistogram";

export default function AlarmDataAnalysis() {
  // 設定を取得
  const { config } = useConfig();

  // グローバルステートから取得
  const { 
    machineUnitData,
    setMachineUnitData,
    machineName,
    setMachineName,
    validationError,
    setValidationError,
    downloads,
    setDownloads,
    isError,
    setIsError,
    errorMessage,
    setErrorMessage,
    downloadsState,
    setDownloadsState,
    isGraph,
    setIsGraph,
    machineList,
    setMachineList,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startDateError,
    setStartDateError,
    endDateError,
    setEndDateError,
    startDateErrorMessage,
    setStartDateErrorMessage,
    endDateErrorMessage,
    setEndDateErrorMessage,
    typeNameList,
    setTypeNameList,
    alarmDetailMap,
    setAlarmDetailMap,
    stopTimeMap,
    setStopTimeMap,
    stopCountMap,
    setStopCountMap,
    selectedTypeName,
    setSelectedTypeName
  } = useAlarmData();

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

    //初回ページロード時のみ設備リストを更新するようにする
    if (machineList.length!=0) return;

    fetchMachineList();
  }, []);

  // 日付バリデーション関数
  const validateDates = () => {
    let hasError = false;
    const now = new Date();

    // 開始日のバリデーション
    if (startDate) {
      if (startDate > dayjs(now)) {
        setStartDateError(true);
        setStartDateErrorMessage("開始日は現在時刻より前に設定してください");
        hasError = true;
      } else {
        setStartDateError(false);
        setStartDateErrorMessage("");
      }
    }

    // 終了日のバリデーション
    if (endDate) {
      const endDateObj = endDate.toDate();
      if (endDateObj > now) {
        setEndDateError(true);
        setEndDateErrorMessage("終了日は現在時刻より前に設定してください");
        hasError = true;
      } else {
        setEndDateError(false);
        setEndDateErrorMessage("");
      }
    }

    // 開始日と終了日の関係チェック
    if (startDate && endDate) {
      const startDateObj = startDate.toDate();
      const endDateObj = endDate.toDate();
      if (startDateObj >= endDateObj) {
        setStartDateError(true);
        setStartDateErrorMessage("開始日は終了日より前に設定してください");
        hasError = true;
      }
    }

    return !hasError;
  };

  // 開始日変更時のハンドラ
  const handleStartDateChange = (date) => {
    setStartDate(date ? dayjs(date) : null);
    setStartDateError(false);
    setStartDateErrorMessage("");
  };

  // 終了日変更時のハンドラ
  const handleEndDateChange = (date) => {
    setEndDate(date ? dayjs(date) : null);
    setEndDateError(false);
    setEndDateErrorMessage("");
  };

  // アラームダウンロードを実行する関数
  const downloadAlarm = async () => {
    // 日付バリデーション
    if (!validateDates()) {
      return;
    }

    setAlarmDetailMap(null);
    setStopTimeMap(null);
    setStopCountMap(null);
    setTypeNameList(null);
    setIsGraph(null);
    setIsError(false);
    setErrorMessage("");

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
        body: JSON.stringify({
          machine_id: parseInt(machineName),
          start_date: startDate.format("YYYY-MM-DD HH:mm:00"),
          end_date: endDate.format("YYYY-MM-DD HH:mm:00"),
        }),
      });

      const data = await response.json();
      if (data.success) {

        if(Object.keys(data.alarm_detail_map).length===0){
          setIsError(true);
          setErrorMessage("指定された日付範囲でデータが存在しませんでした");
        }else{
          console.log("処理成功:", data);
          //各データをsetする
          setAlarmDetailMap(data.alarm_detail_map);
          setStopTimeMap(data.stop_time_map);
          setStopCountMap(data.stop_count_map);
          setTypeNameList(Object.keys(data.stop_time_map));
          setIsGraph(true);
        }
        setDownloads(false);
      } else {
        console.log("処理失敗:", data);
        setDownloads(false);
        setIsError(true);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setIsError(true);
      setDownloads(false);
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
      <div className="mt-8 max-w-4xl">
        {/* アラームデータ */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">アラームデータのダウンロード</h2>
            <p className="text-sm text-gray-600 mb-6">対象装置のアラームデータをダウンロードします。</p>

            {/* 装置選択 */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <label className="text-base font-medium text-gray-700">装置 : CLT</label>
              <select
                className="h-10 w-30 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
              >
                {machineList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <label className="text-base font-medium text-gray-700">号機</label>
            </div>

            {/* 日付範囲選択 */}
            <div className="border border-gray-300 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">データ収集期間</h3>
              <div className="flex flex-wrap items-start gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">開始日</label>
                  <OriginalDatepicker
                    selected={startDate ? startDate.toDate() : null}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    value={startDate}
                    error={startDateError}
                    errorMessage={startDateErrorMessage}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">終了日</label>
                  <OriginalDatepicker
                    selected={endDate ? endDate.toDate() : null}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    value={endDate}
                    error={endDateError}
                    errorMessage={endDateErrorMessage}
                  />
                </div>
              </div>
            </div>

            {/* ダウンロードボタン */}
            <div>
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

      {isGraph ? 
      <div style={{marginTop:"20px"}}>
        {/* combox 表示 */}
        <div style={{marginBottom: "20px"}}>
        <label style={{marginRight: "10px", fontWeight: "bold"}}>表示機種:</label>
        <select
            value={selectedTypeName || ""}
            onChange={(e) => {
                setSelectedTypeName(e.target.value === "" ? null : e.target.value);
            }}
            style={{
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                minWidth: "200px"
            }}
        >
            {typeNameList.map(item => (
                <option key={item} value={item}>{item}</option>
            ))}
        </select>
        </div>
        {/* histogram 表示 */}
        <AlarmHistogram
          selectedTypeName={selectedTypeName}
          alarmDetailMap={alarmDetailMap}
          stopCountMap={stopCountMap}
          stopTimeMap={stopTimeMap}
        />
      </div>
      : null}
    </>
  );
}
