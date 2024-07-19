import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
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
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import app from "../../base.js";
import Header from "../../components/Header";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const ClientCluster = () => {
  const [activeTypeTab, setActiveTypeTab] = useState("0");
  const [activeFlightTab, setActiveFlightTab] = useState({});
  const [flights, setFlights] = useState({});
  const [flightTypes, setFlightTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [groupedRooms, setGroupedRooms] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [existingDistributionId, setExistingDistributionId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching initial data...");
      const db = getFirestore(app);
      const flightsCollection = collection(db, "flights");
      const clientsCollection = collection(db, "clients");

      try {
        // Fetch flights
        console.log("Fetching flights...");
        const flightsSnapshot = await getDocs(flightsCollection);
        const flightsData = flightsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched flights:", flightsData);

        // Group flights by type
        console.log("Grouping flights by type...");
        const groupedByType = flightsData.reduce((acc, flight) => {
          if (!acc[flight.type]) {
            acc[flight.type] = [];
          }
          acc[flight.type].push(flight);
          return acc;
        }, {});
        console.log("Grouped flights:", groupedByType);

        setFlights(groupedByType);
        setFlightTypes(Object.keys(groupedByType));

        // Fetch clients and their flights subcollection
        console.log("Fetching clients...");
        const clientsSnapshot = await getDocs(clientsCollection);
        const clientsData = await Promise.all(
          clientsSnapshot.docs.map(async (doc) => {
            const clientData = { id: doc.id, ...doc.data() };
            const flightsSubcollection = collection(
              db,
              `clients/${doc.id}/flights`
            );
            const flightsSubSnapshot = await getDocs(flightsSubcollection);
            clientData.flights = flightsSubSnapshot.docs.map((subDoc) =>
              subDoc.data()
            );
            return clientData;
          })
        );
        console.log("Fetched clients:", clientsData);
        setClients(clientsData);

        // Set initial active tabs
        if (Object.keys(groupedByType).length > 0) {
          const initialType = Object.keys(groupedByType)[0];
          setActiveTypeTab("0");
          setActiveFlightTab({ [initialType]: "0" });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (flightTypes.length > 0 && clients.length > 0) {
      const currentType = flightTypes[parseInt(activeTypeTab)];
      const currentFlightIndex = activeFlightTab[currentType] || "0";
      const currentFlight = flights[currentType][parseInt(currentFlightIndex)];

      if (currentFlight) {
        fetchDistributionOrGroupClients(currentFlight);
      }
    }
  }, [activeTypeTab, activeFlightTab, flightTypes, flights, clients]);

  const fetchDistributionOrGroupClients = async (selectedFlight) => {
    console.log(
      "Fetching distribution or grouping clients for flight:",
      selectedFlight
    );
    const db = getFirestore(app);
    const roomDistributionCollection = collection(db, "roomDistribution");

    try {
      // Check if a distribution exists for the selected flight
      const q = query(
        roomDistributionCollection,
        where("flightDate", "==", selectedFlight.date),
        where("flightType", "==", flightTypes[parseInt(activeTypeTab)])
      );
      const distributionSnapshot = await getDocs(q);

      if (!distributionSnapshot.empty) {
        // Distribution exists, fetch and display it
        console.log("Existing distribution found");
        const distributionDoc = distributionSnapshot.docs[0];
        setExistingDistributionId(distributionDoc.id);
        const distributionData = distributionDoc.data();

        console.log("Distribution data:", distributionData);

        if (
          distributionData &&
          distributionData.rooms &&
          Array.isArray(distributionData.rooms)
        ) {
          // Reconstruct the grouped rooms from the saved data
          const reconstructedRooms = distributionData.rooms.map(
            (room) =>
              room.clients
                .map((clientId) => {
                  const client = clients.find((c) => c.id === clientId);
                  if (!client) {
                    console.warn(`Client with ID ${clientId} not found`);
                  }
                  return client;
                })
                .filter(Boolean) // Remove any undefined clients
          );

          console.log("Reconstructed rooms:", reconstructedRooms);
          setGroupedRooms(reconstructedRooms);
        } else {
          console.error(
            "Invalid distribution data structure:",
            distributionData
          );
          throw new Error("Invalid distribution data structure");
        }
      } else {
        // No existing distribution, perform automatic grouping
        console.log("No existing distribution, performing automatic grouping");
        setExistingDistributionId(null);
        const flightClients = clients.filter((client) => {
          return client.flights.some(
            (flight) => flight.flight_date === selectedFlight.date
          );
        });
        console.log("Clients for this flight:", flightClients);
        const groupedRooms = groupClientsIntoRooms(flightClients);
        setGroupedRooms(groupedRooms);
      }
    } catch (error) {
      console.error("Error fetching distribution or grouping clients:", error);
      // Handle the error gracefully, maybe set an empty array or show an error message
      setGroupedRooms([]);
    }
  };

  const handleTypeTabChange = (event, newValue) => {
    console.log("Type tab changed to:", newValue);
    setActiveTypeTab(newValue);
    const newType = flightTypes[parseInt(newValue)];
    setActiveFlightTab((prev) => ({ ...prev, [newType]: "0" }));
  };

  const handleFlightTabChange = (type) => (event, newValue) => {
    console.log("Flight tab changed for type:", type, "to:", newValue);
    setActiveFlightTab((prev) => ({
      ...prev,
      [type]: newValue,
    }));
  };

  const groupClientsIntoRooms = (clients) => {
    console.log("Grouping clients into rooms...");

    // Sort clients by gender
    const maleClients = clients.filter((client) => client.sex === "male");
    const femaleClients = clients.filter((client) => client.sex === "female");

    console.log("Male clients:", maleClients);
    console.log("Female clients:", femaleClients);

    const groupClientsByGender = (genderClients) => {
      // Sort clients by age
      genderClients.sort((a, b) => new Date(a.birthday) - new Date(b.birthday));
      console.log("Sorted clients by age:", genderClients);

      const rooms = [];
      const maxClientsPerRoom = 4; // Adjust this based on your requirements

      for (let i = 0; i < genderClients.length; i += maxClientsPerRoom) {
        const room = genderClients.slice(i, i + maxClientsPerRoom);
        rooms.push(room);
      }
      return rooms;
    };

    const maleRooms = groupClientsByGender(maleClients);
    const femaleRooms = groupClientsByGender(femaleClients);

    console.log("Male rooms:", maleRooms);
    console.log("Female rooms:", femaleRooms);

    // Combine male and female rooms
    const allRooms = [...maleRooms, ...femaleRooms];
    console.log("All rooms:", allRooms);

    return allRooms;
  };

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleSaveRooms = async () => {
    console.log("Save rooms button clicked");
    setSaveDialogOpen(true);
  };

  const confirmSaveRooms = async () => {
    console.log("Confirming save rooms...");
    const db = getFirestore(app);
    const roomDistributionCollection = collection(db, "roomDistribution");
    const batch = writeBatch(db);

    try {
      const currentFlight =
        flights[flightTypes[activeTypeTab]][
          activeFlightTab[flightTypes[activeTypeTab]]
        ];

      // Create an array to store all room distribution data
      const allRoomDistributions = groupedRooms.map((room, index) => ({
        clients: room.map((client) => client.id),
        gender: room[0]?.sex || "Unknown",
        ageDetails: {
          minAge: Math.min(
            ...room.map((client) => calculateAge(client.birthday))
          ),
          maxAge: Math.max(
            ...room.map((client) => calculateAge(client.birthday))
          ),
          averageAge:
            room.reduce(
              (sum, client) => sum + calculateAge(client.birthday),
              0
            ) / room.length,
        },
        flightDate: currentFlight.date,
        flightType: flightTypes[activeTypeTab],
        roomId: `Room-${index + 1}`,
      }));

      if (existingDistributionId) {
        // Update existing distribution
        const distributionRef = doc(
          db,
          "roomDistribution",
          existingDistributionId
        );
        batch.update(distributionRef, { rooms: allRoomDistributions });
        console.log("Updating existing room distribution");
      } else {
        // Save new distribution
        const newDistributionRef = doc(roomDistributionCollection);
        batch.set(newDistributionRef, {
          rooms: allRoomDistributions,
          flightDate: currentFlight.date,
          flightType: flightTypes[activeTypeTab],
        });
        setExistingDistributionId(newDistributionRef.id);
        console.log("Creating new room distribution");
      }

      // Commit the batch
      await batch.commit();
      console.log("Room distributions saved successfully");

      setSaveDialogOpen(false);
    } catch (error) {
      console.error("Error saving rooms:", error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    const sourceRoomIndex = parseInt(source.droppableId.replace("room-", ""));
    const destRoomIndex = parseInt(
      destination.droppableId.replace("room-", "")
    );

    // Clone the rooms
    const updatedRooms = [...groupedRooms];

    // Get the dragged client
    const [movedClient] = updatedRooms[sourceRoomIndex].splice(source.index, 1);

    // Move the client to the new room
    updatedRooms[destRoomIndex].splice(destination.index, 0, movedClient);

    setGroupedRooms(updatedRooms);
  };

  return (
    <Box m="20px">
      <Header title="Client Cluster" subtitle="Room Distribution" />
      <Box display="flex" justifyContent="space-between">
        <Box width="100%">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabContext value={activeTypeTab}>
              <TabList onChange={handleTypeTabChange} aria-label="type tabs">
                {flightTypes.map((type, index) => (
                  <Tab key={type} label={type} value={String(index)} />
                ))}
              </TabList>
              {flightTypes.map((type, typeIndex) => (
                <TabPanel key={type} value={String(typeIndex)}>
                  <Tabs
                    value={activeFlightTab[type] || "0"}
                    onChange={handleFlightTabChange(type)}
                    aria-label="flight tabs"
                  >
                    {flights[type].map((flight, flightIndex) => (
                      <Tab
                        key={flight.id}
                        label={`Flight ${flightIndex + 1}`}
                        value={String(flightIndex)}
                      />
                    ))}
                  </Tabs>
                </TabPanel>
              ))}
            </TabContext>
          </Box>
          <Box mt="20px">
            <DragDropContext onDragEnd={onDragEnd}>
              {groupedRooms.map((room, index) => (
                <Droppable key={index} droppableId={`room-${index}`}>
                  {(provided) => (
                    <Paper
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{ mb: 2, p: 2 }}
                    >
                      <Typography variant="h6">{`Room ${
                        index + 1
                      }`}</Typography>
                      {room.map((client, clientIndex) => (
                        <Draggable
                          key={client.id}
                          draggableId={client.id}
                          index={clientIndex}
                        >
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              mt={1}
                              sx={{
                                p: 1,
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                              }}
                            >
                              <Typography>{`Name: ${client.firstName} ${client.lastName}`}</Typography>
                              <Typography>{`Sex: ${client.sex}`}</Typography>
                              <Typography>{`Age: ${calculateAge(
                                client.birthday
                              )}`}</Typography>
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Paper>
                  )}
                </Droppable>
              ))}
            </DragDropContext>
          </Box>
          <Box mt="20px">
            <Button variant="contained" onClick={handleSaveRooms}>
              Save Room Distribution
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        aria-labelledby="save-dialog-title"
      >
        <DialogTitle id="save-dialog-title">Confirm Save</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save the current room distribution?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmSaveRooms} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientCluster;
