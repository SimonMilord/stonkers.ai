import React, { useEffect, useState } from "react";
import { formatDollarAmount } from "@utils/functions";
import { Paper, Title, Text, Divider, Table, Flex } from "@mantine/core";
import "./companyProfileCard.css";
import "../cardStyles.css";
import GenerativeAIBadge from "@components/generativeAIBadge/generativeAIBadge";

export default function CompanyProfileCard({
  profileData,
}: {
  profileData: any;
}) {
  const [companyDescription, setCompanyDescription] = useState<string | null>(
    null
  );

  const notAvailable: String = "Not Available";
  const formattedMarketCap = formatDollarAmount(
    profileData?.marketCapitalization * 1000000
  );
  const formattedSharesOutstanding = formatDollarAmount(
    profileData?.shareOutstanding * 1000000
  );
  const companyWebsiteLink = profileData?.weburl ? (
    <a href={profileData?.weburl} target="_blank" className="companyUrl">
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

  const generateCompanyDescription = async (companyName: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/ai/generate-company-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ companyName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate company description");
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Error generating company description:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCompanyDescription = async () => {
      if (profileData?.name) {
        const description = await generateCompanyDescription(profileData.name);
        setCompanyDescription(description);
      }
    };

    fetchCompanyDescription();
  }, [profileData?.name]);

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
        {companyDescription ? (
          <Text className="formatted-description">{companyDescription}</Text>
        ) : (
          <Text>Loading...</Text>
        )}
      </Paper>
    </div>
  );
}
