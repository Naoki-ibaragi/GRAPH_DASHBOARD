import { useState, useEffect, useRef } from "react";
import GraphSetting from "../graphComponents/GraphSetting";
import { line_plot_x_axis_items, line_plot_y_axis_items } from "../Variables/LinePlotData";
import { scatter_plot_x_axis_items, scatter_plot_y_axis_items } from "../Variables/ScatterPlotData";
import { histogram_axis_items } from "../Variables/HistogramData";
import { useGraphData2 } from "../contexts/GraphDataContext2";

//各グラフ種類毎のコンポーネントをimport
import GraphManager from "../graphComponents/GraphManager";

export default function ChartCard2() {
  // グローバルステートから取得
  const {
    graphType,
    setGraphType,
    xdimItem,
    setXdimItem,
    ydimItem,
    setYdimItem,
    alarmUnit,
    setAlarmUnit,
    alarmNumbers,
    setAlarmNumbers,
    operator,
    setOperator,
    plotUnit,
    setPlotUnit,
    binNumber,
    setBinNumber,
    binsX,
    setBinsX,
    binsY,
    setBinsY,
    filters,
    setFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    closeSettingCard,
    setCloseSettingCard,
    resultData,
    setResultData,
    isGraph,
    setIsGraph,
    graphCondition,
    setGraphCondition,
  } = useGraphData2();

  // ローカルステート（UI表示用のみ）
  const [xDimItems, setXDimItems] = useState(scatter_plot_x_axis_items); //X軸の項目
  const [yDimItems, setYDimItems] = useState(scatter_plot_y_axis_items); //Y軸の項目
  const [isProcess, setIsProcess] = useState(false); //バックエンドで処理中かどうか
  const [processState, setProcessState] = useState(""); //バックエンドの処理状況

  //validation
  const [graphTypeError, setGraphTypeError] = useState(false);
  const [xdimItemError, setXdimItemError] = useState(false);
  const [ydimItemError, setYdimItemError] = useState(false);
  const [alarmUnitError, setAlarmUnitError] = useState(false);
  const [filterItemError, setFilterItemError] = useState([false]);

  // 初回マウント時のフラグ
  const isInitialMount = useRef(true);
  const prevGraphType = useRef(graphType);

  //グラフ種種によって軸の項目を変える
  useEffect(() => {
    // 初回マウント時、またはgraphTypeが実際に変更されていない場合はスキップ
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevGraphType.current = graphType;

      // 初回マウント時にxDimItemsとyDimItemsだけを設定
      if (graphType === "ScatterPlot") {
        setXDimItems(scatter_plot_x_axis_items);
        setYDimItems(scatter_plot_y_axis_items);
      } else if (graphType === "LinePlot") {
        setXDimItems(line_plot_x_axis_items);
        setYDimItems(line_plot_y_axis_items);
      } else if (graphType === "Histogram") {
        setXDimItems(histogram_axis_items);
      } else if (graphType === "DensityPlot") {
        setXDimItems(scatter_plot_x_axis_items);
        setYDimItems(scatter_plot_y_axis_items);
      }
      return;
    }

    // graphTypeが実際に変更された場合のみ、項目をリセット
    if (prevGraphType.current !== graphType) {
      prevGraphType.current = graphType;

      // グラフタイプが変更されたら、古い結果データをクリア
      setIsGraph(false);
      setResultData(null);

      if (graphType === "ScatterPlot") {
        setXDimItems(scatter_plot_x_axis_items);
        setYDimItems(scatter_plot_y_axis_items);
        setXdimItem(scatter_plot_x_axis_items[Object.keys(scatter_plot_x_axis_items)[0]]);
        setYdimItem(scatter_plot_y_axis_items[Object.keys(scatter_plot_y_axis_items)[0]]);
      } else if (graphType === "LinePlot") {
        setXDimItems(line_plot_x_axis_items);
        setYDimItems(line_plot_y_axis_items);
        setXdimItem(line_plot_x_axis_items[Object.keys(line_plot_x_axis_items)[0]]);
        setYdimItem(line_plot_y_axis_items[Object.keys(line_plot_y_axis_items)[0]]);
      } else if (graphType === "Histogram") {
        setXDimItems(histogram_axis_items);
        setXdimItem(histogram_axis_items[Object.keys(histogram_axis_items)[0]]);
      } else if (graphType === "DensityPlot") {
        setXDimItems(scatter_plot_x_axis_items);
        setYDimItems(scatter_plot_y_axis_items);
        setXdimItem(scatter_plot_x_axis_items[Object.keys(scatter_plot_x_axis_items)[0]]);
        setYdimItem(scatter_plot_y_axis_items[Object.keys(scatter_plot_y_axis_items)[0]]);
      }
    }
  }, [graphType, setXdimItem, setYdimItem, setIsGraph, setResultData]);

  //backendから取得する関数
  const getGraphDataFromBackend = async (customAlarmNumbers = null) => {
    //filtersからenableがfalseのものを抜く
    const filters_result = filters
      .filter((f) => f.enable)
      .map((f) => ({ item: f.item, value: f.value, comparison: f.comparison }));

    // customAlarmNumbersが渡された場合はそれを使用、なければalarmNumbersを使用
    const alarmCodes = customAlarmNumbers !== null ? customAlarmNumbers : alarmNumbers;

    const newGraphCondition = {
      //ローカル変数でデータを作成
      graph_type: graphType,
      graph_x_item: xdimItem,
      graph_y_item: ydimItem,
      bin_number: parseInt(binNumber), //ヒストグラムでのみ使用
      bins_x: parseInt(binsX), //密度プロットで使用
      bins_y: parseInt(binsY), //密度プロットで使用
      alarm: { unit: alarmUnit, codes: alarmCodes },
      start_date: startDate.format("YYYY-MM-DD HH:mm:00"),
      end_date: endDate.format("YYYY-MM-DD HH:mm:00"),
      plot_unit: plotUnit,
      filters: filters_result,
      filter_conjunction: operator,
    };

    console.log(newGraphCondition);

    setGraphCondition(newGraphCondition); //状態を更新
    setIsProcess(true); //処理開始
    setProcessState("バックエンドへの通信を開始");

    try {
      // バックエンドのコマンドを呼び出し（ローカル変数を送信）
      const response = await fetch("http://127.0.0.1:8080/get_graphdata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGraphCondition),
      });

      // レスポンスステータスのチェック
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}:`, errorText);
        setIsProcess(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log("処理成功:", data);
        setResultData(data);
        setIsProcess(false);
        setIsGraph(true);
      } else {
        console.log("処理失敗:", data);
        setIsProcess(false);
      }
    } catch (error) {
      console.error("コマンド呼び出しエラー:", error);
      setIsProcess(false); // ← エラー時も処理中フラグを解除
    }
  };

  return (
    <div className="w-full max-w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCloseSettingCard((prev) => !prev)}
          className="px-6 text-sm font-medium text-primary-700 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-200"
        >
          {closeSettingCard ? "グラフの設定を開く" : "グラフの設定を閉じる"}
        </button>
      </div>
      {!closeSettingCard ? (
        <GraphSetting
          graphType={graphType}
          setGraphType={setGraphType}
          xdimItem={xdimItem}
          setXdimItem={setXdimItem}
          ydimItem={ydimItem}
          setYdimItem={setYdimItem}
          binNumber={binNumber}
          binsX={binsX}
          setBinsX={setBinsX}
          binsY={binsY}
          setBinsY={setBinsY}
          setBinNumber={setBinNumber}
          alarmNumbers={alarmNumbers}
          setAlarmNumbers={setAlarmNumbers}
          alarmUnit={alarmUnit}
          setAlarmUnit={setAlarmUnit}
          operator={operator}
          setOperator={setOperator}
          plotUnit={plotUnit}
          setPlotUnit={setPlotUnit}
          filters={filters}
          setFilters={setFilters}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          xDimItems={xDimItems}
          yDimItems={yDimItems}
          setGraphCondition={setGraphCondition}
          graphTypeError={graphTypeError}
          xDimItemError={xdimItemError}
          yDimItemError={ydimItemError}
          alarmUnitError={alarmUnitError}
          filterItemError={filterItemError}
          setFilterItemError={setFilterItemError}
          getGraphDataFromBackend={getGraphDataFromBackend}
        />
      ) : null}
      {isProcess ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <h3 className="text-xl font-semibold text-gray-800">グラフデータを取得中...</h3>
            <p className="text-sm text-gray-600">{processState}</p>
          </div>
        </div>
      ) : null}
      {isGraph ? <GraphManager graphCondition={graphCondition} resultData={resultData} /> : null}
    </div>
  );
}
