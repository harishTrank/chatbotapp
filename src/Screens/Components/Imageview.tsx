import React from 'react'
import "./Imagemodal.style.css";
import landscape from "../../images/land.png"

const Imageview = ({ setFullView, imageUrl }: any) => {
    return (
        <div className="image-view">
            <div className="image-full">
                <div className="top-group" onClick={() => setFullView(false)}>
                    <i className="fa-solid fa-xmark"></i>
                </div>
                <img src={imageUrl} alt="" />
            </div>
        </div>
    )
}

export default Imageview
