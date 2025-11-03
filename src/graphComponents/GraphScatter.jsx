import React from 'react'
import {Chart,Series,Title,XAxis,YAxis,Legend,setHighcharts} from '@highcharts/react';
import { Scatter } from '@highcharts/react/series';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
setHighcharts(Highcharts);

function GraphScatter(props) {
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
        >
            {Object.keys(raw_data).map((key)=>(
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