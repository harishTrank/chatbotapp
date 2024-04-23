import dayjs from "dayjs";

export const getFormattedDate = (time: string) => {
  const currentDate = dayjs(time).startOf("day");
  const today = dayjs().startOf("day");
  const yesterday = dayjs().subtract(1, "day").startOf("day");

  if (currentDate.isSame(today, "day")) {
    return "Today";
  } else if (currentDate.isSame(yesterday, "day")) {
    return "Yesterday";
  } else {
    return currentDate.format("DD/MM/YYYY");
  }
};
