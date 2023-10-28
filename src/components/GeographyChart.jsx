import { useTheme } from "@mui/material";
import { ResponsiveGeoMap } from "@nivo/geo";
import { gadm41_TUN_1 } from "../data/gadm41_TUN_1.js";
import { tokens } from "../theme";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useState } from "react";

const GeographyChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [zoomLevel, setZoomLevel] = useState(3);
  const centerCoordinates = [9.5375, 33.8869];

  const handleZoomIn = () => {
    setZoomLevel((prevZoomLevel) => prevZoomLevel + 1);
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoomLevel) => prevZoomLevel - 1);
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ResponsiveGeoMap
        data={gadm41_TUN_1}
        theme={theme}
        features={gadm41_TUN_1.features}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        projectionTranslation={[0.5, 0.5]}
        projectionRotation={[0, 0, 0]}
        fillColor="#eeeeee"
        borderWidth={0.5}
        borderColor="#333333"
        enableZoom={false}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
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
        zoom={zoomLevel}
        center={centerCoordinates}
      />
      <div style={{ position: "absolute", top: 10, right: 10 }}>
        <IconButton onClick={handleZoomIn}>
          <AddIcon />
        </IconButton>
        <IconButton onClick={handleZoomOut}>
          <RemoveIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default GeographyChart;
