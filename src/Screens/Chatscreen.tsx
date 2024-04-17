import React, { useEffect, useState } from "react";
import "./Chatscreen.style.css";
import {
  createConversation,
  getSingleUser,
  searchUseApi,
} from "../Services/Api/Services";
import {
  disconnectSocket,
  joinConversation,
  sendMessage,
} from "../Services/Socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import defaultImage from "../images/avatar1.png";
import { toast } from "react-toastify";

function Chatscreen() {
  dayjs.extend(relativeTime);
  const [searchFlag, setSearchFlag] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userList, setUserList] = useState([]);
  const [getCurrentUserData, setCurrentUserData]: any = useState({});
  const [messageInput, setMessageInput]: any = useState("");
  const [conversationID, setConversationID]: any = useState("");

  const onChangeHandler = (text: any) => {
    setSearchText(text);
    if (text.length > 0) {
      setSearchFlag(true);
    } else {
      setSearchFlag(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      searchUseApi({
        query: {
          search: searchText,
        },
      })
        .then((res: any) => {
          setUserList(res.response);
        })
        .catch((err: any) => {
          console.log("err", err);
        });
    }, 1000);
  }, [searchText]);

  const searchUserClickHandler = (userId: any) => {
    const userData: any = sessionStorage.getItem("userData");
    const myUserId: any = JSON.parse(userData)._id;

    createConversation({
      body: {
        usersList: [myUserId, userId],
      },
    })
      .then((res: any) => {
        joinConversation({
          userId: myUserId,
          conversationId: res.data._id,
        });
        setConversationID(res.data._id);
        getSingleUser({
          query: {
            userId,
          },
        })
          .then((res: any) => {
            setCurrentUserData(res.response);
            setSearchText("");
            setSearchFlag(false);
          })
          .catch((err) => console.log("err", err));
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const logoutBtnHandler = () => {
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("accessToken");
    disconnectSocket();
    window.location.href = "/login";
    window.location.reload();
  };

  const sendMessageHandler = () => {
    if (messageInput?.length === 0) {
      return toast.error("Please enter message first..");
    }
    const userDetails: any = sessionStorage.getItem("userData");
    const myUserId = JSON.parse(userDetails)._id;
    sendMessage({
      senderId: myUserId,
      receiverId: getCurrentUserData._id,
      type: "text",
      conversationId: conversationID,
      message: messageInput,
    });
    setMessageInput("");
  };

  return (
    <>
      <div className="container-fluid">
        <div className="row clearfix">
          <div className="col-lg-12">
            <div className="card-people chat-app">
              <div id="plist" className="people-list">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={searchText}
                    onChange={(text: any) => onChangeHandler(text.target.value)}
                    placeholder="Search..."
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
                              onClick={() => searchUserClickHandler(item._id)}
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
                <ul className="list-unstyled chat-list mt-2 mb-0">
                  <li className="clearfix">
                    <img src={defaultImage} alt="avatar" />
                    <div className="about">
                      <div className="name">Vincent Porter</div>
                      <div className="status">
                        {" "}
                        <i className="fa fa-circle offline"></i> last seen 7
                        mins ago{" "}
                      </div>
                    </div>
                  </li>
                  <li className="clearfix active">
                    <img src={defaultImage} alt="avatar" />
                    <div className="about">
                      <div className="name">Aiden Chavez</div>
                      <div className="status">
                        {" "}
                        <i className="fa fa-circle online"></i> online{" "}
                      </div>
                    </div>
                  </li>
                  <li className="clearfix">
                    <img src={defaultImage} alt="avatar" />
                    <div className="about">
                      <div className="name">Mike Thomas</div>
                      <div className="status">
                        {" "}
                        <i className="fa fa-circle online"></i> online{" "}
                      </div>
                    </div>
                  </li>
                  <li className="clearfix">
                    <img src={defaultImage} alt="avatar" />
                    <div className="about">
                      <div className="name">Christian Kelly</div>
                      <div className="status">
                        {" "}
                        <i className="fa fa-circle offline"></i> last seen 10
                        hours ago{" "}
                      </div>
                    </div>
                  </li>
                  <li className="clearfix">
                    <img src={defaultImage} alt="avatar" />
                    <div className="about">
                      <div className="name">Monica Ward</div>
                      <div className="status">
                        {" "}
                        <i className="fa fa-circle online"></i> online{" "}
                      </div>
                    </div>
                  </li>
                  <li className="clearfix">
                    <img src={defaultImage} alt="avatar" />
                    <div className="about">
                      <div className="name">Dean Henry</div>
                      <div className="status">
                        {" "}
                        <i className="fa fa-circle offline"></i> offline since
                        Oct 28{" "}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="chat">
                <div className="chat-header clearfix">
                  <div className="row">
                    <div className="col-lg-6">
                      {getCurrentUserData?._id && (
                        <>
                          <a
                            href="#"
                            data-toggle="modal"
                            data-target="#view_info"
                          >
                            <img
                              src={
                                getCurrentUserData?.avatar_url
                                  ? getCurrentUserData?.avatar_url
                                  : defaultImage
                              }
                              alt="avatar"
                            />
                          </a>

                          <div className="chat-about">
                            <h6 className="m-b-0">
                              {getCurrentUserData?.name}
                            </h6>
                            <small>
                              {getCurrentUserData?.status?.toLowerCase() ===
                              "online"
                                ? getCurrentUserData?.status
                                : `Last seen: ${dayjs(
                                    getCurrentUserData?.updated_at
                                  ).fromNow()}`}
                            </small>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="col-lg-6 hidden-sm text-right">
                      <a href="#" className="btn btn-outline-secondary mr-2">
                        <i className="fa fa-file"></i>
                      </a>
                      <a href="#" className="btn btn-outline-primary mr-2">
                        <i className="fa fa-user-group"></i>
                      </a>
                      <a href="#" className="btn btn-outline-primary mr-2">
                        <i className="fa fa-image"></i>
                      </a>
                      <a href="#" className="btn btn-outline-info mr-2">
                        <i className="fa fa-cogs"></i>
                      </a>
                      <div
                        onClick={logoutBtnHandler}
                        className="btn btn-outline-danger"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="chat-history">
                  <ul className="m-b-0">
                    <li className="clearfix">
                      <div className="message-data text-right">
                        <span className="message-data-time">
                          10:10 AM, Today
                        </span>
                        <img src={defaultImage} alt="avatar" />
                      </div>
                      <div className="message other-message float-right">
                        {" "}
                        Hi Aiden, how are you? How is the project coming along?{" "}
                      </div>
                    </li>
                    <li className="clearfix">
                      <div className="message-data">
                        <span className="message-data-time">
                          10:12 AM, Today
                        </span>
                      </div>
                      <div className="message my-message">
                        Are we meeting today?
                      </div>
                    </li>
                    <li className="clearfix">
                      <div className="message-data">
                        <span className="message-data-time">
                          10:15 AM, Today
                        </span>
                      </div>
                      <div className="message my-message">
                        Project has been already finished and I have results to
                        show you.
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="chat-message clearfix">
                  <div className="input-group mb-0">
                    <div
                      onClick={sendMessageHandler}
                      className="input-group-prepend"
                    >
                      <span className="input-group-text">
                        <i className="fa-solid fa-paper-plane"></i>
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter text here..."
                      value={messageInput}
                      onChange={(event: any) =>
                        setMessageInput(event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatscreen;
