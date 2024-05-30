import React, { useEffect, useState, useRef } from "react";
import "./Chatscreen.style.css";
import {
  checkAdminApi,
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
import defaultImage from "../images/trank.png";
import { toast } from "react-toastify";
import defaultBackImage from "../images/defaultback.png";
import Groupmodal from "./Components/Groupmodal";
import Imagemodal from "./Components/Imagemodal";
import Imageview from "./Components/Imageview";
import RenderMessage from "./Components/RenderMessage";
import { getFormattedDate } from "../Utils/UserUtils";
import { messageCountJotai, sessionChange } from "../jotai";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import DeleteGroupModel from "./Components/DeleteGroupModel";
import Editprofile from "./Components/Editprofile";

dayjs.extend(relativeTime);
function Chatscreen() {
  const [searchFlag, setSearchFlag] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [userList, setUserList] = useState<any[]>([]);
  const [myUserId, setMyUserId] = useState<string>("");
  const [getCurrentUserData, setCurrentUserData] = useState<any>({});
  const [messageInput, setMessageInput] = useState<string>("");
  const [conversationID, setConversationID] = useState<any>({});
  const [conversationResult, setConversationResult] = useState<any[]>([]);
  const [messageListResult, setMessageListResult] = useState<any[]>([]);
  const [startMessageValue, setStartMessageValue] = useState<number>(0);
  const [groupPopupFlag, setGroupPopupFlag] = useState<boolean>(false);
  const chatListRef: any = useRef<HTMLDivElement | null>(null);
  const [totalCountMessage, setTotalCountMessage] = useState<number>(0);
  const [scrollManager, setScrollManager] = useState<number>(0);
  const [imagePopup, setImagePopup] = useState<boolean>(false);
  const [fullView, setFullView] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [, setSessionChangeAtom] = useAtom(sessionChange);
  const [messageSearchBtnClick, setMessageSearchBtnClick] =
    useState<boolean>(false);
  const [searchMessageText, setSearchMessageText] = useState<string>("");
  const [messageGetIndexs, setMessageGetIndexs] = useState<number[]>([]);
  const [arrowCount, setArrowCount] = useState<number>(0);
  const [isAdminFlag, setIsAdminFlag] = useState<boolean>(false);
  const [editManagerFlag, setEditManagerFlag] = useState<boolean>(false);
  const [deletePopUpFlag, setDeletePopUpFlag] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [editProfileFlag, setEditProfileFlag] = useState<boolean>(false);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to match the scroll height
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [messageInput]);

  const playSound = () => {
    const audioToPlay = new Audio(require("../notif.mp3"));
    audioToPlay?.play();
  };

  const onChangeHandler = (text: string) => {
    setSearchText(text);
    setSearchFlag(text.length > 0);
  };

  useEffect(() => {
    const searchUser = async () => {
      try {
        const res: any = await searchUseApi({ query: { search: searchText } });
        setUserList(res.response);
      } catch (err) {
        console.log("err", err);
      }
    };
    if (searchText.length > 0) {
      const timeoutId = setTimeout(searchUser, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [searchText]);

  // get message listing
  const singleMessageApiCall = async () => {
    try {
      const res: any = await latestMessageList({
        query: { conversationId: conversationID?._id },
      });
      setMessageListResult((oldValue) => [
        ...oldValue.filter((item) => item._id !== res.data?._id),
        res.data,
      ]);
      setTimeout(() => {
        chatListRef.current?.scrollTo({
          top: chatListRef.current?.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.log("err", err);
    }
  };

  const receiveMessageHandler = (data: any) => {
    if (conversationID?._id) {
      singleMessageApiCall();
      playSound();
    }
  };

  const deleteMessageHandler = (data: any) => {
    setMessageListResult((oldValue) =>
      oldValue.map((record) =>
        record?._id !== data.messageId
          ? record
          : { ...record, deleteMessage: true }
      )
    );
  };

  useEffect(() => {
    const initializeChat = async () => {
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
        try {
          const res: any = await checkAdminApi({
            query: { conversationId: conversationID?._id, userId: myUserId },
          });
          setIsAdminFlag(res?.isAdmin);
        } catch (err) {
          console.log("err", err);
        }
      }
    };
    initializeChat();
  }, [conversationID?._id]);

  const getMessageListRecord = async (
    conversationId: string,
    value: number
  ) => {
    try {
      const res: any = await messageList({
        query: { conversationId, _start: value, _limit: 20 },
      });
      setTotalCountMessage(res?.data?.total_count);
      if (res.data.messages && res.data.messages.length > 0) {
        setMessageListResult((oldValue) => [
          ...res.data.messages.reverse(),
          ...oldValue,
        ]);
        setTimeout(() => {
          if (chatListRef.current?.scrollTop !== undefined) {
            chatListRef.current.scrollTop =
              chatListRef.current?.scrollHeight || 0 - scrollManager;
          }
        }, 100);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    if (startMessageValue !== 0) {
      getMessageListRecord(conversationID?._id, startMessageValue);
    }
  }, [startMessageValue]);

  const searchUserClickHandler = async (
    userId: string,
    conversation: any = undefined
  ) => {
    receiveMessageOff();
    const userDetails: any = sessionStorage.getItem("userData");
    const myUserId = JSON.parse(userDetails)._id;
    setMessageListResult([]);
    setMyUserId(myUserId);
    setTotalCountMessage(0);
    setScrollManager(0);
    setStartMessageValue(0);
    leaveConversation({ userId: myUserId });
    if (conversation?._id && conversation?.type?.toLowerCase() === "group") {
      joinConversation({
        userId: myUserId,
        conversationId: conversation?._id,
      });
      setConversationID(conversation);
      getMessageListRecord(conversation?._id, 0);
    } else {
      try {
        const res: any = await createConversation({
          body: { usersList: [myUserId, userId] },
        });
        await joinConversation({
          userId: myUserId,
          conversationId: res.data._id,
        });
        setConversationID(res.data);
        getMessageListRecord(res.data._id, 0);
        const res1: any = await getSingleUser({ query: { userId } });
        setCurrentUserData(res1.response);
        setSearchText("");
        setSearchFlag(false);
      } catch (err) {
        console.log("err", err);
      }
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

  const sendMessageHandler = async () => {
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

  const handleEnterPress = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        setMessageInput((prev) => prev);
      } else {
        event.preventDefault();
        sendMessageHandler();
      }
    }
  };

  // handle scroll
  useEffect(() => {
    if (chatListRef.current) {
      setTimeout(() => {
        const scrollHeight = chatListRef.current?.scrollHeight;
        chatListRef.current.scrollTop = scrollHeight;
      }, 200);
    }
  }, [chatListRef.current, conversationID?._id]);

  const handleScrollTop = () => {
    setScrollManager(chatListRef.current?.scrollHeight || 0);
    if (chatListRef.current?.scrollTop === 0 && !messageSearchBtnClick) {
      setStartMessageValue((oldValue) =>
        totalCountMessage + 50 > oldValue ? oldValue + 50 : oldValue
      );
    }
  };

  useEffect(() => {
    const initializeChatList = async () => {
      let interval: NodeJS.Timeout;
      setTotalCountMessage(0);
      setScrollManager(0);
      setStartMessageValue(0);
      setMessageListResult([]);
      const userDetails: any = sessionStorage.getItem("userData");
      const myUserId = JSON.parse(userDetails)?._id;
      setMyUserId(myUserId);
      conversationListRecordHit({ userId: myUserId });
      interval = setInterval(() => {
        conversationListRecordHit({ userId: myUserId });
      }, 5000);
      conversationListRecordGet((data: any) => {
        setConversationResult(data);
      });
      return () => {
        receiveMessageOff();
        leaveConversation({ userId: myUserId });
        clearInterval(interval);
      };
    };
    initializeChatList();
  }, []);

  const sendMessageHandlerImage = async (image: string, text: string) => {
    if (!image) {
      toast.error("Please select an image from your computer.");
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

  const searchMessageHandler = async () => {
    if (searchMessageText.length === 0) {
      return toast.error("Please enter search text first.");
    }
    try {
      const res: any = await messageList({
        query: {
          conversationId: conversationID?._id,
          _start: 0,
          _limit: 1000000000,
        },
      });
      setMessageListResult(res.data.messages);
      setMessageGetIndexs(
        res.data.messages
          .reverse()
          .map((val: any, index: any) =>
            val.message
              .toLowerCase()
              .includes(searchMessageText.toLowerCase()) && !val.deleteMessage
              ? index
              : undefined
          )
          .filter((item: any) => item !== undefined)
          .reverse()
      );
      setMessageSearchBtnClick(true);
      setTimeout(() => {
        chatListRef.current?.scrollTo({
          top: chatListRef?.current?.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.log("err", err);
    }
  };

  const scrollToSelectedMessage = (index: number) => {
    const selectedMessage = chatListRef.current?.querySelector(
      `#message-${index}`
    );
    if (selectedMessage) {
      selectedMessage.scrollIntoView({ behavior: "smooth" });
    }
  };

  const upSearchMessageClick = () => {
    setArrowCount((prev) =>
      messageGetIndexs.length - 1 > prev ? prev + 1 : prev
    );
    scrollToSelectedMessage(messageGetIndexs[arrowCount]);
  };

  const downSearchMessageClick = () => {
    setArrowCount((prev) => (prev !== 0 ? prev - 1 : prev));
    scrollToSelectedMessage(messageGetIndexs[arrowCount]);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();

    // Handle text paste
    const clipboardText = event.clipboardData.getData("text");
    if (clipboardText) {
      const formattedText = clipboardText.replace(/\r\n|\r|\n/g, "\n");
      setMessageInput((prevValue) => prevValue + formattedText);
    }

    // Handle image paste
    const items: any = event.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              setImagePopup(true);
              setImage(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
        event.preventDefault();
      }
    }
  };

  const [currentMessageCount, setMessageCount] = useAtom(messageCountJotai);
  useEffect(() => {
    const resultTotal = conversationResult.reduce((total, conversation) => {
      const unreadCount = conversation.unread_count?.[0]?.total_count || 0;
      return total + unreadCount;
    }, 0);
    if (currentMessageCount !== resultTotal) {
      playSound();
      setMessageCount(resultTotal);
    }
  }, [conversationResult]);

  const setCursorToEndAndScroll = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  useEffect(() => {
    setCursorToEndAndScroll();
  }, [messageInput]);

  return (
    <>
      {groupPopupFlag && (
        <Groupmodal
          editManagerFlag={editManagerFlag}
          setGroupPopupFlag={setGroupPopupFlag}
          conversation={conversationID}
          setConversation={setConversationID}
          setEditManagerFlag={setEditManagerFlag}
        />
      )}
      {imagePopup && (
        <Imagemodal
          sendMessageHandlerImage={sendMessageHandlerImage}
          setImagePopup={setImagePopup}
          image={image}
          setImage={setImage}
        />
      )}
      {deletePopUpFlag && (
        <DeleteGroupModel
          setConversation={setConversationID}
          conversation={conversationID}
          setDeletePopUpFlag={setDeletePopUpFlag}
        />
      )}
      {fullView && <Imageview imageUrl={imageUrl} setFullView={setFullView} />}
      {editProfileFlag && (
        <Editprofile setEditProfileFlag={setEditProfileFlag} />
      )}

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
                    <div className="col-lg-6 hidden-sm text-right flex flex-end align-center">
                      {conversationID?._id && (
                        <>
                          <div className="chat-search mr-2">
                            <div className="mr-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter message here..."
                                onChange={(e: any) => {
                                  setMessageSearchBtnClick(false);
                                  setSearchMessageText(e.target.value);
                                }}
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

                      {isAdminFlag && (
                        <>
                          <div
                            className="btn btn-outline-primary mr-2"
                            onClick={() => {
                              setEditManagerFlag(true);
                              setGroupPopupFlag(!groupPopupFlag);
                            }}
                          >
                            <i className="fa-solid fa-user-pen"></i>
                          </div>
                          <div
                            className="btn btn-outline-danger mr-2"
                            onClick={() => setDeletePopUpFlag(!deletePopUpFlag)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </div>
                        </>
                      )}

                      {conversationID?.type !== "group" && (
                        <div
                          onClick={() => {
                            setEditManagerFlag(false);
                            setGroupPopupFlag(!groupPopupFlag);
                          }}
                          className="btn btn-outline-primary mr-2"
                        >
                          <i className="fa fa-user-group"></i>
                        </div>
                      )}
                      <div
                        onClick={() => setEditProfileFlag(true)}
                        className="btn btn-outline-primary mr-2"
                      >
                        <i className="fa-solid fa-user-pen"></i>
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
                        {/* <input
                          type="text"
                          className="form-control"
                          placeholder="Enter text here..."
                          value={messageInput}
                          onKeyDown={handleEnterPress}
                          onChange={(event: any) =>
                            setMessageInput(event.target.value)
                          }
                        /> */}
                        <textarea
                          ref={textareaRef}
                          style={{
                            maxHeight: "200px",
                            resize: "none",
                          }}
                          value={messageInput}
                          onChange={(event: any) => {
                            setMessageInput(event.target.value);
                          }}
                          onKeyDown={handleEnterPress}
                          className="form-control"
                          onPaste={handlePaste}
                          rows={1}
                          cols={50}
                          placeholder="Enter text here..."
                        ></textarea>
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
