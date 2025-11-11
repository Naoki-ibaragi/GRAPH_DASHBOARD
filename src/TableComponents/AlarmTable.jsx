import { useEffect, useState, useMemo, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  Box,
} from "@mui/material";

// メモ化されたセルコンポーネント - 0の値にはTooltipを表示しない
const MemoizedCell = memo(({ value, index, explanation }) => {
    if (index >= 4 && value !== 0 && value !== "0") {
        return (
            <Tooltip title={explanation} arrow placement="top">
                <span style={{ cursor: "help" }}>{value}</span>
            </Tooltip>
        );
    }
    return <span>{value}</span>;
});

MemoizedCell.displayName = 'MemoizedCell';

// メモ化された行コンポーネント
const MemoizedRow = memo(({ row, columnWidth, columnWidth_alarm, explanation_list }) => {
    return (
        <TableRow hover>
            {row.map((cell, c_index) => (
                <TableCell
                    key={c_index}
                    align="center"
                    sx={{
                        position: c_index < 4 ? "sticky" : "static",
                        left: c_index < 4 ? `${c_index * columnWidth}px` : "auto",
                        backgroundColor: c_index < 4 ? "#fff" : "inherit",
                        minWidth: c_index < 4 ? columnWidth : columnWidth_alarm,
                        width: c_index < 4 ? columnWidth : columnWidth_alarm,
                        zIndex: c_index < 4 ? 1 : "auto",
                        borderRight: c_index === 3 ? "2px solid #ddd" : "1px solid #e0e0e0",
                        boxShadow: c_index === 3 ? "2px 0 4px rgba(0,0,0,0.1)" : "none",
                    }}
                >
                    <MemoizedCell
                        value={cell}
                        index={c_index}
                        explanation={c_index >= 4 ? explanation_list[c_index - 4] : ""}
                    />
                </TableCell>
            ))}
        </TableRow>
    );
});

MemoizedRow.displayName = 'MemoizedRow';

function AlarmTable({ alarmCodes, machineUnitData }) {
    if (!alarmCodes || !machineUnitData) return null;

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isRendering, setIsRendering] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // データが変わったら再レンダリング状態にする
    useEffect(() => {
        setIsRendering(true);
        // 少し遅延させてからレンダリング完了とする
        const timer = setTimeout(() => {
            setIsRendering(false);
        }, 100);
        return () => clearTimeout(timer);
    }, [alarmCodes, machineUnitData]);

    // ヘッダーとデータをメモ化
    const { header_list, explanation_list, rows } = useMemo(() => {
        const unit_list = ["ld", "dc1", "ac1", "ac2", "dc2", "ip", "uld"];
        let header_list = ["ロット名", "機種名", "ロット開始時刻", "ロット終了時刻"];
        let explanation_list = [];

        // header一覧
        unit_list.forEach((unit) => {
            const alarm_code_list = alarmCodes[`${unit}_alarm`];
            if (alarm_code_list) {
                Object.keys(alarm_code_list).forEach((alarm_code) => {
                    header_list.push(`${unit.toUpperCase()}_${alarm_code}`);
                    explanation_list.push(`${unit.toUpperCase()} : ${alarm_code_list[alarm_code]}`);
                });
            }
        });

        // 各行のレコード
        const rows = Object.keys(machineUnitData).map((key) => {
            const lot = machineUnitData[key];
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

        return { header_list, explanation_list, rows };
    }, [alarmCodes, machineUnitData]);

    const columnWidth = 150;
    const columnWidth_alarm = 50;

    // レンダリング中はローディング表示
    if (isRendering) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 400,
                    gap: 2,
                }}
            >
                <CircularProgress size={60} />
                <Box sx={{ fontSize: "1.1rem", color: "text.secondary" }}>
                    テーブルを描画中...
                </Box>
            </Box>
        );
    }

    return (
        <TableContainer
            component={Paper}
            sx={{
                maxHeight: 600,
                maxWidth: windowWidth * 0.96,
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
                        <MemoizedRow
                            key={r_index}
                            row={row}
                            columnWidth={columnWidth}
                            columnWidth_alarm={columnWidth_alarm}
                            explanation_list={explanation_list}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default AlarmTable;