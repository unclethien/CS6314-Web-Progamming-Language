import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import "./styles.css";

function UserList() {
  const navigate = useNavigate();
  const users = window.models.userListModel();
  return (
    <div>
      {/* <Typography variant="body1">
        This is the user list, which takes up 3/12 of the window. You might
        choose to use <a href="https://mui.com/components/lists/">Lists</a> and{" "}
        <a href="https://mui.com/components/dividers/">Dividers</a> to display
        your users like so:
      </Typography> */}
      <List component="nav">
        {/* <ListItem>
          <ListItemText primary="Item #1" />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Item #2" />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText primary="Item #3" />
        </ListItem>
        <Divider /> */}
        {users.map((user) => (
          <div key={user._id}>
            <ListItem
              button
              onClick={() => {
                navigate(`/users/${user._id}`);
              }}
            >
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>
      {/* <Typography variant="body1">
        The model comes in from window.models.userListModel()
      </Typography> */}
    </div>
  );
}

export default UserList;
