const express = require("express");
const path = require("path");

const app = express();

// servir le dossier dist
app.use(express.static(path.join(__dirname, "dist")));

// toutes les routes vers index.html (SPA Vue)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
