"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { db } from "../utils/next.config";
import { collection, query, onSnapshot, where } from "firebase/firestore";

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
    if (!notificationTitle || !notificationMessage) {
      alert("Please enter notification title and message.");
      return;
    }
    if (users.length === 0 || expoPushTokens.length === 0) {
      alert("No users to send notifications to.");
      return;
    }

    try {
      const serverKey = process.env.NEXT_PUBLIC_FIREBASE_SERVER_KEY; // Replace with your Firebase project's server key
      const headers = {
        "Content-Type": "application/json",
        Authorization: `key=${serverKey}`,
      };

      // Construct the notification payload

      const notificationMessagelimit =
        notificationMessage
          .replace(/<[^>]*>/g, " ") // Remove HTML tags
          .replace(/&nbsp;/g, " ") // Replace &nbsp; with regular space
          .substring(0, 190) + "...";
      const notification = {
        title: notificationTitle,
        body: notificationMessagelimit,
      };

      const fcmMessage = {
        notification,
        registration_ids: expoPushTokens, // An array of FCM tokens to send notifications to
      };

      const response = await axios.post(
        "https://fcm.googleapis.com/fcm/send",
        fcmMessage,
        {
          headers,
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
    <div style={{ width: "95%", padding: "20px" }}>
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
                <MenuItem value="हिंदी">हिंदी</MenuItem>
                <MenuItem value="বাংলা">বাংলা</MenuItem>
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
