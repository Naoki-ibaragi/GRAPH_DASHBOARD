import { useEffect, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { lot_table_headers } from "../Variables/LotTableHeader";
import LotDataTable from "../TableComponents/LotDataTable";
import { useConfig } from "../contexts/ConfigContext";
import { useLotData } from "../contexts/LotDataContext";

export default function LotDataDownloads() {
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
    lotUnitData,
    setLotUnitData,
    isTable,
    setIsTable
  }=useLotData();

  //invoke処理が完了するとテーブルを表示する
  useEffect(() => {
    if (lotUnitData == null) {
      setIsTable(false);
      return;
    }
    setIsTable(true);
  }, [lotUnitData]);

  // ロットデータのダウンロード処理(REST API)
  const downloadLotData = async () => {
    //ロット名のバリデーションを入れる
    if (lotNumber.length === 0) {
      setValidationError(true);
      return;
    } else {
      setValidationError(false);
    }

    setLotUnitData(null); //データの初期化
    setIsTable(false); //テーブルの削除

    //ダウンロードタスクをセットする
    setDownloads(true);
    setDownloadsState("データ取得開始");

    try {
      // REST APIにリクエストを送信
      const response = await fetch(config.lot_data_url, {
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
        setLotUnitData(data.lot_data);
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

  //テーブルをcsvで出力
  const exportCSV = async () => {
    // ヘッダー行
    const header_arr=Object.keys(lot_table_headers);

    // データ行（各行を個別にカンマ区切りにしてから改行で結合）
    let datas=[];
    Object.keys(lotUnitData).map((chip_key)=>{
        const unit_vec=[];
        const chip_unit_data=lotUnitData[chip_key];

        Object.keys(chip_unit_data).map((data_key,idx)=>{
            const data_type=lot_table_headers[header_arr[idx]]; //num or str
            if (chip_unit_data[data_key]==="None"){
                unit_vec.push("");
            }else if (data_type in chip_unit_data[data_key]){
                unit_vec.push(chip_unit_data[data_key][data_type]);
            }else{
                unit_vec.push("");
            }
        });
        datas.push(unit_vec);
    });
    // ヘッダーとデータを結合
    const csvContent = [header_arr, ...datas].join("\n");

    // ファイル保存ダイアログを開く
    const filePath = await save({
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
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
  };

  return (
    <>
      <div className="mt-8 max-w-2xl">
        {/* ロット単位稼働データのダウンロード */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ロットデータのダウンロード</h2>
            <p className="text-sm text-gray-600 mb-1">1ロット分の稼働データをダウンロードします。</p>
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

      {isTable ? (
        <button
          onClick={exportCSV}
          className="mt-6 mb-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          テーブルをCSVに出力
        </button>
      ) : null}
      {isTable ? <LotDataTable lotUnitData={lotUnitData}></LotDataTable> : null}
    </>
  );
}
