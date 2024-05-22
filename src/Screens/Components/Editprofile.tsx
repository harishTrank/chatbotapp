import { useEffect, useState } from "react";
import "./Groupmodal.style.css";
import { editUserProfileApi, getSingleUser } from "../../Services/Api/Services";
import { toast } from "react-toastify";

const Editprofile = ({ setEditProfileFlag }: any) => {
  const [currentUser, setCurrentUser]: any = useState({});

  useEffect(() => {
    const userDetails: any = sessionStorage.getItem("userData");
    const myUserId = JSON.parse(userDetails)?._id;
    getSingleUser({
      query: {
        userId: myUserId,
      },
    })
      .then((res: any) => setCurrentUser(res?.response))
      .catch((err: any) => console.log("err", err));
  }, []);

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentUser((oldValue: any) => {
        return { ...oldValue, avatar_url: reader.result as string };
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const editUserProfileHandler = () => {
    const userDetails: any = sessionStorage.getItem("userData");
    const myUserId = JSON.parse(userDetails)?._id;
    editUserProfileApi({
      query: {
        id: myUserId,
      },
      body: {
        name: currentUser?.name,
        avatar_url: currentUser?.avatar_url
          ? currentUser?.avatar_url
          : undefined,
      },
    })
      .then(() => {
        toast.success("Edit profile successfully.");
        setEditProfileFlag(false);
      })
      .catch(() => toast.error("Something went wrong."));
  };

  return (
    <>
      <div className="create-group">
        <div className="inside-group">
          <div className="top-group">
            <i
              onClick={() => setEditProfileFlag(false)}
              className="fa-solid fa-xmark"
            ></i>
          </div>
          <div className="group-heading">
            <h3>Edit Profile Chat</h3>
          </div>
          <div className="edit-profile">
            <div className="avatar-upload">
              <div className="avatar-edit">
                <input
                  type="file"
                  id="imageUpload"
                  accept=".png, .jpg, .jpeg"
                  onChange={handleImageChange}
                />
                <label htmlFor="imageUpload"></label>
              </div>
              <div className="avatar-preview">
                <div id="imagePreview">
                  <img
                    style={{
                      width: "100%",
                      borderRadius: "100%",
                    }}
                    src={
                      currentUser?.avatar_url ||
                      require("../../images/trank.png")
                    }
                    alt="Profile"
                  />
                </div>
              </div>
            </div>
            <div className="user-edit">
              <label htmlFor="">Username</label>
              <input
                value={currentUser.name}
                onChange={(e: any) =>
                  setCurrentUser((oldValue: any) => {
                    return { ...oldValue, name: e.target.value };
                  })
                }
                required
                type="text"
                placeholder="Enter your username"
              />
            </div>
            <div className="create-btn">
              <input
                onClick={editUserProfileHandler}
                type="submit"
                className="btn btn-info"
                value={"Update"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editprofile;
