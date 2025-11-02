import { Card, Text } from '@mantine/core';
import React from 'react';

export default function DataCard({data, label, ...props}: {data: number, label: string} & any) {
  return (
    <Card shadow="sm" padding="lg" radius="md" bg="#2D3748" withBorder>
      <Text size="xl" fw={700} c="white">
        {data}
      </Text>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Card>
  );
};
