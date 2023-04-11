import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { SERVER_USER_API } from "../Global";

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;

export default function ForgotPasswordComp({ handleSwitch }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      if (email.match(emailRegex)) {
        setLoading(true);
        axios
          .post(
            `${SERVER_USER_API}/forgot-password-otp`,
            {
              email: email,
            },
            {
              headers: {
                "Content-type": "application/json",
              },
            }
          )
          .then(async (res) => {
            
            if (res.status === 200 && res.data.isSuccess === true) {
              setError("");
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
                setLoading(false);
                handleSwitch(email, "FP");
              }, 3000);
            } else {
              setError(`${res.data.message}`);
              toast({
                title: "Error occured!!!",
                description: `${res.data.message}`,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
                variant: "top-accent",
              });
              setLoading(false);
              return;
            }
          })
          .catch((error) => {
            setError(`${error.response ? error.response.data.message : error.message}`);
            toast({
              title: "Error occured!!!",
              description: `${error.response ? error.response.data.message : error.message}`,
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
              variant: "top-accent",
            });
            setLoading(false);
          });
      } else {
        setError("Invalid email. Please enter a valid email.");
      }
    } else {
      setError("Required!!!");
    }
  };
  
  return (
    <Box
      bg="white"
      w="100%"
      p={3}
      borderRadius="lg"
      borderWidth="1px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Text fontSize="2xl" fontFamily="Work sans" marginTop="0.5em">
        Trouble Logging in?
      </Text>
      <Box
        bg="white"
        w="90%"
        p={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Text fontSize="2md" fontFamily="Work sans" my="1em">
          Enter your email below. If you are registered with us then we will
          send you a password recovery email.
        </Text>

        <FormControl
          id="email_fp"
          fontFamily="Work sans"
          isRequired
          isInvalid={error}
        >
          <FormLabel fontWeight="bold">Email address</FormLabel>
          <Input
            className="email"
            type="email"
            placeholder="Enter your Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>

        <Button
          colorScheme="blue"
          width="100%"
          m="2em 0 1em 0"
          isLoading={loading}
          onClick={handleSubmit}
        >
          Send Password Recovery Link
        </Button>
      </Box>
    </Box>
  );
}
