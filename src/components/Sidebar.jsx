export default function Sidebar({ onSelect, openSideBar, setOpenSideBar }) {
  const onClickSideBarItem = (item) => {
    onSelect(item);
    setOpenSideBar(false);
  };

  const menuItems = [
    { id: "LotDataDownloads", label: "Lot Data Downloads", icon: "📊" },
    { id: "AlarmDataDownloads", label: "Alarm Downloads", icon: "🔔" },
    { id: "Graph1", label: "Graph1", icon: "📈" },
    { id: "Graph2", label: "Graph2", icon: "📈"},
    { id: "Graph3", label: "Graph3", icon: "📈" },
    { id: "Settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-xl z-40 overflow-y-auto scrollbar-thin">
      <nav className="py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onClickSideBarItem(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 rounded-lg transition-all duration-200 group active:scale-98"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
