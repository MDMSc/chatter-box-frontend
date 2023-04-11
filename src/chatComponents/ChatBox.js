import React from "react";
import { ChatState } from "../context/ChatContextProvider";
import { Box } from "@chakra-ui/react";
import SingleChatPage from "./SingleChatPage";

export default function ChatBox({fetchAgain, setFetchAgain, fetchNotifAgain, setFetchNotifAgain}) {
  const { selectedChat } = ChatState();

  return (
    <Box
        display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
        alignItems="center"
        flexDirection="column"
        p={3}
        bg="white"
        w={{ base: "100%", md: "68%" }}
        borderRadius="lg"
        borderWidth="1px"
    >
        <SingleChatPage fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchNotifAgain={fetchNotifAgain} setFetchNotifAgain={setFetchNotifAgain} />
    </Box>
  );
}
