import React, { useState } from "react";
import "./Imagemodal.style.css";

function Imagemodal({
  setImagePopup,
  sendMessageHandlerImage,
  image,
  setImage,
}: any) {
  const [messageText, setMessageText]: any = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload only image files.");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload only image files.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="image-upload">
      <div className="image-insider">
        <div className="top-group" onClick={() => setImagePopup(false)}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <div className="group-heading">
          <h3>Upload Image</h3>
        </div>
        <div
          className="image-body"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <label htmlFor="file" className="labelFile">
            {image ? (
              <img className="uploaded-image" src={image} alt="Uploaded" />
            ) : (
              <>
                <span>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </span>
                <p>Drag and drop your file here or click to select a file!</p>
              </>
            )}
          </label>
          <input
            style={{ display: "none" }}
            className="input"
            name="text"
            id="file"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <div className="textField">
            <input
              value={messageText}
              onChange={(e: any) => setMessageText(e.target.value)}
              type="text"
              placeholder="Enter text..."
            />
            <div
              className="send_btn"
              onClick={() => sendMessageHandlerImage(image, messageText)}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Imagemodal;
