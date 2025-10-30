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
  const parseMarkdownContent = (content: string) => {
    // Split content by bullet points (*) and filter out empty items
    const items = content.split('* ').filter(item => item.trim().length > 0);

    if (items.length <= 1) {
      // If no bullet points, just handle bold formatting
      return (
        <Text className="formatted-content">
          {formatBoldText(content)}
        </Text>
      );
    }

    // Render each item as a separate paragraph without bullets
    return (
      <div className="formatted-content">
        {items.map((item, index) => (
          <Text key={index} mb="md">
            {formatBoldText(item.trim())}
          </Text>
        ))}
      </div>
    );
  };

  const formatBoldText = (text: string) => {
    // Split text by **bold** patterns
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** and make bold
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
  };  return (
    <div>
      <Paper withBorder radius="md" p="lg">
        <Flex justify="space-between" align="center" mb="8">
          <Title order={3}>
            {title}
          </Title>
          <GenerativeAIBadge />
        </Flex>
        <Divider mb="lg" />
        {parseMarkdownContent(generatedContent)}
      </Paper>
    </div>
  );
}
