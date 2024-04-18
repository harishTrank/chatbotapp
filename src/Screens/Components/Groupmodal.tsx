import React, { useEffect, useState } from "react";
import "./Groupmodal.style.css";
import defaultImage from "../../images/avatar1.png";
import { createGroupApi, searchUseApi } from "../../Services/Api/Services";
import { toast } from "react-toastify";

const Groupmodal = ({ setGroupPopupFlag }: any) => {
  const [searchUserState, setSearchUserState]: any = useState("");
  const [searchFlag, setSearchFlag] = useState(false);
  const [userList, setUserList]: any = useState([]);
  const [groupList, setGroupList]: any = useState([]);
  const [groupName, setGroupName]: any = useState(undefined);

  useEffect(() => {
    const userData: any = sessionStorage.getItem("userData");
    setGroupList([JSON.parse(userData)]);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      searchUseApi({
        query: {
          search: searchUserState,
        },
      })
        .then((res: any) => {
          setUserList(res.response);
        })
        .catch((err: any) => {
          console.log("err", err);
        });
    }, 1000);
  }, [searchUserState]);

  const onChangeHandler = (text: any) => {
    setSearchUserState(text);
    if (text.length > 0) {
      setSearchFlag(true);
    } else {
      setSearchFlag(false);
    }
  };
  const searchUserClickHandler = (user: any) => {
    setGroupList((oldValue: any) => {
      return oldValue?.find((record: any) => record._id === user._id)
        ? oldValue
        : [...oldValue, user];
    });
    setSearchFlag(false);
    setSearchUserState("");
  };

  const removeUserHandler = (userId: any) => {
    const userData: any = sessionStorage.getItem("userData");
    const myUserId: any = JSON.parse(userData)?._id;
    if (myUserId !== userId) {
      setGroupList((oldvalue: any) => {
        return oldvalue.filter((item: any) => item._id !== userId);
      });
    } else {
      toast.error("You cannot remove yourself.");
    }
  };

  const createGroupHandler = () => {
    if (!groupName) {
      toast.error("Please enter the group name.");
    } else if (groupList && groupList?.length !== 1) {
      createGroupApi({
        body: {
          members: groupList.map((item: any) => item._id),
          type: "group",
          name: groupName,
        },
      })
        .then((res: any) => {
          setGroupPopupFlag(false);
          toast.success("Group created successfully.");
        })
        .catch((err: any) => {
          console.log("err", err);
        });
    } else {
      toast.error("Add atleast one member.");
    }
  };

  return (
    <>
      <div className="create-group">
        <div className="inside-group">
          <div className="top-group" onClick={() => setGroupPopupFlag(false)}>
            <i className="fa-solid fa-xmark"></i>
          </div>
          <div className="group-heading">
            <h3>Create Group Chat</h3>
          </div>
          <div className="group-body">
            <div>
              <label htmlFor="f">
                <i className="fa-solid fa-image icon"></i>
              </label>
              <input type="file" id="f" />
            </div>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              type="text"
              placeholder="Enter Group Name..."
            />
          </div>
          <div className="group-body">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                onChange={(e) => onChangeHandler(e.target.value)}
                value={searchUserState}
              />
              <div
                className="all-users"
                style={{
                  display: searchFlag ? "block" : "none",
                }}
              >
                <ul>
                  {userList &&
                    userList.map((item: any) => {
                      return (
                        <li
                          key={item._id}
                          onClick={() => searchUserClickHandler(item)}
                          className="clearfix"
                        >
                          <img src={defaultImage} alt="avatar" />
                          <div className="about">
                            <div className="name">{item.name}</div>
                            <div className="status">
                              <i
                                className={`fa fa-circle ${
                                  item.status === "online"
                                    ? "online"
                                    : "offline"
                                }`}
                              ></i>
                              {item.status}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fa fa-search"></i>
                </span>
              </div>
            </div>
            <div className="added-users">
              <ul>
                {groupList &&
                  groupList.map((item: any) => {
                    return (
                      <li key={item._id}>
                        {item.name}
                        <i
                          onClick={() => removeUserHandler(item._id)}
                          className="fa-solid fa-circle-xmark"
                        ></i>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
          <div className="create-btn">
            <input
              onClick={createGroupHandler}
              type="submit"
              className="btn btn-info"
              value="Create Group"
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default Groupmodal;
