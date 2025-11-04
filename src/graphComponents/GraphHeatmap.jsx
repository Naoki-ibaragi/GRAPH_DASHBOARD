import {Chart,Series,Title,XAxis,YAxis,Legend,setHighcharts} from '@highcharts/react';
import Heatmap from '@highcharts/react/series/Heatmap';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import "highcharts/modules/heatmap.src.js";
import { scatter_plot_x_axis_items,scatter_plot_y_axis_items} from "../Variables/ScatterPlotData";
setHighcharts(Highcharts);

//構造体の値からキーを逆算する関数
const getKeyByValue = (obj, value) => {
return Object.keys(obj).find((key) => obj[key] === value);
};

export default function GraphHeatmap(props) {
    const result_data=props.resultData;
    const graph_condition=props.graphCondition;

    const raw_data=result_data.graph_data; //{"data1":[{x:m,y:n,z:l},{x:p,y:q,z:r}...],"data2":[{x:m,y:n,z:l},{x:p,y:q,z:r}...],...}形式
    const x_axis_item=graph_condition.graph_x_item;
    const y_axis_item=graph_condition.graph_y_item;
    console.log(raw_data);

    return (
        <Chart
            options={{
                colorAxis: {
                    min: 1,
                    minColor: '#FFFFFF',
                    maxColor: '#0000FF',
                },
                boost:{
                    useGPUTranslations: true,
                    seriesThreshold: 1
                },
            }}
            containerProps={{style:{height:"620px"}}}
        >
            <Title>DensityPlot</Title>
            <XAxis>{getKeyByValue(scatter_plot_x_axis_items,x_axis_item)}</XAxis>
            <YAxis>{getKeyByValue(scatter_plot_y_axis_items,y_axis_item)}</YAxis>
            <Legend
                align='right'
                layout='vertical'
                itemMarginTop={10}
                verticalAlign='top'
                y={10}
                symbolHeight={520}
            />
            {Object.keys(raw_data).map((key)=>(
                <Series
                    type="heatmap"
                    name={key}
                    data={raw_data[key].map((p)=>[p.x,p.y,p.z])}
                />
            ))}
        </Chart>
  );
}

