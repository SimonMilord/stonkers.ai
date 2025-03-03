import React from 'react';
import { Text, Image, Flex } from '@mantine/core';

export default function DetailsPageContent({stockData}: {stockData: any}) {
  const {
    quoteData,
    companyProfileData,
    earningsCalendarData,
    earningsSurpriseData,
    companyNewsData,
    recommendationTrendsData,
  } = stockData;

  console.log(stockData);
  const fluctuationColor = quoteData.dp >= 0 ? "green" : "red";
  return (
    <div>
      <Flex align="center" mb='md'>
        <Image mr={12} h={50} radius="md" src={companyProfileData.logo}/>
        <Text size='lg'>{companyProfileData.name} - {companyProfileData.ticker}</Text>
      </Flex>
      <Flex justify="center" gap="lg">
        <Text>{quoteData.c}$ {companyProfileData.currency}</Text>
        <Text c={fluctuationColor}>${quoteData.d} | {(quoteData?.dp?.toFixed(2))}%</Text>
      </Flex>
    </div>
  );
}