import React from "react";
import { formatDollarAmount } from "@utils/functions";
import {
  Paper,
  Title,
  Text,
  Divider,
  Table,
  Flex,
  Loader,
  Box,
} from "@mantine/core";
import "./companyProfileCard.css";
import "../cardStyles.css";
import GenerativeAIBadge from "@components/generativeAIBadge/generativeAIBadge";

interface ProfileDataItem {
  key: string;
  value: React.ReactNode;
}

interface CompanyProfileCardProps {
  profileData: any;
  companyDescription: string | null;
  isGeneratingDescription: boolean;
}

const NOT_AVAILABLE = "Not Available";
const MARKET_CAP_MULTIPLIER = 1000000;
const SHARES_MULTIPLIER = 1000000;
const LOADER_MIN_HEIGHT = 100;

// Utility functions
const formatShareCount = (shares: number): string => {
  if (!shares) return NOT_AVAILABLE;
  return formatDollarAmount(shares * SHARES_MULTIPLIER);
};

const formatMarketCap = (marketCap: number): string => {
  if (!marketCap) return NOT_AVAILABLE;
  return formatDollarAmount(marketCap * MARKET_CAP_MULTIPLIER);
};

const createWebsiteLink = (url: string): React.ReactNode => {
  if (!url) return NOT_AVAILABLE;

  return (
    <a
      href={url}
      target="_blank"
      className="companyUrl"
      rel="noopener noreferrer"
      aria-label={`Visit ${url} (opens in new tab)`}
    >
      {url}
    </a>
  );
};

const useProfileData = (profileData: any): ProfileDataItem[] => {
  return React.useMemo(
    () => [
      {
        key: "Company Name:",
        value: profileData?.name || NOT_AVAILABLE,
      },
      {
        key: "Market Capitalization:",
        value: formatMarketCap(profileData?.marketCapitalization),
      },
      {
        key: "Industry:",
        value: profileData?.finnhubIndustry || NOT_AVAILABLE,
      },
      {
        key: "Country:",
        value: profileData?.country || NOT_AVAILABLE,
      },
      {
        key: "Shares Outstanding:",
        value: formatShareCount(profileData?.shareOutstanding),
      },
      {
        key: "Exchange:",
        value: profileData?.exchange || NOT_AVAILABLE,
      },
      {
        key: "Website:",
        value: createWebsiteLink(profileData?.weburl),
      },
    ],
    [profileData]
  );
};

const ProfileTable: React.FC<{ data: ProfileDataItem[] }> = React.memo(
  ({ data }) => (
    <Table withRowBorders={false}>
      <Table.Tbody>
        {data.map((item) => (
          <Table.Tr key={item.key}>
            <Table.Td>{item.key}</Table.Td>
            <Table.Td className="tableRow__value">{item.value}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
);

const CompanyOverview: React.FC<{
  companyDescription: string | null;
  isGeneratingDescription: boolean;
}> = React.memo(({ companyDescription, isGeneratingDescription }) => (
  <>
    <Flex justify="space-between" align="center" mb="16">
      <Title order={4}>Overview</Title>
      <GenerativeAIBadge />
    </Flex>

    {isGeneratingDescription ? (
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: LOADER_MIN_HEIGHT }}
        aria-live="polite"
        aria-label="Generating company description"
      >
        <Loader />
      </Flex>
    ) : companyDescription ? (
      <Text
        className="formatted-description"
        component="div"
        role="region"
        aria-label="Company description"
      >
        {companyDescription}
      </Text>
    ) : (
      <Text
        c="dimmed"
        role="status"
        aria-label="No company description available"
      >
        No description available.
      </Text>
    )}
  </>
));

export default React.memo(function CompanyProfileCard({
  profileData,
  companyDescription,
  isGeneratingDescription,
}: CompanyProfileCardProps) {
  const profileTableData = useProfileData(profileData);

  return (
    <Box component="section" aria-label="Company profile information">
      <Paper withBorder radius="md" p="lg">
        <Title order={3} mb="8">
          Company Profile
        </Title>
        <Divider mb="lg" />

        <ProfileTable data={profileTableData} />

        <Divider my="lg" />

        <CompanyOverview
          companyDescription={companyDescription}
          isGeneratingDescription={isGeneratingDescription}
        />
      </Paper>
    </Box>
  );
});
