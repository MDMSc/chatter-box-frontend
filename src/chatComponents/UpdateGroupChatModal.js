import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../context/ChatContextProvider";
import UserBadgeItem from "./UserBadgeItem";
import axios from "axios";
import { SERVER_CHAT_API, SERVER_USER_API } from "../Global";
import { useNavigate } from "react-router-dom";
import UserListItem from "./UserListItem";

export default function UpdateGroupChatModal({
  fetchAgain,
  setFetchAgain,
  fetchMessages,
}) {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, selectedChat, setSelectedChat } = ChatState();
  const toast = useToast();
  const navigate = useNavigate();

  const handleDeleteUser = (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Warning!!!",
        description: "Only admins can remove user from group chats",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
        variant: "top-accent",
      });
      return;
    }

    setLoading(true);
    axios
      .put(
        `${SERVER_CHAT_API}/group-remove-user`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
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
          user1._id === user._id
            ? setSelectedChat()
            : setSelectedChat(res.data);
          setFetchAgain(!fetchAgain);
          fetchMessages();
          setLoading(false);
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `Failed to remove user to group chat. ${
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

  const handleAddUser = (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "Warning!!!",
        description: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
        variant: "top-accent",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Warning!!!",
        description: "Only admins can add user to group chats",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
        variant: "top-accent",
      });
      return;
    }

    setLoading(true);
    axios
      .put(
        `${SERVER_CHAT_API}/group-add-user`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
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
          setSelectedChat(res.data);
          setFetchAgain(!fetchAgain);
          setLoading(false);
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `Failed to add user to group chat. ${
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

  const handleRename = () => {
    if (!groupName) return;

    setRenameLoading(true);

    axios
      .put(
        `${SERVER_CHAT_API}/rename-group`,
        {
          chatId: selectedChat._id,
          chatName: groupName,
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
          setSelectedChat(res.data);
          setFetchAgain(!fetchAgain);
          setRenameLoading(false);
          setGroupName("");
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `Failed to update group chat name. ${
            error.response ? error.response.data.message : error.message
          }`,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
          variant: "top-accent",
        });
        setRenameLoading(false);
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

        setGroupName("");
      });
  };

  const handleSearch = (query) => {
    setSearch(query);
    if (!query) return;

    setLoading(true);
    axios
      .get(`${SERVER_USER_API}?search=${query}`, {
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
          setSearchResults(res.data);
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

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        onClick={onOpen}
        icon={<ViewIcon />}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat &&
                selectedChat.users.map((user) => (
                  <UserBadgeItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleDeleteUser(user)}
                  />
                ))}
            </Box>

            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add user to group chat"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner color="black" thickness="4px" size="md" />
            ) : (
              searchResults &&
              searchResults
                .slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddUser(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleDeleteUser(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
