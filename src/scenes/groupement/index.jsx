import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import app from "../../base.js";
import Header from "../../components/Header";

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    display: "grid",
    gridTemplateColumns: "250px 1fr",
    gap: "20px",
  },
  roomsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  room: {
    background: "#f0f0f0",
    borderRadius: "8px",
    padding: "15px",
    width: "45%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  },
  roomTitle: {
    fontSize: "1.2em",
    marginBottom: "10px",
    color: "black",
  },
  clientCard: {
    background: "white",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  clientInfo: {
    marginBottom: "5px",
    color: "black",
  },
  select: {
    width: "100%",
    padding: "5px",
    marginTop: "5px",
  },
};

const ClientCluster = () => {
  const [activeTypeTab, setActiveTypeTab] = useState("0");
  const [activeFlightTab, setActiveFlightTab] = useState({});
  const [flights, setFlights] = useState({});
  const [flightTypes, setFlightTypes] = useState([]);
  const [rooms, setRooms] = useState({});
  const [clients, setClients] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [activeFlightId, setActiveFlightId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore(app);
      const flightsCollection = collection(db, "flights");
      const clientsCollection = collection(db, "clients");
      const regroupementCollection = collection(db, "regroupement");

      try {
        // Fetch flights
        const flightsSnapshot = await getDocs(flightsCollection);
        const flightsData = flightsSnapshot.docs.map((doc) => ({
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

        // Fetch clients
        const clientsSnapshot = await getDocs(clientsCollection);
        const clientsData = clientsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientsData);

        // Fetch existing regroupement data
        const regroupementSnapshot = await getDocs(regroupementCollection);
        const regroupementData = regroupementSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Regroupement data:", regroupementData);

        // Initialize rooms with existing regroupement data or group clients if no data exists
        const initialRooms = reconstructRoomsFromRegroupement(
          regroupementData,
          clientsData
        );
        setRooms(initialRooms);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const reconstructRoomsFromRegroupement = (regroupementData, clientsData) => {
    const rooms = {};
    regroupementData.forEach((group) => {
      if (group && group.groups && Array.isArray(group.groups)) {
        group.groups.forEach((roomGroup) => {
          if (
            roomGroup &&
            roomGroup.roomNumber !== undefined &&
            Array.isArray(roomGroup.clients)
          ) {
            const roomNumber = roomGroup.roomNumber.toString();
            rooms[roomNumber] = roomGroup.clients
              .map((clientId) => clientsData.find((c) => c.id === clientId))
              .filter(Boolean);
          }
        });
      }
    });
    return rooms;
  };

  const handleTypeTabChange = (event, newValue) => {
    setActiveTypeTab(newValue);
    setActiveFlightTab({});
    setActiveFlightId(null);
    setRooms({});
  };

  const handleFlightTabChange = (type) => async (event, newValue) => {
    setActiveFlightTab((prev) => ({
      ...prev,
      [type]: newValue,
    }));

    const selectedFlight = flights[type][newValue];
    setActiveFlightId(selectedFlight.id);

    // Fetch rooms for the selected flight
    const db = getFirestore(app);
    const regroupementDoc = doc(
      db,
      "regroupement",
      `flight-${selectedFlight.id}`
    );
    const regroupementSnapshot = await getDocs(
      collection(regroupementDoc, "groups")
    );

    const flightRooms = {};
    regroupementSnapshot.forEach((doc) => {
      const roomData = doc.data();
      flightRooms[roomData.roomNumber] = roomData.clients
        .map((clientId) => clients.find((c) => c.id === clientId))
        .filter(Boolean);
    });

    setRooms(flightRooms);
  };

  const handleCreateRoom = async () => {
    if (!activeFlightId) return;

    const newRoomNumber = Object.keys(rooms).length.toString();
    const updatedRooms = {
      ...rooms,
      [newRoomNumber]: [],
    };
    setRooms(updatedRooms);

    // Update Firestore
    try {
      const db = getFirestore(app);
      const regroupementDoc = doc(
        db,
        "regroupement",
        `flight-${activeFlightId}`
      );
      const groupsCollection = collection(regroupementDoc, "groups");

      await setDoc(doc(groupsCollection), {
        roomNumber: newRoomNumber,
        clients: [],
        flightId: activeFlightId,
      });
    } catch (error) {
      console.error("Error creating new room:", error);
    }
  };

  const handleDeleteRoom = async (roomNumber) => {
    setRoomToDelete(roomNumber);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRoom = async () => {
    if (roomToDelete === null || !activeFlightId) return;

    const updatedRooms = { ...rooms };
    delete updatedRooms[roomToDelete];
    setRooms(updatedRooms);

    // Update Firestore
    try {
      const db = getFirestore(app);
      const regroupementDoc = doc(
        db,
        "regroupement",
        `flight-${activeFlightId}`
      );
      const groupsCollection = collection(regroupementDoc, "groups");
      const roomDoc = doc(groupsCollection, roomToDelete);

      await updateDoc(roomDoc, {
        clients: [],
      });

      // Move clients to a default room or handle as needed
      const clientsToReassign = rooms[roomToDelete];
      if (clientsToReassign.length > 0) {
        const defaultRoomNumber = Object.keys(updatedRooms)[0] || "0";
        for (const client of clientsToReassign) {
          await handleClientMove(
            client,
            roomToDelete,
            defaultRoomNumber,
            activeFlightId
          );
        }
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }

    setDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  const handleClientMove = async (
    clientToMove,
    currentRoomNumber,
    newRoomNumber,
    flightId
  ) => {
    setRooms((prevRooms) => {
      const newRooms = { ...prevRooms };
      const currentRoom = [...(newRooms[currentRoomNumber] || [])];
      const newRoom = [...(newRooms[newRoomNumber] || [])];

      const clientIndex = currentRoom.findIndex(
        (client) => client.id === clientToMove.id
      );

      if (clientIndex !== -1) {
        currentRoom.splice(clientIndex, 1);
        newRoom.push(clientToMove);

        newRooms[currentRoomNumber] = currentRoom;
        newRooms[newRoomNumber] = newRoom;

        if (currentRoom.length === 0) {
          delete newRooms[currentRoomNumber];
        }
      }

      return newRooms;
    });

    // Update Firestore
    try {
      const db = getFirestore(app);
      const regroupementDoc = doc(db, "regroupement", `flight-${flightId}`);
      const groupsCollection = collection(regroupementDoc, "groups");

      // Remove client from the old room
      const oldRoomDoc = doc(groupsCollection, currentRoomNumber);
      await updateDoc(oldRoomDoc, {
        clients: arrayRemove(clientToMove.id),
      });

      // Add client to the new room
      const newRoomDoc = doc(groupsCollection, newRoomNumber);
      await updateDoc(newRoomDoc, {
        clients: arrayUnion(clientToMove.id),
      });

      // Update client's flight information
      const clientDoc = doc(db, "clients", clientToMove.id);
      await updateDoc(clientDoc, {
        flights: arrayUnion({
          flightId: flightId,
          roomNumber: newRoomNumber,
        }),
      });
    } catch (error) {
      console.error("Error updating client room:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="Client Cluster" subtitle="regroupement" />
      <Box display="flex" justifyContent="space-between">
        <Box width="100%">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabContext value={activeTypeTab}>
              <TabList onChange={handleTypeTabChange} aria-label="type tabs">
                {flightTypes.map((type, index) => (
                  <Tab key={type} label={type} value={index.toString()} />
                ))}
              </TabList>
              {flightTypes.map((type, index) => (
                <TabPanel key={type} value={index.toString()}>
                  <TabContext value={activeFlightTab[type] || "0"}>
                    <TabList
                      onChange={handleFlightTabChange(type)}
                      aria-label="flight tabs"
                    >
                      {flights[type]?.map((flight, flightIndex) => (
                        <Tab
                          key={flight.id}
                          label={flight.date || "Unnamed Flight"}
                          value={flightIndex.toString()}
                        />
                      ))}
                    </TabList>
                    {flights[type]?.map((flight, flightIndex) => (
                      <TabPanel key={flight.id} value={flightIndex.toString()}>
                        <Box>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleCreateRoom}
                            sx={{ marginBottom: 2 }}
                          >
                            Crée une Nouvelle chambre
                          </Button>
                          {Object.entries(rooms).map(([roomNumber, room]) => (
                            <Box key={roomNumber} sx={styles.room}>
                              <Typography sx={styles.roomTitle}>{`Room ${
                                Number(roomNumber) + 1
                              }`}</Typography>
                              <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleDeleteRoom(roomNumber)}
                                sx={{ marginBottom: 2 }}
                              >
                                Delete Room
                              </Button>
                              {room.map((client) => (
                                <Paper key={client.id} sx={styles.clientCard}>
                                  <Typography
                                    sx={styles.clientInfo}
                                  >{`Name: ${client.firstName} ${client.lastName}`}</Typography>
                                  <Typography
                                    sx={styles.clientInfo}
                                  >{`Gender: ${client.sex}`}</Typography>
                                  <Typography
                                    sx={styles.clientInfo}
                                  >{`Passport: ${client.passportNumber}`}</Typography>
                                  <FormControl fullWidth sx={styles.select}>
                                    <InputLabel>Move to Room</InputLabel>
                                    <Select
                                      value={roomNumber}
                                      onChange={(e) =>
                                        handleClientMove(
                                          client,
                                          roomNumber,
                                          e.target.value,
                                          flight.id
                                        )
                                      }
                                    >
                                      {Object.keys(rooms).map((idx) => (
                                        <MenuItem
                                          key={idx}
                                          value={idx}
                                        >{`Room ${Number(idx) + 1}`}</MenuItem>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Room?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Vous êtes sûr de supprimer cette chambre ? Tous les clients de cette
            chambre vont passer à la chambre la plus proche.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={confirmDeleteRoom} autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientCluster;
