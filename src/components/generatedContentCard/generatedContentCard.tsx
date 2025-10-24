import React from "react";
import { Paper, Title, Divider, Text, Flex } from "@mantine/core";
import "../cardStyles.css";
import GenerativeAIBadge from "@components/generativeAIBadge/generativeAIBadge";

export default function GeneratedContentCard({
  title,
  generatedContent,
}: {
  title: string;
  generatedContent: string;
}) {
  return (
    <div>
      <Paper withBorder radius="md" p="lg">
        <Flex justify="space-between" mb="8">
          <Title order={3}>
            {title}
          </Title>
          <GenerativeAIBadge />
        </Flex>
        <Divider mb="lg" />
        <Text>{generatedContent}</Text>
      </Paper>
    </div>
  );
}
