


import { useRef, useState, useEffect } from "react";

function LotDataTable({ columnHeader, lotUnitData }) {
    if (!columnHeader || !lotUnitData) return null;

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
        lotUnitData.length,
        Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    const visibleRows = lotUnitData.slice(startIndex, endIndex);
    const totalHeight = lotUnitData.length * rowHeight;
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
                {columnHeader.map((header, index) => (
                    <div
                        key={index}
                        style={{
                            minWidth: index==columnHeader.length-1 ? columnWidth : columnWidth,
                            width: index==columnHeader.length-1 ? columnWidth : columnWidth,
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px",
                            borderRight: index==columnHeader.length-1 ? null:"1px solid #e0e0e0",
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
                                                minWidth: c_index==columnHeader.length-1 ? columnWidth_last : columnWidth,
                                                width: c_index==columnHeader.length-1 ? columnWidth_last : columnWidth,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "8px",
                                                borderRight: c_index==columnHeader.length-1 ? "0px":"1px solid #e0e0e0",
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