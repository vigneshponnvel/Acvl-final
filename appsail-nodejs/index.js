// const express = require("express");
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import qs from "qs";
import cors from "cors";


dotenv.config();

const app = express();
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;

app.use(cors());
app.use(express.json());

// Set up a route to respond with "Hello World!"
app.get('/', (req, res) => {
  res.send('Hello World!');
});



// Route to fetch data from Zoho Sheets and send it to the client
app.get('/zoho-data', async (req, res) => {
  try {
    const data = await fetchDataFromZohoSheets(process.env.ZOHO_RESOURCE_ID, process.env.ZOHO_WORKSHEET_NAME);
    res.json(data); 
  } catch (error) {
    console.error("Error in /zoho-data:", error);
    res.status(500).send(`Failed to fetch data from Zoho Sheets: ${error.message}`);
  }
});

app.get('/zoho-data/zip-code', async (req, res) => {
  try {
    const data = await fetchZipcodeZohoSheets(process.env.ZOHO_RESOURCE_ID, process.env.ZOHO_WORKSHEET_NAME1);
    res.json(data); 
  } catch (error) {
    console.error("Error in /zoho-data:", error);
    res.status(500).send(`Failed to fetch data from Zoho Sheets: ${error.message}`);
  }
});

app.post('/customer-detail', async (req, res) => {
   try { const { Customer_name, Email, PhoneNumber,row_index,ID,AlternatePhoneNumber,MoveSize,Trailer,SalesAgent,CustomerPickupTime,MoveFrom,MoveTo,
    ConnectionType,MoveCoordinator,CrewLeadContactNumber,CrewAssigned,ToAddress,FromAddress,SpecialInstruction,PackingService,PackingSupplies,
    Storage,LongWalk,Elevator,CountofStairs,DispatchDate,DateDepositPaid,DepositPaid,MethodofPayment,DispatchComments,HeavyItems,DestinationPropertyType,
    OriginPropertyType,StorageLocation,Status,Emailstatus,PickUpTime,GroundTeam,DispatchManager,PaidBy,Invoicelink,
    } = req.body;
    const updates = { 
      'Customer_name': Customer_name,
       'Email': Email, 
       'PhoneNumber': PhoneNumber, 
       'row_index': row_index,
       'ID':ID,
       'AlternatePhoneNumber': AlternatePhoneNumber,
       'MoveSize':MoveSize,
       'Trailer':Trailer,
       'SalesAgent':SalesAgent,
       'CustomerPickupTime':CustomerPickupTime,
       'MoveFrom':MoveFrom,
       'MoveTo':MoveTo,
       'ConnectionType':ConnectionType,
       'FromAddress':FromAddress,
       'ToAddress':ToAddress,
       'CrewAssigned':CrewAssigned,
       'CrewLeadContactNumber':CrewLeadContactNumber,
       'MoveCoordinator':MoveCoordinator,
       'DispatchDate':DispatchDate,
       'CountofStairs':CountofStairs,
       'Elevator':Elevator,
       'LongWalk':LongWalk,
       'Storage':Storage,
       'PackingSupplies':PackingSupplies,
       'PackingService':PackingService,
       'SpecialInstruction':SpecialInstruction,
       'Emailstatus':Emailstatus,
       'Status':Status,
       'StorageLocation':StorageLocation,
       'OriginPropertyType':OriginPropertyType,
       'DestinationPropertyType':DestinationPropertyType,
       'HeavyItems':HeavyItems,
       'DispatchComments':DispatchComments,
       'MethodofPayment':MethodofPayment,
       'DepositPaid':DepositPaid,
       'DateDepositPaid':DateDepositPaid,
       'PaidBy':PaidBy,
      'DispatchManager':DispatchManager,
      'GroundTeam':GroundTeam,
      'PickUpTime':PickUpTime,
      'Invoicelink':Invoicelink
       
       }; 
       console.log(updates)

       const data = await updateZohoSheet(updates);
        res.json(data); // Use res.json to send JSON data 
        } catch (error)
         { 
          console.error("Error in /customer-detail:", error);
           res.status(500).send(`Failed to update data in Zoho Sheets: ${error.message}`);
           } 
          });

