import { Box,AppBar,Toolbar,IconButton,Typography,Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function Header(props) {

    const openSideBar = props.openSideBar; //SideBarをオープンするかどうか
    const setOpenSideBar = props.setOpenSideBar; //SideBarをオープンするかどうか
    const title = props.title; //Headerのタイトル

    const handleClickMenuIcon=()=>{ //メニューボタンクリック時の挙動
        setOpenSideBar(!openSideBar);
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar>
                <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ 
                        mr: 2
                    }}
                    onClick={handleClickMenuIcon}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {title} 
                </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Header