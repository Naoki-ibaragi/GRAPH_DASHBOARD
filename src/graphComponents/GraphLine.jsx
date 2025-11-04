import React from 'react'
import {Chart,Series,Title,XAxis,YAxis,Legend,setHighcharts} from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import { line_plot_x_axis_items,line_plot_y_axis_items } from '../Variables/LinePlotData';
setHighcharts(Highcharts);

//構造体の値からキーを逆算する関数
const getKeyByValue = (obj, value) => {
  return Object.keys(obj).find((key) => obj[key] === value);
};

function GraphLine(props) {
    const result_data=props.resultData;
    const graph_condition=props.graphCondition;

    const raw_data=result_data.graph_data; //{"data1":[{x:m,y:n},{x:p,y:q}...],"data2":[{x:m,y:n},{x:p,y:q}...],...}形式
    const x_axis_item=graph_condition.graph_x_item;
    const y_axis_item=graph_condition.graph_y_item;
    console.log(raw_data);

    return (
        <Chart
            boost={{
                useGPUTranslations: true,
                seriesThreshold: 1
            }}
            containerProps={{style:{height:"600px"}}}
        >
            <Title>LinePlot</Title>
            <XAxis>{getKeyByValue(line_plot_x_axis_items,x_axis_item)}</XAxis>
            <YAxis>{getKeyByValue(line_plot_y_axis_items,y_axis_item)}</YAxis>
            {Object.keys(raw_data).map((key)=>(
                key.includes("alarm") ?
                <Series
                    type="line"
                    name={key}
                    color="#FF0000"
                    zIndex="100"
                    data={raw_data[key].map((p)=>[p.x,p.y])}
                />:
                <Series
                    type="line"
                    name={key}
                    data={raw_data[key].map((p)=>[p.x,p.y])}
                />
            ))}
        </Chart>
    )
}

export default GraphLine
