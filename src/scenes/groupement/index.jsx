import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tab, Tabs, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

const mockData = [
  { id: 1, name: 'Client 1', age: 25, gender: 'Male' },
  { id: 2, name: 'Client 2', age: 30, gender: 'Female' },
  { id: 3, name: 'Client 3', age: 35, gender: 'Male' },
  { id: 4, name: 'Client 4', age: 28, gender: 'Female' },
  { id: 5, name: 'Client 5', age: 22, gender: 'Male' },
  { id: 6, name: 'Client 6', age: 29, gender: 'Female' },
  { id: 7, name: 'Client 7', age: 27, gender: 'Male' },
  { id: 8, name: 'Client 8', age: 31, gender: 'Female' },
  { id: 9, name: 'Client 9', age: 33, gender: 'Male' },
  { id: 10, name: 'Client 10', age: 26, gender: 'Female' },
];

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
  const [flights, setFlights] = useState([]);
  const [flightTypes, setFlightTypes] = useState([]);
  const [rooms, setRooms] = useState(groupClients(mockData));

  useEffect(() => {
    const fetchFlights = async () => {
      const db = getFirestore(app);
      const flightsCollection = collection(db, 'flights');

      try {
        const querySnapshot = await getDocs(flightsCollection);
        const flightsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group flights by type
        const groupedByType = flightsData.reduce((acc, flight) => {
          if (!acc[flight.type]) {
            acc[flight.type] = [];
          }
          acc[flight.type].push(flight);
          return acc;
        }, {});

        setFlights(groupedByType);
        setFlightTypes(Object.keys(groupedByType));
      } catch (error) {
        console.error('Error fetching flights:', error);
      }
    };

    fetchFlights();
  }, []);

  const handleTypeTabChange = (event, newValue) => {
    setActiveTypeTab(newValue);
  };

  const handleFlightTabChange = (type) => (event, newValue) => {
    setActiveFlightTab((prev) => ({
      ...prev,
      [type]: newValue,
    }));
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
      <Header title="Client Cluster" subtitle="Chart simple Pie" />
      <Box display="flex" justifyContent="space-between">
        <Box width="60%">
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
                        <Tab key={flight.id} label={flight.date || 'Unnamed Flight'} value={flightIndex.toString()} />
                      ))}
                    </TabList>
                    {flights[type]?.map((flight, flightIndex) => (
                      <TabPanel key={flight.id} value={flightIndex.toString()}>
                        <Box sx={styles.roomsContainer}>
                          {Object.entries(rooms).map(([roomNumber, room]) => (
                            <Box key={roomNumber} sx={styles.room}>
                              <Typography sx={styles.roomTitle}>{`Room ${Number(roomNumber) + 1}`}</Typography>
                              {room.map((client) => (
                                <Paper key={client.id} sx={styles.clientCard}>
                                  <Typography sx={styles.clientInfo}>{`Client: ${client.name}`}</Typography>
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





