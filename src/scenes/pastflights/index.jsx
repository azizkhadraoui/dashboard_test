import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { tokens } from "../../theme";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import app from "../../base.js";
import Header from "../../components/Header";

const PastSessions = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [sessions, setSessions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openActionPopup, setOpenActionPopup] = useState(false);
  const [openFlightsPopup, setOpenFlightsPopup] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    emptySeats: "",
    returnDate: "", // Add returnDate field
    flightCompany: "", // Add flightCompany field
  });

  const [flights, setFlights] = useState([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [editingFlight, setEditingFlight] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore(app);
        const sessionsCollection = collection(db, "sessions");
        const querySnapshot = await getDocs(sessionsCollection);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSessions(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: "title", headerName: "nom", flex: 1 },
    { field: "time", headerName: "de", flex: 1 },
    { field: "date", headerName: "jusqua", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenPopup(params.row)}
        >
          Actions
        </Button>
      ),
    },
  ];

  const handleOpenPopup = (row) => {
    // Check if any popup is already open and close it
    if (openActionPopup || openFlightsPopup) {
      handleClosePopup();
    }

    setSelectedRows([row.id]);
    setOpenActionPopup(true);
    setSelectedTitle(row.title);
  };

  const handleClosePopup = () => {
    setOpenActionPopup(false);
    setOpenFlightsPopup(false);
    setEditingFlight(null);
    setSelectedAction("");
  };

  const handleDelete = async () => {
    try {
      const db = getFirestore(app);
      const sessionsCollection = collection(db, "sessions");

      for (const rowId of selectedRows) {
        const docRef = doc(sessionsCollection, rowId);
        await deleteDoc(docRef);
      }

      const querySnapshot = await getDocs(sessionsCollection);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(data);

      handleClosePopup();
    } catch (error) {
      console.error("Error deleting sessions:", error);
    }
  };

  const handleViewFlights = async () => {
    try {
      const db = getFirestore(app);
      const flightsCollection = collection(db, "flights");
      const querySnapshot = await getDocs(
        query(flightsCollection, where("type", "==", selectedTitle))
      );
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlights(data);
      setOpenFlightsPopup(true);
    } catch (error) {
      console.error("Error fetching flights:", error);
    }
  };

  const handleAddFlights = () => {
    setSelectedAction("add flights");
    setOpenActionPopup(true);
  };

  const handleSaveFlights = async () => {
    try {
      const db = getFirestore(app);
      const flightsCollection = collection(db, "flights");

      const newDocRef = doc(flightsCollection);
      await setDoc(newDocRef, {
        type: selectedTitle,
        date: formData.date,
        empty_seats: formData.emptySeats,
        return_date: formData.returnDate, // Add return_date field
        flight_company: formData.flightCompany, // Add flight_company field
      });

      const updatedQuerySnapshot = await getDocs(flightsCollection);
      const data = updatedQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFlights(data);
      handleClosePopup();
    } catch (error) {
      console.error("Error adding flights:", error);
    }
  };

  const handleOpenEditFlightsPopup = (flight) => {
    setEditingFlight(flight);
    setSelectedAction("edit flights");
    setOpenActionPopup(true);
  };

  const handleEditFlights = async () => {
    try {
      const db = getFirestore(app);
      const flightsCollection = collection(db, "flights");
      const docRef = doc(flightsCollection, editingFlight.id);

      await setDoc(docRef, {
        type: selectedTitle,
        date: formData.date,
        empty_seats: formData.emptySeats,
        return_date: formData.returnDate, // Add return_date field
        flight_company: formData.flightCompany, // Add flight_company field
      });

      const querySnapshot = await getDocs(flightsCollection);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFlights(data);
      handleClosePopup();
    } catch (error) {
      console.error("Error editing flights:", error);
    }
  };

  const handleDeleteFlight = async (flightId) => {
    try {
      const db = getFirestore(app);
      const flightsCollection = collection(db, "flights");
      const docRef = doc(flightsCollection, flightId);
      await deleteDoc(docRef);

      const querySnapshot = await getDocs(flightsCollection);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlights(data);
    } catch (error) {
      console.error("Error deleting flight:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="Past Sessions" subtitle="List of Past Sessions" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={sessions}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          checkboxSelection
          onSelectionModelChange={(selection) =>
            setSelectedRows(selection.selectionModel)
          }
        />
      </Box>

      <Dialog open={openActionPopup} onClose={handleClosePopup}>
        <DialogTitle>Selectionner Action</DialogTitle>
        <DialogContent>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleDelete}
            style={{ marginRight: "8px" }}
          >
            Supprimer
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleViewFlights}
            style={{ marginRight: "8px" }}
          >
            consulter les vols
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleAddFlights}
            style={{ marginRight: "8px" }}
          >
            ajouter une vol
          </Button>
          {selectedAction === "edit flights" && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleOpenEditFlightsPopup(editingFlight)}
              style={{ marginRight: "8px" }}
            >
              changer vole
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup} color="secondary">
            annuler
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openFlightsPopup}
        onClose={handleClosePopup}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>les vols de {selectedTitle}</DialogTitle>
        <DialogContent>
          <ul>
            {flights.map((flight) => (
              <li
                key={flight.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <span>
                    Date: {flight.date} - Capacité: {flight.empty_seats}
                  </span>
                  {flight.return_date && (
                    <span> - Return Date: {flight.return_date}</span>
                  )}
                  {flight.flight_company && (
                    <span> - Flight Company: {flight.flight_company}</span>
                  )}
                </div>
                <div>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleOpenEditFlightsPopup(flight)}
                  >
                    changer
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteFlight(flight.id)}
                  >
                    supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup} color="primary">
            fermer
          </Button>
        </DialogActions>
      </Dialog>

      {(selectedAction === "add flights" ||
        selectedAction === "edit flights") && (
        <Dialog open={openActionPopup} onClose={handleClosePopup}>
          <DialogTitle>
            {selectedAction === "add flights" ? "Add Flights" : "Edit Flights"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Date de vol"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              sx={{ gridColumn: "span 4" }}
            />
            <TextField
              label="Empty Seats"
              type="number"
              fullWidth
              value={formData.emptySeats}
              onChange={(e) =>
                setFormData({ ...formData, emptySeats: e.target.value })
              }
            />
            <TextField
              label="Date de retour"
              type="date"
              fullWidth
              value={formData.returnDate}
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setFormData({ ...formData, returnDate: e.target.value })
              }
              sx={{ gridColumn: "span 4" }}
            />
            <TextField
              label="Flight Company"
              fullWidth
              value={formData.flightCompany}
              onChange={(e) =>
                setFormData({ ...formData, flightCompany: e.target.value })
              }
              sx={{ marginBottom: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={
                selectedAction === "add flights"
                  ? handleSaveFlights
                  : handleEditFlights
              }
            >
              {selectedAction === "add flights" ? "Save" : "Save Changes"}
            </Button>
            <Button onClick={handleClosePopup} color="primary">
              annuler
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PastSessions;
