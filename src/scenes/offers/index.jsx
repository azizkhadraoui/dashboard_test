import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import AddIcon from "@mui/icons-material/Add";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import app from "../../base.js";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';


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
    singlePrice: yup.string().required("Single Price is required"),
    doublePrice: yup.string().required("Double Price is required"),
    roomPrice: yup.string().required("Room Price is required"),
    roomOfFourPrice: yup.string().required("Room of Four Price is required"),
    familyOfFourPrice: yup.string().required("Family of Four Price is required"),
    date: yup.date().required("Date is required"),
    time: yup.string().required("Time is required"),
    title: yup.string().required("Title is required"),
  });

  const initialValues = {
    singlePrice: "",
    doublePrice: "",
    roomPrice: "",
    roomOfFourPrice: "",
    familyOfFourPrice: "",
    date: null,
    time: "",
    title: "",
    poster: null,
  };

  const handleFormSubmit = async (values) => {
    const { singlePrice, doublePrice, roomPrice, roomOfFourPrice, familyOfFourPrice, date, time, title, poster } = values;

    try {
            const storageRef = ref(storage, `offers/${title}.jpg`);
            await uploadBytes(storageRef, poster);
      
            const formattedDate1 = moment(date).format("DD-MM-YYYY");
            const formattedDate2 = moment(time).format("DD-MM-YYYY");
      
            const sessionData = {
              date: formattedDate1,
              time: formattedDate2,
              title,
            };

      const collectionRef = collection(firestore, 'sessions');
      const documentRef = doc(collectionRef, title);
      await setDoc(documentRef, sessionData);

      const roomsData = {
        single: [singlePrice.toString(), "1"],
        double: [doublePrice.toString(), "2"],
        "room of 3": [roomPrice.toString(), "3"],
        "room of 4": [roomOfFourPrice.toString(), "1"],
        "family of 4": [familyOfFourPrice.toString(), "4"],
      };

      const roomsCollectionRef = collection(documentRef, 'rooms');
      await setDoc(doc(roomsCollectionRef, 'roomTypes'), roomsData);

      toast.success("offre bien ete ajoutee");
    } catch (error) {
      toast.error("Error adding offer: " + error.message);
    }
  };

  return (
    <Box m="20px">
      <Header title="Ajouter un offre" subtitle="cree un nouveau offre" />
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
                label="prix de chambre single"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.singlePrice}
                name="singlePrice"
                error={!!touched.singlePrice && !!errors.singlePrice}
                helperText={touched.singlePrice && errors.singlePrice}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="prix de chmbre double"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.doublePrice}
                name="doublePrice"
                error={!!touched.doublePrice && !!errors.doublePrice}
                helperText={touched.doublePrice && errors.doublePrice}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="prix chambre a 3"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.roomPrice}
                name="roomPrice"
                error={!!touched.roomPrice && !!errors.roomPrice}
                helperText={touched.roomPrice && errors.roomPrice}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="prix chambre a 4"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.roomOfFourPrice}
                name="roomOfFourPrice"
                error={!!touched.roomOfFourPrice && !!errors.roomOfFourPrice}
                helperText={touched.roomOfFourPrice && errors.roomOfFourPrice}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="prix famille de 4"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.familyOfFourPrice}
                name="familyOfFourPrice"
                error={!!touched.familyOfFourPrice && !!errors.familyOfFourPrice}
                helperText={touched.familyOfFourPrice && errors.familyOfFourPrice}
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
                Ajouter un nouveau offre
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <ToastContainer />
    </Box>
  );
};

export default AddOffer;
//import React, { useState } from "react";
// import { Box, Button, TextField } from "@mui/material";
// import { Formik } from "formik";
// import * as yup from "yup";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import Header from "../../components/Header";
// import AddIcon from "@mui/icons-material/Add";
// import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
// import { getStorage, ref, uploadBytes } from "firebase/storage";
// import app from "../../base.js";
// import { ToastContainer, toast } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
// import moment from 'moment';

// const storage = getStorage(app);
// const firestore = getFirestore(app);

// const FileUpload = ({ setFieldValue }) => {
//   const [selectedImage, setSelectedImage] = useState(null);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];

//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setSelectedImage(reader.result);
//       };
//       reader.readAsDataURL(file);

//       setFieldValue("poster", file);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         width: "100px",
//         height: "100px",
//         border: "2px dashed gray",
//         borderRadius: "5px",
//         cursor: "pointer",
//         position: "relative",
//       }}
//     >
//       <input
//         accept="image/*"
//         style={{ display: "none" }}
//         id="contained-button-file"
//         type="file"
//         onChange={handleFileChange}
//       />
//       {selectedImage ? (
//         <img
//           src={selectedImage}
//           alt="Selected"
//           style={{ width: "100%", height: "100%", borderRadius: "5px" }}
//         />
//       ) : (
//         <label htmlFor="contained-button-file">
//           <AddIcon fontSize="large" />
//         </label>
//       )}
//     </Box>
//   );
// };

// const AddOffer = () => {
//   const isNonMobile = useMediaQuery("(min-width:600px)");

//   const offerSchema = yup.object().shape({
//     singlePrice: yup.string().required("Single Price is required"),
//     doublePrice: yup.string().required("Double Price is required"),
//     roomPrice: yup.string().required("Room Price is required"),
//     roomOfFourPrice: yup.string().required("Room of Four Price is required"),
//     familyOfFourPrice: yup.string().required("Family of Four Price is required"),
//     date: yup.date().required("Date is required"),
//     time: yup.date().required("Date is required"),
//     title: yup.string().required("Title is required"),
//   });

