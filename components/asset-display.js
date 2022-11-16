import React, { useState, useEffect } from "react";
import { Form, Container, Message, Table, Loader, Dropdown, Grid } from "semantic-ui-react";
import * as ethers from "ethers";
import { subProvider } from "../web3/api";
import { bnToHex } from "@polkadot/util";
import _ from "underscore";

const assetInfoComponent = ({ network }) => {
  const [localAssets, setLocalAssets] = useState(Array());
  const [externalAssets, setExternalAssets] = useState(Array());
  const [localAssetsDropdown, setLocalAssetsDropdown] = useState(Array());
  const [externalAssetsDropdown, setExternalAssetsDropdown] = useState(Array());
  const [focusLocalAsset, setFocusLocalAsset] = useState("");
  const [focusExternalAsset, setFocusExternalAsset] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalAssets(Array());
    setExternalAssets(Array());
    setLocalAssetsDropdown(Array());
    setExternalAssetsDropdown(Array());
    setFocusLocalAsset("");
    setFocusExternalAsset("");
    loadAllData("assets");
    loadAllData("localAssets");
  }, [network]);

  const loadAllData = async (pallet) => {
    setLoading(true);
    setErrorMessage("");

    try {
      let assetsData = Array();
      let assetsDataDropdown = Array();

      // Load Provider
      const api = await subProvider(network);

      const data = await api.query[pallet].asset.entries();
      data.forEach(async ([key, exposure]) => {
        assetsData.push({
          assetID: BigInt(key.args.map((k) => k.toHuman())[0].replaceAll(",", "")),
          assetInfo: exposure,
        });
      });

      for (let i = 0; i < assetsData.length; i++) {
        let metadata;
        let multilocation;
        if (pallet === "assets") {
          // Load asycnhronously all data
          const dataPromise = Promise.all([
            api.query.assetManager.assetIdType(assetsData[i].assetID.toString()),
            api.query[pallet].metadata(assetsData[i].assetID.toString()),
          ]);

          [multilocation, metadata] = await dataPromise;
          multilocation = multilocation.toHuman();

          const key = Object.keys(multilocation.Xcm.interior)[0];
          assetsData[i].paraID = multilocation.Xcm.interior[key].Parachain
            ? Number(multilocation.Xcm.interior[key].Parachain.replaceAll(",", ""))
            : multilocation.Xcm.interior[key][0].Parachain
            ? Number(multilocation.Xcm.interior[key][0].Parachain.replaceAll(",", ""))
            : "Relay";
        } else {
          // Load asycnhronously all data
          const dataPromise = Promise.all([
            api.query[pallet].metadata(assetsData[i].assetID.toString()),
          ]);

          [metadata] = await dataPromise;
        }

        assetsData[i].address = ethers.utils.getAddress(
          "fffffffe" + bnToHex(assetsData[i].assetID).slice(2)
        );
        assetsData[i].name = metadata.name.toHuman().toString();
        assetsData[i].decimals = metadata.decimals.toHuman().toString();
        assetsData[i].symbol = metadata.symbol.toHuman().toString();
        assetsData[i].metadata = metadata;
        assetsDataDropdown.push({
          key: assetsData[i].assetID.toString(),
          text: assetsData[i].name + " - " + assetsData[i].address,
          value: assetsData[i].assetID.toString(),
        });
      }

      let sortedAssets = _.sortBy(assetsData, "paraID");
      sortedAssets.unshift(sortedAssets.pop());

      switch (pallet) {
        case "localAssets":
          setLocalAssets(sortedAssets);
          setLocalAssetsDropdown(assetsDataDropdown);
          break;
        case "assets":
          setExternalAssets(sortedAssets);
          setExternalAssetsDropdown(assetsDataDropdown);
          break;
        default:
          throw new Error("Option not allowed!");
      }

      setLoading(false);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const renderAssets = (assetType) => {
    const { Row, Cell } = Table;
    let assetData;
    switch (assetType) {
      case "local":
        assetData = localAssets;
        break;
      case "external":
        assetData = externalAssets;
        break;
      default:
        console.error("Option not allowed!");
    }
    if (assetData.length !== 0 && assetData[0]) {
      return assetData.map((asset, index) => {
        return (
          <Row key={index}>
            <Cell>{index}</Cell>
            <Cell>{asset.name}</Cell>
            <Cell>{asset.symbol}</Cell>
            <Cell>{asset.address}</Cell>
            <Cell>{asset.decimals}</Cell>
            <Cell>{asset.assetID.toString()}</Cell>
            {assetType === "external" && <Cell>{asset.paraID}</Cell>}
          </Row>
        );
      });
    }
  };

  const handleLocalChange = (e, { value }) => {
    setFocusLocalAsset(value);
  };

  const handleExternalChange = (e, { value }) => {
    setFocusExternalAsset(value);
  };

  const renderAsset = (assetType) => {
    const { Row, Cell } = Table;
    let focussedAsset;
    let assetData;
    let assetToSearch;
    switch (assetType) {
      case "local":
        assetData = localAssets;
        assetToSearch = focusLocalAsset;
        break;
      case "external":
        assetData = externalAssets;
        assetToSearch = focusExternalAsset;
        break;
      default:
        console.error("Option not allowed!");
    }
    if (assetToSearch.length !== 0) {
      assetData.forEach((asset) => {
        if (asset.assetID.toString() === assetToSearch) {
          focussedAsset = asset;
        }
      });
      return (
        <Body>
          <Row>
            <Cell>Owner</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().owner}</Cell>
          </Row>
          <Row>
            <Cell>Issuer</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().issuer}</Cell>
          </Row>
          <Row>
            <Cell>Admin</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().admin}</Cell>
          </Row>
          <Row>
            <Cell>Freezer</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().freezer}</Cell>
          </Row>
          <Row>
            <Cell>Supply</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().supply}</Cell>
          </Row>
          <Row>
            <Cell>Deposit</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().deposit}</Cell>
          </Row>
          <Row>
            <Cell>Min. Balance</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().minBalance}</Cell>
          </Row>
          <Row>
            <Cell>Accounts</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().accounts}</Cell>
          </Row>
          <Row>
            <Cell>Sufficients</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().sufficients}</Cell>
          </Row>
          <Row>
            <Cell>Approvals</Cell>
            <Cell>{focussedAsset.assetInfo.toHuman().approvals}</Cell>
          </Row>
        </Body>
      );
    }
  };

  const { Header, Row, HeaderCell, Body, Column } = Table;

  return (
    <div>
      <Form error={!!{ errorMessage }.errorMessage}>
        <h2>External XC-20s</h2>
        {loading === true && <Loader active inline="centered" content="Loading" />}
        {loading === false && (
          <Container>
            <Table singleLine>
              <Header>
                <Row>
                  <HeaderCell>#</HeaderCell>
                  <HeaderCell>Asset Name</HeaderCell>
                  <HeaderCell>Symbol</HeaderCell>
                  <HeaderCell>XC-20 Address</HeaderCell>
                  <HeaderCell>Decimals</HeaderCell>
                  <HeaderCell>Asset ID</HeaderCell>
                  <HeaderCell>Para-ID</HeaderCell>
                </Row>
              </Header>
              <Body>{renderAssets("external")}</Body>
            </Table>
          </Container>
        )}
        <h2> Local XC-20s</h2>
        <br />
        {loading === true && <Loader active inline="centered" content="Loading" />}
        {loading === false && (
          <Container>
            <Table singleLine>
              <Header>
                <Row>
                  <HeaderCell>#</HeaderCell>
                  <HeaderCell>Asset Name</HeaderCell>
                  <HeaderCell>Symbol</HeaderCell>
                  <HeaderCell>XC-20 Address</HeaderCell>
                  <HeaderCell>Decimals</HeaderCell>
                  <HeaderCell>Asset ID</HeaderCell>
                </Row>
              </Header>
              <Body>{renderAssets("local")}</Body>
            </Table>
          </Container>
        )}
        <br />
        <Grid>
          <Grid.Column width={8}>
            <h3> External Asset Info</h3>
            <Dropdown
              placeholder="Select External Asset"
              selection
              options={externalAssetsDropdown}
              onChange={handleExternalChange}
              value={focusExternalAsset || ""}
            />
            <br />
            <br />
            <Container>
              <Table definition singleLine>
                {renderAsset("external")}
              </Table>
            </Container>
          </Grid.Column>
          <Grid.Column width={8}>
            <h3> Local Asset Info</h3>
            <Dropdown
              placeholder="Select Local Asset"
              selection
              options={localAssetsDropdown}
              onChange={handleLocalChange}
              value={focusLocalAsset || ""}
            />
            <br />
            <br />
            <Container>
              <Table definition singleLine>
                {renderAsset("local")}
              </Table>
            </Container>
          </Grid.Column>
        </Grid>
        <br />
        <br />
        <Message error header="Oops!" content={errorMessage} />
      </Form>
    </div>
  );
};

export default assetInfoComponent;
