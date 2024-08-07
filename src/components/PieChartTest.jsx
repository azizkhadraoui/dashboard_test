import * as React from "react";
import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import app from "../base.js";
import AccordionItem from "./ui/Accordion.jsx";
import FlightsTable from "./ui/FlightsTable.jsx";

export default function PieChartTest() {
  const [sessions, setSessions] = useState([]);
  const [flights, setFlights] = useState([]);
  const [sessionValue, setSessionValue] = useState("");
  const [selectedAccordion, setSelectedAccordion] = useState(null);

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
        const q = query(flightsCollection, where("type", "==", sessionValue));

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

  const handleAccordionClick = (packName) => {
    if (selectedAccordion === packName) {
      setSelectedAccordion(null);
      setSessionValue("");
    } else {
      setSelectedAccordion(packName);
      setSessionValue(packName);
    }
  };

  return (
    <div>
      <ul>
        {sessions.map((session, index) => (
          <AccordionItem
            key={index}
            packName={session.id}
            flights={<FlightsTable rows={flights} />}
            selected={selectedAccordion === session.id}
            onClick={() => handleAccordionClick(session.id)}
            disabled={selectedAccordion && selectedAccordion !== session.id}
          />
        ))}
      </ul>
    </div>
  );
}
