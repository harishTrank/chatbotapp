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
  deleteMessageReceiver,
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
import Imagemodal from "./Components/Imagemodal";
import Imageview from "./Components/Imageview";
import RenderMessage from "./Components/RenderMessage";
import { getFormattedDate } from "../Utils/UserUtils";
import { sessionChange } from "../jotai";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";

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
  const [imagePopup, setImagePopup]: any = useState(false);
  const [fullView, setFullView]: any = useState(false);
  const [imageUrl, setImageUrl]: any = useState("");
  const [, setSessionChangeAtom] = useAtom(sessionChange);
  const [messageSearchBtnClick, setMessageSearchBtnClick]: any =
    useState(false);
  const [searchMessageText, setSearchMessageText]: any = useState("");
  const [messageGetIndexs, setMessageGetIndexs]: any = useState([]);
  const [arrowCount, setArrowCount]: any = useState(0);

  const playSound = () => {
    const audioToPlay = new Audio(require("../notif.mp3"));
    audioToPlay.play();
  };

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

  const singleMessageApiCall = () => {
    setTimeout(() => {
      latestMessageList({
        query: {
          conversationId: conversationID?._id,
          // messageId: data?.latestMessageId,
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
              top: chatListRef?.current?.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        })
        .catch((err: any) => console.log("err", err));
    }, 500);
  };

  const receiveMessageHandler = (data: any) => {
    if (conversationID?._id) {
      singleMessageApiCall();
      playSound();
    }
  };

  const deleteMessageHandler = (data: any) => {
    setMessageListResult((oldValue: any) => {
      return oldValue.map((record: any) => {
        return record?._id !== data.messageId
          ? record
          : { ...record, deleteMessage: true };
      });
    });
  };

  useEffect(() => {
    setCurrentUserData({});
    setMessageInput("");
    setTotalCountMessage(0);
    setScrollManager(0);
    setStartMessageValue(0);
    setMessageSearchBtnClick(false);
    setSearchMessageText("");
    setMessageGetIndexs([]);
    setArrowCount(0);
    if (conversationID?._id) {
      receiveMessageOff();
      receiveMessage(receiveMessageHandler);
      deleteMessageReceiver(deleteMessageHandler);
    }
  }, [conversationID?._id]);

  const getMessageListRecord = (conversation: any, value: any) => {
    messageList({
      query: {
        conversationId: conversation,
        _start: value,
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
    if (startMessageValue !== 0) {
      getMessageListRecord(conversationID?._id, startMessageValue);
    }
  }, [startMessageValue]);

  const searchUserClickHandler = (
    userId: any,
    conversation: any = undefined
  ) => {
    let interval: any;
    receiveMessageOff();
    const userDetails: any = sessionStorage.getItem("userData");
    const myUserId = JSON.parse(userDetails)._id;
    clearInterval(interval);
    setMessageListResult([]);
    setMyUserId(myUserId);
    setTotalCountMessage(0);
    setScrollManager(0);
    setStartMessageValue(0);
    leaveConversation({
      userId: myUserId,
    });
    interval = setInterval(() => {
      conversationListRecordHit({
        userId: myUserId,
      });
    }, 1500);
    conversationListRecordGet((data: any) => {
      setConversationResult(data);
    });
    if (conversation?._id && conversation?.type?.toLowerCase() === "group") {
      joinConversation({
        userId: myUserId,
        conversationId: conversation?._id,
      });
      setConversationID(conversation);
      getMessageListRecord(conversation?._id, 0);
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
          getMessageListRecord(res.data._id, 0);
          getSingleUser({
            query: {
              userId,
            },
          })
            .then((res1: any) => {
              setCurrentUserData(res1.response);
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

  const navigation = useNavigate();

  const logoutBtnHandler = () => {
    sessionStorage.clear();
    disconnectSocket();
    setSessionChangeAtom((oldValue: any) => oldValue + 1);
    toast.success("Logout successfully.");
    navigation("/login");
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
    singleMessageApiCall();
  };

  const handleEnterPress = (event: any) => {
    if (event.key === "Enter") {
      sendMessageHandler();
    }
  };

  // handle scroll
  useEffect(() => {
    if (chatListRef.current) {
      setTimeout(() => {
        if (chatListRef?.current?.scrollHeight) {
          const scrollHeight = chatListRef.current.scrollHeight;
          chatListRef.current.scrollTop = scrollHeight;
        }
      }, 200);
    }
  }, [chatListRef.current, conversationID?._id]);

  const handleScrollTop = () => {
    setScrollManager(chatListRef.current.scrollHeight);
    if (chatListRef.current?.scrollTop === 0 && !messageSearchBtnClick) {
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
    const myUserId = JSON.parse(userDetails)?._id;
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
      const myUserId = JSON.parse(userDetails)?._id;
      leaveConversation({
        userId: myUserId,
      });
      clearInterval(interval);
    };
  }, []);

  const sendMessageHandlerImage = (image: any, text: any) => {
    if (!image || image === "") {
      toast.error("Please select a image from your computer.");
      return;
    }
    sendMessage({
      senderId: myUserId,
      receiverIds:
        conversationID?.type?.toLowerCase() === "group"
          ? conversationID?.members
          : getCurrentUserData._id,
      type: "image",
      conversationId: conversationID?._id,
      message: text,
      image: image,
    });
    setImagePopup(false);
    singleMessageApiCall();
  };

  const searchMessageHandler = () => {
    messageList({
      query: {
        conversationId: conversationID?._id,
        _start: 0,
        _limit: 10000000,
      },
    })
      .then((res: any) => {
        setMessageListResult(res.data.messages);
        setMessageGetIndexs(
          res.data.messages
            .reverse()
            .map((val: any, index: any) => {
              return val.message
                .toLowerCase()
                .includes(searchMessageText.toLowerCase()) && !val.deleteMessage
                ? index
                : undefined;
            })
            .filter((item: any) => item !== undefined)
            .reverse()
        );
        setMessageSearchBtnClick(true);
        setTimeout(() => {
          chatListRef.current.scrollTo({
            top: chatListRef?.current?.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      })
      .catch((err: any) => {
        console.log("err", err);
      });
  };

  const scrollToSelectedMessage = (index: number) => {
    const selectedMessage = chatListRef.current.querySelector(
      `#message-${index}`
    );
    if (selectedMessage) {
      selectedMessage.scrollIntoView({ behavior: "smooth" });
    }
  };

  const upSearchMessageClick: any = () => {
    setArrowCount(
      messageGetIndexs.length - 1 > arrowCount ? arrowCount + 1 : arrowCount
    );
    scrollToSelectedMessage(messageGetIndexs[arrowCount]);
  };

  const downSearchMessageClick = () => {
    setArrowCount(arrowCount !== 0 ? arrowCount - 1 : arrowCount);
    scrollToSelectedMessage(messageGetIndexs[arrowCount]);
  };

  return (
    <>
      {groupPopupFlag && <Groupmodal setGroupPopupFlag={setGroupPopupFlag} />}
      {imagePopup && (
        <Imagemodal
          sendMessageHandlerImage={sendMessageHandlerImage}
          setImagePopup={setImagePopup}
        />
      )}
      {fullView && <Imageview imageUrl={imageUrl} setFullView={setFullView} />}

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
                              <img
                                src={
                                  item?.avatar_url
                                    ? item?.avatar_url
                                    : defaultImage
                                }
                                alt="avatar"
                              />
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
                          {record?.unread_count?.[0]?.total_count && (
                            <div className="msg-count">
                              {record?.unread_count?.[0]?.total_count > 99
                                ? "99+"
                                : record?.unread_count?.[0]?.total_count}
                            </div>
                          )}
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
                    <div className="col-lg-6 hidden-sm text-right flex flex-end">
                      {conversationID?._id && (
                        <>
                          <div className="chat-search mr-2">
                            <div className="mr-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter message here..."
                                onChange={(e: any) =>
                                  setSearchMessageText(e.target.value)
                                }
                                value={searchMessageText}
                              />
                            </div>

                            {messageSearchBtnClick ? (
                              <>
                                <div
                                  className="btn btn-outline-primary mr-2"
                                  onClick={upSearchMessageClick}
                                >
                                  <i className="fa-solid fa-arrow-up"></i>
                                </div>
                                <div
                                  className="btn btn-outline-primary"
                                  onClick={downSearchMessageClick}
                                >
                                  <i className="fa-solid fa-arrow-down"></i>
                                </div>
                              </>
                            ) : (
                              <div
                                className="btn btn-outline-primary"
                                onClick={searchMessageHandler}
                              >
                                <i className="fa-solid fa-search"></i>
                              </div>
                            )}
                          </div>
                          {/* <a
                            href="#"
                            className="btn btn-outline-secondary mr-2"
                          >
                            <i className="fa fa-file"></i>
                          </a> */}
                          <div
                            onClick={() => setImagePopup(true)}
                            className="btn btn-outline-primary mr-2"
                          >
                            <i className="fa fa-image"></i>
                          </div>
                          {/* <a href="#" className="btn btn-outline-info mr-2">
                            <i className="fa fa-cogs"></i>
                          </a> */}
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
                          messageListResult.map((record: any, index: any) => {
                            const currentDate = getFormattedDate(
                              record?.created_at
                            );
                            const prevDate =
                              index > 0
                                ? getFormattedDate(
                                    messageListResult[index - 1]?.created_at
                                  )
                                : null;

                            return (
                              <div key={record?._id}>
                                {prevDate !== currentDate && (
                                  <div
                                    style={{
                                      textAlign: "center",
                                      margin: "10px 0",
                                    }}
                                  >
                                    <h6 className="daywisedate">
                                      {currentDate}
                                    </h6>
                                  </div>
                                )}
                                <RenderMessage
                                  record={record}
                                  myUserId={myUserId}
                                  conversationID={conversationID}
                                  setImageUrl={setImageUrl}
                                  setFullView={setFullView}
                                  getCurrentUserData={getCurrentUserData}
                                  setMessageListResult={setMessageListResult}
                                  index={index}
                                  messageGetIndexs={messageGetIndexs}
                                />
                              </div>
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
