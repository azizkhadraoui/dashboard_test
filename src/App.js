import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"; 
import { AuthProvider } from "./Auth";
import PrivateRoute from "./PrivateRoute";
import { ColorModeContext, useMode } from "./theme.js";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Topbar } from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard";
import Sidebar from "./scenes/global/Sidebar";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import Invoices from "./scenes/invoices";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar";
import Profile from "./scenes/profile/index.jsx";
import PastFlights from "./scenes/pastflights/index.jsx";
import AddOffer from "./scenes/offers/index.jsx";
import Login from "./scenes/login";


function App() {
  const [theme, colorMode] = useMode();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  // Determine whether to show the top and sidebar based on the current path
  const showTopbarAndSidebar = currentPath !== "/login";

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {showTopbarAndSidebar && <Sidebar />}
            <main className={currentPath === "/login" ? "content centered-content" : "content"}>
              {showTopbarAndSidebar && <Topbar />}
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="team" element={<PrivateRoute><Team /></PrivateRoute>} />
                <Route path="contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
                <Route path="invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
                <Route path="bar" element={<PrivateRoute><Bar /></PrivateRoute>} />
                <Route path="form" element={<PrivateRoute><Form /></PrivateRoute>} />
                <Route path="line" element={<PrivateRoute><Line /></PrivateRoute>} />
                <Route path="pie" element={<PrivateRoute><Pie /></PrivateRoute>} />
                <Route path="faq" element={<PrivateRoute><FAQ /></PrivateRoute>} />
                <Route path="calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
                <Route path="geography" element={<PrivateRoute><Geography /></PrivateRoute>} />
                <Route
                  path="profile/:id"
                  element={<PrivateRoute><Profile /></PrivateRoute>}
                />
                <Route
                  path="pastflights"
                  element={<PrivateRoute><PastFlights /></PrivateRoute>}
                />
                <Route
                  path="addoffer"
                  element={<PrivateRoute><AddOffer /></PrivateRoute>}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;

