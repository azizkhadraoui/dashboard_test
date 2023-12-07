import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import AddIcon from "@mui/icons-material/Add";
import { getFirestore, collection, setDoc,doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import app from "../../base.js";
import React, { useState } from "react";

const storage = getStorage(app);
const firestore = getFirestore(app);

const FileUpload = ({ setFieldValue }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);

      setFieldValue("poster", file);
    }
  };

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
        onChange={handleFileChange}
      />
      {selectedImage ? (
        <img
          src={selectedImage}
          alt="Selected"
          style={{ width: "100%", height: "100%", borderRadius: "5px" }}
        />
      ) : (
        <label htmlFor="contained-button-file">
          <AddIcon fontSize="large" />
        </label>
      )}
    </Box>
  );
};

const AddOffer = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const offerSchema = yup.object().shape({
    price: yup.string().required("Price is required"),
    date: yup.date().required("Date is required"),
    time: yup.string().required("Time is required"),
    title: yup.string().required("Title is required"),
  });

  const initialValues = {
    startDate: null,
    endDate: null,
    price: "",
    date: null,
    time: "",
    title: "",
    poster: null,
  };

  const handleFormSubmit = async (values) => {
    console.log("Form submitted:", values);
    const { price, date, time, title, poster } = values;

    try {
      const storageRef = ref(storage, `offers/${title}.jpg`);
      const posterSnapshot = await uploadBytes(storageRef, poster);

      const sessionData = {
        price,
        date,
        time,
        title,
      };

      const collectionRef = collection(firestore, 'sessions'); // reference to the "sessions" collection
      const documentRef = doc(collectionRef, title);
      await setDoc(documentRef, sessionData);

      console.log("Data added to Firestore successfully!");
    } catch (error) {
      console.error("Error adding data to Firestore:", error);
    }
  };

  return (
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
              <FileUpload setFieldValue={setFieldValue} />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Prix"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.price}
                name="price"
                error={!!touched.price && !!errors.price}
                helperText={touched.price && errors.price}
                sx={{ gridColumn: "span 4" }}
              />
              
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="De"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.time}
                name="time"
                error={!!touched.time && !!errors.time}
                helperText={touched.time && errors.time}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Jusqu'a"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.date || ""}
                name="date"
                error={!!touched.date && !!errors.date}
                helperText={touched.date && errors.date}
                sx={{ gridColumn: "span 4" }}
              />
              
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Titre"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.title}
                name="title"
                error={!!touched.title && !!errors.title}
                helperText={touched.title && errors.title}
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
  );
};

export default AddOffer;
