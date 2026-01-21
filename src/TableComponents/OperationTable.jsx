/*稼働結果を表示*/
import React, { useState, useRef, useEffect } from 'react';
import { Chart, Series, XAxis, YAxis, Tooltip, Legend, setHighcharts } from '@highcharts/react';
import Highcharts from 'highcharts/highcharts';
import ParetoModule from "highcharts/modules/pareto";

setHighcharts(Highcharts);

function OperationTable({resultData}) {
    const [isOpenLotUnitDataWindow,setIsOpenLotUnitDataWindow]=useState(false);
    const [lotUnitDataIndex,setLotUnitDataIndex]=useState(null);
    const [selectedTypeName,setSelectedTypeName]=useState(null);
    const lotDetailRef = useRef(null);

    if (!resultData) return null;

    // resultDataから異なるtype_nameのリストを作成
    const typeNameList = [...new Set(resultData.map(data => data.type_name))].sort();

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    //稼働時間(第一縦軸)、OEE、歩留(第二縦軸)の複合チャート
    const ComplexChart=({resultData})=>{
        // フィルタリングされたデータを取得
        const filteredData = selectedTypeName
            ? resultData.filter(data => data.type_name === selectedTypeName)
            : resultData;

        const categories = filteredData.map(data => data.type_name+"<br/>"+data.lot_name);
        const passChipData = filteredData.map(data => data.pass_chip_num);
        const failChipData = filteredData.map(data => data.fail_chip_num);
        const lineoutChipData = filteredData.map(data => data.lineout_chip_num);
        const goodYieldData = filteredData.map(data => data.good_yield);
        const oeeData = filteredData.map(data => data.oee_index);

        // OEE折れ線グラフクリック時のハンドラ
        const handleOeeClick = (e) => {
            if (e.point && e.point.index !== undefined) {
                const clickedIndex = e.point.index;
                // filteredDataのインデックスから元のresultDataのインデックスを取得
                const originalIndex = resultData.findIndex(
                    data => data.lot_name === filteredData[clickedIndex].lot_name
                );
                setLotUnitDataIndex(originalIndex);
                setIsOpenLotUnitDataWindow(true);
                // 詳細表示部分にスクロール
                setTimeout(() => {
                    if (lotDetailRef.current) {
                        lotDetailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        };

        return(
            <Chart containerProps={{ style: { height: "400px" } }}>
                <XAxis
                    categories={categories}
                    labels={{
                        rotation: -45,
                        style: {
                            fontSize: '11px'
                        }
                    }}
                />
                <YAxis id="chip-axis">
                    チップ数 (pcs)
                </YAxis>
                <YAxis id="percent-axis" opposite min={0} max={100}>
                    OEE・歩留 (%)
                </YAxis>
                <Tooltip
                    shared
                    useHTML
                    formatter={function() {
                        if (!this.points || this.points.length === 0) return '';
                        const index = this.point ? this.point.index : 0;
                        const data = filteredData[index];
                        if (!data) return '';

                        let tooltip = `<b>${data.lot_name}</b><br/>`;
                        tooltip += `機種: ${data.type_name}<br/>`;
                        //tooltip += `<hr style="margin:5px 0"/>`;
                        //tooltip += `<b>時間内訳:</b><br/>`;
                        //tooltip += `稼働時間: ${formatTime(data.start_time)}<br/>`;
                        //tooltip += `停止時間: ${formatTime(data.stop_time)}<br/>`;
                        //tooltip += `合計(ロット時間): ${formatTime(data.lot_time)}<br/>`;
                        //tooltip += `<hr style="margin:5px 0"/>`;
                        //tooltip += `<b>指標:</b><br/>`;
                        //tooltip += `歩留: ${data.good_yield.toFixed(2)}%<br/>`;
                        //tooltip += `OEE: ${data.oee_index.toFixed(2)}%<br/>`;
                        //tooltip += `<hr style="margin:5px 0"/>`;
                        //tooltip += `<span style="color:#888;font-size:10px">クリックで詳細表示</span>`;
                        return tooltip;
                    }}
                />
                <Legend />
                {/* 第一軸: 積み上げ棒グラフ (良品数 + 不良品数 + ラインアウト数) */}
                <Series
                    name="良品数"
                    type="column"
                    yAxis="chip-axis"
                    data={passChipData}
                    color="#4CAF50"
                    stacking="normal"
                />
                <Series
                    name="不良品数"
                    type="column"
                    yAxis="chip-axis"
                    data={failChipData}
                    color="#F44336"
                    stacking="normal"
                />
                <Series
                    name="ラインアウト数"
                    type="column"
                    yAxis="chip-axis"
                    data={lineoutChipData}
                    color="#9E9E9E"
                    stacking="normal"
                />
                {/* 第二軸: 折れ線グラフ (歩留, OEE) */}
                <Series
                    name="歩留"
                    type="spline"
                    yAxis="percent-axis"
                    data={goodYieldData}
                    color="#2196F3"
                    marker={{
                        enabled: true,
                        radius: 4
                    }}
                    lineWidth={2}
                />
                <Series
                    name="OEE"
                    type="spline"
                    yAxis="percent-axis"
                    data={oeeData}
                    color="#FF9800"
                    marker={{
                        enabled: true,
                        radius: 6
                    }}
                    lineWidth={2}
                    cursor="pointer"
                    events={{
                        click: handleOeeClick
                    }}
                />
            </Chart>
        )
    }

    // パレート図コンポーネント
    const ParetoChart = ({ stopTimeMap, stopCountMap, alarmDetailMap }) => {
        const chartRef = useRef(null);

        // no_alarm_stopを除外し、停止時間でソート
        const entries = Object.entries(stopTimeMap)
            .filter(([key]) => key !== 'no_alarm_stop')
            .sort((a, b) => b[1] - a[1]);

        const categories = entries.map(([key]) => key);
        const stopTimes = entries.map(([_, value]) => value);
        const stopCounts = entries.map(([key]) => stopCountMap[key] || 0);
        const details = entries.map(([key]) => alarmDetailMap[key] || '');

        useEffect(() => {
            if (chartRef.current && chartRef.current.chart) {
                const chart = chartRef.current.chart;
                chart.redraw();
            }
        }, [stopTimeMap]);

        return (
            <Chart
                ref={chartRef}
                containerProps={{ style: { height: "400px" } }}
            >
                <XAxis
                    categories={categories}
                    labels={{
                        rotation: -45,
                        style: {
                            fontSize: '11px'
                        }
                    }}
                />
                <YAxis id="stoptime-axis">
                    停止時間 (秒)
                </YAxis>
                <YAxis id="cumulative-axis" opposite max={100}>
                    累積比率 (%)
                </YAxis>
                <Tooltip
                    shared
                    useHTML
                    formatter={function() {
                        if (!this.points || this.points.length === 0) return '';
                        const index = this.x !== undefined ? categories.indexOf(String(this.x)) : 0;
                        const validIndex = index >= 0 ? index : 0;
                        let tooltip = `<b>${categories[validIndex]}</b><br/>`;
                        tooltip += `詳細: ${details[validIndex]}<br/>`;
                        tooltip += `停止時間: ${stopTimes[validIndex]}秒 (${formatTime(stopTimes[validIndex])})<br/>`;
                        tooltip += `停止回数: ${stopCounts[validIndex]}回<br/>`;
                        if (this.points.length > 1 && this.points[1]) {
                            tooltip += `累積比率: ${this.points[1].y.toFixed(1)}%`;
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
                    baseSeries={0}
                    tooltip={{
                        valueSuffix: '%'
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
    };

    //ロット単位の全情報
    //complexChartのグラフクリックで開く
    const LotUnitDataWindow = ({ index, onClose }) => {
        if (index === null || !resultData[index]) return null;

        const lotUnitData = resultData[index];

        // stop_time_mapからno_alarm_stopを除外してソート
        const stopTimeEntries = Object.entries(lotUnitData.stop_time_map || {})
            .filter(([key]) => key !== 'no_alarm_stop')
            .sort((a, b) => b[1] - a[1]);

        const totalStopTimeWithAlarm = stopTimeEntries.reduce((sum, [_, time]) => sum + time, 0);
        const noAlarmStop = lotUnitData.stop_time_map?.no_alarm_stop || 0;

        return (
            <div style={{
                marginTop: "30px",
                border: "2px solid #2196F3",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: "#f8f9fa"
            }}>
                {/* ヘッダー部分 */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px"
                    }}
                >
                    <h2 style={{ margin: 0, color: "#2196F3" }}>
                        ロット詳細: {lotUnitData.lot_name}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#f44336",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        ✕ 閉じる
                    </button>
                </div>

                {/* 基本情報グリッド */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "15px",
                        padding: "10px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        marginBottom: "20px"
                    }}
                >
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>ロット名</div>
                        <div style={{fontSize: "18px", color: "#2196F3"}}>{lotUnitData.lot_name}</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>機種名</div>
                        <div>{lotUnitData.type_name}</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>開始時刻</div>
                        <div>{lotUnitData.lot_start_time}</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>終了時刻</div>
                        <div>{lotUnitData.lot_end_time}</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>良品数</div>
                        <div>{lotUnitData.pass_chip_num} pcs</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>不良品数</div>
                        <div>{lotUnitData.fail_chip_num} pcs</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>ラインアウト数</div>
                        <div>{lotUnitData.lineout_chip_num} pcs</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>ロット処理時間</div>
                        <div>{formatTime(lotUnitData.lot_time)}</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>稼働時間</div>
                        <div style={{color: "#4CAF50", fontWeight: "bold"}}>{formatTime(lotUnitData.start_time)}</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>停止時間</div>
                        <div style={{color: "#F44336", fontWeight: "bold"}}>{formatTime(lotUnitData.stop_time)}</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>歩留</div>
                        <div style={{color: "#2196F3", fontWeight: "bold"}}>{lotUnitData.good_yield.toFixed(2)}%</div>
                    </div>
                    <div>
                        <div style={{fontWeight: "bold", color: "#666"}}>OEE</div>
                        <div style={{color: "#FF9800", fontWeight: "bold"}}>{lotUnitData.oee_index.toFixed(2)}%</div>
                    </div>
                </div>

                {/* 詳細部分 - 展開時のみ表示 */}
                <div style={{marginTop: "20px"}}>
                    {/* 停止時間詳細テーブル */}
                    <div style={{marginBottom: "30px"}}>
                        <h3 style={{color: "#333", marginBottom: "15px"}}>停止時間詳細</h3>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            backgroundColor: "#fff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                            <thead>
                                <tr style={{backgroundColor: "#2196F3", color: "#fff"}}>
                                    <th style={{padding: "12px", textAlign: "left", border: "1px solid #ddd"}}>順位</th>
                                    <th style={{padding: "12px", textAlign: "left", border: "1px solid #ddd"}}>アラームコード</th>
                                    <th style={{padding: "12px", textAlign: "left", border: "1px solid #ddd"}}>詳細</th>
                                    <th style={{padding: "12px", textAlign: "right", border: "1px solid #ddd"}}>停止回数</th>
                                    <th style={{padding: "12px", textAlign: "right", border: "1px solid #ddd"}}>停止時間(秒)</th>
                                    <th style={{padding: "12px", textAlign: "right", border: "1px solid #ddd"}}>停止時間</th>
                                    <th style={{padding: "12px", textAlign: "right", border: "1px solid #ddd"}}>比率(%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stopTimeEntries.map(([alarmCode, stopTime], idx) => {
                                    const stopCount = lotUnitData.stop_count_map?.[alarmCode] || 0;
                                    const detail = lotUnitData.alarm_detail_map?.[alarmCode] || '';
                                    const ratio = (stopTime / totalStopTimeWithAlarm * 100).toFixed(1);

                                    return (
                                        <tr key={alarmCode} style={{
                                            backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff"
                                        }}>
                                            <td style={{padding: "10px", border: "1px solid #ddd"}}>{idx + 1}</td>
                                            <td style={{padding: "10px", border: "1px solid #ddd", fontFamily: "monospace"}}>{alarmCode}</td>
                                            <td style={{padding: "10px", border: "1px solid #ddd"}}>{detail}</td>
                                            <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>{stopCount}</td>
                                            <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>{stopTime}</td>
                                            <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>{formatTime(stopTime)}</td>
                                            <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>{ratio}%</td>
                                        </tr>
                                    );
                                })}
                                {noAlarmStop > 0 && (
                                    <tr style={{backgroundColor: "#fff3cd", fontWeight: "bold"}}>
                                        <td style={{padding: "10px", border: "1px solid #ddd"}}>-</td>
                                        <td style={{padding: "10px", border: "1px solid #ddd", fontFamily: "monospace"}}>no_alarm_stop</td>
                                        <td style={{padding: "10px", border: "1px solid #ddd"}}>アラーム無し停止</td>
                                        <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>-</td>
                                        <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>{noAlarmStop}</td>
                                        <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>{formatTime(noAlarmStop)}</td>
                                        <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>-</td>
                                    </tr>
                                )}
                                <tr style={{backgroundColor: "#e3f2fd", fontWeight: "bold"}}>
                                    <td colSpan="4" style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>合計</td>
                                    <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>{lotUnitData.stop_time}</td>
                                    <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>{formatTime(lotUnitData.stop_time)}</td>
                                    <td style={{padding: "10px", border: "1px solid #ddd", textAlign: "right"}}>100.0%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* パレート図 */}
                    {stopTimeEntries.length > 0 && (
                        <div style={{marginTop: "30px"}}>
                            <h3 style={{color: "#333", marginBottom: "15px"}}>停止時間パレート図</h3>
                            <ParetoChart
                                stopTimeMap={lotUnitData.stop_time_map}
                                stopCountMap={lotUnitData.stop_count_map}
                                alarmDetailMap={lotUnitData.alarm_detail_map}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                overflow: "auto",
                backgroundColor: "#fff",
                marginTop: "20px",
                padding: "20px"
            }}
        >
            <div style={{fontSize: "24px", fontWeight: "bold", marginBottom: "20px"}}>
                稼働データ処理結果 {resultData.length} 件のデータを取得完了
            </div>

            {/* 機種選択コンボボックス */}
            <div style={{marginBottom: "20px"}}>
                <label style={{marginRight: "10px", fontWeight: "bold"}}>機種選択:</label>
                <select
                    value={selectedTypeName || ""}
                    onChange={(e) => setSelectedTypeName(e.target.value === "" ? null : e.target.value)}
                    style={{
                        padding: "8px 12px",
                        fontSize: "14px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        minWidth: "200px"
                    }}
                >
                    <option value="">全機種</option>
                    {typeNameList.map(typeName => (
                        <option key={typeName} value={typeName}>{typeName}</option>
                    ))}
                </select>
                {selectedTypeName && (
                    <span style={{marginLeft: "15px", color: "#666"}}>
                        {resultData.filter(d => d.type_name === selectedTypeName).length} 件表示中
                    </span>
                )}
            </div>

            {/* 稼働時間、OEE、歩留まりをグラフにしたものを表示する */}
            {/* 棒グラフをクリックした際のイベントで詳細を開くようにする */}
            <ComplexChart resultData={resultData} />

            {isOpenLotUnitDataWindow && (
                <div ref={lotDetailRef}>
                    <LotUnitDataWindow
                        index={lotUnitDataIndex}
                        onClose={() => setIsOpenLotUnitDataWindow(false)}
                    />
                </div>
            )}

        </div>
    );
}

export default OperationTable;
