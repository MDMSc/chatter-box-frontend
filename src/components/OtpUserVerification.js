import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  PinInput,
  PinInputField,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { SERVER_USER_API } from "../Global";

export default function OtpUserVerification({email, otpType}) {
  const [otp, setOtp] = useState(0);
  const [counter, setCounter] = useState(59);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    axios
      .post(
        `${SERVER_USER_API}/verification-otp-mail`,
        {
          email: email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        
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
          setLoading(false);
        } else {
          setError(res.data.message);
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
        }
      })
      .catch((error) => {
        setError(error.response ? error.response.data.message : error.message);
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
        return;
      });
  }, []);

  useEffect(() => {
    const timer =
      counter > 0 &&
      setInterval(() => {
        setCounter(counter - 1);
      }, 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setCounter(0);
    if (otp) {
      const data = {
        email: email,
        otp: otp,
        otpType: otpType,
      };

      setLoading(true);
      axios
        .post(`${SERVER_USER_API}/verifyOtp`, data)
        .then((res) => {
          
          if (res.status === 200 && res.data.isSuccess === true) {
            setError("");
            toast({
              title: "Success!!!",
              description: `${res.data.message}. You will be redirected to Login page.`,
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "bottom",
              variant: "top-accent",
            });
            setLoading(false);
            setTimeout(() => {
              window.location.reload(true);
            }, 3000);
          } else {
            setError(res.data.message);
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
          setError(error.response ? error.response.data.message : error.message);
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
          return;
        });
    } else {
      setError("OTP Required!!!");
      toast({
        title: "Error occured!!!",
        description: `OTP Required!!!`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
        variant: "top-accent",
      });
      return;
    }
  };

  const handleClickResend = () => {
    const data = {
      email: email,
      otpType: otpType,
    };

    setLoading(true);
    axios
      .post(`${SERVER_USER_API}/resend-otp`, data)
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
          setLoading(false);
          setCounter(59);
        } else {
          setError(res.data.message);
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
        setError(error.response ? error.response.data.message : error.message);
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
        return;
      });
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
        OTP Verification
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
          Enter the OTP sent to your email. OTP will expire in 10 mins.
        </Text>

        <FormControl
          id="otp"
          fontFamily="Work sans"
          isRequired
          display="flex"
          flexDirection="column"
          alignItems="center"
          isInvalid={error}
        >
          <FormLabel fontWeight="bold">OTP</FormLabel>
          <HStack>
            <PinInput type="number" otp size="lg" onChange={(e) => setOtp(e)}>
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>

        <Button
          colorScheme="blue"
          variant="link"
          type="button"
          marginTop="1em"
          onClick={handleClickResend}
          isDisabled={counter}
        >
          Resend OTP ?
        </Button>
        <Text fontWeight="bolder">
          {counter >= 10 ? `00:${counter}` : `00:0${counter}`}
        </Text>
        <Button
          colorScheme="blue"
          type="submit"
          width="100%"
          m="1em 0"
          onClick={handleSubmit}
          isLoading={loading}
        >
          Verify OTP
        </Button>
      </Box>
    </Box>
  );
}
