import React, { useRef, useEffect } from 'react';
import { Title, XAxis, setHighcharts, Chart } from '@highcharts/react';
import { Series } from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import { histogram_axis_items } from '../Variables/HistogramData';
import { getKeyByValue } from '../utils/helpers';

setHighcharts(Highcharts);

export default function GraphHistogram(props) {
    const result_data = props.resultData;
    const graph_condition = props.graphCondition;
    const chartRef = useRef(null);

    const graph_data = result_data.graph_data;
    const grid_data = result_data.grid_data;
    const x_axis_item = graph_condition.graph_x_item;

    const processHistogramData = (data) => {
        if (!data || !Array.isArray(data)) return [];

        return data.map((item) => {
            const histData = item.BinnedHistogram;
            return {
                x: histData.bin_index,
                y: histData.count
            };
        });
    };

    const getBinCategories = () => {
        if (!grid_data?.histogram_bin_info?.bin_edges) return [];

        const binEdges = grid_data.histogram_bin_info.bin_edges;
        const categories = [];

        for (let i = 0; i < binEdges.length - 1; i++) {
            const start = binEdges[i].toFixed(0);
            const end = binEdges[i + 1].toFixed(0);
            categories.push(`${start} - ${end}`);
        }

        return categories;
    };

    const isMultipleSeries = () => {
        if (!graph_data) return false;

        if (Array.isArray(graph_data.data)) {
            return false;
        }

        return typeof graph_data === 'object';
    };

    const categories = getBinCategories();
    const multipleSeries = isMultipleSeries();

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
    }, [graph_data]);

    // シリーズ名の配列をリセット
    seriesNames.current = [];

    return (
        <>
        <Chart ref={chartRef}>
            <XAxis
                categories={categories}
                labels={{
                    rotation: -45,
                    style: {
                        fontSize: '10px'
                    }
                }}
            >
                {getKeyByValue(histogram_axis_items, x_axis_item)}
            </XAxis>

            {multipleSeries ? (
                Object.keys(graph_data).map((key) => {
                    const chartData = processHistogramData(graph_data[key]);
                    const isAlarm = key.includes("alarm");
                    seriesNames.current.push(key);

                    return (
                        <Series
                            key={key}
                            type="column"
                            name={String(key)}
                            data={chartData}
                            color={isAlarm ? "#FF0000" : undefined}
                            zIndex={isAlarm ? 100 : undefined}
                            pointPlacement={0}
                        />
                    );
                })
            ) : (
                (() => {
                    seriesNames.current.push("Histogram");
                    return (
                        <Series
                            type="column"
                            name={String("Histogram")}
                            data={processHistogramData(graph_data.data)}
                            color="#7cb5ec"
                            pointPlacement={0}
                        />
                    );
                })()
            )}
        </Chart>
        <div>
            <p className='bg-white'>BIN幅 : {grid_data.histogram_bin_info.bin_width}</p>
        </div>
        </>
    );
}

