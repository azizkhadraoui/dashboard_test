import React, { useEffect, useState, useCallback } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Typography,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import app from "../../base.js";
const PieChartComponent = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <ResponsivePie
      data={data}
      theme={{
        tooltip: {
          container: {
            background: 'white',
            color: 'black',
            fontSize: '15px',
          }},
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
              fill: colors.redAccent[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
      }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={colors.grey[100]}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      enableArcLabels={false}
      arcLabelsRadiusOffset={0.4}
      arcLabelsSkipAngle={7}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
    />
  );
};

const TabsOpen = () => {
  const [sessionValue, setSessionValue] = useState(0);
  const [flightValue, setFlightValue] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [activeTab, setActiveTab] = useState("0");
  const [usersByFlightDate, setUsersByFlightDate] = useState({});
  const [counters, setCounters] = useState({});
  const [data,setData] =useState([]);
  const [newval,setNewval] =useState([0,0,0,0,0]);



  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  useEffect(() => {
    const fetchTabData = async () => {
      // Check if flights array is empty or if activeTab is not valid
      if (!flights || flights.length === 0 || !flights[activeTab]) {
        return; // Do nothing if flights array is empty or activeTab is invalid
      }
  
      // Fetch data from Firebase based on the active tab
      const db = getFirestore(app);
      const selectedFlight = flights[activeTab]; // Use activeTab to determine the selected flight
      const flightsCollection = collection(db, "flights");
      const q = query(
        flightsCollection,
        where("date", "==", selectedFlight.date)
      );
  
      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const flightData = querySnapshot.docs[0].data();
          const newData = [
            { id: 'siege vide', label: 'siege vide', value: flightData.empty_seats }
          ];
          const newCounters = {}; // Initialize new counters object
      
          const seatsCollectionRef = collection(flightsCollection, selectedFlight.id, 'seats');
          const seatQuerySnapshot = await getDocs(seatsCollectionRef);
          seatQuerySnapshot.forEach(doc => {
            const userData = doc.data();
            Object.keys(userData).forEach(userid => {
              const user = users.find(user => user.numPasseport === userid);
              if (user) {
                newData.push({ id: user.name, label: user.name, value: userData[userid] });
                
                // Update counters
                newCounters[user.id] = userData[userid];
              } else {
                newData.push({ id: userid, label: userid, value: userData[userid] });
              }
            });
          });
      
          // Set newData and update counters
          setData(newData);
          setCounters(newCounters);
        } else {
          console.log("No matching flight found.");
        }
      } catch (error) {
        console.error("Error fetching flight data:", error);
      }
    };
  
    fetchTabData();
  }, [activeTab, flights, users]);
  
  
  
  

  useEffect(() => {
    const db = getFirestore(app);
    const sessionsCollection = collection(db, "sessions");

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(sessionsCollection);
        const sessionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      if (sessions.length > 0) {
        const db = getFirestore(app);
        const flightsCollection = collection(db, "flights");
        const q = query(
          flightsCollection,
          where("type", "==", sessions[sessionValue]?.title)
        );

        try {
          const querySnapshot = await getDocs(q);
          const flightsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFlights(flightsData);
          console.log(flights)
        } catch (error) {
          console.error("Error fetching flights:", error);
        }
      }
    };

    fetchFlights();
  }, [sessionValue, sessions]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const db = getFirestore(app);
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("accessLevel", "==", "rabateur"));

      try {
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);
  const getUsernameFromUserId = async (userId) => {
    const db = getFirestore(app);
    const usersCollection = collection(db, "users");
    const userDoc = doc(usersCollection, userId);

  
    try {
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        return userData.name; 
      } else {
        console.log("User does not exist");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };
  
  

  const handleSessionTabChange = useCallback((event, newValue) => {
    setSessionValue(newValue);
    setActiveTab(""); // Unselect all flight tabs
    setFlightValue(0);
    setData([]);
    setCounters([]);
    setNewval(["null", "null", "null", "null", "null"]);
  }, []);
  const handleSubmit = async () => {
    // Ensure counters and data are up-to-date
    const updatedData = data;
    const updatedCounters = counters;
    toast.success("les siege bien ete ajoutee");

  
    for (const user of users) {
      const userValue = updatedData.find(item => item.id === user.name)?.value || 0;
      await addSeatToFlight(newval[4], newval[3], newval[0], userValue, user.numPasseport);
    }
  };
  

  const handleUserChange = useCallback((event) => {
    setSelectedUserId(event.target.value);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue.toString());
    setData([]);
    setCounters([]);
    setNewval([flights[newValue.toString()].empty_seats,
    flights[newValue.toString()].flight_company,
    flights[newValue.toString()].return_date,
    flights[newValue.toString()].type,
    flights[newValue.toString()].date]);
    console.log(flights[newValue.toString()].date);
    console.log(newval);
  };

  const incrementCounter = (userId) => {
    setCounters((prevCounters) => ({
      ...prevCounters,
      [userId]: (prevCounters[userId] || 0) + 1,
    }));
  
    setNewval((prevNewval) => {
      const updatedVal = prevNewval[0] - 1;
      if (updatedVal < 0) {
        console.log("No empty seats available.");
        return prevNewval;
      }
  
      return [updatedVal, ...prevNewval.slice(1)];
    });
  
    getUsernameFromUserId(userId).then((username) => {
      setData((prevData) => {
        const existingIndex = prevData.findIndex((item) => item.label === username);
        if (existingIndex !== -1) {
          return prevData.map((item, index) => {
            if (index === existingIndex) {
              return { ...item, value: item.value + 1 };
            }
            return item;
          });
        } else {
          return [...prevData, { id: username, label: username, value: 1 }];
        }
      });
    }).catch(console.error);
  };







async function addSeatToFlight(flightDate, flightType, emptySeats, seatNumber, username) {
  const db = getFirestore();

  // Find the document in the flights collection where date = flightDate and type = flightType
  const flightsRef = collection(db, 'flights');
  const q = query(flightsRef, where('date', '==', flightDate), where('type', '==', flightType));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log('No matching document found.');
    return;
  }

  querySnapshot.forEach(async (flightDoc) => {
    // Update empty_seats in the flights document
    const flightsDocRef = doc(flightsRef, flightDoc.id);
    await updateDoc(flightsDocRef, { empty_seats: emptySeats });

    // Check if the seat document already exists
    const seatsCollectionRef = collection(flightsDocRef, 'seats');
const q = query(seatsCollectionRef);

const querySnapshot = await getDocs(q);
if (!querySnapshot.empty) {
  // At least one document exists, update the first document found
  const existingDocumentRef = querySnapshot.docs[0].ref;
  await setDoc(existingDocumentRef, {
    [username]: seatNumber,
  }, { merge: true });
  console.log('Existing document updated with new field');
} else {
  // No document found, create a new one
  const newSeatDocRef = doc(seatsCollectionRef, 'new_document_id'); // Use a unique ID for the new document
  await setDoc(newSeatDocRef, {
    [username]: seatNumber,
  });
  console.log('New document created');
}

    
    
    
  });
}









