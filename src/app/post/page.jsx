"use client";

import React, { useState } from "react";
import JoditEditor from "jodit-react";
import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../utils/next.config";
import styles from "./page.module.css";
import Image from "next/image";

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

  const handleAddPost = async () => {
    if (title && content && selectedLanguage) {
      const storage = getStorage();
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
