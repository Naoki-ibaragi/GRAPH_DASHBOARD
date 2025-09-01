
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
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";

export default function ChartCard1() {
  const [graphType, setGraphType] = useState("ScatterPlot");
  const [xdimItem, setXdimItem] = useState("LD_COORD_X");
  const [ydimItem, setYdimItem] = useState("LD_COORD_Y");
  const [operator, setOperator] = useState("and");

  const [filters, setFilters] = useState(
    Array(5).fill({
      enable:false,
      dimItem: "LD_COORD_X",
      dimVal: "",
      dimOperator: "equal",
    })
  );

  const dim_items = {
    "LD座標X": "LD_COORD_X",
    "LD座標Y": "LD_COORD_Y",
  };

  const operator_items = {
    "に等しい": "equal",
    "に等しくない": "not_equal",
    "より大きい": "greater_than",
    "より小さい": "less_than",
  };

  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const handleRadioButton=(e)=>{
    setOperator(e.target.value);
  }

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
    <Box>
      <Card>
        <CardContent>
          {/* グラフ種類 */}
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              グラフ種類
            </Typography>
            <Select
              size="small"
              sx={{height:32}}
              value={graphType}
              onChange={(e) => setGraphType(e.target.value)}
            >
              <MenuItem value={"ScatterPlot"}>散布図</MenuItem>
              <MenuItem value={"LinePlot"}>折れ線グラフ</MenuItem>
              <MenuItem value={"Histogram"}>ヒストグラム</MenuItem>
            </Select>
          </Box>

          {/* 軸設定 */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                X軸の項目
              </Typography>
              <Select
                size="small"
                sx={{height:32}}
                fullWidth
                value={xdimItem}
                onChange={(e) => setXdimItem(e.target.value)}
              >
                {Object.keys(dim_items).map((key) => (
                  <MenuItem key={key} value={dim_items[key]}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                Y軸の項目
              </Typography>
              <Select
                size="small"
                sx={{height:32}}
                fullWidth
                value={ydimItem}
                onChange={(e) => setYdimItem(e.target.value)}
              >
                {Object.keys(dim_items).map((key) => (
                  <MenuItem key={key} value={dim_items[key]}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

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
          <Button
            variant="contained"
            color="primary"
          >
            グラフ作成開始
          </Button>
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

