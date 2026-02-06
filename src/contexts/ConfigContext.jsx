import { createContext, useState, useEffect, useContext } from "react";
import { invoke } from "@tauri-apps/api/core";

// ConfigContext の作成
const ConfigContext = createContext();

// Context を利用するための Hook
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};

// ConfigProvider コンポーネント
export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    graph_data_url: "http://127.0.0.1:8080/get_graphdata",
    lot_data_url: "http://127.0.0.1:8080/download_lot",
    machine_list_url: "http://127.0.0.1:8080/get_machine_list",
    alarm_data_url: "http://127.0.0.1:8080/download_alarm",
    lot_data_analysis_url: "http://127.0.0.1:8080/lot_data_analysis",
    operation_data_url: "http://127.0.0.1:8080/download_operating_data",
    event_data_url: "http://127.0.0.1:8080/download_event_data",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 設定を読み込む
  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const loadedConfig = await invoke("get_app_config");
      setConfig(loadedConfig);
      setError(null);
    } catch (err) {
      console.error("設定の読み込みに失敗しました:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 設定を保存する
  const saveConfig = async (newConfig) => {
    try {
      await invoke("save_app_config", { config: newConfig });
      setConfig(newConfig);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error("設定の保存に失敗しました:", err);
      setError(err);
      return { success: false, error: err };
    }
  };

  // 初回マウント時に設定を読み込む
  useEffect(() => {
    loadConfig();
  }, []);

  const value = {
    config,
    isLoading,
    error,
    loadConfig,
    saveConfig,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};
