import { useState,useEffect } from "react";
import dayjs from "dayjs";
import {Box,Button,Card,CardContent,Typography,LinearProgress} from "@mui/material";
import GraphSetting from "../graphComponents/GraphSetting";
import { line_plot_x_axis_items,line_plot_y_axis_items } from "../Variables/LinePlotData";
import { scatter_plot_x_axis_items,scatter_plot_y_axis_items } from "../Variables/ScatterPlotData";
import { filter_items } from "../Variables/FilterData";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import Highcharts, { seriesType } from 'highcharts';
import HighchartsReact from "highcharts-react-official";
import 'highcharts/modules/boost';

export default function ChartCard1() {
  const [graphType, setGraphType] = useState("ScatterPlot"); //グラフの種類
  const [xdimItem, setXdimItem] = useState(""); //x軸の項目
  const [ydimItem, setYdimItem] = useState(""); //y軸の項目
  const [alarmUnit, setAlarmUnit] = useState("LD"); //アラームユニットの設定
  const [alarmNumbers, setAlarmNumbers] = useState([]); //アラームユニットの設定
  const [operator, setOperator] = useState("and"); //フィルターの接続詞
  const [plotUnit,setPlotUnit]=useState("None"); //プロットの分割単位
  const [closeSettingCard, setCloseSettingCard] = useState(false); //設定カードを閉じるかどうか(グラフを見やすくするため)
  const [startDate,setStartDate]=useState(dayjs().subtract(1,"month"));
  const [endDate,setEndDate]=useState(dayjs());
  const [xDimItems,setXDimItems]=useState(scatter_plot_x_axis_items); //X軸の項目
  const [yDimItems,setYDimItems]=useState(scatter_plot_y_axis_items); //Y軸の項目
  const [graphCondition,setGraphCondition]=useState({}); //グラフの条件一覧
  const [graphData,setGraphData]=useState({}); //グラフに表示するアイテム一覧
  const [filters,setFilters]=useState([{enable:false,item:"",value:"",comparison:"="}]); //フィルターの項目
  const [isGraph,setIsGraph]=useState(false); //グラフが描画されているか
  const [isProcess,setIsProcess]=useState(false); //バックエンドで処理中かどうか
  const [processState,setProcessState]=useState(""); //バックエンドの処理状況
  const [options,setOptions]=useState({});

  //validation
  const [graphTypeError,setGraphTypeError]=useState(false);
  const [xdimItemError,setXdimItemError]=useState(false);
  const [ydimItemError,setYdimItemError]=useState(false);
  const [alarmUnitError,setAlarmUnitError]=useState(false);
  const [filterItemError,setFilterItemError]=useState([false]);

  //構造体の値からキーを逆算する関数
  const getKeyByValue = (obj, value) => {
    return Object.keys(obj).find((key) => obj[key] === value);
  };

  //グラフ種種によって軸の項目を変える
  useEffect(()=>{
    setXdimItem("");
    setYdimItem("");
    if(graphType=="ScatterPlot"){
        setXDimItems(scatter_plot_x_axis_items);
        setYDimItems(scatter_plot_y_axis_items);
    }else if(graphType=="LinePlot"){
        setXDimItems(line_plot_x_axis_items);
        setYDimItems(line_plot_y_axis_items);
    }
  },[graphType])

  //backendから取得する関数
  const getGraphDataFromBackend=async ()=>{

    //filtersからenableがfalseのものを抜く
    const filters_result = filters
    .filter(f => f.enable)
    .map(f => ({ item: f.item, value: f.value, comparison: f.comparison }));

    const newGraphCondition={ //ローカル変数でデータを作成
      graph_type:graphType,
      graph_x_item:xdimItem,
      graph_y_item:ydimItem,
      alarm:{unit:alarmUnit,codes:alarmNumbers},
      start_date:startDate.format("YYYY-MM-DD 00:00:00"),
      end_date:endDate.format("YYYY-MM-DD 00:00:00"),
      plot_unit:plotUnit,
      filters:filters_result,
      filter_conjunction:operator,
    };
    
    setGraphCondition(newGraphCondition); //状態を更新
    console.log(newGraphCondition);
    setIsProcess(true);
    setProcessState("バックエンドへの通信を開始");

    //進捗のイベントリスナーを設定
    const unlistenProgress= await listen('graph_data-progress',(event)=>{
      const payload=event.payload;
      console.log(`進捗:${payload.progress}% - ${payload.message}`);
      setProcessState(`${payload.message}`)
    });

    // 完了イベントのリスナーを設定
    const unlistenComplete = await listen('graph_data-complete', (event) => {
      const payload = event.payload;
      if (payload.success) {
        const newData=payload.data.graph_data;
        console.log('処理成功:', newData);
        let series = [];
        Object.keys(newData).forEach((key) => {
            const series_unit = key.includes("alarm") ? 
            {
              name: key,
              data: newData[key].map((p) => [p.x, p.y]),
              zIndex:100,
              color:"#FF0000"
            }
            :
            {
              name: key,
              data: newData[key].map((p) => [p.x, p.y]),
            };

          series.push(series_unit);
        });
        console.log(series);

        let option_graph_type="";
        switch(graphType){
          case "ScatterPlot": 
            option_graph_type='scatter';
            break;
          case "LinePlot": 
            option_graph_type='line';
            break;
        };

        setOptions({
          chart: {
              type: option_graph_type,
              animation: false, // アニメーション無効化で高速化
              reflow: true
          },
          title:{
            text:`${getKeyByValue(xDimItems,xdimItem)} / ${getKeyByValue(yDimItems,ydimItem)}`
          },
          xAxis:{
            title:{
              text:`${getKeyByValue(xDimItems,xdimItem)}`
            }
          },
          yAxis:{
            title:{
              text:`${getKeyByValue(yDimItems,ydimItem)}`
            }
          },
          boost:{
            useGPUTranslations:true,
            seriesThreshold:5000
          },
          tooltip:{
            enaled:false
          },
           plotOptions: {
            series: {
              // ボーストモジュールの設定
              turboThreshold: 1, // データ処理の簡略化を無効化
              // WebGL描画時のパフォーマンス最適化
              states: {
                hover: {
                  enabled: false // ホバーエフェクトを無効化（パフォーマンス向上）
                }
              },
              dataLabels: {
                enabled: false // データラベルを非表示（パフォーマンス向上）
              }
            }
          },
          series: series
        });
        setIsProcess(false); // ← ここで処理中フラグを解除
        setIsGraph(true);
      } else {
        console.error('処理失敗:', payload.error);
        setIsProcess(false); // ← ここで処理中フラグを解除
      }
      
      // リスナーをクリーンアップ
      unlistenProgress();
      unlistenComplete();
    });

    try {
      // バックエンドのコマンドを呼び出し（ローカル変数を送信）
      await invoke('get_graphdata', { graphCondition: newGraphCondition});
    } catch (error) {
      console.error('コマンド呼び出しエラー:', error);
      setIsProcess(false); // ← エラー時も処理中フラグを解除
      unlistenProgress();
      unlistenComplete();
    }
  }

  return (
    <Box sx={{width:"99%",maxWidth:"100%"}}>
      <Box sx={{display:"flex",justifyContent:"flex-end"}}>
        <Button type="inherit" onClick={()=>setCloseSettingCard((prev)=>!prev)} sx={{my:0,py:0,px:3}}>
          {closeSettingCard ? (
            "グラフの設定を開く"
          ):(
            "グラフの設定を閉じる"
          )}
        </Button>
      </Box>
      {!closeSettingCard ? (
        <GraphSetting
          graphType={graphType}
          setGraphType={setGraphType}
          xdimItem={xdimItem}
          setXdimItem={setXdimItem}
          ydimItem={ydimItem}
          setYdimItem={setYdimItem}
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
      ):null}
      {isProcess ? 
      <Card>
          <CardContent>
            <LinearProgress />
            <Typography variant="caption" gutterBottom>
              {`処理状況 - ${processState}`}
            </Typography>
        </CardContent>
      </Card>
      :null
      }
      {isGraph && options && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

