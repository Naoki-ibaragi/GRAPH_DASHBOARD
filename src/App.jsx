import { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import ChartCard1 from "./components/ChartCard1";
import ChartCard2 from "./components/ChartCard2";
import ChartCard3 from "./components/ChartCard3";
import LotDataDownloads from "./components/LotDataDownloads";
import LotDataAnalysis from "./components/LotDataAnalysis";
import AlarmDataDownloads from "./components/AlarmDataDownloads";
import OperationDataDownloads from "./components/OperationDataDownloads";
import Header from "./components/Header";
import Settings from "./components/Settings";
import Manual from "./components/Manual";
import { LotDataProvider } from "./contexts/LotDataContext";
import { LotDataAnalysisProvider } from "./contexts/LotDataAnalysisContext";
import { AlarmDataProvider } from "./contexts/AlarmDataContext";
import { OperationDataProvider } from "./contexts/OperationDataContext";
import { GraphDataProvider } from "./contexts/GraphDataContext";
import { GraphDataProvider2 } from "./contexts/GraphDataContext2";
import { GraphDataProvider3 } from "./contexts/GraphDataContext3";
import { ConfigProvider } from "./contexts/ConfigContext";
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
  LotDataAnalysis: {
    title: "Lot Data Graph Analysis",
    component: LotDataAnalysis,
  },
  OperationDataDownloads:{
    title:"Operation Data Download",
    component:OperationDataDownloads,
  },
  Graph1: {
    title: "Graph1",
    component: ChartCard1,
  },
  Graph2: {
    title: "Graph2",
    component: ChartCard2,
  },
  Graph3: {
    title: "Graph3",
    component: ChartCard3,
  },
  Settings: {
    title: "Settings",
    component: Settings,
  },
  manual:{
    title: "Manual",
    component: Manual,
  }
};

function App() {
  const [selectedPage, setSelectedPage] = useState("Graph1");
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
    <ConfigProvider>
      <LotDataProvider>
        <LotDataAnalysisProvider>        
          <AlarmDataProvider>
            <OperationDataProvider>
              <GraphDataProvider>
                <GraphDataProvider2>
                  <GraphDataProvider3>
                    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                      <Header
                        openSideBar={openSideBar}
                        setOpenSideBar={setOpenSideBar}
                        title={currentPage.title}
                      />
                      <div className="flex pt-12">
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
                  </GraphDataProvider3>
                </GraphDataProvider2>
              </GraphDataProvider>
            </OperationDataProvider>
          </AlarmDataProvider>
        </LotDataAnalysisProvider>
      </LotDataProvider>
    </ConfigProvider>
  );
}

export default App;

