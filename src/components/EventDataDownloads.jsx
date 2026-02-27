import { useEffect, useState } from "react";
import { useConfig } from "../contexts/ConfigContext";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import dayjs from "dayjs";
import { OriginalDatepicker } from "../utils/datepicker";
import { useEventData } from "../contexts/EventDataContext";
import { isObject } from "highcharts";
import EventTable from "../TableComponents/EventTable";

export default function EventDataDownloads() {
  // 設定を取得
  const { config } = useConfig();

  // グローバルステートから取得
  const { 
    resultData,
    setResultData,
    machineName,
    setMachineName,
    downloads,
    setDownloads,
    isError,
    setIsError,
    errorMessage,
    setErrorMessage,
    downloadsState,
    setDownloadsState,
    isResult,
    setIsResult,
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
    lotName,
    setLotName,
    searchMode,
    setSearchMode,
  } = useEventData();

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
  const downloadOperationData = async () => {
    // 日付バリデーション
    if (!validateDates()) {
      return;
    }

    setResultData(null);
    setIsResult(false);
    setIsError(false);
    setErrorMessage("");

    //ダウンロードタスクをセットする
    setDownloads(true);
    setDownloadsState("ダウンロード開始");

    //tauri invokeからバックエンドapiへのfetchに仕様変更
    try {
      const response = await fetch(config.event_data_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search_mode: searchMode,
          lot_name:lotName,
          machine_id: parseInt(machineName),
          start_date: startDate.format("YYYY-MM-DD HH:mm:00"),
          end_date: endDate.format("YYYY-MM-DD HH:mm:00"),
        }),
      });

      // レスポンスステータスの確認
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status} ${response.statusText}`);
      }

      // レスポンスのテキストを取得
      const responseText = await response.text();

      // レスポンスが空でないか確認
      if (!responseText || responseText.trim() === '') {
        throw new Error('サーバーから空のレスポンスが返されました');
      }

      // JSONとしてパース
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSONパースエラー:', parseError);
        console.error('レスポンステキスト:', responseText);
        throw new Error('サーバーから不正なJSONが返されました');
      }

      if (data.success) {
        console.log("処理成功:", data);
        setIsResult(true);
        setResultData(data.summary_data);
        setDownloads(false);
      } else {
        console.log("処理失敗:", data);
        setIsResult(false);
        setDownloads(false);
        setIsError(true);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setIsError(true);
      setDownloads(false);
      setErrorMessage(error.message || String(error));
      console.error("コマンド呼び出しエラー:", error);
    }
  };

  //テーブルをcsvで出力
  const exportCSV = async () => {
    // ヘッダー行
    const header_arr=["装置ID","機種名","ロット名","時刻","イベント","アラームユニット","アラームコード","アラーム詳細"];

    // データ行（各行を個別にカンマ区切りにしてから改行で結合）
    let datas=[];
    resultData.forEach((rowArray)=>{
        const unit_vec=[];
        rowArray.forEach((data)=>{
          if(isObject(data) && Object.hasOwn(data,"Str")){
            unit_vec.push(data["Str"]);
          }else if(isObject(data) && Object.hasOwn(data,"Num")){
            unit_vec.push(data["Num"]);
          }else{
            unit_vec.push(data);
          }
        });
        datas.push(unit_vec);
    });
    // ヘッダーとデータを結合
    const csvContent = [header_arr, ...datas].join("\n");

    let filePath="";
    // ファイル保存ダイアログを開く
    if(searchMode==1){
      filePath = await save({
        filters: [{ name: "CSV Files", extensions: ["csv"] }],
        defaultPath: `machine_${machineName}_events.csv`,
      });
    }else{
      filePath = await save({
        filters: [{ name: "CSV Files", extensions: ["csv"] }],
        defaultPath: `${lotName}_events.csv`,
      });
    }
    if (filePath) {
      try {
        // plugin-fs を使ってファイルに書き込む（UTF-8 BOMを追加して文字化け防止）
        await writeTextFile(filePath, "\uFEFF" + csvContent);
        alert("CSVを保存しました！");
      } catch (error) {
        console.error("CSV保存エラー:", error);
        alert(`保存に失敗しました: ${error}`);
      }
    }
  };

  return (
    <>
      <div className="mt-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">イベントデータのダウンロード</h2>
            <p className="text-sm text-gray-600 mb-6">対象装置のイベントデータをダウンロードします。</p>
            {/* 日付範囲選択 */}
            <div className="border border-gray-300 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap mb-5">
                <h3 className="text-sm font-semibold text-gray-700">装置番号と期間を指定して検索</h3>
                <input
                  type="radio"
                  name="searchMode"
                  checked={searchMode==1}
                  onChange={() => setSearchMode(1)}
                  className="w-5 h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </div>
              {/* 装置選択 */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
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

            {/* ロット番号で指定 */}
            <div className="border border-gray-300 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap mb-5">
                <h3 className="text-sm font-semibold text-gray-700">ロット番号を使用して検索</h3>
                <input
                  type="radio"
                  name="searchMode"
                  checked={searchMode==2}
                  onChange={() => setSearchMode(2)}
                  className="w-5 h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </div>
              <input
                type="text"
                placeholder="ロット番号"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                value={lotName}
                onChange={(e)=>setLotName(e.target.value)}
              />
            </div>


            {/* ダウンロードボタン */}
            <div className="flex items-center gap-4">
              <div>
                <button
                  disabled={downloads}
                  onClick={() => downloadOperationData()}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  ダウンロード開始
                </button>
              </div>
              {isResult ? (
              <div>
                <button
                  onClick={exportCSV}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  テーブルをCSVに出力
                </button>
              </div>
              ) : null}
            </div>
 
          </div>
        </div>
      </div>

      {/* ダウンロード中リスト */}
      {downloads ? (
        <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <h3 className="text-xl font-semibold text-gray-800">イベントデータを取得中...</h3>
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

      {/* fetch結果表示 */}
      {isResult ? <EventTable resultData={resultData}></EventTable> : null}
    </>
  );
}
