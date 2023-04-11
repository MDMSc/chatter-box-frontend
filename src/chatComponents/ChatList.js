import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSenderName } from "../config/ChatLogics";
import { ChatState } from "../context/ChatContextProvider";
import { SERVER_CHAT_API } from "../Global";
import ChatLoading from "../miscComponents/ChatLoading";
import PageLoading from "../miscComponents/PageLoading";
import GroupChatModal from "./GroupChatModal";

export default function ChatList({
  fetchAgain,
  fetchNotifAgain,
  setFetchNotifAgain,
}) {
  const [loggedUser, setLoggedUser] = useState();

  const navigate = useNavigate();

  const toast = useToast();
  const {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    mainLoading,
    setMainLoading,
    notification,
    setNotification,
  } = ChatState();

  const fetchChats = () => {
    axios
      .get(`${SERVER_CHAT_API}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("authToken")
              ? localStorage.getItem("authToken")
              : ""
          }`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setChats(res.data);
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `Failed to load chats. ${
            error.response ? error.response.data.message : error.message
          }`,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
          variant: "top-accent",
        });

        if (
          error.response.status === 401 ||
          error.response.status === 404 ||
          error.response.status === 500
        ) {
          setTimeout(() => {
            localStorage.removeItem("userInfo");
            localStorage.removeItem("authToken");
            navigate("/");
          }, 3000);
        }
      });
  };

  useEffect(() => {
    setMainLoading(true);
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    setMainLoading(false);
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "25px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats &&
              chats.map((chat) => (
                <Box
                  onClick={() => {
                    setSelectedChat(chat);
                    setNotification(
                      notification.filter((n) => n.chat._id !== chat._id)
                    );
                  }}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                >
                  <Text>
                    {mainLoading ? (
                      <PageLoading />
                    ) : loggedUser && !chat.isGroupChat ? (
                      getSenderName(loggedUser, chat.users)
                    ) : (
                      chat.chatName
                    )}
                  </Text>
                </Box>
              ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
}
