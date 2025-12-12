//グラフ描画用データをcsvでダウンロード
import { line_plot_y_axis_items } from '../Variables/LinePlotData';
import { scatter_plot_x_axis_items,scatter_plot_y_axis_items } from '../Variables/ScatterPlotData';
import { density_plot_x_axis_items,density_plot_y_axis_items } from '../Variables/DensityPlotData';
import { histogram_axis_items } from '../Variables/HistogramData';
import { getKeyByValue } from '../utils/helpers';
import { open } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { resumeToPipeableStream } from 'react-dom/server';


export const graphDataDownloads=(graphCondition,resultData)=>{
    if (graphCondition.graph_type==="ScatterPlot" || graphCondition.graph_data==="LinePlot"){
        downloads_scatter_and_line_data(graphCondition,resultData);
    }else if(graphCondition.graph_type==="Histogram"){
        downloads_histogram_data(graphCondition,resultData);
    }else if(graphCondition.graph_type=="DensityPlot"){
        downloads_density_data(graphCondition,resultData);
    }
    
}

const downloads_scatter_and_line_data=async (graphCondition,resultData)=>{
    let headers=[];
    let datas=[];
    let units=[];
    const graph_data=resultData.graph_data
    if (graphCondition.graph_type==="ScatterPlot" && graphCondition.graph_x_item.includes("DATE")){
        Object.keys(graph_data).map((unit_name)=>{
            headers.push([getKeyByValue(scatter_plot_x_axis_items,graphCondition.graph_x_item),getKeyByValue(scatter_plot_y_axis_items,graphCondition.graph_y_item),"is_alarm"]);
            units.push(unit_name);
            let unit_data_list=[]
            Object.keys(graph_data[unit_name]).map((key,idx)=>{
                let unit_data=[]
                unit_data.push(graph_data[unit_name][key]["Scatter"]["x_data"]["DateData"]);
                unit_data.push(graph_data[unit_name][key]["Scatter"]["y_data"]);
                unit_data.push(graph_data[unit_name][key]["Scatter"]["is_alarm"]);
                unit_data_list.push(unit_data);
            });
            datas.push(unit_data_list)
        });
    }else if(graphCondition.graph_type==="ScatterPlot" && !graphCondition.graph_x_item.includes("DATE")){
        Object.keys(graph_data).map((unit_name)=>{
            headers.push([getKeyByValue(scatter_plot_x_axis_items,graphCondition.graph_x_item),getKeyByValue(scatter_plot_y_axis_items,graphCondition.graph_y_item),"is_alarm"]);
            units.push(unit_name);
            let unit_data_list=[]
            Object.keys(graph_data[unit_name]).map((key,idx)=>{
                let unit_data=[]
                unit_data.push(graph_data[unit_name][key]["Scatter"]["x_data"]["NumberData"]);
                unit_data.push(graph_data[unit_name][key]["Scatter"]["y_data"]);
                unit_data.push(graph_data[unit_name][key]["Scatter"]["is_alarm"]);
                unit_data_list.push(unit_data);
            });
            datas.push(unit_data_list)
        });
    
    }else if(graphCondition.graph_type==="LinePlot"){
        Object.keys(graph_data).map((unit_name)=>{
            headers.push(["serial",getKeyByValue(line_plot_y_axis_items,graphCondition.graph_y_item),"is_alarm"]);
            units.push(unit_name);
            let unit_data_list=[]
            Object.keys(graph_data[unit_name]).map((key,idx)=>{
                let unit_data=[]
                unit_data.push(idx+1);
                unit_data.push(graph_data[unit_name][key]["Line"]["y_data"]);
                unit_data.push(graph_data[unit_name][key]["Line"]["is_alarm"]);
                unit_data_list.push(unit_data);
            });
            datas.push(unit_data_list)
        });
    }

    // ヘッダーとデータを結合
    const csvContents=[]
    headers.forEach((header_list,idx)=>{
        const csvContent=[header_list,...datas[idx]].join("\n");
        csvContents.push(csvContent);
    });

    // フォルダ選択ダイアログを開く
    const folderPath = await open({
        directory: true,
        multiple: false,
        title: "CSVファイルの保存先フォルダを選択してください"
    });

    if (!folderPath) {
        console.log("フォルダ選択がキャンセルされました");
        return;
    }

    // csvContentsの中身を1ファイルずつCSVで出力
    try {
        for (let i = 0; i < csvContents.length; i++) {
            const fileName = `${graphCondition.graph_type}_${units[i]}.csv`;
            const filePath = await join(folderPath, fileName);

            // BOM付きUTF-8で保存(日本語文字化け対策)
            const bom = '\uFEFF';
            const contentWithBom = bom + csvContents[i];

            await writeTextFile(filePath, contentWithBom);
            console.log(`ファイル ${i + 1}/${csvContents.length} を保存しました: ${filePath}`);
        }

        alert(`${csvContents.length}個のCSVファイルを保存しました!\n保存先: ${folderPath}`);
    } catch (error) {
        console.error("CSV保存エラー:", error);
        alert(`保存に失敗しました: ${error}`);
    }
}

