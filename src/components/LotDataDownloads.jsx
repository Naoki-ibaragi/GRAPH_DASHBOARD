import { useEffect, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import LotDataTable from "../TableComponents/LotDataTable";

export default function LotDataDownloads() {
  const [lotNumber, setLotNumber] = useState(""); //バックエンドに送信するロット番号
  const [validationError, setValidationError] = useState(false); //設備名入力時のエラーの有無
  const [downloads, setDownloads] = useState(false); //ダウンロード中かどうか
  const [isError, setIsError] = useState(false); //ダウンロードタスク中にエラーがでたかどうか
  const [downloadsState, setDownloadsState] = useState(""); //ダウンロード状況表示
  const [columnHeader, setColumnHeader] = useState(null); //バックエンドから受け取った各カラムのヘッダー名
  const [lotUnitData, setLotUnitData] = useState(null); //バックエンドから受け取った設備単位のアラームデータ一覧
  const [isTable, setIsTable] = useState(false); //データを受け取ってテーブルを表示するかどうか

  //invoke処理が完了するとテーブルを表示する
  useEffect(() => {
    if (lotUnitData == null || columnHeader == null) {
      setIsTable(false);
      return;
    }
    setIsTable(true);
  }, [lotUnitData, columnHeader]);

  // ロットデータのダウンロード処理(REST API)
  const downloadLotData = async () => {
    //ロット名のバリデーションを入れる
    if (lotNumber.length != 10) {
      setValidationError(true);
      return;
    } else {
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
      const response = await fetch("http://127.0.0.1:8080/download_lot", {
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
      setColumnHeader(data.lot_header);
      setLotUnitData(data.lot_data);
      setDownloads(false);
      setIsError(false);
    } catch (error) {
      console.error("データ取得エラー:", error);
      setIsError(true);
      setDownloads(false);
      setDownloadsState(`処理失敗: ${error.message}`);
    }
  };

  //テーブルをcsvで出力
  const exportCSV = async () => {
    // ヘッダー行
    const header = columnHeader.join(",");

    // データ行（各行を個別にカンマ区切りにしてから改行で結合）
    const rows = lotUnitData.map((row) => row.join(","));

    // ヘッダーとデータを結合
    const csvContent = [header, ...rows].join("\n");

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
                {validationError && <p className="text-red-600 text-sm mt-1.5">ロット名は10文字で記入してください</p>}
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
      {downloads || isError ? (
        <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <h3 className="text-xl font-semibold text-gray-800">グラフデータを取得中...</h3>
            <p className="text-sm text-gray-600">{downloadsState}</p>
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
      {isTable ? <LotDataTable columnHeader={columnHeader} lotUnitData={lotUnitData}></LotDataTable> : null}
    </>
  );
}
