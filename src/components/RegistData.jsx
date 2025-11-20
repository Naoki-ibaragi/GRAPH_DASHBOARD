import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog"; // ファイルダイアログ用
import { invoke } from "@tauri-apps/api/core"; //rustバックエンドでの処理用
import { listen } from "@tauri-apps/api/event";

function RegistData() {
  const [filePath, setFilePath] = useState("D:\\testspace\\csv_data"); // DB登録用のテキストデータのパス
  const [typeName, setTypeName] = useState(""); //バックエンドに送る機種名
  const [isProcess, setIsProcess] = useState(false); //バックエンドで処理中かどうか
  const [isError, setIsError] = useState(false); //バックエンドで処理でエラーが発生した場合true
  const [state, setState] = useState("処理開始"); //処理状況
  const [historyList, setHistoryList] = useState([]);

  // コンポーネントマウント時にリスナーを設定
  useEffect(() => {
    let unlistenProgress;
    let unlistenComplete;

    const setupListeners = async () => {
      // 進捗イベントのリスナー
      unlistenProgress = await listen("regist_data-progress", (event) => {
        const payload = event.payload;
        console.log(`進捗: ${payload.progress}% - ${payload.message}`);
        setState(`${payload.message}`);
      });

      // 完了イベントのリスナー
      unlistenComplete = await listen("regist_data-complete", (event) => {
        const payload = event.payload;

        if (payload.success) {
          console.log("処理成功:", payload.data);
          setIsProcess(false);
          setHistoryList((prev) => [...prev, { file_path: payload.data.file_path, result: true }]);
        } else {
          console.error("処理失敗:", payload.error);
          setIsError(true);
          setIsProcess(false);
          setHistoryList((prev) => [...prev, { file_path: payload.data.file_path, result: false }]);
        }
      });
    };

    setupListeners();

    // クリーンアップ
    return () => {
      if (unlistenProgress) unlistenProgress();
      if (unlistenComplete) unlistenComplete();
    };
  }, []);

  //ファイルパスをダイアログから選択
  const selectFilePath = async () => {
    const selected = await open({
      directory: false, // フォルダ選択モード
      multiple: false, // 複数選択しない
    });

    if (selected) {
      setFilePath(selected); // 選択されたフォルダパスを state に反映
    }
  };

  // バックエンドにフォルダパスを送って登録処理を走らせる
  const registData = async () => {
    setIsError(false); //処理開始前にエラーをリセットする
    setIsProcess(true); //処理フラグを立てて進捗を表示する
    try {
      // バックエンドのコマンドを呼び出し（即座に戻る）
      await invoke("regist_data", { filePath: filePath, typeName: typeName });
      setIsError(false);
    } catch (error) {
      console.error("コマンド呼び出しエラー:", error);
      setIsError(true);
      setHistoryList((prev) => [...prev, { file_path: filePath, result: false }]);
      unlistenProgress();
      unlistenComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ロット情報のDBへの登録</h2>
          <p className="text-sm text-gray-600 mb-6">テキストデータのフォルダパスの入力</p>
          <div className="flex gap-4 items-center mb-6">
            <input
              type="text"
              placeholder="フォルダパス"
              className="w-[500px] px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
            />
            <button
              onClick={selectFilePath}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              ファイル選択
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">機種名の入力</p>
          <div className="flex gap-4 items-center mb-6">
            <input
              type="text"
              placeholder="機種名"
              className="w-[500px] px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
            />
          </div>
          <button
            disabled={!filePath}
            onClick={registData}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            DBへデータを登録
          </button>
        </div>
      </div>

      {/*処理状況の表示*/}
      {isProcess || isError ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <p className="text-sm text-gray-700 mb-3">{`処理状況 - ${state}`}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/*処理履歴を最後部に表示する*/}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">処理履歴</h3>
          <div className="space-y-2">
            {historyList.map((h, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${h.result ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <p className="text-sm">
                  <span className="font-medium">{h.file_path}</span> -{" "}
                  <span className={h.result ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                    {h.result ? "成功" : "失敗"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistData;
