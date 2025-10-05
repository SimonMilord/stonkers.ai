import React, { useState } from "react";
import Layout from "./layout";
import { Grid } from "@mantine/core";

export default function Port() {
  const [opened, setOpened] = useState(false);

  return (
    <Layout opened={opened} toggle={() => setOpened(!opened)}>
      <Grid className="portfolioPage">
        PORTFOLIO PAGE // TODO
        Symbol | Name | Shares | Avg. Cost | Price | Change % | Market Value | P/L $ | P/L %
      </Grid>
    </Layout>
  );
}
