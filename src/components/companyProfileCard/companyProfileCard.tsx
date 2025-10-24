import React from "react";
import { formatDollarAmount } from "@utils/functions";
import { Paper, Title, Text, Divider, Table } from "@mantine/core";
import "./companyProfileCard.css";
import "../cardStyles.css";

export default function CompanyProfileCard({
  profileData,
}: {
  profileData: any;
}) {
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
    { key: "Market Capitalization:", value: formattedMarketCap || notAvailable },
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
        {/* TODO: Change description to one that is AI generated */}
        <Text>
          Amazon is a global technology company primarily known for its
          e-commerce platform, where it sells a wide range of products directly
          and through third-party sellers. It operates through several key
          segments: North America and International (its retail businesses),
          Amazon Web Services (AWS) (its cloud computing division), Advertising
          Services, and Subscription Services like Prime. Amazon makes money by
          selling goods online, taking commissions from third-party sellers,
          charging for advertising space on its platform, offering subscription
          plans, and providing scalable cloud computing solutions through
          AWS—which is one of its most profitable segments.
        </Text>
      </Paper>
    </div>
  );
}
