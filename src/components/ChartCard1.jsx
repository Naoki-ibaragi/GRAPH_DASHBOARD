import Highcharts from "highcharts";
import { useState } from "react";
import HighchartsReact from "highcharts-react-official";
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

export default function ChartCard1() {
  const [graphType, setGraphType] = useState("ScatterPlot"); //グラフの種類
  const [xdimItem, setXdimItem] = useState("LD_COORD_X"); //x軸の項目
  const [ydimItem, setYdimItem] = useState("LD_COORD_Y"); //y軸の項目
  const [alarmUnit, setAlarmUnit] = useState("LD"); //アラームユニットの設定
  const [operator, setOperator] = useState("and"); //フィルターの接続詞
  const [closeSettingCard, setCloseSettingCard] = useState(false); //設定カードを閉じるかどうか(グラフを見やすくするため)

  //filerオブジェクトを入れる配列
  const [filters, setFilters] = useState(
      Array(2).fill({
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
    <Box sx={{width:"100%",maxWidth:"100%"}}>
      <Box sx={{display:"flex",justifyContent:"flex-end"}}>
        <Button type="inherit" >グラフの設定を閉じる</Button>
      </Box>
      <Card>
        <CardContent>
          {/* グラフ種類 */}
          <Box mb={2}>
            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography sx={{mr:1}} variant="subtitle2" gutterBottom>グラフの種類</Typography>
              <Select
                size="small"
                sx={{mr:3,height:32,width:200}}
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
              >
                {Object.keys(graph_items).map((key) => (
                  <MenuItem key={key} value={graph_items[key]}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
              <Typography sx={{mr:1}} variant="subtitle2" gutterBottom>X軸の項目</Typography>
              <Select
                size="small"
                sx={{mr:3,height:32,width:200}}
                value={xdimItem}
                onChange={(e) => setXdimItem(e.target.value)}
              >
                {Object.keys(dim_items).map((key) => (
                  <MenuItem key={key} value={dim_items[key]}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
              <Typography sx={{mr:1}} variant="subtitle2" gutterBottom>Y軸の項目</Typography>
              <Select
                size="small"
                sx={{mr:3,height:32,width:200}}
                value={ydimItem}
                onChange={(e) => setYdimItem(e.target.value)}
              >
                {Object.keys(dim_items).map((key) => (
                  <MenuItem key={key} value={dim_items[key]}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          </Box>
          {/* アラーム番号設定 */}
          {/* 散布図と2Dヒートマップが設定されているときだけ表示するようにする */}
          {graphType === "ScatterPlot" || graphType==="2DHeatmap" ? (
            <Box mb={2}>
              <Stack direction="row" alignItems="center" flexWrap="wrap">
                <Typography sx={{ mr: 1 }} variant="subtitle2" gutterBottom>
                  アラーム設定
                </Typography>
                <Select
                  size="small"
                  sx={{mr:3,height:32,width:200}}
                  value={alarmUnit}
                  onChange={(e) => setAlarmUnit(e.target.value)}
                >
                  {Object.keys(unit_items).map((key) => (
                    <MenuItem key={key} value={unit_items[key]}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
                <Typography sx={{ mr: 1 }} variant="subtitle2" gutterBottom>
                  アラーム番号
                </Typography>
                <TextField
                  size="small"
                  label="アラーム番号"
                  onChange={(e) =>
                    handleFilterChange(index, "dimVal", e.target.value)
                  }
                />
              </Stack>
            </Box>
          ) : null}
          {/* フィルター設定 */}
          <Grid
            container
            spacing={2}
            sx={{
              justifyContent:"left",
              alignItems:"center"
            }}
          >
            <Grid item xs={12} sm={3}>
              <Typography variant="subtitle1" gutterBottom>
                データフィルター設定
              </Typography>
            </Grid>
            {/*フィルター同士をandで結ぶかorで結ぶかを決定*/}
            <Grid item xs={12} sm={3}>
              <RadioGroup 
                row
                value={operator}
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                onChange={(e) =>
                  handleRadioButton(e)
                }
              >
                <FormControlLabel value="and" control={<Radio />} label="ANDで結ぶ" />
                <FormControlLabel value="or" control={<Radio />} label="ORで結ぶ" />
              </RadioGroup>
            </Grid>
          </Grid>
          {filters.map((filter, index) => (
            <Grid
              container
              spacing={2}
              key={index}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Grid item xs={12} sm={3}>
                <Typography variant="body2">{`フィルター${index + 1}`}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Checkbox
                  checked={filter.enable}
                  onChange={(e) =>
                    handleFilterChange(index, "enable", e.target.checked)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Select
                  size="small"
                  sx={{height:32}}
                  fullWidth
                  value={filter.dimItem}
                  onChange={(e) =>
                    handleFilterChange(index, "dimItem", e.target.value)
                  }
                >
                  {Object.keys(dim_items).map((key) => (
                    <MenuItem key={key} value={dim_items[key]}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  size="small"
                  fullWidth
                  label="値"
                  value={filter.dimVal}
                  onChange={(e) =>
                    handleFilterChange(index, "dimVal", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Select
                  size="small"
                  sx={{height:32}}
                  fullWidth
                  value={filter.dimOperator}
                  onChange={(e) =>
                    handleFilterChange(index, "dimOperator", e.target.value)
                  }
                >
                  {Object.keys(operator_items).map((key) => (
                    <MenuItem key={key} value={operator_items[key]}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          ))}
          <Box>
            <Button
              variant="contained"
              color="primary"
            >
              グラフ作成開始
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            プレビュー
          </Typography>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </CardContent>
      </Card>
    </Box>
  );
}

