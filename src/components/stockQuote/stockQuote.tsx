import { Text, Image, Flex, Box } from "@mantine/core";
import { QuoteData, CompanyProfileData } from "../../types/financialApi";
import React from "react";

export default function StockQuote({
  quoteData,
  companyProfileData,
}: {
  quoteData: QuoteData;
  companyProfileData: CompanyProfileData;
}) {
  const fluctuationColor = quoteData?.dp >= 0 ? "green" : "red";
  const processedTicker = companyProfileData?.ticker.includes(".")
    ? companyProfileData?.ticker.split(".")[0]
    : companyProfileData?.ticker;
  return (
    <Box m="lg">
      <Flex align="center" mb="md">
        <Image mr={12} h={50} radius="md" src={companyProfileData?.logo} />
        <Text size="lg">
          {companyProfileData?.name} - {processedTicker}
        </Text>
      </Flex>
      <Flex justify="center" gap="lg">
        <Text>{quoteData?.c}$ USD</Text>
        <Text c={fluctuationColor}>
          ${quoteData?.d} | {quoteData?.dp?.toFixed(2)}%
        </Text>
      </Flex>
    </Box>
  );
}
