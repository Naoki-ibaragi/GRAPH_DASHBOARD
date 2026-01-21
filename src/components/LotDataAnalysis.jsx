import { useEffect } from "react";
import { useConfig } from "../contexts/ConfigContext";
import { useLotDataAnalysis } from "../contexts/LotDataAnalysisContext";
import { Chart, Series, XAxis, YAxis, setHighcharts } from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import { analysis_data_items } from "../Variables/AnalysisData";

setHighcharts(Highcharts);

export default function LotDataAnalysis() {
  // 設定を取得
  const { config } = useConfig();
  const {
    lotNumber,
    setLotNumber,
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
    displayItem,
    setDisplayItem,
    displayEvent,
    setDisplayEvent,
    itemComboMenu,
    eventComboMenu,
    setEventComboMenu,
    lotData,
    setLotData,
    eventData,
    setEventData
  }=useLotDataAnalysis();

  //invoke処理が完了するとテーブルを表示する
  useEffect(() => {
    if (lotData == null) {
      setIsGraph(false);
      return;
    }
    setIsGraph(true);
  }, [lotData, setIsGraph]);

  // ロットデータのダウンロード処理(REST API)
  const downloadLotData = async () => {
    //ロット名のバリデーションを入れる
    if (lotNumber.length === 0) {
      setValidationError(true);
      return;
    } else {
      setValidationError(false);
    }

    setLotData(null); //データの初期化
    setEventData(null); //データの初期化
    setEventComboMenu([]); //データの初期化
    setIsGraph(false); //グラフの削除

    //ダウンロードタスクをセットする
    setDownloads(true);
    setDownloadsState("データ取得開始");

    try {
      // REST APIにリクエストを送信
      const response = await fetch(config.lot_data_analysis_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lot_name: lotNumber }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("処理成功:", data);
      if (data.success){
        //データを整理する
        const eventData=data.event_data;
        const lotData=data.lot_data;


        //eventデータからeventCombMenuを取得する
        // 値を取り出すヘルパー関数（オブジェクト形式 {Str: "値"}, {Num: 123} に対応）
        const extractVal = (val) => {
          if (val === null || val === undefined || val === "None") return null;
          if (typeof val === 'object' && val !== null) {
            if (val.Str !== undefined) return val.Str;
            if (val.Num !== undefined) return val.Num;
            if (val.Number !== undefined) return val.Number;
            if (val.Int !== undefined) return val.Int;
            if (val.Float !== undefined) return val.Float;
            const keys = Object.keys(val);
            if (keys.length === 1) return val[keys[0]];
          }
          return val;
        };

        let comboMenu=[]
        eventData.forEach((arr)=>{
          const event_name = extractVal(arr[1]);
          const alarm_unit = extractVal(arr[3]);
          const alarm_detail = extractVal(arr[5]);

          if (event_name==="ALARM"){
            let menu_name=alarm_unit+"_"+alarm_detail;
            if (!comboMenu.includes(menu_name)) comboMenu.push(menu_name);
          }else{
            if (!comboMenu.includes(event_name)) comboMenu.push(event_name);
          }
        });

        setEventComboMenu(comboMenu);
        setLotData(data.lot_data);
        setEventData(data.event_data);
        setIsGraph(true);
        setDownloads(false);
        setIsError(false);
      }else{
        setDownloads(false);
        setIsError(true);
        setErrorMessage(`${data.message}`);
      }
    } catch (error) {
      console.error("データ取得エラー:", error);
      setIsError(true);
      setDownloads(false);
      setDownloadsState(`処理失敗: ${error.message}`);
      setErrorMessage(`処理失敗: ${error.message}`);
    }
  };

  // 値を取り出すヘルパー関数（オブジェクト形式 {Str: "値"}, {Num: 123} に対応）
  const extractValue = (val) => {
    // null, undefined, "None"文字列はnullとして扱う
    if (val === null || val === undefined || val === "None") return null;
    if (typeof val === 'object' && val !== null) {
      // {Str: "値"}, {Num: 123} などの形式に対応
      if (val.Str !== undefined) return val.Str;
      if (val.Num !== undefined) return val.Num;
      if (val.Number !== undefined) return val.Number;
      if (val.Int !== undefined) return val.Int;
      if (val.Float !== undefined) return val.Float;
      // その他のオブジェクト形式
      const keys = Object.keys(val);
      if (keys.length === 1) return val[keys[0]];
    }
    return val;
  };

  /* backendから取得したデータを使用してグラフを作成(complexグラフで) */
  const createAnalysisGraph = (lotData, eventData, displayItem, displayEvent) => {
    console.log("=== createAnalysisGraph called ===");
    console.log("lotData:", lotData ? `${lotData.length} rows` : "null");
    console.log("displayItem:", displayItem);

    if (!lotData || !displayItem) {
      console.log("Early return: lotData or displayItem is null/undefined");
      return null;
    }

    const yItemColumn = analysis_data_items[displayItem];
    const scatterData = []; // [x, y]の形式で散布図データを格納
    const eventDateData = []; // イベント発生日時

    // デバッグ: データ構造を確認
    console.log("=== createAnalysisGraph Debug ===");
    console.log("displayItem:", displayItem);
    console.log("yItemColumn:", yItemColumn);
    console.log("lotData.length:", lotData.length);
    if (lotData.length > 0) {
      console.log("lotData sample (first row):", lotData[0]);
      console.log("arr[7] (date raw):", lotData[0][7]);
      console.log("arr[7] (date extracted):", extractValue(lotData[0][7]));
      console.log("arr[yItemColumn] (raw):", lotData[0][yItemColumn]);
      console.log("arr[yItemColumn] (extracted):", extractValue(lotData[0][yItemColumn]));
    }

    // 散布図データの配列を作成する
    lotData.forEach((arr, index) => {
      const rawYValue = extractValue(arr[yItemColumn]);
      if (rawYValue !== "None" && rawYValue != null) {
        const rawXValue = extractValue(arr[7]); // LD_PICKUP_DATE
        const xValue = new Date(rawXValue).getTime();
        const yValue = parseFloat(rawYValue);
        if (!isNaN(yValue) && !isNaN(xValue)) {
          scatterData.push([xValue, yValue]);
        } else if (index < 3) {
          console.log(`Row ${index}: xValue=${xValue}, yValue=${yValue} - SKIPPED (NaN)`);
        }
      } else if (index < 3) {
        console.log(`Row ${index}: rawYValue=${rawYValue} - SKIPPED (null/None)`);
      }
    });

    console.log("scatterData.length:", scatterData.length);
    if (scatterData.length > 0) {
      console.log("scatterData sample:", scatterData.slice(0, 3));
    }

    // EventDateの配列を作成する
    const standardEvents = ["LOTSTART", "START", "STOP", "LOTEND", "LOCK_STOP", "NOLOCK_STOP"];
    if (displayEvent && eventData) {
      if (standardEvents.includes(displayEvent)) {
        // ALARMイベント以外
        eventData.forEach((arr) => {
          const eventName = extractValue(arr[1]);
          if (eventName === displayEvent) {
            const rawDate = extractValue(arr[2]);
            eventDateData.push(new Date(rawDate).getTime());
          }
        });
      } else {
        // アラームイベント
        eventData.forEach((arr) => {
          const alarm_unit = extractValue(arr[3]);
          const alarm_detail = extractValue(arr[5]);
          if (displayEvent === alarm_unit + "_" + alarm_detail) {
            const rawDate = extractValue(arr[2]);
            eventDateData.push(new Date(rawDate).getTime());
          }
        });
      }
    }

    // 垂直線（plotLines）の設定を作成
    const plotLines = eventDateData.map((timestamp, index) => ({
      id: `event-line-${index}`,
      value: timestamp,
      color: 'red',
      width: 2,
      dashStyle: 'Dash',
      label: {
        text: displayEvent,
        rotation: 0,
        style: {
          color: 'red',
          fontSize: '10px'
        }
      },
      zIndex: 5
    }));

    return (
      <Chart
        boost={{
          useGPUTranslations: true,
          seriesThreshold: 1
        }}
        containerProps={{ style: { height: "600px" } }}
      >
        <XAxis
          type="datetime"
          plotLines={plotLines}
        >
          LD_PICKUP_DATE
        </XAxis>
        <YAxis>{displayItem}</YAxis>
        <Series
          type="scatter"
          name={displayItem}
          zIndex={1}
          data={scatterData}
        />
      </Chart>
    );
  };

  return (
    <>
      <div className="mt-8 max-w-2xl">
        {/* ロット単位稼働データのダウンロード */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ロットデータ解析</h2>
            <p className="text-sm text-gray-600 mb-1">1ロット分の稼働データを解析します</p>
            <p className="text-sm text-gray-600 mb-6">下記にロット番号を入力後、ダウンロード開始ボタンを押してください。</p>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ロット番号"
                  className={`w-full px-4 py-2.5 border ${
                    validationError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary-500"
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                />
                {validationError && <p className="text-red-600 text-sm mt-1.5">ロット名を入力してください</p>}
              </div>
              <button
                onClick={() => downloadLotData()}
                disabled={downloads}
                className="w-52 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
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
        {/* 表示アイテム選択コンボボックス */}
        <div style={{marginBottom: "20px"}}>
            <label style={{marginRight: "42px", fontWeight: "bold"}}>表示項目:</label>
            <select
                value={displayItem || ""}
                onChange={(e) => {
                    console.log("displayItem changed to:", e.target.value);
                    setDisplayItem(e.target.value === "" ? null : e.target.value);
                }}
                style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    minWidth: "200px"
                }}
            >
                {itemComboMenu.map(item => (
                    <option key={item} value={item}>{item}</option>
                ))}
            </select>
        </div>

        {/* 表示イベント選択コンボボックス */}
        <div style={{marginBottom: "20px"}}>
            <label style={{marginRight: "10px", fontWeight: "bold"}}>表示イベント:</label>
            <select
                value={displayEvent || ""}
                onChange={(e) => setDisplayEvent(e.target.value === "" ? null : e.target.value)}
                style={{
                    padding: "8px 12px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    minWidth: "200px"
                }}
            >
                <option value="">-- 選択してください --</option>
                {eventComboMenu.map(evt => (
                    <option key={evt} value={evt}>{evt}</option>
                ))}
            </select>
        </div>
        {createAnalysisGraph(lotData, eventData, displayItem, displayEvent)}
      </div>
      : null}
    </>
  );
}
