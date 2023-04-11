import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React, { useState } from "react";
import * as yup from "yup";
import { SERVER_USER_API } from "../Global";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const initialValues = {
  password: "",
  confirmPassword: "",
};

const validationSchema = yup.object({
  password: yup
    .string()
    .min(8, "Password must have atleast 8 characters")
    .matches(/[0-9]/, "Password requires a number")
    .matches(/[a-z]/, "Password requires a lowercase letter")
    .matches(/[A-Z]/, "Password requires an uppercase letter")
    .matches(/[^\w]/, "Password requires a symbol")
    .required("Required!!!"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Password does not match")
    .required("Required!!!"),
});

export default function NewPassword({ email }) {
  const [pShow, setPShow] = useState(false);
  const [cShow, setCShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      setLoading(true);
      axios
        .post(
          `${SERVER_USER_API}/forgot-password`,
          {
            email: email,
            password: values.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          if (res.status === 200 && res.data.isSuccess === true) {
            toast({
              title: "Success!!!",
              description: `${res.data.message}. You will be redirected to Login page.`,
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "bottom",
              variant: "top-accent",
            });

            setTimeout(() => {
              setLoading(false);
              navigate("/");
            }, 3000);
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
    },
  });

  const handlePasswordShow = () => setPShow(!pShow);
  const handleCPasswordShow = () => setCShow(!cShow);

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
      fontFamily="Work sans"
    >
      <Text fontSize="2xl" marginTop="0.5em">
        Create New Password
      </Text>
      <Box
        bg="white"
        w="90%"
        p={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <form className="main_form" onSubmit={formik.handleSubmit}>
          <VStack spacing="3" fontFamily="Work sans">
            <FormControl
              id="password_new"
              isRequired
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
                  <Button
                    height="1.75rem"
                    size="sm"
                    onClick={handlePasswordShow}
                  >
                    {pShow ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {formik.touched.password && formik.errors.password && (
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl
              id="confirmPassword_new"
              isRequired
              isInvalid={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
            >
              <FormLabel fontWeight="bold">Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  className="confirmPassword"
                  type={cShow ? "text" : "password"}
                  placeholder="Re-enter your Password"
                  {...formik.getFieldProps("confirmPassword")}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    height="1.75rem"
                    size="sm"
                    onClick={handleCPasswordShow}
                  >
                    {cShow ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <FormErrorMessage>
                    {formik.errors.confirmPassword}
                  </FormErrorMessage>
                )}
            </FormControl>

            <FormControl>
              <Button
                colorScheme="blue"
                type="submit"
                width="100%"
                marginTop={6}
                isLoading={loading}
              >
                Create New Password
              </Button>
            </FormControl>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
