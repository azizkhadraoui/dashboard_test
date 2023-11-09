import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material";
import { ResponsiveChoropleth } from "@nivo/geo";
import { tokens } from "../theme";
import { mockGeographyData as data } from "../data/mockData";
import data2 from "../data/tunisiaGeoJSON.geojson"
console.log(data);

const GeographyChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [tunisiaGeoJSON, setTunisiaGeoJSON] = useState(null);

  useEffect(() => {

    const fetchData = async () => {
      const response = await fetch(data2);
      const json = await response.json();
      setTunisiaGeoJSON(json);
    };

    fetchData();
  }, []);

  if (!tunisiaGeoJSON) {
    return null; 
  }

  const tunisiaData = {
    type: "FeatureCollection",
    features: tunisiaGeoJSON.features,
  };
  console.log(tunisiaGeoJSON.features[0].id);

  return (
    <ResponsiveChoropleth
      data={data}
      theme={{
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
            fill: "colors.grey[100]",
          },
        },
      }}
      features={tunisiaData.features}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      domain={[0, 100]}
      unknownColor="#666666"
      label="properties.gouv_fr"
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