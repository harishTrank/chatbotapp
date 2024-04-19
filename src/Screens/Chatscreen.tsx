import React, { useEffect, useState, useRef } from "react";
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
  const [conversationID, setConversationID]: any = useState({});
  const [conversationResult, setConversationResult]: any = useState([]);
  const [messageListResult, setMessageListResult]: any = useState([]);
  const [startMessageValue, setStartMessageValue]: any = useState(0);
  const [groupPopupFlag, setGroupPopupFlag]: any = useState(false);
  const chatListRef: any = useRef(null);
  const [totalCountMessage, setTotalCountMessage]: any = useState(0);
  const [scrollManager, setScrollManager]: any = useState(0);

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

  const receiveMessageHandler = (data: any) => {
    if (conversationID?._id) {
      setTimeout(() => {
        latestMessageList({
          query: {
            conversationId: conversationID?._id,
            // messageId: data?.latestMessageId,
          },
        })
          .then((res: any) => {
            console.log("conversationID?._id", conversationID?._id);
            setMessageListResult((oldValue: any) => {
              return [
                ...oldValue.filter((item: any) => item._id !== res.data?._id),
                res.data,
              ];
            });
            setTimeout(() => {
              chatListRef.current.scrollTo({
                top: chatListRef.current.scrollHeight,
                behavior: "smooth",
              });
            }, 100);
          })
          .catch((err: any) => console.log("err", err));
      }, 500);
    }
  };

  useEffect(() => {
    setMessageListResult([]);
    setTotalCountMessage(0);
    setScrollManager(0);
    setStartMessageValue(0);
    if (conversationID?._id) {
      receiveMessageOff();
      receiveMessage(receiveMessageHandler);
    }
  }, [conversationID?._id]);

  const getMessageListRecord = (conversation: any) => {
    messageList({
      query: {
        conversationId: conversation,
        _start: startMessageValue,
        _limit: 50,
      },
    })
      .then((res: any) => {
        setTotalCountMessage(res?.data?.total_count);
        if (res.data.messages && res.data.messages.length > 0) {
          setMessageListResult((oldValue: any) => {
            return [...res.data.messages.reverse(), ...oldValue];
          });
          setTimeout(() => {
            if (chatListRef?.current?.scrollTop) {
              chatListRef.current.scrollTop =
                chatListRef.current?.scrollHeight || 0 - scrollManager;
            }
          }, 100);
        }
      })
      .catch((err: any) => console.log("err", err));
  };

  useEffect(() => {
    getMessageListRecord(conversationID?._id);
  }, [startMessageValue]);

  const searchUserClickHandler = (
    userId: any,
    conversation: any = undefined
  ) => {
    setMessageListResult([]);
    setTotalCountMessage(0);
    setScrollManager(0);
    setStartMessageValue(0);
    leaveConversation({
      userId: myUserId,
    });
    if (conversation?._id && conversation?.type?.toLowerCase() === "group") {
      joinConversation({
        userId: myUserId,
        conversationId: conversation?._id,
      });
      setConversationID(conversation);
      getMessageListRecord(conversation?._id);
    } else {
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
          setConversationID(res.data);
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
    }
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
      receiverIds:
        conversationID?.type?.toLowerCase() === "group"
          ? conversationID?.members
          : getCurrentUserData._id,
      type: "text",
      conversationId: conversationID?._id,
      message: messageInput,
    });
    setMessageInput("");
    setTimeout(() => {
      latestMessageList({
        query: {
          conversationId: conversationID?._id,
        },
      })
        .then((res: any) => {
          setMessageListResult((oldValue: any) => {
            return [
              ...oldValue.filter((item: any) => item._id !== res.data?._id),
              res.data,
            ];
          });
          setTimeout(() => {
            chatListRef.current.scrollTo({
              top: chatListRef.current.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        })
        .catch((err: any) => console.log("err", err));
    }, 500);
  };

  const handleEnterPress = (event: any) => {
    if (event.key === "Enter") {
      sendMessageHandler();
    }
  };

  // handle scroll
  useEffect(() => {
    setTotalCountMessage(0);
    setScrollManager(0);
    setStartMessageValue(0);
    setMessageListResult([]);
    if (chatListRef.current) {
      setTimeout(() => {
        const scrollHeight = chatListRef.current.scrollHeight;
        chatListRef.current.scrollTop = scrollHeight;
      }, 200);
    }
  }, [chatListRef.current, conversationID?._id]);

  const handleScrollTop = () => {
    setScrollManager(chatListRef.current.scrollHeight);
    if (chatListRef.current?.scrollTop === 0) {
      setStartMessageValue((oldValue: any) =>
        totalCountMessage + 50 > oldValue ? oldValue + 50 : oldValue
      );
    }
  };

  //-----------------------------

  useEffect(() => {
    let interval: any;
    setTotalCountMessage(0);
    setScrollManager(0);
    setStartMessageValue(0);
    setMessageListResult([]);
    const userDetails: any = sessionStorage.getItem("userData");
    const myUserId = JSON.parse(userDetails)._id;
    setMyUserId(myUserId);
    interval = setInterval(() => {
      conversationListRecordHit({
        userId: myUserId,
      });
    }, 1500);
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
      {groupPopupFlag && <Groupmodal setGroupPopupFlag={setGroupPopupFlag} />}
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
                          className={`clearfix ${
                            record?._id === conversationID?._id && "active"
                          }`}
                          onClick={() =>
                            searchUserClickHandler(getOtherUser?._id, record)
                          }
                        >
                          <img
                            src={
                              record.type === "single"
                                ? getOtherUser?.avatar_url || defaultImage
                                : record.avatar_url || defaultImage
                            }
                            alt="avatar"
                          />
                          <div className="about">
                            <div className="name">
                              {record.type === "single"
                                ? getOtherUser?.name
                                : record.name}
                            </div>
                            {record.type === "single" ? (
                              <div className="status">
                                {" "}
                                <i
                                  className={`fa fa-circle ${
                                    getOtherUser?.status === "online"
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
                            ) : (
                              <div className="status">Group Chat</div>
                            )}
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
                      {conversationID?._id && (
                        <>
                          <a
                            href="#"
                            data-toggle="modal"
                            data-target="#view_info"
                          >
                            <img
                              src={
                                conversationID.type === "single"
                                  ? getCurrentUserData?.avatar_url ||
                                    defaultImage
                                  : conversationID.avatar_url || defaultImage
                              }
                              alt="avatar"
                            />
                          </a>

                          <div className="chat-about">
                            <h6 className="m-b-0">
                              {conversationID?.type === "single"
                                ? getCurrentUserData?.name
                                : conversationID?.name}
                            </h6>
                            <small>
                              {conversationID?.type === "single"
                                ? getCurrentUserData?.status?.toLowerCase() ===
                                  "online"
                                  ? getCurrentUserData?.status
                                  : `Last seen: ${dayjs(
                                      getCurrentUserData?.updated_at
                                    ).fromNow()}`
                                : "Group Chat"}
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
                            <i className="fa fa-image"></i>
                          </a>
                          <a href="#" className="btn btn-outline-info mr-2">
                            <i className="fa fa-cogs"></i>
                          </a>
                        </>
                      )}
                      <div
                        onClick={() => setGroupPopupFlag(!groupPopupFlag)}
                        className="btn btn-outline-primary mr-2"
                      >
                        <i className="fa fa-user-group"></i>
                      </div>
                      <div
                        onClick={logoutBtnHandler}
                        className="btn btn-outline-danger"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                      </div>
                    </div>
                  </div>
                </div>
                {conversationID?._id ? (
                  <>
                    <div
                      onScroll={handleScrollTop}
                      ref={chatListRef}
                      className="chat-history"
                    >
                      <ul className="m-b-0">
                        {messageListResult &&
                          messageListResult?.map((record: any) => {
                            const myMessage = myUserId === record?.sender?._id;
                            return (
                              <li key={record?._id} className="clearfix">
                                <div
                                  className={`message-data ${
                                    myMessage && "text-right"
                                  }`}
                                >
                                  <span className="message-data-time">
                                    {`${dayjs(record?.created_at).format(
                                      "hh:mm A"
                                    )} ${
                                      conversationID?.type === "group"
                                        ? `(${
                                            record?.sender?._id !== myUserId
                                              ? record?.sender?.name
                                              : "You"
                                          })`
                                        : ""
                                    }`}
                                  </span>
                                </div>
                                <div
                                  className={`message ${
                                    myMessage
                                      ? "other-message float-right"
                                      : "my-message"
                                  }`}
                                >
                                  {record?.message}
                                </div>
                              </li>
                            );
                          })}
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
                          onKeyDown={handleEnterPress}
                          onChange={(event: any) =>
                            setMessageInput(event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={defaultBackImage}
                      style={{
                        width: "50%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chatscreen;
