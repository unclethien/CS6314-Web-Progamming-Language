import React, { useEffect, useState } from "react";
import { Typography, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";  // Adjust the path if necessary
import "./styles.css";
import axios from "axios";
function UserDetail({ userId }) {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // Fetch user details using the fetchModel function
    axios.get(`/user/${userId}`)
    // .then(response => {
    //   // Ensure we only set the necessary properties (id/first_name/last_name) in the state
    //   const minimalUserData = response.data(({ _id, first_name, last_name, location, description, occupation }) => ({
    //     _id,
    //     first_name,
    //     last_name,
    //     location,
    //     description,
    //     occupation
    //   }));
    //   // eslint-disable-next-line no-undef
    //   setUsers(minimalUserData);  // Set the minimal user data in the state
    // })
    .then(response => {
      // Directly access response.data, which is expected to be an object
      const userData = response.data; 
      // Extract only the necessary fields
      const minimalUserData = {
        _id: userData._id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        location: userData.location,
        description: userData.description,
        occupation: userData.occupation,
      };
      setUserDetails(minimalUserData); // Correctly set the state
    })
      .catch(error => {
        console.error("Error fetching user details:", error);
        setUserDetails(null);  // Reset userDetails if there's an error
      });
  }, [userId]);

  if (!userDetails) {
    return <Typography variant="body1">Loading user details...</Typography>;
  }

  return (
    <Paper elevation={3} className="user-detail">
      <Typography variant="h4">{`${userDetails.first_name} ${userDetails.last_name}`}</Typography>
      <Typography variant="body1">Location: {userDetails.location}</Typography>
      <Typography variant="body1">Description: {userDetails.description}</Typography>
      <Typography variant="body1">Occupation: {userDetails.occupation}</Typography>
      <Link to={`/photos/${userId}`}>
        <Button variant="contained" color="primary" style={{ marginTop: '20px' }}>
          View Photos
        </Button>
      </Link>
    </Paper>
  );
}

export default UserDetail;
