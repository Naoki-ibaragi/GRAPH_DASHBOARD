import { useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import ChartCard1 from "./components/ChartCard1";
import ChartCard2 from "./components/ChartCard2";
import ChartCard3 from "./components/ChartCard3";
import ChartCard4 from "./components/ChartCard4";
import LotDataDownloads from "./components/LotDataDownloads";
import LotDataDownloadsVer2 from "./components/LotDataDownloadsVer2";
import LotDataAnalysis from "./components/LotDataAnalysis";
import AlarmDataAnalysis from "./components/AlarmDataAnalysis";
import OperationDataDownloads from "./components/OperationDataDownloads";
import EventDataDownloads from "./components/EventDataDownloads";
import Header from "./components/Header";
import Settings from "./components/Settings";
import Manual from "./components/Manual";
import { LotDataProvider } from "./contexts/LotDataContext";
import { LotDataVer2Provider } from "./contexts/LotDataContextVer2";
import { LotDataAnalysisProvider } from "./contexts/LotDataAnalysisContext";
import { AlarmDataProvider } from "./contexts/AlarmDataContext";
import { OperationDataProvider } from "./contexts/OperationDataContext";
import { GraphDataProvider } from "./contexts/GraphDataContext";
import { GraphDataProvider2 } from "./contexts/GraphDataContext2";
import { GraphDataProvider3 } from "./contexts/GraphDataContext3";
import { GraphDataProvider4 } from "./contexts/GraphDataContext4";
import { EventDataProvider } from "./contexts/EventDataContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { useBackendEvent } from "./hooks/useBackendEvent";

// ページ設定の定義
const PAGE_CONFIG = {
  LotDataDownloads: {
    title: "従来機 Lot Data Downloads",
    component: LotDataDownloads,
  },
  LotDataDownloadsVer2: {
    title: "小型機 Lot Data Downloads",
    component: LotDataDownloadsVer2,
  },
  AlarmDataAnalysis: {
    title: "Alarm Data Download",
    component: AlarmDataAnalysis,
  },
  LotDataAnalysis: {
    title: "Lot Data Graph Analysis",
    component: LotDataAnalysis,
  },
  EventDataAnalysis: {
    title: "Event Data Analysis",
    component: EventDataDownloads,
  },
  OperationDataDownloads:{
    title:"Operation Data Download",
    component:OperationDataDownloads,
  },
  Graph1: {
    title: "従来機 Graph1",
    component: ChartCard1,
  },
  Graph2: {
    title: "従来機 Graph2",
    component: ChartCard2,
  },
  Graph3: {
    title: "小型機 Graph1",
    component: ChartCard3,
  },
  Graph4: {
    title: "小型機 Graph2",
    component: ChartCard4,
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
        <LotDataVer2Provider>
          <LotDataAnalysisProvider>        
            <AlarmDataProvider>
              <OperationDataProvider>
                <GraphDataProvider>
                  <GraphDataProvider2>
                    <GraphDataProvider3>
                      <GraphDataProvider4>
                        <EventDataProvider>
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
                        </EventDataProvider>
                      </GraphDataProvider4>
                    </GraphDataProvider3>
                  </GraphDataProvider2>
                </GraphDataProvider>
              </OperationDataProvider>
            </AlarmDataProvider>
          </LotDataAnalysisProvider>
        </LotDataVer2Provider>
      </LotDataProvider>
    </ConfigProvider>
  );
}

export default App;

