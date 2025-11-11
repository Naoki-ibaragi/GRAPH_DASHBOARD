import { createContext, useContext, useState } from "react";

const AlarmDataContext = createContext();

export function AlarmDataProvider({ children }) {
  const [alarmCodes, setAlarmCodes] = useState(null);
  const [machineUnitData, setMachineUnitData] = useState(null);
  const [machineName, setMachineName] = useState("");

  const clearAlarmData = () => {
    setAlarmCodes(null);
    setMachineUnitData(null);
  };

  return (
    <AlarmDataContext.Provider
      value={{
        alarmCodes,
        setAlarmCodes,
        machineUnitData,
        setMachineUnitData,
        machineName,
        setMachineName,
        clearAlarmData,
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
