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
          backgroundColor:"#1976d2",
          color:"white",
          zIndex:1000,
          width:150,
          paddingY:8,
        }
      }}
      >
      <List>
        <ListItem button onClick={()=>onClickSideBarItem("downloads")}>
          <ListItemText primary="Downloads" />
        </ListItem>
        <ListItem button onClick={()=>onClickSideBarItem("dashboard")}>
          <ListItemText primary="Graph1" />
        </ListItem>
        <ListItem button onClick={()=>onClickSideBarItem("dashboard")}>
          <ListItemText primary="Graph2" />
        </ListItem>
        <ListItem button onClick={()=>onClickSideBarItem("settings")}>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
}
