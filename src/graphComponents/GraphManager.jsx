import React, { useState, useEffect } from "react";
import GraphHeatmap from "../graphComponents/GraphHeatmap";
import GraphScatter from "../graphComponents/GraphScatter";
import GraphLine from "../graphComponents/GraphLine";
import GraphHistogram from "../graphComponents/GraphHistogram";
import { GRAPH_TYPES } from "../constants/graphConfig";

const GraphManager = React.memo((props) => {
  const graph_condition = props.graphCondition;
  const resultData = props.resultData;
  const graph_type = graph_condition.graph_type;
  const [isRendering, setIsRendering] = useState(true);

  console.log("graph_type", graph_type);

  useEffect(() => {
    // データが変わったら再レンダリング状態にする
    setIsRendering(true);
    const timer = setTimeout(() => {
      setIsRendering(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [resultData, graph_condition]);

  if (!resultData) {
    return null;
  }

  // レンダリング中はローディング表示
  if (isRendering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 mt-4">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <h3 className="text-xl font-semibold text-gray-800">グラフを描画中...</h3>
      </div>
    );
  }

  switch (graph_type) {
    case GRAPH_TYPES.SCATTER:
      return <GraphScatter resultData={resultData} graphCondition={graph_condition} />;
    case GRAPH_TYPES.LINE:
      return <GraphLine resultData={resultData} graphCondition={graph_condition} />;
    case GRAPH_TYPES.HISTOGRAM:
      return <GraphHistogram resultData={resultData} graphCondition={graph_condition} />;
    case GRAPH_TYPES.DENSITY:
      return <GraphHeatmap resultData={resultData} graphCondition={graph_condition} />;
    default:
      return null;
  }
});

export default GraphManager;
