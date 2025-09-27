import { useState,useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChartCard1 from "./components/ChartCard1";
import Downloads from "./components/Downloads";
import Header from "./components/Header";
import Settings from "./components/Settings";
import { Typography,Box } from "@mui/material";

function App() {
  const [selectedPage, setSelectedPage] = useState("downloads");
  const [openSideBar, setOpenSideBar] = useState(false);
  const [title,setTitle]=useState("Download");

  const leftSpace=openSideBar ? 150 : 0;

  useEffect(() => {
    if (selectedPage === "downloads") {
      setTitle("Downloads");
    } else if (selectedPage === "dashboard") {
      setTitle("Dashboard");
    } else if (selectedPage === "settings") {
      setTitle("Settings");
    } else {
      setTitle("Settings");
    }
  }, [selectedPage]);

  return (
    <div>
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
        <div hidden={selectedPage !== "downloads"}>
          <Downloads />
        </div>
        {/* Dashboard */}
        <div hidden={selectedPage !== "dashboard"}>
          <ChartCard1 />
        </div>
        {/* Settings */}
        <div hidden={selectedPage !== "settings"}>
          <Settings />
        </div>
      </main>
    </Box>
    </div>
  );
}

export default App;

