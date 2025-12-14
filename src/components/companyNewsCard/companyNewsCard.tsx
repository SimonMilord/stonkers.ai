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
import { formatDate } from "@utils/functions";

interface NewsItem {
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

interface CompanyNewsCardProps {
  title: string;
  newsData: NewsItem[];
}

const MAX_NEWS_ITEMS = 10;
const DATETIME_SEPARATOR = " | ";

const NewsItemComponent: React.FC<{ newsItem: NewsItem }> = React.memo(({ newsItem }) => (
  <Box key={newsItem.id}>
    <Group>
      <Box>
        <Group gap="xs" mb="0.5rem" align="baseline">
          <Text 
            size="sm" 
            fw={700} 
            c="dimmed"
            component="span"
            aria-label={`Source: ${newsItem.source}`}
          >
            {newsItem.source}
          </Text>
          <Text 
            size="sm" 
            c="dimmed" 
            opacity={0.6}
            component="span"
            aria-label={`Published: ${formatDate(newsItem.datetime)}`}
          >
            {DATETIME_SEPARATOR}{formatDate(newsItem.datetime)}
          </Text>
        </Group>
        <Anchor
          href={newsItem.url}
          rel="noopener noreferrer"
          target="_blank"
          underline="hover"
          c="inherit"
          aria-label={`Read full article: ${newsItem.headline}`}
        >
          <Text size="md" fw={600} lineClamp={3}>
            {newsItem.headline}
          </Text>
        </Anchor>
      </Box>
    </Group>
  </Box>
));

const CompanyNewsCard: React.FC<CompanyNewsCardProps> = React.memo(({ title, newsData }) => {
  const displayedNews = React.useMemo(
    () => newsData?.slice(0, MAX_NEWS_ITEMS) || [],
    [newsData]
  );

  if (!newsData || newsData.length === 0) {
    return (
      <Paper withBorder radius="md" p="lg">
        <Title order={3} mb="8">
          {title}
        </Title>
        <Divider mb="lg" />
        <Text c="dimmed" ta="center" py="xl">
          No news available at this time.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" p="lg">
      <Title order={3} mb="8">
        {title}
      </Title>
      <Divider mb="lg" />
      <Stack 
        gap="md" 
        component="section"
        aria-label={`${title} - ${displayedNews.length} news items`}
      >
        {displayedNews.map((newsItem) => (
          <NewsItemComponent key={newsItem.id} newsItem={newsItem} />
        ))}
      </Stack>
    </Paper>
  );
});

export default CompanyNewsCard;
