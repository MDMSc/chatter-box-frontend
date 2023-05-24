import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { SERVER_USER_API } from "../Global";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../context/ChatContextProvider";
import { defaultLogin } from "../config/DefaultCredentials";

const initialValues = {
  email: "",
  password: "",
};

const validationSchema = yup.object({
  email: yup.string().email("Invalid Email!!!"),
  password: yup.string(),
});

export default function Login({ handleSwitch }) {
  const [pShow, setPShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();

  const navigate = useNavigate();
  const toast = useToast();

  const { setMainLoading } = ChatState();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      
      if(!values.email && !values.password){
        values.email = defaultLogin.email;
        values.password = defaultLogin.password;
      }

      setLoading(true);
      axios
        .post(`${SERVER_USER_API}/login`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 200 && res.data.isSuccess === true) {
            getUserDetails(res.data.token);
            setLoading(false);
          } else {
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
          toast({
            title: "Error occured!!!",
            description: error.response
              ? error.response.data.message
              : error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
            variant: "top-accent",
          });

          setLoading(false);
          return;
        });
    },
  });

  const getUserDetails = (token) => {
    setLoading(true);
    axios
      .get(`${SERVER_USER_API}/user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data);
          localStorage.setItem("userInfo", JSON.stringify(res.data));
          localStorage.setItem("authToken", token);
          setLoading(false);
        } else {
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
        toast({
          title: "Error occured!!!",
          description: error.response
            ? error.response.data.message
            : error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
          variant: "top-accent",
        });

        setLoading(false);
      });
  };

  useEffect(() => {
    setMainLoading(true);
    if (user !== undefined) {
      if (user.verified) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
          setMainLoading(false);
          navigate("/chats");
        }
      } else {
        setMainLoading(false);
        handleSwitch(user.email, "IV");
      }
    }
  }, [user]);

  const handlePasswordShow = () => setPShow(!pShow);

  return (
    <form className="main_form" onSubmit={formik.handleSubmit}>
      <VStack spacing="3" fontFamily="Work sans">
        <FormControl
          id="email_login"
          isInvalid={formik.touched.email && formik.errors.email}
        >
          <FormLabel fontWeight="bold">Email address</FormLabel>
          <Input
            className="email"
            type="email"
            placeholder="Enter your Email"
            {...formik.getFieldProps("email")}
          />
          {formik.touched.email && formik.errors.email && (
            <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl
          id="password_login"
          isInvalid={formik.touched.password && formik.errors.password}
        >
          <FormLabel fontWeight="bold">Password</FormLabel>
          <InputGroup>
            <Input
              className="password"
              type={pShow ? "text" : "password"}
              placeholder="Enter your Password"
              {...formik.getFieldProps("password")}
            />
            <InputRightElement width="4.5rem">
              <Button height="1.75rem" size="sm" onClick={handlePasswordShow}>
                {pShow ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          {formik.touched.password && formik.errors.password && (
            <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
          )}
          <FormHelperText>
            <Button
              colorScheme="blue"
              type="button"
              variant="link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </Button>
          </FormHelperText>
        </FormControl>

        <FormControl>
          <Button
            colorScheme="blue"
            type="submit"
            width="100%"
            marginTop={6}
            isLoading={loading}
          >
            Let's Chat
          </Button>
        </FormControl>
        <Text fontSize='xs'><sup>*</sup>For default login, kindly click 'Let's Chat' button without entering any values</Text>
      </VStack>
    </form>
  );
}
