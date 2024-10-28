import React, { useEffect, useState } from "react";
import { Divider, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

import "./styles.css";

function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchModel("http://localhost:3000/user/list")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user list:", error);
      });
  }, []);

  return (
    <List component="nav">
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
  );
}

export default UserList;
