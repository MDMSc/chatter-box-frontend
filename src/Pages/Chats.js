import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatContextProvider";
import { Box, useToast } from "@chakra-ui/react";
import SideDrawer from "../chatComponents/SideDrawer";
import ChatList from "../chatComponents/ChatList";
import ChatBox from "../chatComponents/ChatBox";
import PageLoading from "../miscComponents/PageLoading";
import axios from "axios";
import { SERVER_MESSAGE_API } from "../Global";
import { useNavigate } from "react-router-dom";

export default function Chats() {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [fetchNotifAgain, setFetchNotifAgain] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, mainLoading, setNotification } = ChatState();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchNotificationMessages = () => {
    setLoading(true);
    setNotification([]);
    axios
      .get(`${SERVER_MESSAGE_API}`, {
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
          setNotification(res.data);
          setLoading(false);
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

  useEffect(() => {
    fetchNotificationMessages();
  }, [fetchNotifAgain]);

  return (
    <div style={{ width: "100%" }}>
      {mainLoading && loading ? (
        <PageLoading />
      ) : (
        <>
          {user && (
            <SideDrawer
              fetchNotifAgain={fetchNotifAgain}
              setFetchNotifAgain={setFetchNotifAgain}
            />
          )}
          <Box
            display="flex"
            justifyContent="space-between"
            width="100%"
            height="91.5vh"
            p="10px"
          >
            {user && (
              <ChatList
                fetchAgain={fetchAgain}
                fetchNotifAgain={fetchNotifAgain}
                setFetchNotifAgain={setFetchNotifAgain}
              />
            )}
            {user && (
              <ChatBox
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
                fetchNotifAgain={fetchNotifAgain}
                setFetchNotifAgain={setFetchNotifAgain}
              />
            )}
          </Box>
        </>
      )}
    </div>
  );
}
