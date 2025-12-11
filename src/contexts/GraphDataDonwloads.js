//グラフ描画用データをcsvでダウンロード

import { line_plot_y_axis_items } from '../Variables/LinePlotData';
import { scatter_plot_x_axis_items,scatter_plot_y_axis_items } from '../Variables/ScatterPlotData';
import { getKeyByValue } from '../utils/helpers';
import { open } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';


export const graphDataDownloads=async (graphCondition,resultData)=>{
    let headers=[];
    let datas=[];
    let units=[];
    console.log("graphCondition@graphDataDownloads",graphCondition);
    console.log("resultData@graphDataDownloads",resultData);
    const graph_data=resultData.graph_data
    if (graphCondition.graph_type==="ScatterPlot" && graphCondition.x_axis_item.includes("DATE")){
        headers.push([getKeyByValue(scatter_plot_x_axis_items,graphCondition.x_axis_item),getKeyByValue(scatter_plot_y_axis_items,graphCondition.x_axis_item),"is_alarm"]);
        let unit_data_list=[]
        Object.keys(graph_data).map((plot_unit_data,idx)=>{
            let unit_data=[]
            unit_data.push(plot_unit_data["Scatter"]["x_data"]["DateData"]);
            unit_data.push(plot_unit_data["Scatter"]["y_data"]);
            unit_data.push(plot_unit_data["Scatter"]["is_alarm"]);
        });
        datas.push(unit_data_list)

    }else if(graphCondition.graph_type==="ScatterPlot" && !graphCondition.x_axis_item.includes("DATE")){
        headers.push([getKeyByValue(scatter_plot_x_axis_items,graphCondition.x_axis_item),getKeyByValue(scatter_plot_y_axis_items,graphCondition.x_axis_item),"is_alarm"]);
        let unit_data_list=[]
        Object.keys(graph_data).map((plot_unit_data,idx)=>{
            let unit_data=[]
            unit_data.push(plot_unit_data["Scatter"]["x_data"]["NumberData"]);
            unit_data.push(plot_unit_data["Scatter"]["y_data"]);
            unit_data.push(plot_unit_data["Scatter"]["is_alarm"]);
        });
        datas.push(unit_data_list)
    
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