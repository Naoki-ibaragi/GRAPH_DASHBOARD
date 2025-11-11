import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import GraphHeatmap from '../graphComponents/GraphHeatmap';
import GraphScatter from '../graphComponents/GraphScatter';
import GraphLine from '../graphComponents/GraphLine';
import GraphHistogram from '../graphComponents/GraphHistogram';
import { GRAPH_TYPES } from '../constants/graphConfig';

const GraphManager = React.memo((props) => {
    const graph_condition = props.graphCondition;
    const resultData = props.resultData;
    const graph_type = graph_condition.graph_type;
    const [isRendering, setIsRendering] = useState(true);

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
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 400,
                    gap: 2,
                    mt: 2,
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" gutterBottom>
                    グラフを描画中...
                </Typography>
            </Box>
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
