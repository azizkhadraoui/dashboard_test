import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveChoropleth } from "@nivo/geo";
import { tokens } from "../theme";
import data2 from "../data/tunisiaGeoJSON.geojson";
import { mockGeographyData as data } from "../data/mockData";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from "../base.js";

const GeographyChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contacts, setContacts] = useState([]);
  const [tunisiaGeoJSON, setTunisiaGeoJSON] = useState(null);

  // Updated to use circo_id and circo_na_1
  const getFeatureIdByCirco = (circoName) => {
    const features = tunisiaGeoJSON.features;
    const matchingFeature = features.find(feature => feature.properties.circo_na_1 === circoName);
    return matchingFeature ? matchingFeature.id : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore(app);
      const contactsCollection = collection(db, 'clients');

      try {
        const querySnapshot = await getDocs(contactsCollection);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContacts(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(data2);
      const json = await response.json();
      setTunisiaGeoJSON(json);
      console.log(tunisiaGeoJSON);
    };

    fetchData();
  }, []);

  if (!tunisiaGeoJSON || !contacts.length) {
    return null; 
  }

  // Updated to match new data structure
  const delegationCounts = contacts.reduce((counts, client) => {
    const delegation = client.deligation; // Make sure this matches your data
    //console.log(client.deligation);

    if (!counts[delegation]) {
      counts[delegation] = 1;
    } else {
      counts[delegation]++;
    }

    return counts;
  }, {});

  // Updated to match new data structure
  const delegationList = Object.entries(delegationCounts).map(([delegation, count]) => ({
    id: getFeatureIdByCirco(delegation),
    value: count,
  }));
  //console.log(delegationList);

  const tunisiaData = {
    type: "FeatureCollection",
    features: tunisiaGeoJSON.features.map(feature => ({
      ...feature,
      id: feature.id
    }))
  };

  console.log(delegationList);
  console.log(tunisiaData.features)

  return (
    <ResponsiveChoropleth
      data={delegationList}
//       data={[{
//         "id": 25,
//         "value": 200
//     },{
//       "id": 3,
//       "value": 500
//   },{
//     "id": 6,
//     "value":60
// },]}
      theme={{
        tooltip: {
          container: {
            background: 'white',
            color: 'black',
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
      margin={{ top: 0, right: 0,
      bottom: 0, left: 0 }}
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
    />
  );
};

export default GeographyChart;