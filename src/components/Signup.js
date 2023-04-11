import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { SERVER_USER_API } from "../Global";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  pic: undefined,
};

const validationSchema = yup.object({
  name: yup.string().required("Required!!!"),
  email: yup.string().email("Invalid Email!!!").required("Required!!!"),
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

export default function Signup({ handleSwitch }) {
  const [pShow, setPShow] = useState(false);
  const [cShow, setCShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      setLoading(true);
      axios
        .post(`${SERVER_USER_API}/signup`, values, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          if (res.status === 200 && res.data.isSuccess === true) {
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
            handleSwitch(values.email, "IV");
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

  const handlePasswordShow = () => setPShow(!pShow);
  const handleCPasswordShow = () => setCShow(!cShow);

  return (
    <form className="main_form" onSubmit={formik.handleSubmit}>
      <VStack spacing="3" fontFamily="Work sans">
        <FormControl
          id="name"
          isRequired
          isInvalid={formik.touched.name && formik.errors.name}
        >
          <FormLabel fontWeight="bold">Name</FormLabel>
          <Input
            className="name"
            placeholder="Enter your Name"
            {...formik.getFieldProps("name")}
          />
          {formik.touched.name && formik.errors.name && (
            <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl
          id="email_signup"
          isRequired
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
          id="password_signup"
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
              <Button height="1.75rem" size="sm" onClick={handlePasswordShow}>
                {pShow ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          {formik.touched.password && formik.errors.password && (
            <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl
          id="confirmPassword"
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
              <Button height="1.75rem" size="sm" onClick={handleCPasswordShow}>
                {cShow ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <FormErrorMessage>{formik.errors.confirmPassword}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl
          id="pic"
          isInvalid={formik.touched.pic && formik.errors.pic}
        >
          <FormLabel fontWeight="bold">Profile Picture</FormLabel>
          <Input
            className="pic"
            type="file"
            p={1.5}
            accept="image/*"
            values={formik.values.pic}
            onBlur={formik.handleBlur}
            onChange={(e) => {
              const pic = e.target.files[0];
              setLoading(true);
              if (pic === undefined) {
                toast({
                  title: "Please select an image!!!",
                  status: "warning",
                  duration: 5000,
                  isClosable: true,
                  position: "bottom",
                  variant: "top-accent",
                });
                return;
              }
              if (
                pic.type === "image/jpeg" ||
                pic.type === "image/jpg" ||
                pic.type === "image/png"
              ) {
                const data = new FormData();
                data.append("file", pic);
                data.append("upload_preset", "chatter-box");
                data.append("cloud_name", "delx9uezx");
                fetch(
                  "https://api.cloudinary.com/v1_1/delx9uezx/image/upload",
                  {
                    method: "POST",
                    body: data,
                  }
                )
                  .then((res) => res.json())
                  .then((data) => {
                    formik.values.pic = data.url.toString();
                    setLoading(false);
                  })
                  .catch((err) => {
                    toast({
                      title: `${err.message}`,
                      status: "error",
                      duration: 5000,
                      isClosable: true,
                      position: "bottom",
                      variant: "top-accent",
                    });
                    setLoading(false);
                  });
              } else {
                toast({
                  title: "Please select an image!!!",
                  status: "warning",
                  duration: 5000,
                  isClosable: true,
                  position: "bottom",
                  variant: "top-accent",
                });
                return;
              }
            }}
          />
          <FormHelperText>
            Upload image file only (.jpg, .jpeg, .png)
          </FormHelperText>
          {formik.touched.pic && formik.errors.pic && (
            <FormErrorMessage>{formik.errors.pic}</FormErrorMessage>
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
            Sign Up
          </Button>
        </FormControl>
      </VStack>
    </form>
  );
}
