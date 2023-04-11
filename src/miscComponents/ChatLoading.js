import React from 'react';
import { Skeleton, Stack } from '@chakra-ui/react';

export default function ChatLoading() {
  return (
    <Stack>
        <Skeleton height="30px" />
        <Skeleton height="30px" />
        <Skeleton height="30px" />
        <Skeleton height="30px" />
        <Skeleton height="30px" />
        <Skeleton height="30px" />
        <Skeleton height="30px" />
    </Stack>
  )
}
