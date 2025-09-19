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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

export default function GraphSetting(props) {

    const graphType=props.graphType; //グラフの種類
    const setGraphType=props.setGraphType;
    const xdimItem=props.xdimItem; //x軸の項目
    const setXdimItem=props.setXdimItem;
    const ydimItem=props.ydimItem; //Y軸の項目
    const setYdimItem=props.setYdimItem;
    const alarmUnit=props.alarmUnit; //グラフに表示するアラームのユニット
    const setAlarmUnit=props.setAlarmUnit;
    const alarmNumbers=props.alarmNumbers; //アラームの番号
    const setAlarmNumbers=props.setAlarmNumbers;
    const operator=props.operator; //フィルターの結び方
    const setOperator=props.setOperator;
    const filters=props.filters; //フィルターの中身(配列)
    const setFilters=props.setFilters;

    //グラフの種類一覧
    const graph_items = {
        "散布図": "ScatterPlot",
        "折れ線グラフ": "LinePlot",
        "ヒストグラム": "Histogram",
        "2軸ヒートマップ": "2DHeatmap",
        "3軸ヒートマップ": "3DHeatmap",
    };

    //ユニット一覧
    const unit_items={
        "LD":"LD",
        "DC1":"DC1",
        "AC1":"AC1",
        "AC2":"AC2",
        "DC2":"DC2",
        "IP":"IP",
        "ULD":"ULD",
    };

    //軸項目一覧
    const dim_items = {
        "LDポケット座標X": "LD_COORD_X",
        "LDポケット座標Y": "LD_COORD_Y",
        "DC1検査ステージアライメントX": "DC1_TEST_ALIGN_X",
        "DC1検査ステージアライメントY": "DC1_TEST_ALIGN_Y",
    };

    //フィルターの比較詞
    const operator_items = {
        "に等しい": "equal",
        "に等しくない": "not_equal",
        "より大きい": "greater_than",
        "より小さい": "less_than",
    };

    //アラーム設定のテキストボックス書き換え時のハンドラ
    const handleAlarmNumberChange=(val)=>{
        setAlarmNumbers(val.split(","));
    }

    //フィルターのエントリー記入時にハンドラー
    const handleFilterChange = (index, field, value) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [field]: value };
        setFilters(newFilters);
    };

    //フィルターのラジオボタンクリック時のハンドラー
    const handleRadioButton=(e)=>{
        setOperator(e.target.value);
    };

    //フィルターを追加する
    const addFilter=()=>{
        const newFilters = [...filters];
        newFilters.push(
        {
            enable:true,
            dimItem: "LD_COORD_X",
            dimVal: "",
            dimOperator: "equal",
        });
        setFilters(newFilters);
    };

    //フィルターを追加する
    const deleteFilter=(index)=>{
        const newFilters = [
        ...filters.slice(0, index),
        ...filters.slice(index + 1)
        ];
        setFilters(newFilters);
    };

    return (
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
                    sx={{mr:3,height:32,width:300}}
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
                    sx={{mr:3,height:32,width:300}}
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
                    value={(alarmNumbers.join(","))}
                    onChange={(e) =>
                        handleAlarmNumberChange(e.target.value)
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
                    sx={{height:32,width:300}}
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
                <Grid>
                    {index>0 ? (
                        <Button onClick={(e)=>deleteFilter(index)}>
                            <DeleteIcon></DeleteIcon>
                        </Button>
                    ):null}
                </Grid>
                <Grid>
                    {index===(filters.length)-1 ? (
                        <Button onClick={addFilter}>
                            <AddCircleOutlineIcon></AddCircleOutlineIcon>
                        </Button>
                    ):null}
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
    )
}

