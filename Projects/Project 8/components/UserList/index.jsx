import React, { useState, useEffect } from "react";
import { Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";  // Adjust the path as necessary
import "./styles.css";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch all users from the server using fetchModel
    axios.get("/user/list")
    .then(response => {
      // Ensure we only set the necessary properties (id/first_name/last_name) in the state
      const minimalUserData = response.data.map(({ _id, first_name, last_name }) => ({
        _id,
        first_name,
        last_name
      }));
      setUsers(minimalUserData);  // Set the minimal user data in the state
    })
      .catch(error => {
        console.error("Error fetching user list:", error);
        setUsers([]);  // Set users to an empty array if there's an error
      });
  }, []);

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        User List
      </Typography>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem button component={Link} to={`/users/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
