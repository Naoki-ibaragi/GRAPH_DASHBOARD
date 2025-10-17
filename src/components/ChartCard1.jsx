import Highcharts from "highcharts";
import { useState,useEffect } from "react";
import HighchartsReact from "highcharts-react-official";
import dayjs from "dayjs";
import {Box,Button,Card,CardContent,Typography,Stack} from "@mui/material";
import GraphSetting from "../graphComponents/GraphSetting";
import { line_plot_x_axis_items,line_plot_y_axis_items } from "../Variables/LinePlotData";
import { scatter_plot_x_axis_items,scatter_plot_y_axis_items } from "../Variables/ScatterPlotData";
import { filter_items } from "../Variables/FilterData";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export default function ChartCard1() {
  const [graphType, setGraphType] = useState("ScatterPlot"); //グラフの種類
  const [xdimItem, setXdimItem] = useState(""); //x軸の項目
  const [ydimItem, setYdimItem] = useState(""); //y軸の項目
  const [alarmUnit, setAlarmUnit] = useState("LD"); //アラームユニットの設定
  const [alarmNumbers, setAlarmNumbers] = useState([]); //アラームユニットの設定
  const [operator, setOperator] = useState("and"); //フィルターの接続詞
  const [closeSettingCard, setCloseSettingCard] = useState(false); //設定カードを閉じるかどうか(グラフを見やすくするため)
  const today=new Date();
  const [startDate,setStartDate]=useState(dayjs().subtract(1,"month"));
  const [endDate,setEndDate]=useState(dayjs());
  const [xDimItems,setXDimItems]=useState(scatter_plot_x_axis_items); //X軸の項目
  const [yDimItems,setYDimItems]=useState(scatter_plot_y_axis_items); //Y軸の項目
  const [graphCondition,setGraphCondition]=useState({}); //グラフの条件一覧
  const [graphData,setGraphData]=useState({}); //グラフに表示するアイテム一覧
  const [filters,setFilters]=useState([{enable:false,dimItem:"",dimVal:"",dimOperator:""}]); //フィルターの項目
  const [isGraph,setIsGraph]=useState(false); //グラフが描画されているか
  const [isProcess,setIsProcess]=useState(false); //バックエンドで処理中かどうか
  const [processState,setProcessState]=useState(""); //バックエンドの処理状況

  //validation
  const [xDimItemError]
  const [graphTypeError,setGraphTypeError]=useState(false);

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

  //graphConditionの内容をバリデーションする
  const checkGraphCondition=()=>{
    //x軸の項目y軸の項目

  };
  
  //backendから取得する関数
  const getGraphDataFromBackend=async ()=>{
    if (!checkGraphCondition) return;
    setIsProcess(true);
    setProcessState("バックエンドへの通信を開始");

    //進捗のイベントリスナーを設定
    const unlistenProgress= await listen('graph1-progress',(event)=>{
      const payload=event.payload;
      console.log(`進捗:${payload.progress}% - ${payload.message}`);
      setProcessState(`${payload.message}`)
    });

    // 完了イベントのリスナーを設定
    const unlistenComplete = await listen('lot_log-complete', (event) => {
      const payload = event.payload;
      
      if (payload.success) {
        console.log('処理成功:', payload.data);
        setColumnHeader(payload.data.lot_header);
        setLotUnitData(payload.data.lot_data);
        setDownloads(false);
      } else {
        console.error('処理失敗:', payload.error);
        setIsError(true);
        setDownloads(false);
        setDownloadsState('処理失敗:', payload.error);
      }
      
      // リスナーをクリーンアップ
      unlistenProgress();
      unlistenComplete();
    });

    try {
      // バックエンドのコマンドを呼び出し（即座に戻る）
      await invoke('graph1_get_data', { graphCondtion:graphData });
    } catch (error) {
      console.error('コマンド呼び出しエラー:', error);
      unlistenProgress();
      unlistenComplete();
    }

  }

  //Highchartの描画内容を更新
  useEffect(()=>{
    getGraphDataFromBackend();
  },[graphCondition]);

  const options = {
    title: { text: "月別売上" },
    xAxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
    series: [
      {
        name: "売上",
        data: [29, 71, 106, 129, 144],
      },
    ],
  };

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
          filters={filters}
          setFilters={setFilters}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          xDimItems={xDimItems}
          yDimItems={yDimItems}
          setGraphCondition={setGraphCondition}
        />
      ):null}
      {isProcess ? 
      <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {`処理状況 ${processState}`}
            </Typography>
            <Stack spacing={2}>
            </Stack>
        </CardContent>
      </Card>
      :null
      }

      {isGraph ? 
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </CardContent>
        </Card>
      :null}
    </Box>
  );
}

