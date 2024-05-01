import React from "react";
import "./Groupmodal.style.css"
import { deleteGroupApi } from "../../Services/Api/Services";

const DeleteGroupModel = ({ setDeletePopUpFlag, conversation, setConversation }: any) => {

  const deleteButtonHandler = () => {
    deleteGroupApi({
      query: {
        id: conversation._id
      }
    }).then((res: any) => {
      setConversation(undefined);
      setDeletePopUpFlag(false);
    }).catch((err: any) => {
      console.log('err', err)
    })
  }

  return (
    <div className="create-group">
      <div className="inside-group">
        <div
          className="top-group"
          onClick={() => {
            setDeletePopUpFlag(false);
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </div>
        <div className="group-heading" style={{
          marginTop: "30px",
          marginBottom: "30px",
        }}>
          <h3 style={{
            fontSize: "18px",
          }}>Are you sure you want to delete the group?</h3>
        </div>
        <div className="yes-no">
          <button className="yes" onClick={deleteButtonHandler}>Yes</button>
          <button onClick={() => {
            setDeletePopUpFlag(false);
          }}>No</button>
        </div>
      </div>
    </div>
  )
};

export default DeleteGroupModel;
