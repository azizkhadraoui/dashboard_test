import React, { useState, useEffect } from "react";
import { useTheme, Button, ButtonGroup } from "@mui/material";
import { ResponsiveChoropleth } from "@nivo/geo";
import { tokens } from "../theme";
import data2 from "../data/tunisiaGeoJSON.geojson";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from "../base.js";

const GeographyChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contacts, setContacts] = useState([]);
  const [tunisiaGeoJSON, setTunisiaGeoJSON] = useState(null);
  const [dataType, setDataType] = useState("clients");

  const getFeatureIdByCirco = (circoName) => {
    const features = tunisiaGeoJSON.features;
    const matchingFeature = features.find(feature => feature.properties.circo_na_1 === circoName);
    return matchingFeature ? matchingFeature.id : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore(app);
      const contactsCollection = collection(db, dataType);

      try {
        const querySnapshot = await getDocs(contactsCollection);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContacts(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dataType]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(data2);
      const json = await response.json();
      setTunisiaGeoJSON(json);
    };

    fetchData();
  }, []);

  if (!tunisiaGeoJSON || !contacts.length) {
    return null; 
  }

  const delegationCounts = contacts.reduce((counts, contact) => {
    const field = dataType === "clients" ? contact.deligation : contact.location;
    if (!counts[field]) {
      counts[field] = dataType === "users" ? [contact.name] : 1;
    } else {
      if (dataType === "users") {
        counts[field].push(contact.name);
      } else {
        counts[field]++;
      }
    }
    return counts;
  }, {});

  const delegationList = Object.entries(delegationCounts).map(([field, value]) => ({
    id: getFeatureIdByCirco(field),
    value: dataType === "users" ? value.join(', ') : value,
    name: field
  }));

  const tunisiaData = {
    type: "FeatureCollection",
    features: tunisiaGeoJSON.features.map(feature => ({
      ...feature,
      id: feature.id
    }))
  };

  const CustomTooltip = ({ feature }) => {
    const delegation = delegationList.find(d => d.id === feature.id);

    if (!delegation || delegation.value === undefined) return null;

    const displayValue = dataType === "users"
      ? `${delegation.name} : ${delegation.value}`
      : `${delegation.name} : ${delegation.value}`;

    return (
      <div
        style={{
          padding: '12px',
          background: colors.background,
          color: colors.text,
          borderRadius: '4px',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          fontSize: '15px',
        }}
      >
        <strong>{delegation.name}</strong> : {delegation.value}
      </div>
    );
  };

  return (
    <>
      <ButtonGroup
        variant="contained"
        aria-label="outlined primary button group"
        style={{ margin: '20px 0' }}
      >
        <Button
          onClick={() => setDataType("clients")}
          variant={dataType === "clients" ? "contained" : "outlined"}
          style={{
            color: dataType === "clients" ? colors.primary[100] : colors.grey[100],
            borderColor: colors.grey[600],
            backgroundColor: 'transparent', // Ensure background is transparent for both states
            borderWidth: 2,
            borderRadius: 4,
            fontWeight: dataType === "clients" ? 'bold' : 'normal',
            '&:hover': {
              backgroundColor: 'transparent', // Maintain transparency on hover
              color: dataType === "clients" ? colors.primary[100] : colors.grey[300],
            }
          }}
        >
          Clients
        </Button>
        <Button
          onClick={() => setDataType("users")}
          variant={dataType === "users" ? "contained" : "outlined"}
          style={{
            color: dataType === "users" ? colors.primary[100] : colors.grey[100],
            borderColor: colors.grey[600],
            backgroundColor: 'transparent', // Ensure background is transparent for both states
            borderWidth: 2,
            borderRadius: 4,
            fontWeight: dataType === "users" ? 'bold' : 'normal',
            '&:hover': {
              backgroundColor: 'transparent', // Maintain transparency on hover
              color: dataType === "users" ? colors.primary[100] : colors.grey[300],
            }
          }}
        >
          Revendeurs
        </Button>
      </ButtonGroup>
      <ResponsiveChoropleth
        data={delegationList}
        theme={{
          tooltip: {
            container: {
              background: colors.background,
              color: colors.text,
              fontSize: '15px',
            },
          },
          axis: {
            domain: {
              line: {
                stroke: colors.grey[100],
              },
            },
            legend: {
              text: {
                fill: colors.grey[100],
              },
            },
            ticks: {
              line: {
                stroke: colors.grey[100],
                strokeWidth: 1,
              },
              text: {
                fill: colors.grey[100],
              },
            },
          },
          legends: {
            text: {
              fill: colors.grey[100],
            },
          },
        }}
        features={tunisiaData.features}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        domain={[0, 100]}
        unknownColor="#666666"
        label="properties.circo_na_1"
        valueFormat=".2s"
        projectionScale={isDashboard ? 1300 : 2500}
        projectionTranslation={isDashboard ? [-0.15, 4.6] : [0.18, 3.5]}
        projectionRotation={[0, 0, 0]}
        borderWidth={1.5}
        borderColor="#ffffff"
        legends={
          !isDashboard
            ? [
                {
                  anchor: "bottom-left",
                  direction: "column",
                  justify: true,
                  translateX: 20,
                  translateY: -100,
                  itemsSpacing: 0,
                  itemWidth: 94,
                  itemHeight: 18,
                  itemDirection: "left-to-right",
                  itemTextColor: colors.grey[100],
                  itemOpacity: 0.85,
                  symbolSize: 18,
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#ffffff",
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]
            : undefined
        }
        tooltip={CustomTooltip}
      />
    </>
  );
};

export default GeographyChart;
