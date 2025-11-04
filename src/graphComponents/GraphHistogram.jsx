import {Chart,Series,Title,XAxis,YAxis,Legend,PlotOptions,setHighcharts} from '@highcharts/react';
import Histogram from '@highcharts/react/series/histogram';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import 'highcharts/modules/histogram-bellcurve.src.js';
import { histogram_axis_items} from "../Variables/HistogramData";
setHighcharts(Highcharts);

//構造体の値からキーを逆算する関数
const getKeyByValue = (obj, value) => {
    return Object.keys(obj).find((key) => obj[key] === value);
};

export default function GraphHistogram(props) {
    const result_data=props.resultData;
    const graph_condition=props.graphCondition;

    const raw_data=result_data.graph_data; //{"data1":[x1,x2,x3..],"data2":[x1,x2,x3...],...}形式
    const x_axis_item=graph_condition.graph_x_item;
    const bin_num=graph_condition.bin_number;
    console.log(raw_data);

    return (
        <Histogram>
            <Title>Histogram</Title>
            <XAxis>{getKeyByValue(histogram_axis_items,x_axis_item)}</XAxis>

            {Object.keys(raw_data).map((key)=>(
                key.includes("alarm")?
                <Series
                    type="histogram" 
                    name={key}
                    binsNumber={bin_num}
                    color="#FF0000"
                    zIndex="100"
                    data={raw_data[key].map((p)=>p.x)}
                />:
                <Series
                    type="histogram" 
                    name={key}
                    binsNumber={bin_num}
                    data={raw_data[key].map((p)=>p.x)}
                />
            ))}
        </Histogram>
  );
}

