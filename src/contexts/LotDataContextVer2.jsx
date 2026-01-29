import { createContext, useContext, useState } from "react";

const LotDataContextVer2 = createContext();

export function LotDataVer2Provider({ children }) {
  const [lotNumber, setLotNumber] = useState(""); //バックエンドに送信するロット番号
  const [validationError, setValidationError] = useState(false); //設備名入力時のエラーの有無
  const [downloads, setDownloads] = useState(false); //ダウンロード中かどうか
  const [isError, setIsError] = useState(false); //ダウンロードタスク中にエラーがでたかどうか
  const [errorMessage, setErrorMessage] = useState(""); //表示するエラーメッセージ
  const [downloadsState, setDownloadsState] = useState(""); //ダウンロード状況表示
  const [lotUnitData, setLotUnitData] = useState(null); //バックエンドから受け取った設備単位のアラームデータ一覧
  const [isTable, setIsTable] = useState(false); //データを受け取ってテーブルを表示するかどうか

  return (
    <LotDataContextVer2.Provider
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
        lotUnitData,
        setLotUnitData,
        isTable,
        setIsTable
      }}
    >
      {children}
    </LotDataContextVer2.Provider>
  );
}

export function useLotDataVer2() {
  const context = useContext(LotDataContextVer2);
  if (!context) {
    throw new Error("useLotData must be used within LotDataProvider");
  }
  return context;
}
