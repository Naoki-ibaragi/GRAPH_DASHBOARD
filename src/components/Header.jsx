function Header(props) {
  const openSideBar = props.openSideBar;
  const setOpenSideBar = props.setOpenSideBar;
  const title = props.title;

  const handleClickMenuIcon = () => {
    setOpenSideBar(!openSideBar);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
      <div className="flex items-center px-4 py-3 md:px-6">
        <button
          onClick={handleClickMenuIcon}
          className="mr-4 p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
          aria-label="menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="flex-1 text-xl md:text-2xl font-semibold text-white tracking-wide">
          {title}
        </h1>
      </div>
    </header>
  );
}

export default Header;
