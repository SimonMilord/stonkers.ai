import React, {useState} from 'react';
import { Center, Title, Stack } from '@mantine/core';
import './homePage.css';
import SearchBox from '@components/searchBox/searchBox';

export default function HomePage() {
  const query = useState('');

  return (
    <Center className="homePage">
      <Stack>
        <Title>Stonkers.ai</Title>
        <SearchBox variant="standalone"/>
      </Stack>
    </Center>
  );
}