const listUsers = require('./firebaseUsers');
const cors = require('cors');


const express = require('express');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;


app.get('/api/getUserEmails', async (req, res) => {
  try {
    const userEmails = await listUsers();
    res.json(userEmails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
