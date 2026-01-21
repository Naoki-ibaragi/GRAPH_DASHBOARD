import { Chart, Series, XAxis, YAxis, Tooltip, Legend, setHighcharts } from "@highcharts/react";
import Highcharts from "highcharts/highcharts";
import ParetoModule from "highcharts/modules/pareto";

// Paretoモジュールを初期化
setHighcharts(Highcharts);

// 秒を時:分:秒形式に変換
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
};

export default function AlarmHistogramTime({
  selectedTypeName,
  alarmDetailMap,
  stopCountMap,
  stopTimeMap,
}) {
  const typedStopCountMap = stopCountMap[selectedTypeName] || {};
  const typedStopTimeMap = stopTimeMap[selectedTypeName] || {};

  // no_alarm_stopを除外し、停止時間でソート
  const entries = Object.entries(typedStopTimeMap)
    .filter(([key]) => key !== "no_alarm_stop")
    .sort((a, b) => b[1] - a[1]);

  const categories = entries.map(([key]) => key);
  const stopTimes = entries.map(([_, value]) => value);
  const stopCounts = entries.map(([key]) => typedStopCountMap[key] || 0);
  const details = entries.map(([key]) => alarmDetailMap[key] || "");
  let sum=0;
  entries.map(([_,value])=>sum+=value);
  const timeRatio=entries.map(([_,value])=>value*100/sum);

  return (
    <Chart
      containerProps={{ style: { height: "400px" } }}
    >
      <XAxis
        categories={categories}
        labels={{
          rotation: -45,
          style: {
            fontSize: "11px",
          },
        }}
      />
      <YAxis id="stoptime-axis">
        停止時間 (秒)
      </YAxis>
      <YAxis id="cumulative-axis" opposite min={0} max={100}>
        累積比率 (%)
      </YAxis>
      <Tooltip
        shared={true}
        useHTML
        formatter={function () {
          if (!this.points || this.points.length === 0) return "";
          const index = this.point ? this.point.index : 0;
          const data = stopTimes[index];
          if (!data) return '';
          const validIndex = index >= 0 ? index : 0;
          let tooltip = `<b>${categories[validIndex]}</b><br/>`;
          tooltip += `詳細: ${details[validIndex]}<br/>`;
          tooltip += `停止時間: ${stopTimes[validIndex]}秒 (${formatTime(stopTimes[validIndex])})<br/>`;
          tooltip += `停止回数: ${stopCounts[validIndex]}回<br/>`;
          if (this.points.length > 1 && this.points[1]) {
            tooltip += `累積比率: ${timeRatio[validIndex].toFixed(1)}%`;
          }
          return tooltip;
        }}
      />
      <Legend />
      <Series
        type="pareto"
        name="累積比率"
        yAxis="cumulative-axis"
        zIndex={10}
        baseSeries={1}
        opposite={true}
        tooltip={{
          valueSuffix: "%",
        }}
      />
      <Series
        name="停止時間"
        type="column"
        yAxis="stoptime-axis"
        data={stopTimes}
        color="#4472C4"
      />
    </Chart>
  );
}
