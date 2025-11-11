import { createContext, useContext, useState } from "react";

const GraphDataContext = createContext();

export function GraphDataProvider({ children }) {
  const [graphType, setGraphType] = useState("ScatterPlot");
  const [xdimItem, setXdimItem] = useState("");
  const [ydimItem, setYdimItem] = useState("");
  const [resultData, setResultData] = useState(null);
  const [isGraph, setIsGraph] = useState(false);
  const [graphCondition, setGraphCondition] = useState({});

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
    </GraphDataContext.Provider>
  );
}

export function useGraphData() {
  const context = useContext(GraphDataContext);
  if (!context) {
    throw new Error("useGraphData must be used within GraphDataProvider");
  }
  return context;
}
