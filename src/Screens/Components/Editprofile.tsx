import React from 'react'
import "./Groupmodal.style.css";

const Editprofile = ({ setEditProfileFlag }: any) => {
    return (
        <>
            <div className="create-group">
                <div className="inside-group">
                    <div className="top-group">
                        <i onClick={() => setEditProfileFlag(false)} className="fa-solid fa-xmark"></i>
                    </div>
                    <div className="group-heading">
                        <h3>Edit Group Chat</h3>
                    </div>
                    <div className="edit-profile">
                        <div className="avatar-upload">
                            <div className="avatar-edit">
                                <input type='file' id="imageUpload" accept=".png, .jpg, .jpeg" />
                                <label htmlFor="imageUpload"></label>
                            </div>
                            <div className="avatar-preview">
                                <div id="imagePreview"></div>
                            </div>
                        </div>
                        <div className="user-edit">
                            <label htmlFor="">Username</label>
                            <input type="text" name="" id="" placeholder='Enter your username' />
                        </div>
                        <div className="create-btn">
                            <input
                                type="submit"
                                className="btn btn-info"
                                value={"Update"}
                            />
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default Editprofile