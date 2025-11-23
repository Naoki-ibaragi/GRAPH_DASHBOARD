import { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import ChartCard1 from "./components/ChartCard1";
import ChartCard2 from "./components/ChartCard2";
import LotDataDownloads from "./components/LotDataDownloads";
import AlarmDataDownloads from "./components/AlarmDataDownloads";
import Header from "./components/Header";
import RegistData from "./components/RegistData";
import Manual from "./components/Manual";
import { AlarmDataProvider } from "./contexts/AlarmDataContext";
import { GraphDataProvider } from "./contexts/GraphDataContext";
import { GraphDataProvider2 } from "./contexts/GraphDataContext2";
import { useBackendEvent } from "./hooks/useBackendEvent";

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
  dashboard2: {
    title: "Dashboard2",
    component: ChartCard2,
  },
  register: {
    title: "Regist Data",
    component: RegistData,
  },
  manual:{
    title: "Manual",
    component: Manual,
  }
};

function App() {
  const [selectedPage, setSelectedPage] = useState("dashboard1");
  const [openSideBar, setOpenSideBar] = useState(false);

  const openManual=()=>{
    setSelectedPage("manual")
  };

  const event=useBackendEvent("open-manual",openManual,[]);

  // 選択されたページの設定を取得
  const currentPage = useMemo(() => {
    return PAGE_CONFIG[selectedPage] || { title: "Settings", component: null };
  }, [selectedPage]);

  const PageComponent = currentPage.component;

  return (
    <AlarmDataProvider>
      <GraphDataProvider>
        <GraphDataProvider2>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header
              openSideBar={openSideBar}
              setOpenSideBar={setOpenSideBar}
              title={currentPage.title}
            />
            <div className="flex pt-16">
              {openSideBar && (
                <Sidebar
                  onSelect={setSelectedPage}
                  openSideBar={openSideBar}
                  setOpenSideBar={setOpenSideBar}
                />
              )}
              <main className="flex-1 p-4 md:p-6 lg:p-4">
                {PageComponent && <PageComponent />}
              </main>
            </div>
          </div>
        </GraphDataProvider2>
      </GraphDataProvider>
    </AlarmDataProvider>
  );
}

export default App;

