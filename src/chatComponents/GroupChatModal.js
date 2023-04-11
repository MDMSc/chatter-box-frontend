import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
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
import { ChatState } from "../context/ChatContextProvider";
import { SERVER_CHAT_API, SERVER_USER_API } from "../Global";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserListItem from "./UserListItem";
import UserBadgeItem from "./UserBadgeItem";

export default function GroupChatModal({ children }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user, chats, setChats } = ChatState();
  const navigate = useNavigate();

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
          description: `Failed to get searched users. 
                          ${error.response ? error.response.data.message : error.message}`,
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

  const handleSubmit = () => {
    if (!groupName || !selectedUsers) {
      toast({
        title: "Warning!!!",
        description: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
        variant: "top-accent",
      });
      return;
    }

    axios
      .post(
        `${SERVER_CHAT_API}/create-group`,
        {
          chatName: groupName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
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
          setChats([res.data, ...chats]);
          onClose();
          toast({
            title: "Success!!!",
            description: "Group chat created successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
            variant: "top-accent",
          });

          return;
        }
      })
      .catch((error) => {
        toast({
          title: "Error occured!!!",
          description: `${error.response ? error.response.data.message : error.message}`,
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

  const handleAddUser = (user) => {
    if (selectedUsers.includes(user)) {
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

    setSelectedUsers([...selectedUsers, user]);
  };

  const handleDeleteUser = (user) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="30px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create New Group
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Group Chat Name"
                mb={3}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            <Box width="100%" display="flex" flexWrap="wrap">
              {selectedUsers &&
                selectedUsers.map((user) => (
                  <UserBadgeItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleDeleteUser(user)}
                  />
                ))}
            </Box>

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
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
