import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../context/ChatContextProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import { SERVER_CHAT_API, SERVER_USER_API } from "../Global";
import axios from "axios";
import ChatLoading from "../miscComponents/ChatLoading";
import UserListItem from "./UserListItem";
import { getSenderName } from "../config/ChatLogics";

export default function SideDrawer({ fetchNotifAgain, setFetchNotifAgain }) {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const navigate = useNavigate();
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleLogout = () => {
    axios
      .post(
        `${SERVER_USER_API}/logout`,
        {
          email: user.email,
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
          setSelectedChat();
          setChats([]);
          setNotification([]);
          localStorage.removeItem("userInfo");
          localStorage.removeItem("authToken");

          toast({
            title: "Success!!!",
            description: `${res.data.message}`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
            variant: "top-accent",
          });

          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `${
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

  const handleSearch = () => {
    if (!search) {
      toast({
        title: "Warning!!!",
        description: `Please enter something to search`,
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
        variant: "top-accent",
      });
      return;
    }

    setLoading(true);
    axios
      .get(`${SERVER_USER_API}?search=${search}`, {
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
          setSearchResult(res.data);
          setLoading(false);
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `Failed to get searched users. ${
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

  const accessChat = (userId) => {
    setLoadingChat(true);

    axios
      .post(
        `${SERVER_CHAT_API}`,
        { userId },
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
          if (chats && !chats.find((c) => c._id === res.data._id)) {
            setChats([res.data, ...chats]);
          }
          setSelectedChat(res.data);
          setLoadingChat(false);
          onClose();
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `Failed to fetch the chat. ${
            error.response ? error.response.data.message : error.message
          }`,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
          variant: "top-accent",
        });
        setLoadingChat(false);
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

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px"
        borderWidth="5px"
      >
        <Tooltip
          hasArrow
          label="Search users"
          placement="bottom-end"
          aria-label="Search users"
        >
          <Button variant="ghost" onClick={onOpen}>
            <i className="fa fa-search" aria-hidden="true"></i>
            <Text display={{ base: "none", md: "flex" }} px="2">
              Search users
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="3xl" fontFamily="Work sans">
          Chatter-Box
        </Text>

        <div>
          <Menu isLazy>
            <MenuButton
              p={1}
              style={{ position: "relative" }}
              mr={notification.length ? 2 : 1}
            >
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50px",
                  backgroundColor: "red",
                  display: notification.length ? "flex" : "none",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: notification.length < 10 ? "13px" : "10px",
                  color: "whitesmoke",
                }}
              >
                {notification.length < 10 ? notification.length : "9+"}
              </span>
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={1} maxH="50vh" overflowY="scroll">
              {!notification.length && "No new messages"}
              {notification.length ? (
                notification.map((notif) => {
                  return (
                    <MenuItem
                      key={notif._id}
                      p={1}
                      onClick={() => {
                        setSelectedChat(notif.chat);
                        setNotification(
                          notification.filter(
                            (n) => n.chat._id !== notif.chat._id
                          )
                        );
                      }}
                      display="flex"
                      alignItems="space-between"
                    >
                      {notif.chat.isGroupChat ? (
                        <span>
                          New Message in <b>{notif.chat.chatName}</b>
                        </span>
                      ) : (
                        <span>
                          New Message from{" "}
                          <b>{getSenderName(user, notif.chat.users)}</b>
                        </span>
                      )}
                    </MenuItem>
                  );
                })
              ) : (
                <></>
              )}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} p={1}>
              <Avatar
                name={user.name}
                src={user.pic}
                size="sm"
                cursor="pointer"
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by email or name"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult &&
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
