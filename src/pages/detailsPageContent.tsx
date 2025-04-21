import React from 'react';
import StockQuote from '@components/stockQuote/stockQuote';
import { Flex, Grid } from '@mantine/core';
import CompanyProfileCard from '@components/companyProfileCard/companyProfileCard';
import CompanyMetricsCard from '@components/companyMetricsCard/companyMetricsCard';
import GeneratedContentCard from '@components/generatedContentCard/generatedContentCard';

export default function DetailsPageContent({stockData}: {stockData: any}) {
  const {
    quoteData,
    companyProfileData,
    earningsCalendarData,
    earningsSurpriseData,
    companyNewsData,
    recommendationTrendsData,
    basicFinancialsData,
    reportedFinancialsData,
  } = stockData;

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
        <Grid.Col span={6}><CompanyProfileCard profileData={companyProfileData}/></Grid.Col>
        <Grid.Col span={6}><CompanyMetricsCard quoteData={quoteData} metricsData={basicFinancialsData} profileData={companyProfileData} reportedFinancialData={reportedFinancialsData}/></Grid.Col>
        <Grid.Col span={6}><GeneratedContentCard title="Competitive Advantages" generatedContent='TODO: ADD GENERATED CONTENT HERE' /></Grid.Col>
        <Grid.Col span={6}><GeneratedContentCard title="Investment Risks" generatedContent='TODO: ADD GENERATED CONTENT HERE'/></Grid.Col>
      </Grid>
    </>
  );
}