//グラフ描画用データをcsvでダウンロード
export const graphDataDownloads=async (graphCondition,resultData)=>{
    if (graphCondition.graphType==="ScatterPlot"){
        //header行作成
        

    }

    // ヘッダー行
    const header_arr=Object.keys(lot_table_headers);

    // データ行（各行を個別にカンマ区切りにしてから改行で結合）
    let datas=[];
    Object.keys(lotUnitData).map((chip_key)=>{
        const unit_vec=[];
        const chip_unit_data=lotUnitData[chip_key];

        Object.keys(chip_unit_data).map((data_key,idx)=>{
            const data_type=lot_table_headers[header_arr[idx]]; //num or str
            if (chip_unit_data[data_key]==="None"){
                unit_vec.push("");
            }else if (data_type in chip_unit_data[data_key]){
                unit_vec.push(chip_unit_data[data_key][data_type]);
            }else{
                unit_vec.push("");
            }
        });
        datas.push(unit_vec);
    });
    // ヘッダーとデータを結合
    const csvContent = [header_arr, ...datas].join("\n");

    // ファイル保存ダイアログを開く
    const filePath = await save({
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
      defaultPath: `${lotNumber}_data.csv`,
    });

    if (filePath) {
      try {
        // plugin-fs を使ってファイルに書き込む
        await writeTextFile(filePath, csvContent);
        alert("CSVを保存しました!");
      } catch (error) {
        console.error("CSV保存エラー:", error);
        alert(`保存に失敗しました: ${error}`);
      }
    }
}