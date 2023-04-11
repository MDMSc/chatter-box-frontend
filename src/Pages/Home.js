import React, { useState } from "react";
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "../components/Login";
import Signup from "../components/Signup";
import OtpUserVerification from "../components/OtpUserVerification";

export default function Home() {
  const [email, setEmail] = useState("");
  const [otpType, setOtpType] = useState("");
  const [switchPageToVerify, setSwitchPageToVerify] = useState(false);

  const handleSwitch = (email, otpType) => {
    setEmail(email);
    setOtpType(otpType);
    setSwitchPageToVerify(true);
  };

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
      {switchPageToVerify ? (
        <OtpUserVerification email={email} otpType={otpType} />
      ) : (
        <Box bg="white" w="100%" p={3} borderRadius="lg" borderWidth="1px">
          <Tabs variant="soft-rounded">
            <TabList mb="1em">
              <Tab width="50%">Login</Tab>
              <Tab width="50%">Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login handleSwitch={handleSwitch} />
              </TabPanel>
              <TabPanel>
                <Signup handleSwitch={handleSwitch} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Container>
  );
}
