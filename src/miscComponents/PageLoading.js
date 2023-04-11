import { Box, Spinner } from '@chakra-ui/react';
import React from 'react';

export default function PageLoading() {
  return (
    <Box 
        display="flex"
        justifyContent="center"
        alignItems="center"
        w="100%"
        h="100%"
        backgroundColor="white.100"
    >
        <Spinner thickness='10px' color="white" size="xxl" />
    </Box>
  )
}
