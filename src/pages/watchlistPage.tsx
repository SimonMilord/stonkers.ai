import React, { useState } from "react";
import Layout from "./layout";
import { Grid } from "@mantine/core";

export default function WatchlistPage() {
  const [opened, setOpened] = useState(false);

  return (
    <Layout opened={opened} toggle={() => setOpened(!opened)}>
      <Grid className="watchlistPage">
        WATCHLIST // TODO
        Symbol | Name | Price | Change % | remove button
      </Grid>
    </Layout>
  );
}
