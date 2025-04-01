import React from 'react';
import StockQuote from '@components/stockQuote/stockQuote';
import { Flex, Grid } from '@mantine/core';
import DetailsCard from '@components/detailsCard/detailsCard';

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
    <>
      <Flex justify="center" mb='lg'>
        {quoteData && companyProfileData ? (
          <StockQuote quoteData={quoteData} companyProfileData={companyProfileData} />
        ) : (
          <p>Loading...</p>
        )}
      </Flex>

      <Grid>
        <Grid.Col span={6}><DetailsCard /></Grid.Col>
        <Grid.Col span={6}><DetailsCard /></Grid.Col>
      </Grid>
    </>
  );
}