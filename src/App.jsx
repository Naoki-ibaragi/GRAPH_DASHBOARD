import { useState,useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChartCard1 from "./components/ChartCard1";
import LotDataDownloads from "./components/LotDataDownloads";
import AlarmDataDownloads from "./components/AlarmDataDownloads";
import Header from "./components/Header";
import RegistData from "./components/RegistData";
import { Box } from "@mui/material";
import { createTheme, ThemeProvider, Button } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00796b",   // メインカラー
      contrastText: "#fff",
    },
    secondary: {
      main: "#d32f2f",
    },
  },
});

function App() {
  const [selectedPage, setSelectedPage] = useState("dashboard1");
  const [openSideBar, setOpenSideBar] = useState(false);
  const [title,setTitle]=useState("dashboard1");

  //const leftSpace=openSideBar ? 150 : 0;
  const leftSpace=0;

  useEffect(() => {
    if (selectedPage === "LotDataDownloads") {
      setTitle("Lot Data Downloads");
    }else if(selectedPage==="AlarmDataDownloads"){
      setTitle("Alarm Data Download");
    } else if (selectedPage === "dashboard1") {
      setTitle("Dashboard1");
    } else if (selectedPage === "register") {
      setTitle("Regist Data");
    } else {
      setTitle("Settings");
    }
  }, [selectedPage]);

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Header openSideBar={openSideBar} setOpenSideBar={setOpenSideBar} title={title}></Header>
        <Box 
        sx={{
          display:"flex",
          paddingY:7
        }}
        >
          {openSideBar ? <Sidebar onSelect={setSelectedPage} openSideBar={openSideBar} setOpenSideBar={setOpenSideBar}/>:<></>}
          <main style={{ marginLeft: leftSpace, padding: "10px", flex: 1 }}>
            {/* Downloads */}
            <div hidden={selectedPage !== "LotDataDownloads"}>
              <LotDataDownloads />
            </div>
            {/* Alarmデータのダウンロードページ */}
            <div hidden={selectedPage !== "AlarmDataDownloads"}>
              <AlarmDataDownloads />
            </div>
            {/* Dashboard */}
            <div hidden={selectedPage !== "dashboard1"}>
              <ChartCard1 />
            </div>
            {/* Settings */}
            <div hidden={selectedPage !== "register"}>
              <RegistData />
            </div>
          </main>
        </Box>
      </ThemeProvider>
    </div>
  );
}

export default App;

