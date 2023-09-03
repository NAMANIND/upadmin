"use client";

import React, { useState, useEffect } from "react";
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

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
});
const AddNewPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMediaUpload = async (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `${file.name}`);
    await uploadBytes(storageRef, file);
    const mediaUrl = await getDownloadURL(storageRef);
    return mediaUrl;
  };

  const sendNotification = async (
    notificationTitle,
    notiMessage,
    expoPushTokens
  ) => {
    const notificationMessage =
      notiMessage
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace &nbsp; with regular space
        .substring(0, 80) + "..."; // Trim to 80 characters

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
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const handleAddPost = async () => {
    if (title && content && selectedLanguage) {
      let mediaUrl = null;

      if (media) {
        mediaUrl = await handleMediaUpload(media);
      }

      setIsLoading(true);

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

        await setDoc(postDocRef, postData, { merge: true });

        console.log("Post created successfully");
        alert("Post created successfully");
        setShowSuccessPopup(true);

        // Send notification
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

        // Clear form inputs
        setTitle("");
        setContent("");
        setMedia(null);
        setSelectedLanguage("");
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
      <div className={styles["language-selector"]}>
        <button
          onClick={() => setSelectedLanguage("English")}
          className={selectedLanguage === "English" ? styles.active : ""}
        >
          English
        </button>
        <button
          onClick={() => setSelectedLanguage("Hindi")}
          className={selectedLanguage === "Hindi" ? styles.active : ""}
        >
          Hindi
        </button>
        <button
          onClick={() => setSelectedLanguage("Arabic")}
          className={selectedLanguage === "Arabic" ? styles.active : ""}
        >
          Arabic
        </button>
      </div>
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
      </div>
      <div className={styles.picker}>
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
                />
              )}
              {media.type.startsWith("video/") && (
                <video width="100" height="100" controls>
                  <source src={URL.createObjectURL(media)} type={media.type} />
                </video>
              )}
            </div>
          )}
        </div>
        <button className={styles["add-post-button"]} onClick={handleAddPost}>
          {isLoading ? "Adding..." : "Add Post"}
        </button>
      </div>
    </div>
  );
};

export default AddNewPost;
