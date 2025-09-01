import { Drawer, List, ListItem, ListItemText } from "@mui/material";

export default function Sidebar({ onSelect }) {
  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItem button onClick={() => onSelect("downloads")}>
          <ListItemText primary="Downloads" />
        </ListItem>
        <ListItem button onClick={() => onSelect("dashboard")}>
          <ListItemText primary="Graph1" />
        </ListItem>
        <ListItem button onClick={() => onSelect("dashboard")}>
          <ListItemText primary="Graph2" />
        </ListItem>
        <ListItem button onClick={() => onSelect("reports")}>
          <ListItemText primary="Graph3" />
        </ListItem>
        <ListItem button onClick={() => onSelect("reports")}>
          <ListItemText primary="Graph4" />
        </ListItem>
        <ListItem button onClick={() => onSelect("reports")}>
          <ListItemText primary="Graph5" />
        </ListItem>
        <ListItem button onClick={() => onSelect("settings")}>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
}
