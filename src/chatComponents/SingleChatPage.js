import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatContextProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSenderDetails, getSenderName } from "../config/ChatLogics";
import ProfileModal from "./ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import axios from "axios";
import { SERVER_BASE_API, SERVER_MESSAGE_API } from "../Global";
import { useNavigate } from "react-router-dom";
import "../styles/messages.css";
import ChatMessages from "./ChatMessages";
import io from "socket.io-client";
import Lottie from "lottie-react";
import typingAnimation from "../animations/typing.json";

const ENDPOINT = SERVER_BASE_API;
let socket, selectedChatCompare;

export default function SingleChatPage({
  fetchAgain,
  setFetchAgain,
  fetchNotifAgain,
  setFetchNotifAgain,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat, notification } = ChatState();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchMessages = () => {
    if (!selectedChat) return;

    setLoading(true);
    axios
      .get(`${SERVER_MESSAGE_API}/${selectedChat._id}`, {
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
          setMessages(res.data);
          setLoading(false);

          socket.emit("join_chat", selectedChat._id);
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `Failed to load messages. ${
            error.response ? error.response.data.message : error.message
          }`,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
          variant: "top-accent",
        });

        setLoading(false);
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

  const readMessage = () => {
    if (!selectedChat) return;

    axios
      .put(
        `${SERVER_MESSAGE_API}/${selectedChat._id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("authToken")
                ? localStorage.getItem("authToken")
                : ""
            }`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          setFetchNotifAgain(!fetchNotifAgain);
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `Failed to load messages. ${
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
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop_typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    readMessage();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message_received", (newMsgReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMsgReceived.chat._id
      ) {
        // give notification
        if (!notification.includes(newMsgReceived)) {
          setFetchNotifAgain(!fetchNotifAgain);
          setFetchAgain(!fetchAgain);
        }
      } else {
        readMessage();
        setMessages([...messages, newMsgReceived]);
      }
    });
  });

  const sendMessage = (e) => {
    if (e.key === "Enter" && newMessage) {
      setNewMessage("");
      socket.emit("stop_typing", selectedChat._id);
      axios
        .post(
          `${SERVER_MESSAGE_API}`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                localStorage.getItem("authToken")
                  ? localStorage.getItem("authToken")
                  : ""
              }`,
            },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            socket.emit("new_message", res.data);
            setMessages([...messages, res.data]);
          }
        })
        .catch((error) => {
          toast({
            title: "Error occured!!!",
            description: `Failed to send data. ${
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
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    //Typing Indicator
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;

    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop_typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={3}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSenderName(user, selectedChat.users)}
                <ProfileModal
                  user={getSenderDetails(user, selectedChat.users)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="#e8e8e8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages_div">
                <ChatMessages messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <Lottie
                  loop={true}
                  autoplay={true}
                  animationData={typingAnimation}
                  style={{
                    width: 80,
                    height: 40,
                    padding: 0,
                    marginBottom: 15,
                    marginLeft: 0,
                  }}
                />
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter message..."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a chat to start chatting...
          </Text>
        </Box>
      )}
    </>
  );
}
