import React, { useEffect, useState } from "react";
import { Divider, List, ListItem, ListItemText, Chip } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import "./styles.css";

function UserList({ advancedFeatures }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user/list");
        const userList = response.data;
        const usersWithCounts = await Promise.all(
          userList.map(async (user) => {
            const photoCountResponse = await axios.get(
              `http://localhost:3000/user/${user._id}/photoCount`
            );
            const commentCountResponse = await axios.get(
              `http://localhost:3000/user/${user._id}/commentCount`
            );
            return {
              ...user,
              photoCount: photoCountResponse.data.count,
              commentCount: commentCountResponse.data.count,
            };
          })
        );
        setUsers(usersWithCounts);
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <List component="nav">
      {users.map((user) => (
        <div key={user._id}>
          <ListItem
            button
            onClick={() => {
              navigate(`/users/${user._id}`, { state: { userId: user._id } });
            }}
          >
            <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            {advancedFeatures && (
              <>
                <Chip label={user.photoCount} color="success" />
                <Chip
                  label={user.commentCount}
                  color="error"
                  component={Link}
                  to={`/users/${user._id}/comments`}
                />
              </>
            )}
          </ListItem>
          <Divider />
        </div>
      ))}
    </List>
  );
}

export default UserList;
