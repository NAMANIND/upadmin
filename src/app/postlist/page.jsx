"use client";
import React, { useEffect, useState } from "react";
import { db, storage } from "../../utils/next.config";
import { DataGrid } from "@mui/x-data-grid";
import {
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  getDoc,
} from "firebase/firestore";

import { deleteObject, ref } from "firebase/storage";
import {
  Modal,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";

import styles from "./page.module.css"; // Import the CSS module

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [openModal, setOpenModal] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedImage, setEditedImage] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // Add this line
  const filteredPosts = posts.filter(
    (post) =>
      (post.title &&
        post.title.toLowerCase().includes(searchValue.toLowerCase())) ||
      (post.content &&
        post.content.toLowerCase().includes(searchValue.toLowerCase())) ||
      (post.imageUrl &&
        post.imageUrl.toLowerCase().includes(searchValue.toLowerCase()))
  );

  useEffect(() => {
    const q = query(collection(db, selectedLanguage));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsub();
  }, [selectedLanguage]);

  const handleDeleteConfirmation = (postId) => {
    setSelectedPostId(postId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      // delet post image from storage
      const postRef = doc(db, selectedLanguage, selectedPostId);
      const postSnapshot = await getDoc(postRef);
      const postData = postSnapshot.data();
      const postImageRef = ref(storage, postData.imageUrl);

      if (postImageRef) {
        await deleteObject(postImageRef);
      }

      // delete post from firestore

      await deleteDoc(doc(db, selectedLanguage, selectedPostId));
      setPosts(posts.filter((post) => post.id !== selectedPostId));
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleEditPost = (post) => {
    setSelectedPostId(post.id);
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setEditedImage(post.imageUrl);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setEditedTitle("");
    setEditedContent("");
    setEditedImage("");
    setSelectedPostId("");
    setOpenModal(false);
  };

  const handleUpdatePost = async () => {
    try {
      if (!selectedPostId) {
        alert("No selected post ID to update.");
        return;
      }

      if (!editedTitle || !editedContent) {
        alert("Title and content must not be empty.");
        return;
      }

      const postRef = doc(db, selectedLanguage, selectedPostId);
      console.log("postRef", postRef);
      const postSnapshot = await getDoc(postRef);

      if (!postSnapshot.exists()) {
        console.error(`Document with ID ${selectedPostId} not found.`);
        return;
      }

      const dataToUpdate = {
        title: editedTitle,
        content: editedContent,
        imageUrl: editedImage,
      };

      await updateDoc(postRef, dataToUpdate);
      console.log("Post updated successfully");
      handleModalClose();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const columns = [
    { field: "title", headerName: "Title", width: 200 },
    { field: "content", headerName: "Content", width: 300 },
    { field: "imageUrl", headerName: "Image URL", width: 300 },
    {
      field: "timestamp",
      headerName: "Timestamp",
      width: 200,
      valueFormatter: (params) => {
        const date = new Date(params.value.seconds * 1000);
        return date.toISOString();
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEditPost(params.row)} size="small">
            <EditIcon />
          </IconButton>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteConfirmation(params.row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <h2>Post List</h2>

      <div className={styles.gridContainer}>
        <FormControl
          className={styles.languageSelector}
          size="small"
          variant="outlined"
        >
          <InputLabel className={styles.inputLabel}>Language</InputLabel>
          <Select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Hindi">Hindi</MenuItem>
            <MenuItem value="Arabic">Arabic</MenuItem>
            {/* Add more language options as needed */}
          </Select>
        </FormControl>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon className={styles.searchIcon} />,
          }}
        />
      </div>

      <DataGrid
        rows={filteredPosts}
        className={styles.dataGrid}
        columns={columns}
        scrollbarSize={5}
      />

      <Modal
        open={openModal}
        onClose={handleModalClose}
        className={styles.modal}
      >
        <div className={styles.modalContent}>
          <h3>Edit Post</h3>
          <TextField
            label="Title"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Content"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            required
            fullWidth
            margin="dense"
            multiline
            rows={4}
          />
          <TextField
            label="Image URL"
            value={editedImage}
            onChange={(e) => setEditedImage(e.target.value)}
            fullWidth
            margin="dense"
          />
          <Button
            onClick={handleUpdatePost}
            variant="contained"
            color="primary"
          >
            Update Post
          </Button>
        </div>
      </Modal>

      <Dialog
        open={Boolean(deleteConfirmOpen)}
        onClose={() => setDeleteConfirmOpen(false)}
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
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

export default Posts;
