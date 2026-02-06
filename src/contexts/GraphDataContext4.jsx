import { createContext, useContext, useState } from "react";
import dayjs from "dayjs";
import { filter_items } from "../VariablesVer2/FilterData";

const GraphDataContext = createContext();

export function GraphDataProvider4({ children }) {
  const [graphType, setGraphType] = useState("ScatterPlot");
  const [xdimItem, setXdimItem] = useState("SERIAL");
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

  const [alarmNumbersString,setAlarmNumbersString]=useState("");

  const clearGraphData = () => {
    setResultData(null);
    setIsGraph(false);
    setGraphCondition({});
  };

  return (
    <GraphDataContext.Provider
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
        alarmNumbersString,
        setAlarmNumbersString
      }}
    >
      {children}
    </GraphDataContext.Provider>
  );
}

export function useGraphData4() {
  const context = useContext(GraphDataContext);
  if (!context) {
    throw new Error("useGraphData must be used within GraphDataProvider");
  }
  return context;
}
