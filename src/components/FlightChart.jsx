import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResponsivePie } from "@nivo/pie";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import app from "../base.js";

const FlightChart = () => {
  const { flightId } = useParams();
  const navigate = useNavigate(); // useNavigate hook for navigation
  const [flightData, setFlightData] = useState(null);

  console.log(flightData);

  useEffect(() => {
    const fetchFlightData = async () => {
      const db = getFirestore(app);
      const flightDocRef = doc(db, "flights", flightId);
      const flightDocSnap = await getDoc(flightDocRef);

      if (flightDocSnap.exists()) {
        setFlightData(flightDocSnap.data());
      } else {
        console.error("Error finding the document");
      }
    };

    fetchFlightData();
  }, [flightId]);

  if (!flightData) {
    return <div>Loading...</div>;
  }

  const total_seats = 50; // Placeholder value, replace with actual data
  const { empty_seats } = flightData;
  const reserved_seats = total_seats - empty_seats;

  const data = [
    {
      id: "Reserved Seats",
      label: "Reserved Seats",
      value: reserved_seats,
    },
    {
      id: "Empty Seats",
      label: "Empty Seats",
      value: empty_seats,
    },
  ];

  return (
    <div style={{ height: 400 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyItems: "center",
          paddingLeft: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2.8rem" }}>{flightData.flight_company}</h1>
        <h2 style={{ fontSize: "1.2rem" }}>{flightData.date}</h2>
      </div>
      <button
        style={{
          position: "absolute",
          top: "6rem",
          right: "8rem",
          padding: "0.5rem 1rem",
          backgroundColor: "gray",
          color: "#fff",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
        }}
        onClick={() => navigate("/testaa")}
      >
        {"< Back"}
      </button>
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={{ scheme: "nivo" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        radialLabelsSkipAngle={10}
        radialLabelsTextColor="#333333"
        radialLabelsLinkColor={{ from: "color" }}
        sliceLabelsSkipAngle={10}
        sliceLabelsTextColor="#333333"
      />
    </div>
  );
};

export default FlightChart;
