import { createContext, useContext, useState } from "react";
import dayjs from "dayjs";
import { filter_items } from "../Variables/FilterData";

const GraphDataContext2 = createContext();

export function GraphDataProvider2({ children }) {
  const [graphType, setGraphType] = useState("ScatterPlot");
  const [xdimItem, setXdimItem] = useState("CONTINUOUS");
  const [ydimItem, setYdimItem] = useState("SERIAL");
  const [alarmUnit, setAlarmUnit] = useState("LD");
  const [alarmNumbers, setAlarmNumbers] = useState([]);
  const [operator, setOperator] = useState("and");
  const [plotUnit, setPlotUnit] = useState("None");
  const [binNumber, setBinNumber] = useState(50);
  const [binsX, setBinsX] = useState(50);
  const [binsY, setBinsY] = useState(50);
  const [filters, setFilters] = useState([
    { enable: false, item: filter_items[Object.keys(filter_items)[0]], value: "", comparison: "=" }
  ]);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "month"));
  const [endDate, setEndDate] = useState(dayjs());
  const [closeSettingCard, setCloseSettingCard] = useState(false);

  const [resultData, setResultData] = useState(null);
  const [isGraph, setIsGraph] = useState(false);
  const [graphCondition, setGraphCondition] = useState({});

  const clearGraphData = () => {
    setResultData(null);
    setIsGraph(false);
    setGraphCondition({});
  };

  return (
    <GraphDataContext2.Provider
      value={{
        graphType,
        setGraphType,
        xdimItem,
        setXdimItem,
        ydimItem,
        setYdimItem,
        alarmUnit,
        setAlarmUnit,
        alarmNumbers,
        setAlarmNumbers,
        operator,
        setOperator,
        plotUnit,
        setPlotUnit,
        binNumber,
        setBinNumber,
        binsX,
        setBinsX,
        binsY,
        setBinsY,
        filters,
        setFilters,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        closeSettingCard,
        setCloseSettingCard,
        resultData,
        setResultData,
        isGraph,
        setIsGraph,
        graphCondition,
        setGraphCondition,
        clearGraphData,
      }}
    >
      {children}
    </GraphDataContext2.Provider>
  );
}

export function useGraphData2() {
  const context = useContext(GraphDataContext2);
  if (!context) {
    throw new Error("useGraphData2 must be used within GraphDataProvider2");
  }
  return context;
}
