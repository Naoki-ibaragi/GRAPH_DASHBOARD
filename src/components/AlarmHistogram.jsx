import AlarmHistogramTime from "./AlarmHistogramTime";
import AlarmHistogramCount from "./AlarmHistogramCount";

export default function AlarmHistogram({
  selectedTypeName,
  alarmDetailMap,
  stopCountMap,
  stopTimeMap,
}) {
  return (
    <div>
      <div>
        <AlarmHistogramTime
          selectedTypeName={selectedTypeName}
          alarmDetailMap={alarmDetailMap}
          stopCountMap={stopCountMap}
          stopTimeMap={stopTimeMap}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <AlarmHistogramCount
          selectedTypeName={selectedTypeName}
          alarmDetailMap={alarmDetailMap}
          stopCountMap={stopCountMap}
          stopTimeMap={stopTimeMap}
        />
      </div>
    </div>
  );
}
