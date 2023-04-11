import { Box, Container, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import ForgotPasswordComp from "../components/ForgotPasswordComp";
import NewPassword from "../components/NewPassword";
import OtpVerification from "../components/OtpVerification";

export default function ForgotPasswordPage() {
  const [switchPage, setSwitchPage] = useState(false);
  const [switchNewPass, setSwitchNewPage] = useState(false);
  const [email, setEmail] = useState("");
  const [otpType, setOtpType] = useState("");

  const handleSwitch = (email, otpType) => {
    setEmail(email);
    setOtpType(otpType);
    setSwitchPage(true);
  };
  
  const handleSwitchNewPass = () => setSwitchNewPage(true);

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        bg="white"
        w="100%"
        p={3}
        m="3em 0 1em 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans">
          Chatter Box
        </Text>
      </Box>

      {switchPage ? (
        switchNewPass ? (
          <NewPassword email={email} />
        ) : (
          <OtpVerification
            handleSwitch={handleSwitchNewPass}
            email={email}
            otpType={otpType}
          />
        )
      ) : (
        <ForgotPasswordComp handleSwitch={handleSwitch} />
      )}
    </Container>
  );
}
