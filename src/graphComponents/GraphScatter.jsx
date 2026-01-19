import React, { useRef, useEffect, useMemo } from 'react';
import { Chart, Series, Title, XAxis, YAxis, setHighcharts } from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import { scatter_plot_x_axis_items, scatter_plot_y_axis_items } from '../Variables/ScatterPlotData';
import { getKeyByValue } from '../utils/helpers';

setHighcharts(Highcharts);

// カラーパレット定義
const ALARM_COLOR_PALETTE = [
    '#FF0000', // 赤
    '#FF3333', // 明るい赤
    '#CC0000', // 濃い赤
    '#FF6666', // ピンク赤
    '#FF1744', // 深紅
    '#D32F2F', // マット赤
    '#E53935', // ビビッド赤
    '#C62828', // ダークレッド
];

const NORMAL_COLOR_PALETTE = [
    '#1976D2', // 青
    '#388E3C', // 緑
    '#F57C00', // オレンジ
    '#7B1FA2', // 紫
    '#0097A7', // シアン
    '#5D4037', // 茶
    '#616161', // グレー
    '#455A64', // ブルーグレー
    '#0288D1', // 明るい青
    '#689F38', // ライトグリーン
];

function GraphScatter(props) {
    const result_data = props.resultData;
    const graph_condition = props.graphCondition;
    const chartRef = useRef(null);

    // バックエンドから受け取ったデータ構造に対応
    const raw_data = result_data.graph_data;

    const x_axis_item = graph_condition.graph_x_item;
    const y_axis_item = graph_condition.graph_y_item;

    // 色の割り当てをuseMemoで安定化
    const colorMapping = useMemo(() => {
        const keys = Object.keys(raw_data);
        const mapping = {};
        let alarmIndex = 0;
        let normalIndex = 0;
        let alarmMarkerIndex = 0;

        keys.forEach(key => {
            if (key.includes("alarm")) {
                mapping[key] = ALARM_COLOR_PALETTE[alarmIndex % ALARM_COLOR_PALETTE.length];
                alarmIndex++;
            } else {
                mapping[key] = NORMAL_COLOR_PALETTE[normalIndex % NORMAL_COLOR_PALETTE.length];
                normalIndex++;
            }

            // アラームマーカーの色も事前に割り当て
            mapping[`${key}_alarm`] = ALARM_COLOR_PALETTE[alarmMarkerIndex % ALARM_COLOR_PALETTE.length];
            alarmMarkerIndex++;
        });

        return mapping;
    }, [raw_data]);

    const getColorForKey = (key) => {
        return colorMapping[key];
    };

    const getAlarmMarkerColor = (key) => {
        return colorMapping[`${key}_alarm`];
    };

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
        <Chart
            ref={chartRef}
            boost={{
                useGPUTranslations: true,
                seriesThreshold: 1
            }}
            containerProps={{style:{height:"600px"}}}
        >
            <XAxis
                {...(x_axis_item.includes("DATE") && {
                    type: "datetime",
                    labels: {
                        format: '{value:%Y-%m-%d %H:%M:%S}'
                    }
                })}
            >
                {getKeyByValue(scatter_plot_x_axis_items,x_axis_item)}
            </XAxis>
            <YAxis>{getKeyByValue(scatter_plot_y_axis_items,y_axis_item)}</YAxis>
            {x_axis_item.includes("DATE") ?
                Object.keys(raw_data).flatMap((key)=>{
                    const normalData = [];
                    const alarmData = [];

                    raw_data[key].forEach((p)=>{
                        const xValue=p["Scatter"]["x_data"]["DateData"]
                        const yValue=p["Scatter"]["y_data"]
                        const isAlarm=p["Scatter"]["is_alarm"]

                        if (isAlarm){
                            alarmData.push({
                                x:xValue,
                                y:yValue
                            });
                        }else{
                            normalData.push({
                                x:xValue,
                                y:yValue
                            });
                        }
                    });

                    const series = [];

                    // 通常データのSeries
                    if (normalData.length > 0) {
                        seriesNames.current.push(key);
                        series.push(
                            <Series
                                key={key}
                                type="scatter"
                                name={String(key)}
                                color={getColorForKey(key)}
                                zIndex={1}
                                data={normalData}
                            />
                        );
                    }

                    // アラームデータのSeries（最前面）
                    if (alarmData.length > 0) {
                        seriesNames.current.push(`${key} (Alarm)`);
                        series.push(
                            <Series
                                key={`${key}_alarm`}
                                type="scatter"
                                name={String(`${key} (Alarm)`)}
                                color={getAlarmMarkerColor(key)}
                                zIndex={1000}
                                marker={{
                                    enabled: true,
                                    radius: 8,
                                    lineWidth: 2,
                                    lineColor: '#FFFFFF'
                                }}
                                data={alarmData}
                            />
                        );
                    }

                    return series;
                })
                :
                Object.keys(raw_data).flatMap((key)=>{
                    const normalData = [];
                    const alarmData = [];

                    raw_data[key].forEach((p)=>{
                        const xValue=p["Scatter"]["x_data"]["NumberData"]
                        const yValue=p["Scatter"]["y_data"]
                        const isAlarm=p["Scatter"]["is_alarm"]

                        if (isAlarm){
                            alarmData.push({
                                x:xValue,
                                y:yValue
                            });
                        }else{
                            normalData.push({
                                x:xValue,
                                y:yValue
                            });
                        }
                    });

                    const series = [];

                    // 通常データのSeries
                    if (normalData.length > 0) {
                        seriesNames.current.push(key);
                        series.push(
                            <Series
                                key={key}
                                type="scatter"
                                name={String(key)}
                                color={getColorForKey(key)}
                                zIndex={1}
                                data={normalData}
                            />
                        );
                    }

                    // アラームデータのSeries（最前面）
                    if (alarmData.length > 0) {
                        seriesNames.current.push(`${key} (Alarm)`);
                        series.push(
                            <Series
                                key={`${key}_alarm`}
                                type="scatter"
                                name={String(`${key} (Alarm)`)}
                                color={getAlarmMarkerColor(key)}
                                zIndex={1000}
                                marker={{
                                    enabled: true,
                                    radius: 8,
                                    lineWidth: 2,
                                    lineColor: '#FFFFFF'
                                }}
                                data={alarmData}
                            />
                        );
                    }

                    return series;
                })
            }
        </Chart>
    )
}

export default GraphScatter
