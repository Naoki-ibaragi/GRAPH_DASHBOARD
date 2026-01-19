import { useState, useEffect } from "react";
import { useConfig } from "../contexts/ConfigContext";

function Settings() {
  const { config, saveConfig, isLoading } = useConfig();

  // ローカルステート（編集中の値を保持）
  const [graphDataUrl, setGraphDataUrl] = useState("");
  const [lotDataUrl, setLotDataUrl] = useState("");
  const [machineListUrl, setMachineListUrl] = useState("");
  const [alarmDataUrl, setAlarmDataUrl] = useState("");
  const [operationDataUrl, setOperationDataUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // 設定が読み込まれたらローカルステートに反映
  useEffect(() => {
    if (config) {
      setGraphDataUrl(config.graph_data_url || "");
      setLotDataUrl(config.lot_data_url || "");
      setMachineListUrl(config.machine_list_url || "");
      setAlarmDataUrl(config.alarm_data_url || "");
      setOperationDataUrl(config.operation_data_url || "");
    }
  }, [config]);

  // 設定を保存
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const newConfig = {
      graph_data_url: graphDataUrl,
      lot_data_url: lotDataUrl,
      machine_list_url: machineListUrl,
      alarm_data_url: alarmDataUrl,
      operation_data_url: operationDataUrl,
    };

    const result = await saveConfig(newConfig);

    if (result.success) {
      setSaveSuccess(true);
      // 3秒後に成功メッセージを消す
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error || "設定の保存に失敗しました");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <p className="text-gray-600">設定を読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">アプリの設定</h2>

          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <span className="text-lg w-72">グラフデータ取得先URL</span>
              <input
                type="text"
                placeholder="http://127.0.0.1:8080/get_graphdata"
                className="w-[500px] px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={graphDataUrl}
                onChange={(e) => setGraphDataUrl(e.target.value)}
              />
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-lg w-72">ロットデータ取得先URL</span>
              <input
                type="text"
                placeholder="http://127.0.0.1:8080/download_lot"
                className="w-[500px] px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={lotDataUrl}
                onChange={(e) => setLotDataUrl(e.target.value)}
              />
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-lg w-72">装置一覧取得先URL</span>
              <input
                type="text"
                placeholder="http://127.0.0.1:8080/get_machine_list"
                className="w-[500px] px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={machineListUrl}
                onChange={(e) => setMachineListUrl(e.target.value)}
              />
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-lg w-72">アラームデータ取得先URL</span>
              <input
                type="text"
                placeholder="http://127.0.0.1:8080/download_alarm"
                className="w-[500px] px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={alarmDataUrl}
                onChange={(e) => setAlarmDataUrl(e.target.value)}
              />
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-lg w-72">稼働データ取得先URL</span>
              <input
                type="text"
                placeholder="http://127.0.0.1:8080/download_operating_data"
                className="w-[500px] px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                value={operationDataUrl}
                onChange={(e) => setOperationDataUrl(e.target.value)}
              />
            </div>


            <div className="flex items-center gap-4 mt-8">
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
              >
                {isSaving ? "保存中..." : "設定内容を更新"}
              </button>

              {saveSuccess && (
                <span className="text-green-600 font-medium">設定を保存しました</span>
              )}

              {saveError && (
                <span className="text-red-600 font-medium">
                  エラー: {saveError.toString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
