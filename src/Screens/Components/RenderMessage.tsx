import dayjs from "dayjs";
import React from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import { messageSoftDelete } from "../../Services/Api/Services";

const deleteStyle = {
  color: "#cd1421",
  fontSize: "14px",
  marginLeft: "5px",
  marginTop: "12px",
  cursor: "pointer",
}

const RenderMessage = ({
  record,
  myUserId,
  conversationID,
  setImageUrl,
  setFullView,
  setMessageListResult
}: any) => {
  dayjs.extend(relativeTime);
  const myMessage = myUserId === record?.sender?._id;

  const deleteMessageHandler = (messageId: any) => {
    messageSoftDelete({
      query: {
        id: messageId
      }
    }).then((res: any) => {
      setMessageListResult((oldValue: any) => oldValue.map((record: any) => {
        return record?._id !== res._id ?
          record :
          res.response
      }))
    })
      .catch((err: any) => console.log('err', err))
  }

  return (
    <li className="clearfix">
      <div className={`message-data ${myMessage && "text-right"}`}>
        <span className="message-data-time">
          {`${dayjs(record?.created_at).format("hh:mm A")} ${conversationID?.type === "group"
            ? `(${record?.sender?._id !== myUserId
              ? record?.sender?.name
              : "You"
            })`
            : ""
            }`}
        </span>
      </div>
      {myMessage && !record?.deleteMessage &&
        <i style={deleteStyle} onClick={() => deleteMessageHandler(record._id)} className="fa-solid fa-trash other-message float-right"></i>
      }
      {record?.deleteMessage ?
        <div
          className={`message ${myMessage ? "other-message float-right" : "my-message"
            }`}
        >
          {myMessage ? "🚫 You deleted this message." : "🚫 This message was deleted."}
        </div>
        :
        record?.type === "text" ? (
          <div
            className={`message ${myMessage ? "other-message float-right" : "my-message"
              }`}
          >
            {record?.message}
          </div>
        ) : (
          <div
            className={`message ${myMessage ? "other-message float-right" : "my-message"
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
