import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";

function AlarmTable({ alarmCodes, lotUnitData }) {
    if (!alarmCodes || !lotUnitData) return null;
    const unit_list = ["ld", "dc1", "ac1", "ac2", "dc2", "ip", "uld"];
    let header_list = ["ロット名", "機種名", "ロット開始時刻", "ロット終了時刻"];
    let explanation_list = [];
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        // リサイズ時に呼ばれる関数
        const handleResize = () => {
        setWindowWidth(window.innerWidth);
        };

        // イベントリスナー登録
        window.addEventListener("resize", handleResize);

        // クリーンアップ（コンポーネントがアンマウントされた時に解除）
        return () => {
        window.removeEventListener("resize", handleResize);
        };
    }, []);
    
    //header一覧    
    unit_list.forEach((unit) => {
        const alarm_code_list = alarmCodes[`${unit}_alarm`];
        if (alarm_code_list) {
            Object.keys(alarm_code_list).forEach((alarm_code) => {
                header_list.push(`${unit.toUpperCase()}_${alarm_code}`);
                explanation_list.push(`${unit.toUpperCase()} : ${alarm_code_list[alarm_code]}`);
            });
        }
    });

    //各行のレコード
    const rows = Object.keys(lotUnitData).map((key) => {
        const lot = lotUnitData[key];
        const lot_data = [
            key,
            lot.type_name,
            lot.lot_start_time,
            lot.lot_end_time,
        ];
        unit_list.forEach((unit) => {
            Object.values(lot.alarm_list[`${unit}_alarm`]).forEach((alarm_value) => {
                lot_data.push(alarm_value);
            });
        });
        return lot_data;
    });
    
    const columnWidth = 150;
    const columnWidth_alarm = 50;
    
    return (
        <TableContainer
            component={Paper}
            sx={{
                maxHeight: 600,
                maxWidth: windowWidth*0.96,
                overflow: "auto",
            }}
        >
            <Table stickyHeader sx={{ tableLayout: "fixed" }}>
                <TableHead>
                    <TableRow>
                        {header_list.map((header, index) => (
                            <TableCell
                                key={index}
                                align="center"
                                sx={{
                                    position: "sticky",
                                    left: index < 4 ? `${index * columnWidth}px` : "auto",
                                    top: 0,
                                    backgroundColor: "#f5f5f5",
                                    fontWeight: "bold",
                                    minWidth: index < 4 ? columnWidth : columnWidth_alarm,
                                    width: index < 4 ? columnWidth : columnWidth_alarm,
                                    zIndex: index < 4 ? 3 : 2,
                                    borderRight: index === 3 ? "2px solid #ddd" : "1px solid #e0e0e0",
                                    boxShadow: index === 3 ? "2px 0 4px rgba(0,0,0,0.1)" : "none",
                                }}
                            >
                                {index >= 4 ? (
                                    <Tooltip title={explanation_list[index - 4]} arrow placement="top">
                                        <span style={{ cursor: "help" }}>{header}</span>
                                    </Tooltip>
                                ) : (
                                    header
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, r_index) => (
                        <TableRow key={r_index} hover>
                            {row.map((cell, c_index) => (
                                <TableCell
                                    key={c_index}
                                    align="center"
                                    sx={{
                                        position: c_index < 4 ? "sticky" : "static",
                                        left: c_index < 4 ? `${c_index * columnWidth}px` : "auto",
                                        backgroundColor: c_index < 4 ? "#fff" : "inherit",
                                        minWidth: c_index < 4 ? columnWidth : columnWidth_alarm,
                                        zIndex: c_index < 4 ? 1 : "auto",
                                        borderRight: c_index === 3 ? "2px solid #ddd" : "1px solid #e0e0e0",
                                        boxShadow: c_index === 3 ? "2px 0 4px rgba(0,0,0,0.1)" : "none",
                                    }}
                                >
                                {c_index >= 4 ? (
                                    <Tooltip title={explanation_list[c_index - 4]} arrow placement="top">
                                        <span style={{ cursor: "help" }}>{cell}</span>
                                    </Tooltip>
                                ) : (
                                    cell
                                )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default AlarmTable;