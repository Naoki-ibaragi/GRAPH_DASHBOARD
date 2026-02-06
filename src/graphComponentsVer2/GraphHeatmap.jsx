import React, { useRef, useEffect } from 'react';
import { Chart, Series, Title, Legend, setHighcharts } from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import 'highcharts/modules/heatmap.src.js';
import { scatter_plot_x_axis_items, scatter_plot_y_axis_items } from '../Variables/ScatterPlotData';
import { getKeyByValue } from '../utils/helpers';

setHighcharts(Highcharts);

export default function GraphHeatmap(props) {
    const result_data = props.resultData;
    const graph_condition = props.graphCondition;
    const chartRef = useRef(null);

    const raw_data = result_data.graph_data;
    const grid_len_x=result_data.grid_data.grid_x;
    const grid_len_y=result_data.grid_data.grid_y;
    const x_min=result_data.grid_data.x_min;
    const y_min=result_data.grid_data.y_min;
    const x_axis_item = graph_condition.graph_x_item;
    const y_axis_item = graph_condition.graph_y_item;

    // シリーズ名をマッピングするための配列を作成
    const seriesNames = useRef([]);

    // グラフ描画後にシリーズ名を書き換える
    useEffect(() => {
        if (chartRef.current && chartRef.current.chart) {
            const chart = chartRef.current.chart;
            chart.series.forEach((series, index) => {
                if (seriesNames.current[index]) {
                    series.update({ name: seriesNames.current[index] }, false);
                }
            });
            chart.redraw();
        }
    }, [raw_data]);

    // シリーズ名の配列をリセット
    seriesNames.current = [];

    return (
        <>
        <Chart
            ref={chartRef}
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
                xAxis: {
                    title: {
                        text: getKeyByValue(scatter_plot_x_axis_items,x_axis_item)
                    },
                    labels: {
                        formatter: function() {
                            return (x_min + this.value * grid_len_x).toFixed(2);
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: getKeyByValue(scatter_plot_y_axis_items,y_axis_item)
                    },
                    labels: {
                        formatter: function() {
                            return (y_min + this.value * grid_len_y).toFixed(2);
                        }
                    }
                }
            }}
            containerProps={{style:{height:"620px"}}}
        >
            <Legend
                align='right'
                layout='vertical'
                itemMarginTop={10}
                verticalAlign='top'
                y={10}
                symbolHeight={520}
            />
            {Object.keys(raw_data).map((key)=>{
                seriesNames.current.push(key);
                return (
                    <Series
                        key={key}
                        type="heatmap"
                        name={String(key)}
                        data={raw_data[key].map((p)=>[p["Heatmap"].x_data,p["Heatmap"].y_data,p["Heatmap"].z_data])}
                    />
                );
            })}
        </Chart>
        <div className='bg-white'>
            <p>X最小値 : {x_min}, X格子幅 : {grid_len_x}</p>
            <p>Y最小値 : {y_min}, Y格子幅 : {grid_len_y}</p>
        </div>
        </>
  );
}

