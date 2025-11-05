import { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import ChartCard1 from "./components/ChartCard1";
import LotDataDownloads from "./components/LotDataDownloads";
import AlarmDataDownloads from "./components/AlarmDataDownloads";
import Header from "./components/Header";
import RegistData from "./components/RegistData";
import { Box, createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b",
      contrastText: "#fff",
    },
    secondary: {
      main: "#d32f2f",
    },
  },
});

// ページ設定の定義
const PAGE_CONFIG = {
  LotDataDownloads: {
    title: "Lot Data Downloads",
    component: LotDataDownloads,
  },
  AlarmDataDownloads: {
    title: "Alarm Data Download",
    component: AlarmDataDownloads,
  },
  dashboard1: {
    title: "Dashboard1",
    component: ChartCard1,
  },
  register: {
    title: "Regist Data",
    component: RegistData,
  },
};

function App() {
  const [selectedPage, setSelectedPage] = useState("dashboard1");
  const [openSideBar, setOpenSideBar] = useState(false);

  // 選択されたページの設定を取得
  const currentPage = useMemo(() => {
    return PAGE_CONFIG[selectedPage] || { title: "Settings", component: null };
  }, [selectedPage]);

  const PageComponent = currentPage.component;

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Header
          openSideBar={openSideBar}
          setOpenSideBar={setOpenSideBar}
          title={currentPage.title}
        />
        <Box sx={{ display: "flex", paddingY: 7 }}>
          {openSideBar && (
            <Sidebar
              onSelect={setSelectedPage}
              openSideBar={openSideBar}
              setOpenSideBar={setOpenSideBar}
            />
          )}
          <Box component="main" sx={{ padding: "10px", flex: 1 }}>
            {PageComponent && <PageComponent />}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

