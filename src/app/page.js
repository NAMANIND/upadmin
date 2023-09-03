"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../utils/next.config";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const Home = () => {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [expoPushTokens, setExpoPushTokens] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "Users"),
      where("language", "==", selectedLanguage)
    );

    const unsub = onSnapshot(q, (querySnapshot) => {
      const tokens = [];
      const userData = [];
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.expoPushToken) {
          tokens.push(user.expoPushToken);
          userData.push(user);
        }
      });
      setExpoPushTokens(tokens);
      setUsers(userData);
    });

    return () => {
      unsub();
    };
  }, [selectedLanguage]);

  const sendNotifications = async () => {
    if (users.length === 0 || expoPushTokens.length === 0) {
      alert("No users to send notifications to.");
      return;
    }

    try {
      const response = await axios.post(
        "https://admin-server-notification.vercel.app/send-notifications",
        {
          notificationTitle,
          notificationMessage,
          expoPushTokens,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      setNotificationTitle("");
      setNotificationMessage("");
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <h2>Notifications</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Notification Title"
              fullWidth
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notification Message"
              fullWidth
              multiline
              rows={4}
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Language</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                label="Select Language"
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Hindi">Hindi</MenuItem>
                <MenuItem value="Arabic">Arabic</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={sendNotifications}
          style={{ marginTop: "20px" }}
        >
          Send Notifications
        </Button>
      </div>
    </div>
  );
};

export default Home;
