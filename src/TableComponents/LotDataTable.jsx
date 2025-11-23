import { useRef, useState, useEffect } from "react";
import { lot_table_headers } from "../Variables/LotTableHeader";

function LotDataTable({ lotUnitData }) {
    if (!lotUnitData) return null;

    const columnWidth = 150;
    const columnWidth_last = 120;
    const columnWidth_time = 150;
    const rowHeight = 32;
    const headerHeight = 48;
    const overscan = 5;

    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const containerHeight = 552; // 600 - headerHeight
    //テーブルのヘッダー
    const header_arr=Object.keys(lot_table_headers);

    //ロットデータをバックエンドからもらった生データから表示用に置き換える
    let display_datas=[];
    Object.keys(lotUnitData).map((chip_key)=>{
        const unit_vec=[];
        const chip_unit_data=lotUnitData[chip_key];

        Object.keys(chip_unit_data).map((data_key,idx)=>{
            const data_type=lot_table_headers[header_arr[idx]]; //num or str
            if (data_type in chip_unit_data[data_key]){
                unit_vec.push(chip_unit_data[data_key][data_type]);
            }else{
                unit_vec.push("");
            }
        });
        display_datas.push(unit_vec);
    });
    console.log("display_datas",display_datas);


    useEffect(() => {
        
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = (e) => {
            setScrollTop(e.target.scrollTop);
            if (headerRef.current) {
                headerRef.current.scrollLeft = e.target.scrollLeft;
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex = Math.min(
        display_datas.length,
        Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    const visibleRows = display_datas.slice(startIndex, endIndex);
    const totalHeight = display_datas.length * rowHeight;
    const offsetY = startIndex * rowHeight;

    return (
        <div
            style={{
                height: 600,
                border: "1px solid #ddd",
                borderRadius: "4px",
                overflow: "hidden",
                backgroundColor: "#fff",
            }}
        >
            {/* ヘッダー */}
            <div
                ref={headerRef}
                style={{
                    display: "flex",
                    height: headerHeight,
                    backgroundColor: "#f5f5f5",
                    borderBottom: "2px solid #ddd",
                    overflow: "hidden",
                    fontSize:"10px"
                }}
            >
                {header_arr.map((header, index) => (
                    <div
                        key={index}
                        style={{
                            minWidth: index==header_arr.length-1 ? columnWidth : columnWidth,
                            width: index==header_arr.length-1 ? columnWidth : columnWidth,
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px",
                            borderRight: index==header_arr.length-1 ? null:"1px solid #e0e0e0",
                            flexShrink: 0,
                        }}
                    >
                        {header}
                    </div>
                ))}
            </div>

            {/* ボディ */}
            <div
                ref={containerRef}
                style={{
                    height: containerHeight,
                    overflow: "auto",
                    minWidth: "100%"
                }}
            >
                <div style={{ height: totalHeight, position: "relative"}}>
                    <div
                        style={{
                            position: "absolute",
                            top: offsetY,
                            left: 0,
                            right: 0,
                        }}
                    >
                        {visibleRows.map((row, index) => {
                            const actualIndex = startIndex + index;
                            const isEven = actualIndex % 2 === 0;

                            return (
                                <div
                                    key={actualIndex}
                                    style={{
                                        display: "flex",
                                        height: rowHeight,
                                        backgroundColor: isEven ? "#fff" : "#fafafa",
                                        borderBottom: "1px solid #e0e0e0",
                                    }}
                                >
                                    {row.map((cell, c_index) => (
                                        <div
                                            key={c_index}
                                            style={{
                                                minWidth: c_index==header_arr.length-1 ? columnWidth_last : columnWidth,
                                                width: c_index==header_arr.length-1 ? columnWidth_last : columnWidth,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "8px",
                                                borderRight: c_index==header_arr.length-1 ? "0px":"1px solid #e0e0e0",
                                                flexShrink: 0,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                fontSize:"12px"
                                            }}
                                            title={String(cell)}
                                        >
                                            {cell}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LotDataTable;