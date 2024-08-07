import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function AccordionItem({ packName, flights, selected, onClick, disabled }) {
  return (
    <Accordion expanded={selected} onChange={onClick} disabled={disabled}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        {packName}
      </AccordionSummary>
      <AccordionDetails>{flights}</AccordionDetails>
    </Accordion>
  );
}

export default AccordionItem;
