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
    if (!content || content.trim() === "") {
      return <Text c="dimmed">No content available</Text>;
    }

    // Split content into lines and process each line
    const generatedContentLines = content
      .split("\n")
      .filter((line) => line.trim().length > 0);

    return (
      <div className="formatted-content">
        {generatedContentLines.map((line, index) => {
          const trimmedLine = line.trim();

          // Handle bullet points (lines starting with *)
          if (trimmedLine.startsWith("* ")) {
            const bulletContent = trimmedLine.substring(2).trim();
            return (
              <Text key={index} mb="sm" className="bullet-item">
                {formatBoldText(bulletContent)}
              </Text>
            );
          }

          // Handle regular paragraphs
          return (
            <Text key={index} mb="md">
              {formatBoldText(trimmedLine)}
            </Text>
          );
        })}
      </div>
    );
  };

  const formatBoldText = (text: string) => {
    // Handle **bold** formatting
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        // Remove ** and make bold
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div>
      <Paper withBorder radius="md" p="lg">
        <Flex justify="space-between" align="center" mb="8">
          <Title order={3}>{title}</Title>
          <GenerativeAIBadge />
        </Flex>
        <Divider mb="lg" />
        {parseMarkdownContent(generatedContent)}
      </Paper>
    </div>
  );
}
