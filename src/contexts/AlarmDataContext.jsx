import { createContext, useContext, useState } from "react";
import dayjs from "dayjs";

const AlarmDataContext = createContext();

export function AlarmDataProvider({ children }) {
  const [machineUnitData, setMachineUnitData] = useState(null);
  const [machineName, setMachineName] = useState("");
  const [validationError, setValidationError] = useState(false); //設備名入力時のエラーの有無
  const [downloads, setDownloads] = useState(false); //ダウンロード中かどうか
  const [isError, setIsError] = useState(false); //ダウンロードタスク中にエラーがでたかどうか
  const [errorMessage, setErrorMessage] = useState(""); //ダウンロード失敗時のメッセージを表示
  const [downloadsState, setDownloadsState] = useState(""); //ダウンロード状況表示
  const [isTable, setIsTable] = useState(false); //データを受け取ってテーブルを表示するかどうか
  const [machineList, setMachineList] = useState([]); //設備名一覧
  const [startDate, setStartDate] = useState(dayjs().subtract(7, "day")); //データ収集開始日（デフォルト: 7日前）
  const [endDate, setEndDate] = useState(dayjs()); //データ収集終了日（デフォルト: 今日）
  const [startDateError, setStartDateError] = useState(false); //開始日のバリデーションエラー
  const [endDateError, setEndDateError] = useState(false); //終了日のバリデーションエラー
  const [startDateErrorMessage, setStartDateErrorMessage] = useState(""); //開始日のエラーメッセージ
  const [endDateErrorMessage, setEndDateErrorMessage] = useState(""); //終了日のエラーメッセージ

  return (
    <AlarmDataContext.Provider
      value={{
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
        isTable,
        setIsTable,
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
        setEndDateErrorMessage
      }}
    >
      {children}
    </AlarmDataContext.Provider>
  );
}

export function useAlarmData() {
  const context = useContext(AlarmDataContext);
  if (!context) {
    throw new Error("useAlarmData must be used within AlarmDataProvider");
  }
  return context;
}
