import { useEffect, useState, useMemo, memo } from "react";

// メモ化されたセルコンポーネント - 0の値にはTooltipを表示しない
const MemoizedCell = memo(({ value, index, explanation }) => {
  if (index >= 4 && value !== 0 && value !== "0") {
    return (
      <div className="group relative inline-block">
        <span className="cursor-help">{value}</span>
        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-lg">
          {explanation}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }
  return <span>{value}</span>;
});

MemoizedCell.displayName = "MemoizedCell";

// メモ化された行コンポーネント
const MemoizedRow = memo(({ row, columnWidth, columnWidth_alarm, explanation_list }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {row.map((cell, c_index) => (
        <td
          key={c_index}
          className={`
            text-center py-3 px-2 border-r border-gray-200
            ${c_index < 4 ? "sticky bg-white z-10" : ""}
            ${c_index === 3 ? "border-r-2 border-gray-400 shadow-[2px_0_4px_rgba(0,0,0,0.1)]" : ""}
          `}
          style={{
            left: c_index < 4 ? `${c_index * columnWidth}px` : "auto",
            minWidth: c_index < 4 ? `${columnWidth}px` : `${columnWidth_alarm}px`,
            width: c_index < 4 ? `${columnWidth}px` : `${columnWidth_alarm}px`,
          }}
        >
          <MemoizedCell value={cell} index={c_index} explanation={c_index >= 4 ? explanation_list[c_index - 4] : ""} />
        </td>
      ))}
    </tr>
  );
});

MemoizedRow.displayName = "MemoizedRow";

function AlarmTable({ alarmCodes, machineUnitData }) {
  if (!alarmCodes || !machineUnitData) return null;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // データが変わったら再レンダリング状態にする
  useEffect(() => {
    setIsRendering(true);
    // 少し遅延させてからレンダリング完了とする
    const timer = setTimeout(() => {
      setIsRendering(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [alarmCodes, machineUnitData]);

  // ヘッダーとデータをメモ化
  const { header_list, explanation_list, rows } = useMemo(() => {
    const unit_list = ["ld", "dc1", "ac1", "ac2", "dc2", "ip", "uld"];
    let header_list = ["ロット名", "機種名", "ロット開始時刻", "ロット終了時刻"];
    let explanation_list = [];

    // header一覧
    unit_list.forEach((unit) => {
      const alarm_code_list = alarmCodes[`${unit}_alarm`];
      if (alarm_code_list) {
        Object.keys(alarm_code_list).forEach((alarm_code) => {
          header_list.push(`${unit.toUpperCase()}_${alarm_code}`);
          explanation_list.push(`${unit.toUpperCase()} : ${alarm_code_list[alarm_code]}`);
        });
      }
    });

    // 各行のレコード
    const rows = Object.keys(machineUnitData).map((key) => {
      const lot = machineUnitData[key];
      const lot_data = [key, lot.type_name, lot.lot_start_time, lot.lot_end_time];
      unit_list.forEach((unit) => {
        Object.values(lot.alarm_list[`${unit}_alarm`]).forEach((alarm_value) => {
          lot_data.push(alarm_value);
        });
      });
      return lot_data;
    });

    return { header_list, explanation_list, rows };
  }, [alarmCodes, machineUnitData]);

  const columnWidth = 150;
  const columnWidth_alarm = 50;

  // レンダリング中はローディング表示
  if (isRendering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 mt-6">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-600">テーブルを描画中...</p>
      </div>
    );
  }

  return (
    <div
      className="mt-6 bg-white rounded-xl shadow-lg overflow-auto scrollbar-thin"
      style={{
        maxHeight: "600px",
        maxWidth: `${windowWidth * 0.96}px`,
      }}
    >
      <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
        <thead className="sticky top-0 z-20">
          <tr>
            {header_list.map((header, index) => (
              <th
                key={index}
                className={`
                  text-center font-bold py-3 px-2 bg-gray-100 border-r border-gray-200
                  ${index < 4 ? "sticky z-30" : "z-20"}
                  ${index === 3 ? "border-r-2 border-gray-400 shadow-[2px_0_4px_rgba(0,0,0,0.1)]" : ""}
                `}
                style={{
                  left: index < 4 ? `${index * columnWidth}px` : "auto",
                  top: 0,
                  minWidth: index < 4 ? `${columnWidth}px` : `${columnWidth_alarm}px`,
                  width: index < 4 ? `${columnWidth}px` : `${columnWidth_alarm}px`,
                }}
              >
                {index >= 4 ? (
                  <div className="group relative inline-block">
                    <span className="cursor-help">{header}</span>
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
                      {explanation_list[index - 4]}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ) : (
                  header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r_index) => (
            <MemoizedRow
              key={r_index}
              row={row}
              columnWidth={columnWidth}
              columnWidth_alarm={columnWidth_alarm}
              explanation_list={explanation_list}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AlarmTable;
