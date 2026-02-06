import { Chart, setHighcharts } from "@highcharts/react";
import Highcharts from "highcharts/highcharts";
import ParetoModule from "highcharts/modules/pareto";

// Paretoモジュールを初期化
if (typeof ParetoModule === 'function') {
  ParetoModule(Highcharts);
}
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
  let sum = 0;
  entries.map(([_, value]) => sum += value);
  const timeRatio = entries.map(([_, value]) => value * 100 / sum);

  const chartOptions = {
    chart: {
      height: 400
    },
    xAxis: {
      categories: categories,
      labels: {
        rotation: -45,
        style: {
          fontSize: "11px"
        }
      }
    },
    yAxis: [{
      id: 'stoptime-axis',
      title: {
        text: '停止時間 (秒)'
      }
    }, {
      id: 'cumulative-axis',
      title: {
        text: '累積比率 (%)'
      },
      opposite: true,
      min: 0,
      max: 100
    }],
    tooltip: {
      shared: true,
      useHTML: true,
      formatter: function () {
        if (!this.points || this.points.length === 0) return "";
        const index = this.points[0].point.index;
        const validIndex = index >= 0 ? index : 0;
        let tooltip = `<b>${categories[validIndex]}</b><br/>`;
        tooltip += `詳細: ${details[validIndex]}<br/>`;
        tooltip += `停止時間: ${stopTimes[validIndex]}秒 (${formatTime(stopTimes[validIndex])})<br/>`;
        tooltip += `停止回数: ${stopCounts[validIndex]}回<br/>`;
        tooltip += `累積比率: ${timeRatio[validIndex].toFixed(1)}%`;
        return tooltip;
      }
    },
    legend: {
      enabled: true
    },
    series: [{
      id: 'stoptime-series',
      name: '停止時間',
      type: 'column',
      yAxis: 0,
      data: stopTimes,
      color: '#4472C4'
    }, {
      type: 'pareto',
      name: '累積比率',
      yAxis: 1,
      zIndex: 10,
      baseSeries: 0,
      tooltip: {
        valueSuffix: '%'
      }
    }]
  };

  // 上位10位までのデータを取得
  const top10Data = entries.slice(0, 10).map(([key, value], index) => ({
    rank: index + 1,
    category: key,
    detail: alarmDetailMap[key] || "",
    stopTime: value,
    stopTimeFormatted: formatTime(value),
    ratio: (value * 100 / sum).toFixed(1)
  }));

  return (
    <div>
      <Chart options={chartOptions} />
      <div style={{ marginTop: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>順位</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>カテゴリ</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>詳細</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>停止時間</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>比率</th>
            </tr>
          </thead>
          <tbody>
            {top10Data.map((row) => (
              <tr key={row.rank}>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{row.rank}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{row.category}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{row.detail}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{row.stopTimeFormatted}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{row.ratio}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