// Start the Express server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`http://localhost:${port}/`);
});


// Access token management
let accessToken = null;
let accessTokenTimestamp = null;

const getAccessToken = async () => {
  if (accessToken && (Date.now() - accessTokenTimestamp) < 3500000) {
    return accessToken;
  }
  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    });
    accessToken = response.data.access_token;
    accessTokenTimestamp = Date.now();
    return accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error.response ? JSON.stringify(error.response.data) : error.message);
    throw new Error(`Error refreshing access token: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
  }
};

// Function to fetch data from Zoho Sheets
const fetchDataFromZohoSheets = async (fileResourceID, sheetName) => {
  try {
    const accessToken = await getAccessToken();
    const endpointURL = `https://sheet.zoho.com/api/v2/${fileResourceID}`;
    const headers = {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const data = {
      worksheet_name: sheetName,
      method: 'worksheet.records.fetch',
      is_case_sensitive: false
    };

    const response = await axios.post(endpointURL, qs.stringify(data), { headers: headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Zoho Sheets:', error.response ? JSON.stringify(error.response.data) : error.message);
    throw new Error(`Error fetching data from Zoho Sheets: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
  }
};
//forzip code
const fetchZipcodeZohoSheets = async (fileResourceID, sheetName) => {
  try {
    const accessToken = await getAccessToken();
    const endpointURL = `https://sheet.zoho.com/api/v2/${fileResourceID}`;
    const headers = {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const data = {
      worksheet_name: sheetName,
      method: 'worksheet.records.fetch',
      is_case_sensitive: false
    };

    const response = await axios.post(endpointURL, qs.stringify(data), { headers: headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Zoho Sheets:', error.response ? JSON.stringify(error.response.data) : error.message);
    throw new Error(`Error fetching data from Zoho Sheets: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
  }
};
//GET THE CORRECT ROW AND UPDATE THE SHEET WITH THE UPDATES RECEIVED
async function updateZohoSheet(updates){
  try {
      const accessToken = await getAccessToken();
      const endpointURL = `https://sheet.zoho.com/api/v2/${process.env.ZOHO_RESOURCE_ID}`;
      const headers = {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'  // This is important for POST requests with x-www-form-urlencoded data.
      };
      const data = {
          worksheet_name: process.env.ZOHO_WORKSHEET_NAME,
          method: 'range.content.get',
          start_row: 1,
          start_column: 1,
          end_row: 5000, // Adjust the row range as needed
          end_column: 1   
      };

      // Here, the qs.stringify method is used to serialize the data object.
      const response = await axios.post(endpointURL, qs.stringify(data), { headers: headers });
     let foundRow = null;
    //  console.log(response.data)      
    //  console.log(response.data.range_details)
    //  console.log(response.data.range_details.row_details[0])
     response.data.range_details.forEach(detail => {
      // console.log(detail.row_details[0].content)
      // console.log(updates.ID)
      if (detail.row_index === updates.row_index) {
        // console.log("jasjfn")
          foundRow = detail.row_index; // The row_index is given in the data
          console.log(foundRow)
         }
     });

     if (foundRow === null) {
         throw new Error('Lead ID not found');
     }

     const updatePayload = Object.keys(updates).map(key => {
      if (key === 'ID') {
          return null; // Skip the "LEAD_ID" entry
      }
      // Define a mapping of keys to column numbers
      const columnMapping = {
          'ID':1,
          'MoveSize':2,
          'Trailer':3,
          'SalesAgent':4,
          'Bookeddate':5,
          'MoveDate':6,
          'CustomerPickupTime':7,
          'Banner':8,
          'INVOICE':9,
          'MoveFrom':10,
          'MoveTo':11,
          'ConnectionType':12,
          'FromAddress':13,
          'ToAddress':14,
          'Coordinates_Origin':15,
          'Coordinates_Destn':16,
          'Customer_name':17,
          'PhoneNumber':18,
          'AlternatePhoneNumber':19,
          'Email':20,
          'CrewAssigned':21,
          'CrewLeadContactNumber':22,
          'MoveCoordinator':23,
          'DispatchDate':24,
          'CountofStairs':25,
          'Elevator':26,
          'LongWalk':27,
          'Storage':28,
          'PackingSupplies':29,
          'PackingService':30,
          'SpecialInstruction':31,
          'Emailstatus':32,
          'Status':33,
          'StorageLocation':34,
          'OriginPropertyType':35,
          'DestinationPropertyType':36,
          'HeavyItems':37,
          'DispatchComments':38,
          'MethodofPayment':39,
          'DepositPaid':40,
          'DateDepositPaid':41,
          'PaidBy':42,
          'DispatchManager':43,
          'GroundTeam':44,    
          'PickUpTime':45,
          'Invoicelink':46
      };
  
      return {
          worksheet_id: '0#',
          content: updates[key],
          row: foundRow,
          column: columnMapping[key]
      };
  }).filter(item => item !== null && item.column); 

    // Make an API call to update the cells
    const updateresponse = await axios.post(
      `https://sheet.zoho.com/api/v2/${process.env.ZOHO_RESOURCE_ID}?method=cells.content.set`,
      qs.stringify({ data: JSON.stringify(updatePayload) }), 
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    // console.log(updateresponse)
    
  } catch (error) {
      console.error('Error fetching data from Sheets:', error.response ? error.response.data : error.message);
      throw error;
  }
}




// return {
//   worksheet_id: '0#', // Adjust the worksheet ID if necessary
//   content: updates[key],
//   row: foundRow,
//   column: columnMapping[key]
// };
// }).filter(item => item !== null && item.column); // Filter out null items and any items that don't have a corresponding column

// // Make an API call to update the cells
// const updateresponse = await axios.post(
// https://sheet.zoho.com/api/v2/${process.env.ZOHO_RESOURCE_ID}?method=cells.content.set,
// qs.stringify({ data: JSON.stringify(updatePayload) }), // Send data as a URL-encoded string
// {
// headers: {
//   'Authorization': Zoho-oauthtoken ${accessToken},
//   'Content-Type': 'application/x-www-form-urlencoded'
// }
// }
// );
// //console.log(updateresponse.data);
// } catch (error) {
// console.error('Error fetching data from Sheets:', error.response ? error.response.data : error.message);
// throw error;
// }
// }https://appsail-10083401023.development.catalystappsail.com
// Route to update data from Zoho Sheets and send it to the client
// app.put('/zoho-data/update', async (req, res) => {
//   try {
//     const data = await updateZohoSheet(process.env.ZOHO_RESOURCE_ID, process.env.ZOHO_WORKSHEET_NAME);
//     res.json(data); // Use res.json to send JSON data
//   } catch (error) {
//     console.error("Error in /zoho-data:", error);
//     res.status(500).send(`Failed to fetch data from Zoho Sheets: ${error.message}`);
//   }
// });

// app.put('/zoho-data/update', async (req, res) => {
//   try {
//     const data = await updateZohoSheet(process.env.ZOHO_RESOURCE_ID, process.env.ZOHO_WORKSHEET_NAME);
//     res.json(data); // Use res.json to send JSON data
//   } catch (error) {
//     console.error("Error in /zoho-data:", error);
//     res.status(500).send(`Failed to update data in Zoho Sheets: ${error.message}`);
//   }
// });

// this code is used to get the deatils from the frentend 
// app.post('/customer-detail', (req, res) => {
//   const { Customer_name, Email, PhoneNumber, alternatePhoneNumber } = req.body;

//   // Simple validation (you can expand this as needed)
//   if (!Customer_name || !Email || !PhoneNumber) {
//       return res.status(400).json({ message: 'customerName, email, and phoneNumber are required' });
//   }

//   // Process the data (for demonstration, we will just log it and send a response)
//   console.log('Received customer data:', req.body);

//   // Send a response back to the client
//   res.status(200).json({ message: 'Customer data received successfully', data: req.body });
// });
// this code is used to get the deatils from the frentend //





// import Express from "express";
// const app = Express();
// const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;

// app.get('/', (req, res) => {
//   res.send('/Backend/index.js')
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
//   console.log(`http://localhost:${port}/`);
// });
