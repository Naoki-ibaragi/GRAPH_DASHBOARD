import { useState,useEffect } from "react";
import dayjs from "dayjs";
import {Box,Button,Card,CardContent,Typography,CircularProgress} from "@mui/material";
import GraphSetting from "../graphComponents/GraphSetting";
import { line_plot_x_axis_items,line_plot_y_axis_items } from "../Variables/LinePlotData";
import { scatter_plot_x_axis_items,scatter_plot_y_axis_items } from "../Variables/ScatterPlotData";
import { histogram_axis_items } from "../Variables/HistogramData";
import { listen } from "@tauri-apps/api/event";
import { useGraphData } from "../contexts/GraphDataContext";

//各グラフ種類毎のコンポーネントをimport
import GraphManager from "../graphComponents/GraphManager";

export default function ChartCard1() {
  // グローバルステートから取得
  const { resultData, setResultData, isGraph, setIsGraph, graphCondition, setGraphCondition } = useGraphData();

  // ローカルステート
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
  const [binNumber,setBinNumber]=useState(50); //ヒストグラムで使用するビン数
  const [binsX,setBinsX]=useState(50); //密度プロットで使用するX軸の分割数
  const [binsY,setBinsY]=useState(50); //密度プロットで使用するX軸の分割数
  const [filters,setFilters]=useState([{enable:false,item:"",value:"",comparison:"="}]); //フィルターの項目
  const [isProcess,setIsProcess]=useState(false); //バックエンドで処理中かどうか
  const [processState,setProcessState]=useState(""); //バックエンドの処理状況

  //validation
  const [graphTypeError,setGraphTypeError]=useState(false);
  const [xdimItemError,setXdimItemError]=useState(false);
  const [ydimItemError,setYdimItemError]=useState(false);
  const [alarmUnitError,setAlarmUnitError]=useState(false);
  const [filterItemError,setFilterItemError]=useState([false]);


  //グラフ種種によって軸の項目を変える
  useEffect(()=>{
    setXdimItem("");
    setYdimItem("");
    if(graphType==="ScatterPlot"){
        setXDimItems(scatter_plot_x_axis_items);
        setYDimItems(scatter_plot_y_axis_items);
    }else if(graphType==="LinePlot"){
        setXDimItems(line_plot_x_axis_items);
        setYDimItems(line_plot_y_axis_items);
    }else if(graphType==="Histogram"){
      setXDimItems(histogram_axis_items);
    }else if(graphType==="DensityPlot"){
      setXDimItems(scatter_plot_x_axis_items);
      setYDimItems(scatter_plot_y_axis_items);
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
      bin_number:parseInt(binNumber), //ヒストグラムでのみ使用
      bins_x:parseInt(binsX), //密度プロットで使用
      bins_y:parseInt(binsY), //密度プロットで使用
      alarm:{unit:alarmUnit,codes:alarmNumbers},
      start_date:startDate.format("YYYY-MM-DD 00:00:00"),
      end_date:endDate.format("YYYY-MM-DD 00:00:00"),
      plot_unit:plotUnit,
      filters:filters_result,
      filter_conjunction:operator,
    };
    
    setGraphCondition(newGraphCondition); //状態を更新
    setIsProcess(true); //処理開始
    setProcessState("バックエンドへの通信を開始");

    try {
      // バックエンドのコマンドを呼び出し（ローカル変数を送信）
      await invoke('get_graphdata', { graphCondition: newGraphCondition});
      const response=await fetch('http://127.0.0.1:8080/get_graphdata',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify({machine_name:machineName}),
      });

      const data= await response.json();
      if(data.success){
        console.log('処理成功:',data);
        setAlarmCodes(data.alarm_header);
        setMachineUnitData(data.alarm_data)
        setDownloads(false);
        setIsTable(true)
      }else{
        console.log('処理失敗:',data);
        setDownloads(false);
        setIsError(true);
        setErrorMessage(data.message);
      }

    } catch (error) {
      console.error('コマンド呼び出しエラー:', error);
      setIsProcess(false); // ← エラー時も処理中フラグを解除
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
      ):null}
      {isProcess ?
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
              gap: 2,
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" gutterBottom>
              グラフデータを取得中...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {processState}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      :null
      }
      {
        isGraph ? <GraphManager graphCondition={graphCondition} resultData={resultData}/> : null
      }
    </Box>
  );
}

