import React, { useState, useEffect } from "react";
import { Container, Menu, Dropdown, MenuItem } from "semantic-ui-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Link } from "../routes";
import AssetDisplayComponent from "../components/asset-display";

const Networks = [
  {
    key: "Moonbeam",
    text: "Moonbeam",
    value: "moonbeam",
    image: { avatar: true, src: "moonbeam.png" },
  },
  {
    key: "Moonriver",
    text: "Moonriver",
    value: "moonriver",
    image: { avatar: true, src: "moonriver.png" },
  },
  {
    key: "Moonbase Alpha",
    text: "Moonbase Alpha",
    value: "moonbase",
    image: { avatar: true, src: "moonbase.png" },
  },
];

const MintalbeXC20Dashboard = () => {
  const router = useRouter();

  // Set the Intial State of the Network based on Default Param or Route
  let defaultNetwork;
  const { network: networkQueryParam } = router.query;
  if (networkQueryParam) {
    defaultNetwork = router.query.network;
  } else {
    defaultNetwork = Networks[0].value;
  }
  const [network, setNetwork] = useState(defaultNetwork);

  useEffect(() => {
    if (router.query.network && network !== router.query.network) {
      setNetwork(router.query.network);
    }
  }, [router.query.network]);

  const handleChange = (e, { value }) => {
    // Update the URL query param when the dropdown selection changes
    router.push(`/?network=${value}`);

    setNetwork(value);
  };

  return (
    <Container>
      <Head>
        <title>XC-20s Dashboard</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
      </Head>
      <div style={{ paddingTop: "10px" }}></div>
      <Menu>
        <Link route="/">
          <a className="item">XC-20s Dashboard</a>
        </Link>
        <Menu.Item position="right">
          <Dropdown
            placeholder="Select Network"
            selection
            options={Networks}
            onChange={handleChange}
            value={defaultNetwork}
          />
        </Menu.Item>
      </Menu>
      <br />
      <AssetDisplayComponent network={network} />
      <p>
        Don't judge the code :) as it is for demostration purposes only. You can check the source
        code &nbsp;
        <a href="https://github.com/albertov19/localAsset-dashboard">here</a>
      </p>
      <br />
    </Container>
  );
};

export default MintalbeXC20Dashboard;
