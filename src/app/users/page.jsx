"use client";
import React, { useState, useEffect } from "react";
import { db, storage } from "../../utils/next.config";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { DataGrid } from "@mui/x-data-grid";
import {
  Modal,
  Button,
  TextField,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { v4 as uuidv4 } from "uuid";
import styles from "./page.module.css"; // Import the CSS module

const Users = () => {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmployeeId, setNewUserEmployeeId] = useState("");
  const [newUserTrade, setNewUserTrade] = useState(""); // Updated to use "Trade" field

  const [searchValue, setSearchValue] = useState(""); // Add this line
  const filteredUsers = users.filter(
    (user) =>
      (user.name &&
        user.name.toLowerCase().includes(searchValue.toLowerCase())) ||
      (user.employeeId &&
        user.employeeId.toLowerCase().includes(searchValue.toLowerCase())) ||
      (user.trade && // Updated to use "trade" field
        user.trade.toLowerCase().includes(searchValue.toLowerCase()))
  );

  useEffect(() => {
    const q = query(collection(db, "Users"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    });

    return () => unsub();
  }, []);

  const columns = [
    { field: "employeeId", headerName: "Employee ID", width: 250 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "trade", headerName: "Trade", width: 150 }, // Updated to use "Trade" field
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteConfirmation(params.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const handleDeleteConfirmation = (userId) => {
    setSelectedUserId(userId);
    setConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      // delete user image from storage
      const userRef = doc(db, "Users", selectedUserId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
      const userImageRef = ref(storage, userData.imageUrl);

      // Check if userData.imageUrl exists and is not empty
      if (userData.imageUrl && userData.imageUrl !== "") {
        try {
          // Delete the user's image from Firebase Storage
          await deleteObject(userImageRef);
          // You can also update the user's data in Firestore to remove the imageUrl, if needed
        } catch (error) {
          console.error(
            "Error deleting user's image from Firebase Storage:",
            error
          );
        }
      }
      // delete user from firestore

      await deleteDoc(doc(db, "Users", selectedUserId));
      setUsers(users.filter((user) => user.id !== selectedUserId));
      setConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmployeeId || !newUserTrade) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const UserId = uuidv4();
      const userDocRef = doc(db, "Users", UserId);
      const userData = {
        userid: UserId,
        name: newUserName,
        employeeId: newUserEmployeeId,
        trade: newUserTrade, // Updated to use "Trade" field
      };

      await setDoc(userDocRef, userData, { merge: true });
      console.log("User created successfully");

      setNewUserName("");
      setNewUserEmployeeId("");
      setNewUserTrade(""); // Updated to use "Trade" field
      setOpenModal(false);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleModalClose = (event) => {
    if (!event.target.closest(".modal-content")) {
      setNewUserName("");
      setNewUserEmployeeId("");
      setNewUserTrade(""); // Updated to use "Trade" field
      setOpenModal(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Users</h2>
      <div className={styles.languageSelector}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
        >
          Add User
        </Button>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <SearchIcon sx={{ color: "#aaa", cursor: "pointer" }} />
            ),
          }}
        />
      </div>

      <DataGrid
        rows={filteredUsers}
        columns={columns}
        className={styles.dataGrid}
        scrollbarSize={5}
      />

      <Modal
        open={openModal}
        onClose={handleModalClose}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="modal-content"
          style={{ padding: "20px", backgroundColor: "#fff", width: "600px" }}
        >
          <h3>Add New User</h3>
          <TextField
            label="Employee ID"
            value={newUserEmployeeId}
            onChange={(e) => setNewUserEmployeeId(e.target.value)}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Trade" // Updated to use "Trade" field
            value={newUserTrade} // Updated to use "Trade" field
            onChange={(e) => setNewUserTrade(e.target.value)} // Updated to use "Trade" field
            required
            fullWidth
            margin="dense"
          />

          <Button onClick={handleAddUser} variant="contained" color="primary">
            Add User
          </Button>
        </div>
      </Modal>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Users;
