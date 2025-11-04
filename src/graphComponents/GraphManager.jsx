/*適切なグラフコンポーネントを返す */
import React from 'react'
import GraphHeatmap from "../graphComponents/GraphHeatmap";
import GraphScatter from "../graphComponents/GraphScatter";
import GraphLine from "../graphComponents/GraphLine";
import GraphHistogram from "../graphComponents/GraphHistogram";

const GraphManager=React.memo((props)=>{
    const graph_condition=props.graphCondition;
    const resultData=props.resultData;
    const graph_type=graph_condition.graph_type;
    let graphComponent;

    console.log("graph_type",graph_type);

    if (graph_type==="ScatterPlot" && resultData){
        graphComponent=<GraphScatter resultData={resultData} graphCondition={graph_condition}></GraphScatter>
    }else if(graph_type==="LinePlot" && resultData){
        graphComponent=<GraphLine resultData={resultData} graphCondition={graph_condition}></GraphLine>
    }else if(graph_type==="Histogram" && resultData){
        graphComponent=<GraphHistogram resultData={resultData} graphCondition={graph_condition}></GraphHistogram>
    }else if(graph_type==="DensityPlot" && resultData){
        graphComponent=<GraphHeatmap resultData={resultData} graphCondition={graph_condition}></GraphHeatmap>
    }else{
        graphComponent=<></>
    }

    console.log("graphComponent",graphComponent);
    return graphComponent;
});

export default GraphManager;
