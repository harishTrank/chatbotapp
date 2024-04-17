import React, { useEffect, useState } from "react";
import "./Chatscreen.style.css";
import {
  createConversation,
  getSingleUser,
  latestMessageList,
  messageList,
  searchUseApi,
} from "../Services/Api/Services";
import {
  conversationListRecordGet,
  conversationListRecordHit,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  receiveMessage,
  receiveMessageOff,
  sendMessage,
} from "../Services/Socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import defaultImage from "../images/avatar1.png";
import { toast } from "react-toastify";
import defaultBackImage from "../images/defaultback.png";
import Groupmodal from "./Components/Groupmodal";

function Chatscreen() {
  dayjs.extend(relativeTime);
  const [searchFlag, setSearchFlag] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userList, setUserList] = useState([]);
  const [myUserId, setMyUserId]: any = useState("");
  const [getCurrentUserData, setCurrentUserData]: any = useState({});
  const [messageInput, setMessageInput]: any = useState("");
  const [conversationID, setConversationID]: any = useState("");
  const [conversationResult, setConversationResult]: any = useState([]);
  const [messageListResult, setMessageListResult]: any = useState([]);
  const [startMessageValue, setStartMessageValue]: any = useState(0);
  const [groupPopupFlag, setGroupPopupFlag]: any = useState(false);

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

  // get message listing
  useEffect(() => {
    setMessageListResult([]);
  }, [conversationID]);

  const getMessageListRecord = (conversation: any) => {
    messageList({
      query: {
        conversationId: conversation,
        _start: startMessageValue,
        _limit: 50,
      },
    })
      .then((res: any) => {
        setMessageListResult((oldValue: any) => {
          return [...res.data.messages.reverse(), ...oldValue];
        });
      })
      .catch((err: any) => console.log("err", err));
  };

  const searchUserClickHandler = (userId: any) => {
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
        getMessageListRecord(res.data._id);
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
    sendMessage({
      senderId: myUserId,
      receiverId: getCurrentUserData._id,
      type: "text",
      conversationId: conversationID,
      message: messageInput,
    });
    setMessageInput("");
    setTimeout(() => {
      latestMessageList({
        query: {
          conversationId: conversationID,
        },
      })
        .then((res: any) => {
          setMessageListResult((oldValue: any) => {
            return [...oldValue, res.data];
          });
        })
        .catch((err: any) => console.log("err", err));
    }, 500);
  };

  const receiveMessageHandler = (data: any) => {
    setTimeout(() => {
      latestMessageList({
        query: {
          conversationId: conversationID,
          messageId: data?.latestMessageId,
        },
      })
        .then((res: any) => {
          setMessageListResult((oldValue: any) => {
            return [...oldValue, res.data];
          });
        })
        .catch((err: any) => console.log("err", err));
    }, 500);
  };

  useEffect(() => {
    let interval: any;
    receiveMessage(receiveMessageHandler);
    setMessageListResult([]);
    const userDetails: any = sessionStorage.getItem("userData");
    const myUserId = JSON.parse(userDetails)._id;
    setMyUserId(myUserId);
    interval = setInterval(() => {
      conversationListRecordHit({
        userId: myUserId,
      });
    }, 1000);
    conversationListRecordGet((data: any) => {
      setConversationResult(data);
    });

    return () => {
      receiveMessageOff();
      const userDetails: any = sessionStorage.getItem("userData");
      const myUserId = JSON.parse(userDetails)._id;
      leaveConversation({
        userId: myUserId,
      });
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {groupPopupFlag &&
        <Groupmodal />
      }
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
                                    className={`fa fa-circle ${item.status === "online"
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
                  {conversationResult &&
                    conversationResult?.map((record: any) => {
                      const getOtherUser =
                        record?.membersInfo?.length === 1
                          ? record?.membersInfo?.[0]
                          : record?.membersInfo?.find(
                            (item: any) => item._id !== myUserId
                          );

                      return (
                        <li
                          key={record?._id}
                          className={`clearfix ${getCurrentUserData?._id === getOtherUser?._id &&
                            "active"
                            }`}
                          onClick={() =>
                            searchUserClickHandler(getOtherUser?._id)
                          }
                        >
                          <img src={defaultImage} alt="avatar" />
                          <div className="about">
                            <div className="name">{getOtherUser?.name}</div>
                            <div className="status">
                              {" "}
                              <i
                                className={`fa fa-circle ${getOtherUser?.status === "online"
                                  ? "online"
                                  : "offline"
                                  }`}
                              ></i>{" "}
                              {getOtherUser?.status === "online"
                                ? "online"
                                : `Last seen: ${dayjs(
                                  getOtherUser?.updated_at
                                ).fromNow()}`}
                            </div>
                          </div>
                        </li>
                      );
                    })}
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
                      {getCurrentUserData?._id && (
                        <>
                          <a
                            href="#"
                            className="btn btn-outline-secondary mr-2"
                          >
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
                        </>
                      )}
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
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter text here..."
                      value={messageInput}
                      onChange={(event: any) =>
                        setMessageInput(event.target.value)
                      }
                    />
                    <div
                      onClick={sendMessageHandler}
                      className="input-group-prepend"
                    >
                      <span className="input-group-text">
                        <i className="fa-solid fa-paper-plane"></i>
                      </span>
                    </div>
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
