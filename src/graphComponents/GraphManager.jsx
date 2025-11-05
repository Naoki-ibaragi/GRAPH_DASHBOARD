import React from 'react';
import GraphHeatmap from '../graphComponents/GraphHeatmap';
import GraphScatter from '../graphComponents/GraphScatter';
import GraphLine from '../graphComponents/GraphLine';
import GraphHistogram from '../graphComponents/GraphHistogram';
import { GRAPH_TYPES } from '../constants/graphConfig';

const GraphManager = React.memo((props) => {
    const graph_condition = props.graphCondition;
    const resultData = props.resultData;
    const graph_type = graph_condition.graph_type;

    if (!resultData) {
        return null;
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
