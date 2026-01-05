import { useEffect, useState, useMemo, useCallback, memo } from "react";
import dayjs from "dayjs";
import { filter_items } from "../Variables/FilterData";
import { PLOT_UNIT_LABELS } from "../constants/graphConfig";
import { OriginalTooltip } from "../utils/tooltip";
import { OriginalDatepicker } from "../utils/datepicker";

function GraphSetting(props) {
  const graphType = props.graphType; //グラフの種類
  const setGraphType = props.setGraphType;
  const xdimItem = props.xdimItem; //x軸の項目
  const setXdimItem = props.setXdimItem;
  const ydimItem = props.ydimItem; //Y軸の項目
  const setYdimItem = props.setYdimItem;
  const binNumber = props.binNumber; //ヒストグラムで使用するBin数
  const setBinNumber = props.setBinNumber;
  const binsX = props.binsX; //密度プロットで使用するX軸のBin数
  const setBinsX = props.setBinsX;
  const binsY = props.binsY; //密度プロットで使用するY軸のBin数
  const setBinsY = props.setBinsY;
  const alarmUnit = props.alarmUnit; //グラフに表示するアラームのユニット
  const setAlarmUnit = props.setAlarmUnit;
  const alarmNumbers = props.alarmNumbers; //アラームの番号
  const setAlarmNumbers = props.setAlarmNumbers;
  const operator = props.operator; //フィルターの結び方
  const setOperator = props.setOperator;
  const plotUnit = props.plotUnit;
  const setPlotUnit = props.setPlotUnit;
  const filters = props.filters; //フィルターの中身(配列)
  const setFilters = props.setFilters;
  const startDate = props.startDate; //集計開始日
  const setStartDate = props.setStartDate;
  const endDate = props.endDate; //集計終了日
  const setEndDate = props.setEndDate;
  const xDimItems = props.xDimItems; //x軸の項目(グラフ種類で変更)
  const yDimItems = props.yDimItems; //y軸の項目(グラフ種類で変更)
  const graphTypeError = props.graphTypeError; //グラフタイプのバリデーション
  const getGraphDataFromBackend = props.getGraphDataFromBackend; //グラフ描画ボタン押し下げ時の実行関数
  const alarmNumbersString=props.alarmNumbersString;
  const setAlarmNumbersString=props.setAlarmNumbersString;
  const isGraph=props.isGraph; //グラフが表示されているかどうか
  const handleGraphDataDownloads=props.handleGraphDataDownloads; //グラフデータをcsvでダウンロード

  // 日付バリデーション用のステート
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [alarmNumbersError, setAlarmNumbersError] = useState(false);
  const [startDateErrorMessage, setStartDateErrorMessage] = useState("");
  const [endDateErrorMessage, setEndDateErrorMessage] = useState("");
  const [alarmNumbersErrorMessage, setAlarmNumbersErrorMessage] = useState("");

  //グラフの種類一覧（メモ化）
  const graph_items = useMemo(
    () => ({
      散布図: "ScatterPlot",
      時系列プロット: "LinePlot",
      ヒストグラム: "Histogram",
      密度プロット: "DensityPlot",
    }),
    []
  );

  //アラームをグラフに重ねる際に表示するユニット一覧（メモ化）
  const unit_items = useMemo(
    () => ({
      LD: "LD",
      DC1: "DC1",
      AC1: "AC1",
      AC2: "AC2",
      DC2: "DC2",
      IP: "IP",
      ULD: "ULD",
    }),
    []
  );

  //フィルターの比較詞（メモ化）
  const operator_items = useMemo(
    () => ({
      に等しい: "=",
      に等しくない: "<>",
      より大きい: ">",
      より小さい: "<",
      を含む: "LIKE",
      を含まない: "NOT LIKE",
    }),
    []
  );

  //フィルターのエントリー記入時にハンドラー
  const handleFilterChange = useCallback(
    (index, field, value) => {
      setFilters((prevFilters) => {
        const newFilters = [...prevFilters];
        newFilters[index] = { ...newFilters[index], [field]: value };
        return newFilters;
      });
    },
    [setFilters]
  );

  //フィルターを追加する
  const addFilter = useCallback(() => {
    setFilters((prevFilters) => [
      ...prevFilters,
      {
        enable: true,
        item: "",
        value: "",
        comparison: "=",
      },
    ]);
  }, [setFilters]);

  //フィルターを削除する
  const deleteFilter = useCallback(
    (index) => {
      setFilters((prevFilters) => [...prevFilters.slice(0, index), ...prevFilters.slice(index + 1)]);
    },
    [setFilters]
  );

  //日付バリデーション
  const validateDatas = useCallback(() => {
    let hasError = false;
    const now = new Date();
    let parsedAlarmNumbers = null;

    //アラームコードのバリデーション
    //アラームコードが空ではない場合、[,]でsplitしたデータが全てintに変換可能か確認
    if(alarmNumbersString){
      const tmp_arr=alarmNumbersString.split(",");
      const invalidNumbers = tmp_arr.filter((num) => {
        const trimmed = num.trim();
        // 空文字列または数値に変換できない場合は無効
        return trimmed === "" || isNaN(trimmed) || isNaN(parseInt(trimmed, 10));
      });

      if(invalidNumbers.length > 0){
        setAlarmNumbersError(true);
        setAlarmNumbersErrorMessage("アラーム番号は整数をカンマ区切りで入力してください");
        hasError = true;
      } else {
        setAlarmNumbersError(false);
        setAlarmNumbersErrorMessage("");
        const result_arr=[];
        tmp_arr.forEach((num)=>{
          const trimmed = num.trim();
          result_arr.push(parseInt(trimmed,10));
        });
        parsedAlarmNumbers = result_arr;
      }
    } else {
      setAlarmNumbersError(false);
      setAlarmNumbersErrorMessage("");
      parsedAlarmNumbers = [];
    }

    // 開始日のバリデーション
    if (startDate) {
      if (startDate > dayjs(now)) {
        setStartDateError(true);
        setStartDateErrorMessage("開始日は現在時刻より前に設定してください");
        hasError = true;
      } else {
        setStartDateError(false);
        setStartDateErrorMessage("");
      }
    }

    // 終了日のバリデーション
    if (endDate) {
      const endDateObj = endDate.toDate();
      if (endDateObj > now) {
        setEndDateError(true);
        setEndDateErrorMessage("終了日は現在時刻より前に設定してください");
        hasError = true;
      } else {
        setEndDateError(false);
        setEndDateErrorMessage("");
      }
    }

    // 開始日と終了日の関係チェック
    if (startDate && endDate) {
      const startDateObj = startDate.toDate();
      const endDateObj = endDate.toDate();
      if (startDateObj >= endDateObj) {
        setStartDateError(true);
        setStartDateErrorMessage("開始日は終了日より前に設定してください");
        hasError = true;
      }
    }

    return { isValid: !hasError, parsedAlarmNumbers };
  }, [startDate, endDate, alarmNumbersString]);

  //開始日変更時のハンドラ
  const handleStartDateChange = useCallback(
    (date) => {
      setStartDate(date ? dayjs(date) : null);
      setStartDateError(false);
      setStartDateErrorMessage("");
    },
    [setStartDate]
  );

  //終了日変更時のハンドラ
  const handleEndDateChange = useCallback(
    (date) => {
      setEndDate(date ? dayjs(date) : null);
      setEndDateError(false);
      setEndDateErrorMessage("");
    },
    [setEndDate]
  );

  //グラフ作成ボタン押下時の処理
  const handleGraphCreate = useCallback(() => {
    const { isValid, parsedAlarmNumbers } = validateDatas();
    if (isValid) {
      // アラーム番号を状態にも設定
      if (parsedAlarmNumbers !== null) {
        setAlarmNumbers(parsedAlarmNumbers);
      }
      // パースした値を直接渡してデータ取得（状態更新を待たない）
      getGraphDataFromBackend(parsedAlarmNumbers);
    }
  }, [validateDatas, getGraphDataFromBackend, setAlarmNumbers]);

  return (
    <div className="bg-white rounded-xl shadow-lg px-6 py-1 mb-6">
      {/* グラフ基本設定 */}
      <fieldset className="border border-gray-300 rounded-lg p-4 mb-4 bg-green-100/30">
        <legend className="text-base font-semibold text-gray-700 px-2 bg-white border">グラフ基本設定</legend>

        <div className="flex flex-wrap items-center gap-6 mb-4">
          {/* グラフの種類 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">グラフの種類</label>
            <div>
              <select
                className={`h-8 w-52 px-3 border ${
                  graphTypeError ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
              >
                {Object.keys(graph_items).map((key) => (
                  <option key={key} value={graph_items[key]}>
                    {key}
                  </option>
                ))}
              </select>
              {graphTypeError && <p className="text-red-600 text-xs mt-1">グラフの種類が不適切です</p>}
            </div>
          </div>

          {/* X軸の項目 */}
          {graphType !== "LinePlot" && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">X軸の項目</label>
            <select
              className="h-8 w-80 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={xdimItem}
              onChange={(e) => setXdimItem(e.target.value)}
            >
              {Object.keys(xDimItems).map((key) => (
                <option key={key} value={xDimItems[key]}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          )}

          {/* Y軸の項目 */}
          {graphType !== "Histogram" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Y軸の項目</label>
              <select
                className="h-8 w-80 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={ydimItem}
                onChange={(e) => setYdimItem(e.target.value)}
              >
                {Object.keys(yDimItems).map((key) => (
                  <option key={key} value={yDimItems[key]}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ビン数 */}
          {graphType === "Histogram" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">ビン数</label>
              <input
                type="number"
                className="h-8 w-32 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={binNumber}
                onChange={(e) => setBinNumber(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* アラーム設定 */}
        {(graphType === "ScatterPlot" || graphType === "LinePlot" || graphType === "Histogram") && (
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <OriginalTooltip text="アラーム番号を設定した場合、アラームが発生したチップの情報を視覚化してプロットします">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">アラーム設定</label>
            </OriginalTooltip>
            <select
              className="h-8 w-52 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={alarmUnit}
              onChange={(e) => setAlarmUnit(e.target.value)}
            >
              {Object.keys(unit_items).map((key) => (
                <option key={key} value={unit_items[key]}>
                  {key}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">アラーム番号</label>
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="例: 1,2,3"
                className={`h-8 w-64 px-3 border ${
                  alarmNumbersError ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
                value={alarmNumbersString}
                onChange={(e) => {
                  setAlarmNumbersString(e.target.value);
                  setAlarmNumbersError(false);
                  setAlarmNumbersErrorMessage("");
                }}
              />
              {alarmNumbersError && (
                <p className="text-red-600 text-xs mt-1">{alarmNumbersErrorMessage}</p>
              )}
            </div>
          </div>
        )}

        {/* X,YのBIN数設定 */}
        {graphType === "DensityPlot" && (
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">X軸の分割数</label>
            <input
              type="number"
              className="h-8 w-52 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={binsX}
              onChange={(e) => setBinsX(e.target.value)}
            />
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Y軸の分割数</label>
            <input
              type="number"
              className="h-8 w-52 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={binsY}
              onChange={(e) => setBinsY(e.target.value)}
            />
          </div>
        )}
      </fieldset>

      {/* フィルター設定 */}
      <fieldset className="border border-gray-300 rounded-lg p-4 mb-4 bg-green-100/30">
        <OriginalTooltip text="フィルターの内容に沿って表示内容を制限します">
          <legend className="text-base font-semibold text-gray-700 px-2 bg-white border">フィルター設定</legend>
        </OriginalTooltip>

        {/* AND/OR選択 */}
        <div className="mb-4">
          <div className="flex gap-6">
            <OriginalTooltip text="全てのフィルター条件を満たすデータをプロットします">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="and"
                checked={operator === "and"}
                onChange={(e) => setOperator(e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">ANDで結ぶ</span>
            </label>
            </OriginalTooltip>
            <OriginalTooltip text="一つでもフィルター条件を満たすデータをプロットします">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="or"
                checked={operator === "or"}
                onChange={(e) => setOperator(e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">ORで結ぶ</span>
            </label>
            </OriginalTooltip>
          </div>
        </div>

        {/* フィルター一覧 */}
        {filters.map((filter, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-center mb-2">
            <div className="col-span-2">
              <p className="text-sm text-gray-700">{`フィルター${index + 1}`}</p>
            </div>
            <OriginalTooltip text="フィルターの有効無効切り替え">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={filter.enable}
                onChange={(e) => handleFilterChange(index, "enable", e.target.checked)}
                className="w-5 h-5 text-primary-600 focus:ring-primary-500 rounded cursor-pointer"
              />
            </div>
            </OriginalTooltip>
            <div className="col-span-3">
              <select
                className="w-full h-8 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={filter.item}
                onChange={(e) => handleFilterChange(index, "item", e.target.value)}
              >
                {Object.keys(filter_items).map((key) => (
                  <option key={key} value={filter_items[key]}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <input
                type="text"
                placeholder="値"
                className="w-full h-8 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={filter.value}
                onChange={(e) => handleFilterChange(index, "value", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <select
                className="w-full h-8 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={filter.comparison}
                onChange={(e) => handleFilterChange(index, "comparison", e.target.value)}
              >
                {Object.keys(operator_items).map((key) => (
                  <option key={key} value={operator_items[key]}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex gap-2">
              {index > 0 && (
                <OriginalTooltip text="フィルターを削除">
                <button
                  onClick={() => deleteFilter(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                </OriginalTooltip>
              )}
              {index === filters.length - 1 && (
                <OriginalTooltip text="フィルターを追加">
                <button
                  onClick={addFilter}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="追加"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                </OriginalTooltip>
              )}
            </div>
          </div>
        ))}
      </fieldset>

      {/* プロット分割設定 */}
      {/* 密度プロットが選択されている時は分割無しに固定する */}
      <fieldset className="border border-gray-300 rounded-lg p-4 mb-4 bg-green-100/30">
        <OriginalTooltip text="グラフのプロットを選択された項目のユニークなシリアル毎に分割します">
          <legend className="text-base font-semibold text-gray-700 px-2 bg-white border">プロット分割設定</legend>
        </OriginalTooltip>
        {graphType !== "DensityPlot" ?
          <select
            className="h-8 w-80 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            value={plotUnit}
            onChange={(e) => setPlotUnit(e.target.value)}
          >
            {Object.keys(PLOT_UNIT_LABELS).map((key) => (
              <option key={key} value={PLOT_UNIT_LABELS[key]}>
                {key}
              </option>
            ))}
          </select>
          :
          <select
            className="h-8 w-80 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            value={"None"}
          >
            <option key="分割無し" value="None">
              分割無し
            </option>
          </select>
        }
      </fieldset>

      {/* 集計日時設定 */}
      <fieldset className="border border-gray-300 rounded-lg p-4 mb-4 bg-blue-100/30">
        <OriginalTooltip text="範囲内の日時に流れたチップのデータを取得します。範囲が大きいとデータ取得に時間がかかります">
          <legend className="text-base font-semibold text-gray-700 px-2 bg-white border">集計日時設定</legend>
        </OriginalTooltip>
        <div className="flex flex-wrap items-center gap-6 mt-2 mb-2">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">開始日</label>
            <OriginalDatepicker
              selected={startDate ? startDate.toDate() : null}
              onChange={(e) => handleStartDateChange(e.target.value)}
              value={startDate}
              error={startDateError}
              errorMessage={startDateErrorMessage}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">終了日</label>
            <OriginalDatepicker
              selected={endDate ? endDate.toDate() : null}
              onChange={(e) => handleEndDateChange(e.target.value)}
              value={endDate}
              error={endDateError}
              errorMessage={endDateErrorMessage}
            />
          </div>
        </div>
      </fieldset>

      {/* グラフ作成ボタン */}
      <div>
      <button
        onClick={handleGraphCreate}
        className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
      >
        グラフ作成開始
      </button>
      {isGraph ? 
        <button 
          className="px-8 py-3 ml-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          onClick={handleGraphDataDownloads}
          >
          グラフデータダウンロード
        </button>
        :null
      }
      </div>
    </div>
  );
}

// メモ化されたエクスポート
export default memo(GraphSetting);
