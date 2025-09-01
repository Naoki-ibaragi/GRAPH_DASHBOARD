import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChartCard1 from "./components/ChartCard1";
import Downloads from "./components/Downloads";
import { Typography } from "@mui/material";

function App() {
  const [selectedPage, setSelectedPage] = useState("downloads");

  return (
    <div style={{ display: "flex" }}>
      <Sidebar onSelect={setSelectedPage} />
      <main style={{ marginLeft: 240, padding: "20px", flex: 1 }}>
        {/* Downloads */}
        <div hidden={selectedPage !== "downloads"}>
          <Downloads />
        </div>

        {/* Dashboard */}
        <div hidden={selectedPage !== "dashboard"}>
          <ChartCard1 />
        </div>

        {/* Reports */}
        <div hidden={selectedPage !== "reports"}>
          <Typography variant="h4">Reports Section</Typography>
        </div>

        {/* Settings */}
        <div hidden={selectedPage !== "settings"}>
          <Typography variant="h4">Settings Section</Typography>
        </div>
      </main>
    </div>
  );
}

export default App;

