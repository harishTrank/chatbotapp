import React, { useState } from 'react'
import "./Imagemodal.style.css"

function Imagemodal({ setImagePopup }: any) {

    return (
        <>
            <div className="image-upload">
                <div className="image-insider">
                    <div className="top-group" onClick={() => setImagePopup(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </div>
                    <div className="group-heading">
                        <h3>Upload Image</h3>
                    </div>
                    <div className="image-body">
                        <div>
                            <label htmlFor="file" className="labelFile">
                                <span><i className="fa-solid fa-cloud-arrow-up"></i></span>
                                <p>drag and drop your file here or click to select a file!</p>
                            </label>
                            <input className="input" name="text" id="file" type="file" />
                        </div>
                        <div className="textField">
                            <input type="text" placeholder='Enter text...' />
                            <div className="send_btn">
                                <i className="fa-solid fa-paper-plane"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Imagemodal