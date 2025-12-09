import React from 'react';
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

    // バックエンドから受け取ったデータ構造に対応
    const raw_data = result_data.graph_data;
    console.log("graph_data:", raw_data);

    const x_axis_item = graph_condition.graph_x_item;
    const y_axis_item = graph_condition.graph_y_item;

    // キーをalarmとnormalに分類してインデックスを管理
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

    return (
        <Chart
            boost={{
                useGPUTranslations: true,
                seriesThreshold: 1
            }}
            containerProps={{style:{height:"600px"}}}
        >
            <Title>ScatterPlot</Title>
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
                Object.keys(raw_data).map((key)=>(
                    <Series
                        key={key}
                        type="scatter"
                        name={key}
                        color={getColorForKey(key)}
                        zIndex={key.includes("alarm") ? 100 : undefined}
                        data={raw_data[key].map((p)=>[new Date(p["Scatter"]["x_data"]["DateData"]).getTime(),p["Scatter"]["y_data"]])}
                    />
                ))
                :
                Object.keys(raw_data).map((key)=>(
                    <Series
                        key={key}
                        type="scatter"
                        name={key}
                        color={getColorForKey(key)}
                        zIndex={key.includes("alarm") ? 100 : undefined}
                        data={raw_data[key].map((p)=>[p["Scatter"]["x_data"]["NumberData"],p["Scatter"]["y_data"]])}
                    />
                ))
            }
        </Chart>
    )
}

export default GraphScatter
