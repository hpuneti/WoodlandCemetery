// instruction source: https://www.youtube.com/watch?v=PFJNJQCU_lo
// dependencies
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

// create app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// functions
async function getData(sheetName) {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
  });

  // create client instance for auth
  const client = await auth.getClient();

  // instance of google sheets api
  const googleSheets = google.sheets({
    version: "v4",
    auth: client
  });

  const spreadsheetId = "1TMlB6OfVMGAKSmMoX_FL42b7g6ai8y7C_q0lcAxr-1E";

  // get rows of spreadsheets
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetName
  });

  const data = getRows.data.values;

  return data;
}

// routes
app.get("/data/regular_lots", async (req, res) => {
  const data = await getData("All Lots 12-11-21 by name");
  const json = [];

  for (let i = 1; i < data.length; i++) {
    json.push([
      data[i][5],
      data[i][6],
      data[i][4],
      data[i][7],
      data[i][0],
      data[i][1],
      data[i][2],
      data[i][8],
      data[i][9],
      data[i][12],
      data[i][13]
    ]);
  }
  
  res.json(json);
});

app.get("/data/single_graves", async (req, res) => {
  const data = await getData("All SGA 6-5-22");
  const json = [];

  for (let i = 1; i < data.length; i++) {
    json.push([
      data[i][3],
      data[i][4],
      data[i][2],
      data[i][5],
      data[i][0],
      data[i][1],
      data[i][6],
      data[i][7],
      data[i][10],
      data[i][11]
    ]);
  }
  
  res.json(json);
});

app.post("/data/admin_notes", async (req, res) => {
  const mySecret = process.env['USER_AUTHENTICATION_PASSWORD'];
  if (req.body.password === mySecret) {
    let returnData = {
      msg: "valid password",
      notes: {
        main: [],
        sga: []
      }
    };

    // main grave data
    const data = await getData("All Lots 12-11-21 by name");
    
    for (let i = 1; i < data.length; i++) {
      returnData.notes.main.push(data[i][10]);
    }

    // single grave data
    data = await getData("All SGA 6-5-22");
    
    for (let i = 1; i < data.length; i++) {
      returnData.notes.sga.push(data[i][8]);
    }

    // send data
    res.json(returnData);
  } else {
    res.json({
      msg: "invalid password"
    });
  }
});

// init app
const port = 3001;
app.listen(port, () => console.log(`Server listening on port ${port}.`));