import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";

const Line = () => {
  const overlayStyles = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(128, 128, 128, 0.5)", // Semi-transparent grey color
    backdropFilter: "blur(8px)", // Adjust the blur strength as needed
  };

  return (
    <Box m="20px" position="relative">
      <Header title="Line Chart" subtitle="Simple Line Chart" />
      <Box height="75vh">
        <LineChart />
      </Box>
      <div style={overlayStyles}></div>
    </Box>
  );
};

export default Line;
