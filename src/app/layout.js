"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import "./globals.css";

import Menu from "@/components/menu/Menu";
import { TextField, Button, FormControl } from "@mui/material";
import Image from "next/image";

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // You can add your logic to validate employee ID and password here
    // For simplicity, let's assume the login is successful if employee ID is "admin" and password is "password"
    if (employeeId === "devloper" && password === "123") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100vw",
            height: "100vh",
          }}
        >
          {isLoggedIn ? (
            <>
              <Navbar style={{ width: "100%" }} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Menu />
                {children}
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100vw",
                height: "100vh",
                background: "#fff",
              }}
            >
              <img src="acplus.jpg" alt="Comapny logo" />
              <h2 style={{ marginTop: "20px", marginBottom: "0" }}>
                Admin Login
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "300px",
                  padding: "20px",
                  borderRadius: "8px",
                  // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  // background: "#fff",
                }}
              >
                <TextField
                  label="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  fullWidth
                  margin="dense"
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  margin="dense"
                />
                <Button
                  onClick={handleLogin}
                  variant="contained"
                  color="primary"
                  style={{ marginTop: "20px" }}
                >
                  Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