const decrementCounter = (userId) => {
  setCounters((prevCounters) => {
    const newCounter = (prevCounters[userId] || 0) - 1;
    if (newCounter < 0) return prevCounters;
    return { ...prevCounters, [userId]: newCounter };
  });

  setNewval((prevNewval) => [prevNewval[0] + 1, ...prevNewval.slice(1)]);

  getUsernameFromUserId(userId).then((username) => {
    setData((prevData) => {
      const existingIndex = prevData.findIndex((item) => item.label === username);
      if (existingIndex !== -1) {
        return prevData.map((item, index) => {
          if (index === existingIndex) {
            return { ...item, value: Math.max(0, item.value - 1) };
          }
          return item;
        });
      }
      return prevData;
    });
  }).catch(console.error);
};


  return (
    <Box sx={{ padding: "20px", backgroundColor: colors.background }}>
      <Header title="CLIENTS" subtitle="Liste des client" />
      <ToastContainer />
      <Paper
        elevation={3}
        sx={{
          marginTop: 3,
          padding: "20px",
          borderRadius: 2,
          borderBottom: "1px solid gray",
          backgroundColor: colors.primary[400],
        }}
      >
        <TabContext value={sessionValue}>
          <TabList
            onChange={handleSessionTabChange}
            aria-label="sessions"
            className="border-b border-gray-200"
          >
            {sessions.map((session, index) => (
              <Tab
                key={session.id}
                label={session.title}
                className="border-b border-gray-200"
                value={index}
              />
            ))}
          </TabList>
          {flights.length > 0 && (
            <TabContext value={activeTab}>
              <TabList
                onChange={(event, newValue) => handleTabChange(event, newValue)}
                aria-label="flights"
                className="border-b border-gray-200"
                value={activeTab}
              >
                {flights.map((flight, fIndex) => (
                  <Tab
                    key={flight.id}
                    label={flight.date}
                    className="border-b border-gray-200"
                    value={fIndex.toString()}
                  />
                ))}
              </TabList>
              <TabPanel value={activeTab}>
              <Box sx={{ padding: "20px", backgroundColor: colors.background }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px', border: '1px solid', padding: '10px' }}>
      <Card sx={{ flex: 1,boxShadow: 3, borderRadius: 1, marginBottom: '10px' }}>
        <CardContent>
          <Typography variant="body3">
            Date de retour: {newval[2]}
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1,boxShadow: 3, borderRadius: 1, marginBottom: '10px' }}>
        <CardContent>
          <Typography variant="body3">
            Aéroport: {newval[1]}
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1,boxShadow: 3, borderRadius: 1 , marginBottom: '10px' }}>
        <CardContent>
          <Typography variant="body3">
            Nombre de sièges vides: {newval[0]}
          </Typography>
        </CardContent>
      </Card>
    </Box>

  <Paper
    elevation={3}
    sx={{
      marginTop: 3,
      padding: "20px",
      borderRadius: 2,
      borderBottom: "1px solid gray",
      backgroundColor: colors.primary[400],
    }}
  >
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TableContainer component={Paper} sx={{ height: 360, overflowY: 'scroll' }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ textAlign: "center" }}>Name</TableCell>
                <TableCell style={{ textAlign: "center" }}>Nombre de siege</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell component="th" scope="row" style={{ textAlign: "center" }}>
                    {user.name}
                  </TableCell>
                  <TableCell component="th" scope="row" style={{ textAlign: "center" }}>
                    <Button sx={{ color: "red" }} onClick={() => decrementCounter(user.id)}>-</Button>
                    {counters[user.id] || 0}
                    <Button sx={{ color: "green" }} onClick={() => incrementCounter(user.id)}>+</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={6}>
        <Paper elevation={3} sx={{ padding: "20px", borderRadius: 2, boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ height: '300px' }}>
            <PieChartComponent data={data} />
          </div>
          <Typography
            variant="body1"
            sx={{
              margin: "20px 0",
              color: colors.blueAccent[200],
              //maxWidth:300
            }}
          >
            {flights[flightValue]?.content}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  </Paper>
</Box>
              </TabPanel>
            </TabContext>
          )}
          <TabPanel>
            <select value={selectedUserId} onChange={handleUserChange}>
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </TabPanel>
        </TabContext>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        sx={{
          color: 'green',
          backgroundColor: 'transparent',
          border: '2px solid green',
          borderRadius: '5px',
          padding: '8px 16px',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          letterSpacing: '1px',
          transition: 'background-color 0.3s, color 0.3s',
          '&:hover': {
            backgroundColor: 'green',
            color: 'white',
          },
        }}
        onClick={handleSubmit}
        
      >
        Soumettre
      </Button>
    </Box>
      </Paper>
    </Box>
  );
};

export default TabsOpen;
