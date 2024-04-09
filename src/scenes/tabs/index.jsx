import React, { useEffect, useState, useCallback } from "react";
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
} from "firebase/firestore";
import app from "../../base.js";

const TabsOpen = () => {
  const [sessionValue, setSessionValue] = useState(0);
  const [flightValue, setFlightValue] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(""); // State for selected user ID
  const [activeTab, setActiveTab] = useState("0"); // Initialize as string
  const [usersByFlightDate, setUsersByFlightDate] = useState({});
  const [counters, setCounters] = useState({}); // State to hold counter values for each user
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
    
      try {
        const querySnapshot = await getDocs(usersCollection);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
    
        // Update the users state with all users data
        setUsers(usersData);
        //console.log(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    // Fetch all users when component mounts
    fetchAllUsers();
  }, []); // Empty dependency array ensures it only runs once on component mount
  
  console.log(users); // Add this line to check if usersData is being set correctly outside of useEffect
  
  


  // Empty dependency array ensures it only runs once on component mount
  

  const handleSessionTabChange = useCallback((event, newValue) => {
    setSessionValue(newValue);
    setFlightValue(0); // Reset flight tab index when session changes
  }, []);



  const handleUserChange = useCallback((event) => {
    setSelectedUserId(event.target.value);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue.toString()); // Convert to string
  };
  
  
  // Function to handle incrementing the counter for a specific user
   const incrementCounter = (userId) => {
      setCounters((prevCounters) => ({
        ...prevCounters,
        [userId]: (prevCounters[userId] || 0) + 1,
      }));
   };
  
   // Function to handle decrementing the counter for a specific user
   const decrementCounter = (userId) => {
      setCounters((prevCounters) => ({
        ...prevCounters,
        [userId]: Math.max((prevCounters[userId] || 0) - 1, 0), // Ensure counter doesn't go below 0
      }));
   };

  return (
    <Box sx={{ padding: "20px", backgroundColor: colors.background }}>
      <Header title="CLIENTS" subtitle="Liste des client" />
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
            className="border-b border-gray-200 "
          >
            {sessions.map((session, index) => (
              <Tab
                key={session.id} // Use a unique identifier as key
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
                    key={flight.id} // Use a unique identifier as key
                    label={flight.date}
                    className="border-b border-gray-200"
                    value={fIndex.toString()} // Convert to string
                  />
                ))}
              </TabList>
              <TabPanel value={activeTab}>
                <Paper
                  elevation={3}
                  sx={{ marginTop: 3, padding: "20px", borderRadius: 2 }}
                >
                  <Typography
                    variant="body1"
                    sx={{ margin: "20px 0", color: colors.blueAccent[200] }}
                  >
                    {flights[flightValue]?.content}
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Nombre de siege</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Render users for the current flight date */}
                        {users?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell component="th" scope="row">
                              {user.name} 
                            </TableCell>
                            <TableCell component="th" scope="row">           
                              <Button sx={{color:"red"}} onClick={() => decrementCounter(user.id)}>-</Button>        
                              {counters[user.id] || 0}
                              <Button sx={{color:"green"}} onClick={() => incrementCounter(user.id)}>+</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
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
      </Paper>
    </Box>
  );
};

export default TabsOpen;
