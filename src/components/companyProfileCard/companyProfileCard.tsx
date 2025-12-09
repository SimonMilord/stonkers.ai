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
} from "@mantine/core";
import "./companyProfileCard.css";
import "../cardStyles.css";
import GenerativeAIBadge from "@components/generativeAIBadge/generativeAIBadge";

export default function CompanyProfileCard({
  profileData,
  companyDescription,
  isGeneratingDescription,
}: {
  profileData: any;
  companyDescription: string | null;
  isGeneratingDescription: boolean;
}) {
  const notAvailable: String = "Not Available";
  const formattedMarketCap = formatDollarAmount(
    profileData?.marketCapitalization * 1000000,
  );
  const formattedSharesOutstanding = formatDollarAmount(
    profileData?.shareOutstanding * 1000000,
  );
  const companyWebsiteLink = profileData?.weburl ? (
    <a
      href={profileData?.weburl}
      target="_blank"
      className="companyUrl"
      rel="noopener noreferrer"
    >
      {profileData?.weburl}
    </a>
  ) : (
    notAvailable
  );

  const profileDataTableElements = [
    { key: "Company Name:", value: profileData?.name || notAvailable },
    {
      key: "Market Capitalization:",
      value: formattedMarketCap || notAvailable,
    },
    { key: "Industry:", value: profileData?.finnhubIndustry || notAvailable },
    { key: "Country:", value: profileData?.country || notAvailable },
    {
      key: "Shares outstanding:",
      value: formattedSharesOutstanding || notAvailable,
    },
    { key: "Exchange:", value: profileData?.exchange || notAvailable },
    { key: "Website:", value: companyWebsiteLink || notAvailable },
  ];

  const rows = profileDataTableElements.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>{item.key}</Table.Td>
      <Table.Td className="tableRow__value">{item.value}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Paper withBorder radius="md" p="lg">
        <Title order={3} mb="8">
          Company Profile
        </Title>
        <Divider mb="lg" />
        <Table withRowBorders={false}>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        <Divider my="lg" />
        <Flex justify="space-between" align="center" mb="16">
          <Title order={4}>Overview</Title>
          <GenerativeAIBadge />
        </Flex>
        {isGeneratingDescription ? (
          <Flex justify="center" align="center" style={{ minHeight: 100 }}>
            <Loader />
          </Flex>
        ) : companyDescription ? (
          <Text className="formatted-description">{companyDescription}</Text>
        ) : (
          <Text c="dimmed">No description available.</Text>
        )}
      </Paper>
    </div>
  );
}
