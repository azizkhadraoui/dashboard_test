import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import app from "../../base.js";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const firestore = getFirestore(app);

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = await getDocs(collection(firestore, "flights"));
        const eventsData = eventsCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          start: new Date(doc.data().date), // Convert date string to Date object
          end: new Date(doc.data().return_date),
          title:doc.data().type // Convert date string to Date object
        }));
        //console.log(eventsData);
        setCurrentEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events from Firestore:", error);
      }
    };

    fetchEvents();
  }, [firestore]);

  const handleDateClick = async (selected) => {
    const type = prompt("Please enter a type for your event");
    

    if (type) {
      const eventToAdd = {
        title: type, // Use the "type" field as the event name
        start: selected.start,
        end: selected.end,
        allDay: selected.allDay,
      };
      

      try {
        const addedEventRef = await setDoc(doc(firestore, "flights"), eventToAdd);
        setCurrentEvents([...currentEvents, { id: addedEventRef.id, ...eventToAdd }]);
      } catch (error) {
        console.error("Error adding event to Firestore:", error);
      }
    }
  };

  const handleEventClick = async (selected) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${selected.event.title}'`
      )
    ) {
      try {
        await setDoc(doc(firestore, "flights", selected.event.id), { deleted: true }, { merge: true });
        setCurrentEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== selected.event.id)
        );
      } catch (error) {
        console.error("Error deleting event from Firestore:", error);
      }
    }
  };

  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="Full Calendar Interactive Page" />

      <Box display="flex" justifyContent="space-between">
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5">Events</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  margin: "10px 0",
                  borderRadius: "2px",
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography>
                      {formatDate(event.start)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            events={currentEvents}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