//   const initialValues = {
//     singlePrice: "",
//     doublePrice: "",
//     roomPrice: "",
//     roomOfFourPrice: "",
//     familyOfFourPrice: "",
//     date: null,
//     time: "",
//     title: "",
//     poster: null,
//   };

//   const handleFormSubmit = async (values) => {
//     const { singlePrice, doublePrice, roomPrice, roomOfFourPrice, familyOfFourPrice, date, time, title, poster } = values;

//     try {
//       const storageRef = ref(storage, `offers/${title}.jpg`);
//       await uploadBytes(storageRef, poster);

//       const formattedDate1 = moment(date).format("DD-MM-YYYY");
//       const formattedDate2 = moment(time).format("DD-MM-YYYY");

//       const sessionData = {
//         date: formattedDate1,
//         time: formattedDate2,
//         title,
//       };

//       const collectionRef = collection(firestore, 'sessions');
//       const documentRef = doc(collectionRef, title);
//       await setDoc(documentRef, sessionData);

//       const roomsData = {
//         single: [singlePrice.toString(), "1"],
//         double: [doublePrice.toString(), "2"],
//         "room of 3": [roomPrice.toString(), "3"],
//         "room of 4": [roomOfFourPrice.toString(), "1"],
//         "family of 4": [familyOfFourPrice.toString(), "4"],
//       };

//       const roomsCollectionRef = collection(documentRef, 'rooms');
//       await setDoc(doc(roomsCollectionRef, 'roomTypes'), roomsData);

//       toast.success("Offer successfully added!");
//     } catch (error) {
//       toast.error("Error adding offer: " + error.message);
//     }
//   };

//   return (
//     <Box m="20px">
//       <Header title="Ajouter un offre" subtitle="cree un nouveau offre" />
//       <Formik
//         onSubmit={handleFormSubmit}
//         initialValues={initialValues}
//         validationSchema={offerSchema}
//       >
//         {({
//           values,
//           errors,
//           touched,
//           handleBlur,
//           handleChange,
//           handleSubmit,
//           setFieldValue,
//         }) => (
//           <form onSubmit={handleSubmit}>
//             <Box
//               display="grid"
//               gap="30px"
//               gridTemplateColumns="repeat(4, minmax(0, 1fr))"
//               sx={{
//                 "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
//               }}
//             >
//               <FileUpload setFieldValue={setFieldValue} />
//               <TextField
//                 fullWidth
//                 variant="filled"
//                 type="text"
//                 label="prix de chambre single"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.singlePrice}
//                 name="singlePrice"
//                 error={!!touched.singlePrice && !!errors.singlePrice}
//                 helperText={touched.singlePrice && errors.singlePrice}
//                 sx={{ gridColumn: "span 4" }}
//               />
//               <TextField
//                 fullWidth
//                 variant="filled"
//                 type="text"
//                 label="prix de chmbre double"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.doublePrice}
//                 name="doublePrice"
//                 error={!!touched.doublePrice && !!errors.doublePrice}
//                 helperText={touched.doublePrice && errors.doublePrice}
//                 sx={{ gridColumn: "span 4" }}
//               />
//               <TextField
//                 fullWidth
//                 variant="filled"
//                 type="text"
//                 label="prix chambre a 3"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.roomPrice}
//                 name="roomPrice"
//                 error={!!touched.roomPrice && !!errors.roomPrice}
//                 helperText={touched.roomPrice && errors.roomPrice}
//                 sx={{ gridColumn: "span 4" }}
//               />
//               <TextField
//                 fullWidth
//                 variant="filled"
//                 type="text"
//                 label="prix chambre a 4"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.roomOfFourPrice}
//                 name="roomOfFourPrice"
//                 error={!!touched.roomOfFourPrice && !!errors.roomOfFourPrice}
//                 helperText={touched.roomOfFourPrice && errors.roomOfFourPrice}
//                 sx={{ gridColumn: "span 4" }}
//               />
//               <TextField
//                 fullWidth
//                 variant="filled"
//                 type="text"
//                 label="prix famille de 4"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.familyOfFourPrice}
//                 name="familyOfFourPrice"
//                 error={!!touched.familyOfFourPrice && !!errors.familyOfFourPrice}
//                 helperText={touched.familyOfFourPrice && errors.familyOfFourPrice}
//                 sx={{ gridColumn: "span 4" }}
//               />
//               <TextField
//                 fullWidth
//                 variant="filled"
//                 type="date"
//                 label="De"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.time ? moment(values.time).format("YYYY-MM-DD") : ""}
//                 name="de"
//                 error={!!touched.date && !!errors.date}
//                 helperText={touched.date && errors.date}
//                 sx={{ gridColumn: "span 4" }}
//               />
//               <TextField
//                 fullWidth
//                 variant="filled"
//                 type="date"
//                 label="Jusqu'a"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.date ? moment(values.date).format("YYYY-MM-DD") : ""}
//                 name="date"
//                 error={!!touched.date && !!errors.date}
//                 helperText={touched.date && errors.date}
//                 sx={{ gridColumn: "span 4" }}
//               />
//               <TextField
//                 fullWidth
//                 variant="filled"
//                 type="text"
//                 label="Titre"
//                 onBlur={handleBlur}
//                 onChange={handleChange}
//                 value={values.title}
//                 name="title"
//                 error={!!touched.title && !!errors.title}
//                 helperText={touched.title && errors.title}
//                 sx={{ gridColumn: "span 4" }}
//               />
//             </Box>
//             <Box display="flex" justifyContent="end" mt="20px">
//               <Button type="submit" color="secondary" variant="contained">
//                 Ajouter un nouveau offre
//               </Button>
//             </Box>
//           </form>
//         )}
//       </Formik>
//       <ToastContainer />
//     </Box>
//   );
// };

// export default AddOffer;

