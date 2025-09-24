import { Center, Divider, Group, Paper, Title, Text, Stack } from "@mantine/core";
import React, { useState } from "react";
import { metric } from "src/pages/calculatorPage";

export default function CalculatorInfoSection({label, metrics}: {label: string, metrics?: metric[]}) {

  return (
    <Paper withBorder radius="md" p="lg">
      <Center>
        <Title order={5} mb="8">
          Current {label}
        </Title>
      </Center>
      <Divider mb="lg" />
      <Group justify="space-between">
        {metrics?.map((metric, index) => (
          <Stack key={index}>
            <Text>{metric.label}</Text>
            <Text>{metric.value}</Text>
          </Stack>
        ))}
      </Group>
    </Paper>
  );
}
