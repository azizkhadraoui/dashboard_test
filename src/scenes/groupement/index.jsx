import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tab, Tabs, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import app from '../../base.js';
import Header from '../../components/Header';

const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gap: '20px',
    },
    roomsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    room: {
      background: '#f0f0f0',
      borderRadius: '8px',
      padding: '15px',
      width: '45%',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
    },
    roomTitle: {
      fontSize: '1.2em',
      marginBottom: '10px',
      color: '#333',
    },
    clientCard: {
      background: 'white',
      borderRadius: '4px',
      padding: '10px',
      marginBottom: '10px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    clientInfo: {
      marginBottom: '5px',
    },
    select: {
      width: '100%',
      padding: '5px',
      marginTop: '5px',
    },
  };

const groupClients = (clients) => {
  const rooms = {};
  clients.forEach((client, index) => {
    const roomNumber = Math.floor(index / 4);
    if (!rooms[roomNumber]) {
      rooms[roomNumber] = [];
    }
    rooms[roomNumber].push(client);
  });
  return rooms;
};

const ClientCluster = () => {
  const [activeTypeTab, setActiveTypeTab] = useState('0');
  const [activeFlightTab, setActiveFlightTab] = useState({});
  const [flights, setFlights] = useState({});
  const [flightTypes, setFlightTypes] = useState([]);
  const [rooms, setRooms] = useState({});

  useEffect(() => {
    const fetchClientsAndFlights = async () => {
      const db = getFirestore(app);

      // Fetch flights
      const flightsCollection = collection(db, 'flights');
      try {
        const querySnapshot = await getDocs(flightsCollection);
        const flightsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group flights by type
        const groupedFlights = {};
        flightsData.forEach(flight => {
          if (!groupedFlights[flight.type]) {
            groupedFlights[flight.type] = [];
          }
          groupedFlights[flight.type].push(flight);
        });

        setFlights(groupedFlights);
        setFlightTypes(Object.keys(groupedFlights));
        
        // Initialize rooms with the first flight's clients (optional)
        if (Object.keys(groupedFlights).length > 0) {
          const firstType = Object.keys(groupedFlights)[0];
          setRooms(groupClients([])); // You can initialize with empty clients or modify as per your needs
        }

      } catch (error) {
        console.error('Error fetching flights:', error);
      }

      // Fetch clients
      const clientsCollection = collection(db, 'clients');
      try {
        const clientsSnapshot = await getDocs(clientsCollection);
        const clientsData = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Process clients data
        const processedClients = clientsData.map(client => ({
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          age: client.birthday, // Assuming 'birthday' contains age
          gender: client.sex, // Assuming 'sex' contains gender
          // Add more fields as needed
        }));

        // Update rooms with the first flight's clients (optional)
        if (Object.keys(flights).length > 0 && Object.keys(flights[flightTypes[activeTypeTab]]).length > 0) {
          const firstFlightClients = flights[flightTypes[activeTypeTab]][0];
          setRooms(groupClients(processedClients));
        }

      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClientsAndFlights();
  }, [activeTypeTab]); // Add any other dependencies as needed

  const handleTypeTabChange = (event, newValue) => {
    setActiveTypeTab(newValue);
    // Reset active flight tab when changing type
    setActiveFlightTab({});
    // Update rooms with the first flight of the new type
    if (flights[flightTypes[newValue]]) {
      const firstFlightClients = flights[flightTypes[newValue]][0];
      setRooms(groupClients([])); // Adjust with appropriate clients for the selected type
    }
  };

  const handleFlightTabChange = (type) => (event, newValue) => {
    setActiveFlightTab(prev => ({
      ...prev,
      [type]: newValue,
    }));
    // Update rooms with the selected flight
    setRooms(groupClients([])); // Adjust with appropriate clients for the selected flight
  };

  const handleClientMove = (clientToMove, currentRoomNumber, newRoomNumber) => {
    setRooms(prevRooms => {
      const newRooms = { ...prevRooms };
      const currentRoom = newRooms[currentRoomNumber];
      const newRoom = newRooms[newRoomNumber];

      // Find the index of the client to move in the current room
      const clientIndex = currentRoom.findIndex(client => client.id === clientToMove.id);

      // If the new room is full, swap with the last client in that room
      if (newRoom.length === 4) {
        const swapClient = newRoom[newRoom.length - 1];
        newRoom[newRoom.length - 1] = clientToMove;
        currentRoom[clientIndex] = swapClient;
      } else {
        // If the new room is not full, just move the client
        newRoom.push(clientToMove);
        currentRoom.splice(clientIndex, 1);
      }

      return newRooms;
    });
  };

  return (
    <Box m="20px">
      <Header title="Client Cluster" subtitle="Flight and Room Assignment" />
      <Box display="flex" justifyContent="space-between">
        <Box width="100%">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabContext value={activeTypeTab}>
              <TabList onChange={handleTypeTabChange} aria-label="type tabs">
                {flightTypes.map((type, index) => (
                  <Tab key={type} label={type} value={index.toString()} />
                ))}
              </TabList>
              {flightTypes.map((type, index) => (
                <TabPanel key={type} value={index.toString()}>
                  <TabContext value={activeFlightTab[type] || '0'}>
                    <TabList onChange={handleFlightTabChange(type)} aria-label="flight tabs">
                      {flights[type]?.map((flight, flightIndex) => (
                        <Tab key={flight.id} label={`Flight ${flightIndex + 1}`} value={flightIndex.toString()} />
                      ))}
                    </TabList>
                    {Object.entries(rooms).map(([roomNumber, room]) => (
                      <TabPanel key={roomNumber} value={roomNumber.toString()}>
                        <Box sx={styles.roomsContainer}>
                          {room.map((client) => (
                            <Paper key={client.id} sx={styles.clientCard}>
                              <Typography sx={styles.clientInfo}>{`Client: ${client.firstName} ${client.lastName}`}</Typography>
                              <Typography sx={styles.clientInfo}>{`Age: ${client.age}`}</Typography>
                              <Typography sx={styles.clientInfo}>{`Gender: ${client.gender}`}</Typography>
                              <FormControl fullWidth sx={styles.select}>
                                <InputLabel>Move to Room</InputLabel>
                                <Select
                                  value={roomNumber}
                                  onChange={(e) => handleClientMove(client, roomNumber, e.target.value)}
                                >
                                  {Object.keys(rooms).map((idx) => (
                                    <MenuItem key={idx} value={idx}>{`Room ${Number(idx) + 1}`}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Paper>
                          ))}
                        </Box>
                      </TabPanel>
                    ))}
                  </TabContext>
                </TabPanel>
              ))}
            </TabContext>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ClientCluster;
