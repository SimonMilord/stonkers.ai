import { Divider, Paper, Title } from "@mantine/core";
import React, { useState } from "react";

export default function CalculatorResultsCard() {
  return (
    <Paper withBorder radius="md" p="lg">
      <Title order={3} mb="8">
        5-Year Projection
      </Title>
      <Divider mb="lg" />

    </Paper>
  );
}
