import React from 'react';
import { Center, Title, Stack } from '@mantine/core';
import './homePage.css';
import SearchBox from '@components/searchBox/searchBox';

export default function HomePage() {

  return (
    <Center className="homePage">
      <Stack>
        <Center>
          <Title>Stonkers.ai</Title>
        </Center>
        <SearchBox variant="standalone"/>
      </Stack>
    </Center>
  );
}