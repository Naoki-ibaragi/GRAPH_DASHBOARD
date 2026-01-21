import { createContext, useContext, useState } from "react";
import { analysis_data_items } from "../Variables/AnalysisData";

const LotDataAnalysisContext = createContext();

export function LotDataAnalysisProvider({ children }) {
  const [lotNumber, setLotNumber] = useState(""); //バックエンドに送信するロット番号
  const [validationError, setValidationError] = useState(false); //設備名入力時のエラーの有無
  const [downloads, setDownloads] = useState(false); //ダウンロード中かどうか
  const [isError, setIsError] = useState(false); //ダウンロードタスク中にエラーがでたかどうか
  const [errorMessage, setErrorMessage] = useState(""); //表示するエラーメッセージ
  const [downloadsState, setDownloadsState] = useState(""); //ダウンロード状況表示
  const [isGraph, setIsGraph] = useState(false); //データを受け取ってテーブルを表示するかどうか
  const [lotData,setLotData]=useState(null);
  const [eventData,setEventData]=useState(null);
  const [displayItem, setDisplayItem] = useState("シリアル"); //何のデータをグラフに表示するか
  const [displayEvent, setDisplayEvent] = useState(null); //何のイベントをグラフに表示するか
  const [itemComboMenu, setItemComboMenu] = useState(Object.keys(analysis_data_items)); //何のデータをグラフに表示するか
  const [eventComboMenu, setEventComboMenu] = useState([]); //何のイベントをグラフに表示するか

  return (
    <LotDataAnalysisContext.Provider
      value={{
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
        setEventData,
      }}
    >
      {children}
    </LotDataAnalysisContext.Provider>
  );
}

export function useLotDataAnalysis() {
  const context = useContext(LotDataAnalysisContext);
  if (!context) {
    throw new Error("useLotData must be used within LotDataProvider");
  }
  return context;
}
