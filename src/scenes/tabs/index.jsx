import { Box, Tabs, Tab, Typography } from "@mui/material";
import { useState } from 'react';
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";

const TabsOpen = () => {
    const [value, setValue] = useState(0);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box m="20px">
            <Header
                title="CLIENTS"
                subtitle="Liste des client"
            />
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
                    "& .name-column--cell": {
                        color: colors.greenAccent[300],
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
                <Tabs value={value} onChange={handleChange}>
                    <Tab label="Tab 1" sx={{backgroundColor: value === 0 ? colors.primary[400] : 'transparent', borderRadius: value === 0 ? '0 0 0 0' : '0 0 0 0'}}/>
                    <Tab label="Tab 2" sx={{backgroundColor: value === 1 ? colors.primary[400] : 'transparent', borderRadius: value === 1 ? '0 0 0 0' : '0 0 0 0'}}/>
                    <Tab label="Tab 3" sx={{backgroundColor: value === 2 ? colors.primary[400] : 'transparent', borderRadius: value === 2 ? '0 0 0 0' : '0 0 0 0'}}/>
                </Tabs>
                <Box sx={{backgroundColor: colors.primary[400], minHeight:'300px'}}>
                    {value === 0 && <div>Content for Tab 1</div>}
                    {value === 1 && <div>Content for Tab 2</div>}
                    {value === 2 && <div>Content for Tab 3</div>}
                </Box>
            </Box>
        </Box>
    );
};

export default TabsOpen;