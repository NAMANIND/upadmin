"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  serverTimestamp,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../utils/next.config";
import styles from "./page.module.css";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
});

const AddNewPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading indicator
  const [uploadStatus, setUploadStatus] = useState(""); // Upload status message

  const handleMediaUpload = async (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `${file.name}`);
    const uploadTask = uploadBytes(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask
        .then(async (snapshot) => {
          // Upload completed successfully
          const mediaUrl = await getDownloadURL(storageRef);
          resolve(mediaUrl);
        })
        .catch((error) => {
          console.error("Error uploading media:", error);
          reject(error);
        })
        .finally(() => {
          setIsLoading(false); // Set loading to false when upload is complete
        });
    });
  };

  const getAccessToken = async () => {
    try {
      const response = await axios.get("/api/token");
      return response.data.accessToken;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      console.log("Access Token:", token);
    })();
  }, []);

  const sendNotification = async (
    notificationTitle,
    notiMessage,
    expoPushTokens
  ) => {
    const notificationMessage =
      notiMessage
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, "")
        .substring(0, 190 - (notiMessage.length > 109 ? 3 : 0)) +
      (notiMessage.length > 109 ? "..." : "");

    if (expoPushTokens.length === 0) {
      alert("No users to send notifications to.");
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error("Failed to obtain access token");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const notifications = expoPushTokens.map((token) => {
        const notification = {
          title: notificationTitle,
          body: notificationMessage,
        };

        const fcmMessage = {
          token: token,
          notification,
        };

        return axios.post(
          "https://fcm.googleapis.com/v1/projects/assent-connect-plus-3014e/messages:send",
          { message: fcmMessage },
          { headers }
        );
      });

      const responses = await Promise.all(notifications);
      responses.forEach((response) => console.log(response.data));
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const handleAddPost = async () => {
    if (title && content && selectedLanguage) {
      let mediaUrl = null;

      if (media) {
        setIsLoading(true); // Set loading to true when upload starts
        setUploadStatus("Uploading..."); // Update upload status

        mediaUrl = await handleMediaUpload(media);

        setUploadStatus(""); // Clear upload status after successful upload
      }

      try {
        const postId = uuidv4();
        const postDocRef = doc(db, `${selectedLanguage}`, postId);
        const postData = {
          id: postId,
          title: title,
          content: content,
          imageUrl: mediaUrl || "",
          timestamp: serverTimestamp(),
        };

        setTitle("");
        setContent("");
        setMedia(null);
        setSelectedLanguage("");
        await setDoc(postDocRef, postData, { merge: true });

        alert("Post created successfully");
        // Clear form inputs after post creation

        setShowSuccessPopup(true);

        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("language", "==", selectedLanguage));
        const querySnapshot = await getDocs(q);

        const expoPushTokens = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.expoPushToken) {
            expoPushTokens.push(userData.expoPushToken);
          }
        });

        if (expoPushTokens.length === 0) {
          console.log("No users to send notifications to.");
        } else {
          sendNotification(title, content, expoPushTokens);
        }
      } catch (error) {
        console.error("Error creating post:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter title, content, and select a language.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Add New Post</h2>
      <FormControl
        fullWidth
        variant="outlined"
        className={styles["language-selector"]}
      >
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
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles["title-input"]}
      />
      <div className={styles.editor}>
        <JoditEditor
          value={content}
          onChange={(newContent) => setContent(newContent)}
          tabIndex={1}
        />
        <div className={styles["media-upload"]}>
          <label className={styles["media-label"]}>
            Upload Media (Image/Video)
          </label>
          <input
            type="file"
            accept="image/*, video/*"
            onChange={(e) => setMedia(e.target.files[0])}
          />
          {media && (
            <div className={styles["selected-media"]}>
              {media.type.startsWith("image/") && (
                <Image
                  src={URL.createObjectURL(media)}
                  alt="Selected Media"
                  width={100}
                  height={100}
                  objectFit="cover"
                />
              )}
              {media.type.startsWith("video/") && (
                <video width="100" height="100" controls>
                  <source src={URL.createObjectURL(media)} type={media.type} />
                </video>
              )}
              <p>{media.name}</p> {/* Display the name of the uploaded file */}
            </div>
          )}
        </div>
        <button className={styles["add-post-button"]} onClick={handleAddPost}>
          {isLoading ? "Uploading..." : "Send"}{" "}
          {/* Dynamically change button text */}
        </button>
      </div>
    </div>
  );
};

export default AddNewPost;
