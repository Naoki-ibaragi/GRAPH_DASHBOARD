import React from 'react';
import { Chart, Series, Title, XAxis, YAxis, setHighcharts } from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import { scatter_plot_x_axis_items, scatter_plot_y_axis_items } from '../Variables/ScatterPlotData';
import { getKeyByValue } from '../utils/helpers';

setHighcharts(Highcharts);

function GraphScatter(props) {
    const result_data = props.resultData;
    const graph_condition = props.graphCondition;

    const raw_data = result_data.graph_data;
    const x_axis_item = graph_condition.graph_x_item;
    const y_axis_item = graph_condition.graph_y_item;

    return (
        <Chart
            boost={{
                useGPUTranslations: true,
                seriesThreshold: 1
            }}
            containerProps={{style:{height:"600px"}}}
        >
            <Title>ScatterPlot</Title>
            <XAxis>{getKeyByValue(scatter_plot_x_axis_items,x_axis_item)}</XAxis>
            <YAxis>{getKeyByValue(scatter_plot_y_axis_items,y_axis_item)}</YAxis>
            {Object.keys(raw_data).map((key)=>(
                key.includes("alarm") ?
                <Series
                    type="scatter"
                    name={key}
                    color="#FF0000"
                    zIndex="100"
                    data={raw_data[key].map((p)=>[p.x,p.y])}
                />:
                <Series
                    type="scatter"
                    name={key}
                    data={raw_data[key].map((p)=>[p.x,p.y])}
                />
            ))}
        </Chart>
    )
}

export default GraphScatter