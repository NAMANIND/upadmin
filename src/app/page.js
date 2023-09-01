"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../utils/next.config";
import { collection, query, onSnapshot } from "firebase/firestore";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
} from "@mui/material";

const Home = () => {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [expoPushTokens, setExpoPushTokens] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "Users"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      const tokens = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.expoPushToken) {
          tokens.push(userData.expoPushToken);
        }
      });
      setExpoPushTokens(tokens);
    });

    // Clean up the listener when the component unmounts
    return () => {
      unsub();
    };
  }, []);

  const sendNotifications = async () => {
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
    <div
      style={{
        width: "100%",
        padding: "20px",
      }}
    >
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
