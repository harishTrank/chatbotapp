import dayjs from "dayjs";
import React from "react";
import relativeTime from "dayjs/plugin/relativeTime";

const RenderMessage = ({
  record,
  myUserId,
  conversationID,
  setImageUrl,
  setFullView,
}: any) => {
  dayjs.extend(relativeTime);
  const myMessage = myUserId === record?.sender?._id;

  return (
    <li className="clearfix">
      <div className={`message-data ${myMessage && "text-right"}`}>
        <span className="message-data-time">
          {`${dayjs(record?.created_at).format("hh:mm A")} ${
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
      {record?.deleteMessage ? (
        <></>
      ) : record?.type === "text" ? (
        <div
          className={`message ${
            myMessage ? "other-message float-right" : "my-message"
          }`}
        >
          {record?.message}
        </div>
      ) : (
        <div
          className={`message ${
            myMessage ? "other-message float-right" : "my-message"
          }`}
        >
          <div className="image-manager-div">
            <img
              onClick={() => {
                setImageUrl(record?.image);
                setFullView(true);
              }}
              style={{
                width: "600px",
                maxHeight: "420px",
                objectFit: "contain",
              }}
              src={record?.image}
              alt=""
            />
            {record?.message ? record?.message : ""}
          </div>
        </div>
      )}
    </li>
  );
};

export default RenderMessage;
