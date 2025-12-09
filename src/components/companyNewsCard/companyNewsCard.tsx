import React from "react";
import {
  Paper,
  Title,
  Divider,
  Box,
  Stack,
  Text,
  Group,
  Anchor,
} from "@mantine/core";
import { formatDate } from "../../utils/functions";

interface News {
  category?: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related?: string;
  source: string;
  summary?: string;
  url: string;
}

export default function CompanyNewsCard({
  title,
  newsData,
}: {
  title: string;
  newsData: News[];
}) {

  return (
    <Paper withBorder radius="md" p="lg">
      <Title order={3} mb="8">
        {title}
      </Title>
      <Divider mb="lg" />
      <Stack gap="md">
        {newsData &&
          newsData.slice(0, 10).map((newsItem) => (
            <Box key={newsItem.id}>
              <Group>
                <Box>
                  <Group gap="xs" mb="0.5rem" align="baseline">
                    <Text size="sm" fw={700} c="dimmed">
                      {newsItem.source}
                    </Text>
                    <Text size="sm" c="dimmed" opacity={0.6}>
                      | {formatDate(newsItem.datetime)}
                    </Text>
                  </Group>
                  <Anchor
                    href={newsItem.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    underline="hover"
                    c="inherit"
                  >
                    <Text size="md" fw={600} lineClamp={3}>
                      {newsItem.headline}
                    </Text>
                  </Anchor>
                </Box>
              </Group>
            </Box>
          ))}
      </Stack>
    </Paper>
  );
}
