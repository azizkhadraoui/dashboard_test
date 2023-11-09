import { Box, Button, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import AddIcon from "@mui/icons-material/Add";

const FileUpload = ({ onChange }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100px",
        height: "100px",
        border: "2px dashed gray",
        borderRadius: "5px",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="contained-button-file"
        type="file"
        onChange={onChange}
      />
      <label htmlFor="contained-button-file">
        <AddIcon fontSize="large" />
      </label>
    </Box>
  );
};

const AddOffer = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const offerSchema = yup.object().shape({
    startDate: yup.date().required("required"),
    endDate: yup.date().required("required"),
    poster: yup.string().required("required"),
    provider: yup.string().required("required"),
  });

  const initialValues = {
    startDate: null,
    endDate: null,
    poster: "",
    provider: "",
  };

  const handleFormSubmit = async (values) => {
    // Handle form submission here
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box m="20px">
        <Header title="CREATE OFFER" subtitle="Create a New Travel Offer" />

        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={offerSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <DatePicker
                  label="Start Date"
                  value={values.startDate}
                  onChange={(value) => setFieldValue("startDate", value)}
                  renderInput={(params) => <TextField {...params} />}
                  sx={{ gridColumn: "span 2" }}
                />
                <DatePicker
                  label="End Date"
                  value={values.endDate}
                  onChange={(value) => setFieldValue("endDate", value)}
                  renderInput={(params) => <TextField {...params} />}
                  sx={{ gridColumn: "span 2" }}
                />
                <FileUpload
                  onChange={(event) =>
                    setFieldValue("poster", event.currentTarget.files[0])
                  }
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Provider"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.provider}
                  name="provider"
                  error={!!touched.provider && !!errors.provider}
                  helperText={touched.provider && errors.provider}
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Create New Offer
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </LocalizationProvider>
  );
};

export default AddOffer;
