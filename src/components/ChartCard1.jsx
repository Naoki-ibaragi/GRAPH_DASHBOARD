import Highcharts from "highcharts";
import { useState,useEffect } from "react";
import HighchartsReact from "highcharts-react-official";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  TextField,
  Grid,
  Checkbox,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import GraphSetting from "../graphComponents/GraphSetting";
import { line_plot_x_axis_items,line_plot_y_axis_items } from "../Variables/LinePlotData";
import { scatter_plot_x_axis_items,scatter_plot_y_axis_items } from "../Variables/ScatterPlotData";

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

  //filerオブジェクトを入れる配列
  const [filters, setFilters] = useState(
      Array(1).fill({
      enable:false,
      dimItem: "LD_COORD_X",
      dimVal: "",
      dimOperator: "equal",
      })
  );

  //HighChartのテスト
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
        />
      ):null}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </CardContent>
      </Card>
    </Box>
  );
}

