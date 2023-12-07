import React, { useEffect, useState } from 'react';
import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { mockLineData as data2 } from "../data/mockData";
import { getFirestore,  getDocs,collection } from 'firebase/firestore';
import app from "../base.js";



const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const db = getFirestore(app);
  const [data, setdata] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
        const clientsRef = collection(db, 'clients');
        const clientsSnapshot = await getDocs(clientsRef);

        const uniqueRabatteurs = {};

        for (const clientDoc of clientsSnapshot.docs) {
            const clientData = clientDoc.data();
            const flightsRef = collection(clientDoc.ref, 'flights');
            const flightsSnapshot = await getDocs(flightsRef);

            const sellerName = clientData.from;

            if (!uniqueRabatteurs[sellerName]) {
                uniqueRabatteurs[sellerName] = {
                    data: []
                };
            }

            flightsSnapshot.docs.forEach(flightDoc => {
                const { payment, flight_date } = flightDoc.data();
                uniqueRabatteurs[sellerName].data.push({
                    x: flight_date, // Use sellerName as x value
                    y: parseInt(payment, 10)
                });
            });
        }

        const transformedData = Object.keys(uniqueRabatteurs).map(rabatteur => ({
            id: rabatteur,
            data: uniqueRabatteurs[rabatteur].data
        }));
        setdata(transformedData);

        //console.log(transformedData);
    }

    fetchData();
}, [db, colors]);



  return (
    <ResponsiveLine
      data={data2}
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
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : { scheme: "category10" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "transportation", // added
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5, // added
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "count", // added
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;