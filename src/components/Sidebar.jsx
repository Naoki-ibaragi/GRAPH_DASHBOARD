import { Button,Drawer, List, ListItem, ListItemText } from "@mui/material";

export default function Sidebar({ onSelect,openSideBar,setOpenSideBar }) {

  const onClickSideBarItem=(item)=>{
    onSelect(item);
    setOpenSideBar(false);
  }

  return (
    <Drawer 
      variant="permanent" 
      anchor="left"
      PaperProps={{
        sx:{
          zIndex:1000,
          width:180,
          paddingY:8,
        }
      }}
      >
      <List>
        <ListItem button="true" onClick={()=>onClickSideBarItem("LotDataDownloads")}>
          <ListItemText primary="LotDataDownloads" />
        </ListItem>
        <ListItem button="true" onClick={()=>onClickSideBarItem("AlarmDataDownloads")}>
          <ListItemText primary="AlarmDownloads" />
        </ListItem>
        <ListItem button="true" onClick={()=>onClickSideBarItem("dashboard1")}>
          <ListItemText primary="Graph1" />
        </ListItem>
        <ListItem button="true" onClick={()=>onClickSideBarItem("settings")}>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
}
