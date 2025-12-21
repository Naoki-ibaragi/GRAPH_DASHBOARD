import React, { useRef, useEffect } from 'react';
import { Chart, Series, Title, XAxis, YAxis, setHighcharts } from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';
import 'highcharts/modules/boost';
import { line_plot_y_axis_items } from '../Variables/LinePlotData';
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

function GraphLine(props) {
    const result_data = props.resultData;
    const graph_condition = props.graphCondition;
    const chartRef = useRef(null);

    const raw_data = result_data.graph_data;
    const x_axis_item = graph_condition.graph_x_item;
    const y_axis_item = graph_condition.graph_y_item;

    // キーをalarmとnormalに分類してインデックスを管理
    const keys = Object.keys(raw_data);
    let alarmIndex = 0;
    let normalIndex = 0;

    const getColorForKey = (key) => {
        if (key.includes("alarm")) {
            const color = ALARM_COLOR_PALETTE[alarmIndex % ALARM_COLOR_PALETTE.length];
            alarmIndex++;
            return color;
        } else {
            const color = NORMAL_COLOR_PALETTE[normalIndex % NORMAL_COLOR_PALETTE.length];
            normalIndex++;
            return color;
        }
    };

    // アラームポイントのマーカー色を取得（インデックスベース）
    let alarmMarkerIndex = 0;
    const getAlarmMarkerColor = () => {
        const color = ALARM_COLOR_PALETTE[alarmMarkerIndex % ALARM_COLOR_PALETTE.length];
        alarmMarkerIndex++;
        return color;
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
            <XAxis>
            </XAxis>
            <YAxis>{getKeyByValue(line_plot_y_axis_items,y_axis_item)}</YAxis>
                {Object.keys(raw_data).map((key)=>{
                    seriesNames.current.push(key);
                    return (
                        <Series
                            key={key}
                            type="line"
                            name={String(key)}
                            color={getColorForKey(key)}
                            zIndex={key.includes("alarm") ? 100 : undefined}
                            data={raw_data[key].map((p)=>{
                                const yValue = p["Line"]["y_data"];
                                const isAlarm = p["Line"]["is_alarm"];

                                // アラームの場合、マーカーに個別の色を設定
                                if (isAlarm) {
                                    return {
                                        y: yValue,
                                        marker: {
                                            fillColor: getAlarmMarkerColor(),
                                            enabled: true
                                        }
                                    };
                                }
                                return yValue;
                            })}
                        />
                    );
                })}
        </Chart>
    )
}

export default GraphLine