const downloads_histogram_data=async (graphCondition,resultData)=>{
    //ヒストグラムは1ファイルに全ユニットの情報を入れる
    let header=["bins_min,bins_max"];
    let datas=[];
    const graph_data=resultData.graph_data;
    const bin_edges=resultData.grid_data.histogram_bin_info.bin_edges;
    Object.keys(graph_data).map((unit_name)=>{
        header.push(unit_name);
        let unit_data=[]
        Object.keys(graph_data[unit_name]).map((key,idx)=>{
            unit_data.push(graph_data[unit_name][key]["BinnedHistogram"]["count"]);
        });
        datas.push(unit_data)
    });

    // ヘッダーとデータを結合
    const csvContents=[]
    for (let i = 0; i < bin_edges.length-1; i++) {
        let row=[bin_edges[i],bin_edges[i+1]];
        datas.forEach((unit_data)=>{
            row.push(unit_data[i]);
        })
        csvContents.push(row);
    }
    const csvContent=[header,...csvContents].join("\n");

    // フォルダ選択ダイアログを開く
    const folderPath = await open({
        directory: true,
        multiple: false,
        title: "CSVファイルの保存先フォルダを選択してください"
    });

    if (!folderPath) {
        console.log("フォルダ選択がキャンセルされました");
        return;
    }

    // csvContentsの中身を1ファイルずつCSVで出力
    try {
        const fileName = `${graphCondition.graph_type}_${getKeyByValue(histogram_axis_items, graphCondition.graph_x_item)}.csv`;
        const filePath = await join(folderPath, fileName);

        // BOM付きUTF-8で保存(日本語文字化け対策)
        const bom = '\uFEFF';
        const contentWithBom = bom + csvContent;

        await writeTextFile(filePath, contentWithBom);

        alert(`CSVファイルを保存しました!\n保存先: ${folderPath}`);
    } catch (error) {
        console.error("CSV保存エラー:", error);
        alert(`保存に失敗しました: ${error}`);
    }
}


const downloads_density_data=async (graphCondition,resultData)=>{
    //プロット分割なし
    let header=["x","y","count"];
    let datas=[];
    const x_min=resultData.grid_data.x_min; //xの最小値
    const y_min=resultData.grid_data.y_min; //yの最小値
    const grid_x=resultData.grid_data.grid_x; //xの格子幅
    const grid_y=resultData.grid_data.grid_y; //yの格子幅
    const graph_data=resultData.graph_data.data;
    Object.keys(graph_data).map((key)=>{
        const x_val=graph_data[key]["Heatmap"]["x_data"]
        const y_val=graph_data[key]["Heatmap"]["y_data"]
        const count=graph_data[key]["Heatmap"]["z_data"]
        datas.push([x_min+x_val*grid_x,y_min+y_val*grid_y,count]);
    });
    
    // ヘッダーとデータを結合
    const csvContent=[header,...datas].join("\n");

    // フォルダ選択ダイアログを開く
    const folderPath = await open({
        directory: true,
        multiple: false,
        title: "CSVファイルの保存先フォルダを選択してください"
    });

    if (!folderPath) {
        console.log("フォルダ選択がキャンセルされました");
        return;
    }

    // csvContentsの中身を1ファイルずつCSVで出力
    try {
        const fileName = `${graphCondition.graph_type}_${getKeyByValue(density_plot_x_axis_items, graphCondition.graph_x_item)}_${getKeyByValue(density_plot_y_axis_items,graphCondition.graph_y_item)}.csv`;
        const filePath = await join(folderPath, fileName);

        // BOM付きUTF-8で保存(日本語文字化け対策)
        const bom = '\uFEFF';
        const contentWithBom = bom + csvContent;

        await writeTextFile(filePath, contentWithBom);

        alert(`CSVファイルを保存しました!\n保存先: ${folderPath}`);
    } catch (error) {
        console.error("CSV保存エラー:", error);
        alert(`保存に失敗しました: ${error}`);
    }
}

