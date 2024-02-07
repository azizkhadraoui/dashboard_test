import { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from "../../base.js";

const TabsOpen = () => {
    const [value, setValue] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [flights, setFlights] = useState([]);
    const [flightTabIndex, setFlightTabIndex] = useState(0);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    useEffect(() => {
        const db = getFirestore(app);
        const sessionsCollection = collection(db, 'sessions');

        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(sessionsCollection);
                const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
                const flightsCollection = collection(db, 'flights');
                const q = query(flightsCollection, where("type", "==", sessions[value].title));

                try {
                    const querySnapshot = await getDocs(q);
                    const flightsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setFlights(flightsData);
                } catch (error) {
                    console.error("Error fetching flights:", error);
                }
            }
        };

        fetchFlights();
    }, [value, sessions]);

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
        setFlightTabIndex(0); // Reset the flight tab index when main tab changes
    };

    const handleFlightTabChange = (event, newValue) => {
        setFlightTabIndex(newValue);
    };

    return (
        <Box sx={{ padding: '20px', backgroundColor: colors.background }}>
            <Header title="CLIENTS" subtitle="Liste des client" />
            <Paper elevation={3} sx={{ marginTop: 3, padding: '20px', borderRadius: 2 }}>
                <Tabs 
                    value={value} 
                    onChange={handleTabChange} 
                    variant="fullWidth" 
                    indicatorColor="primary" 
                    textColor="primary"
                    // Tab styles here
                >
                    {sessions.map((session, index) => (
                        <Tab key={index} label={session.title} />
                    ))}
                </Tabs>
                <Box sx={{ marginTop: 2 }}>
                    {sessions.map((session, index) => (
                        value === index && (
                            <Box key={index}>
                                <Typography variant="body1" sx={{ margin: '20px 0' }}>
                                    {`Content for ${session.name}`}
                                </Typography>
                                <Tabs 
                                    value={flightTabIndex} 
                                    onChange={handleFlightTabChange} 
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    // Inner Tab styles here
                                >
                                    {flights.map((flight, fIndex) => (
                                        <Tab key={fIndex} label={flight.name} />
                                    ))}
                                </Tabs>
                                {/* Additional content for the flight tabs can be added here */}
                            </Box>
                        )
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

export default TabsOpen;
