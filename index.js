// index.js

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://challenge.crossmint.io/api';
const CANDIDATE_ID = process.env.CANDIDATE_ID;

// Create an Axios instance with default headers
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Utility function to introduce delays
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to delete an entity at a specific position
async function deleteEntity(row, column) {
  const payload = {
    candidateId: CANDIDATE_ID,
    row,
    column,
  };

  try {
    // Attempt to delete POLYanet
    await axiosInstance.delete('/polyanets', { data: payload });
    console.log(`Deleted POLYanet at (${row}, ${column})`);
  } catch (error) {
    // Ignore errors; entity might not exist
  }

  try {
    // Attempt to delete SOLoon
    await axiosInstance.delete('/soloons', { data: payload });
    console.log(`Deleted SOLoon at (${row}, ${column})`);
  } catch (error) {
    // Ignore errors; entity might not exist
  }

  try {
    // Attempt to delete comETH
    await axiosInstance.delete('/comeths', { data: payload });
    console.log(`Deleted comETH at (${row}, ${column})`);
  } catch (error) {
    // Ignore errors; entity might not exist
  }
}

// Function to clear all existing entities from the grid
async function clearGrid() {
  const GRID_SIZE = 31; // Adjust according to the actual grid size
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let column = 0; column < GRID_SIZE; column++) {
      await deleteEntity(row, column);
      await delay(500); // Adjust delay as needed
    }
  }
  console.log('All existing entities have been deleted.');
}

// Function to create a POLYanet at a specific position
async function createPolyanet(row, column) {
  const payload = {
    candidateId: CANDIDATE_ID,
    row,
    column,
  };

  try {
    await axiosInstance.post('/polyanets', payload);
    console.log(`POLYanet created at (${row}, ${column})`);
  } catch (error) {
    console.error(
      `Failed to create POLYanet at (${row}, ${column}):`,
      error.response ? error.response.data : error.message
    );
  }
}

// Function to create a SOLoon at a specific position with a given color
async function createSoloon(row, column, color) {
  color = color.toLowerCase(); // Convert color to lowercase
  console.log(`Attempting to create SOLoon (${color}) at (${row}, ${column})`);
  const payload = {
    candidateId: CANDIDATE_ID,
    row,
    column,
    color, // Use the lowercase color value
  };

  try {
    await axiosInstance.post('/soloons', payload);
    console.log(`SOLoon (${color}) created at (${row}, ${column})`);
  } catch (error) {
    console.error(
      `Failed to create SOLoon at (${row}, ${column}):`,
      error.response ? error.response.data : error.message
    );
  }
}

// Function to create a comETH at a specific position with a given direction
async function createCometh(row, column, direction) {
  direction = direction.toLowerCase(); // Convert direction to lowercase
  console.log(`Attempting to create comETH (${direction}) at (${row}, ${column})`);
  const payload = {
    candidateId: CANDIDATE_ID,
    row,
    column,
    direction, // Use the lowercase direction value
  };

  try {
    await axiosInstance.post('/comeths', payload);
    console.log(`comETH (${direction}) created at (${row}, ${column})`);
  } catch (error) {
    console.error(
      `Failed to create comETH at (${row}, ${column}):`,
      error.response ? error.response.data : error.message
    );
  }
}

// Function to retrieve the goal map from the API
async function getGoalMap() {
  try {
    const response = await axiosInstance.get(`/map/${CANDIDATE_ID}/goal`);
    return response.data.goal;
  } catch (error) {
    console.error('Failed to retrieve goal map:', error.message);
    throw error;
  }
}

// Function to create the goal map based on the retrieved data
async function createGoalMap() {
  const goalMap = await getGoalMap();
  const numRows = goalMap.length;
  const numColumns = goalMap[0].length;

  for (let row = 0; row < numRows; row++) {
    for (let column = 0; column < numColumns; column++) {
      const item = goalMap[row][column];
      console.log(`Processing item "${item}" at (${row}, ${column})`);

      switch (item) {
        case 'POLYANET':
          await createPolyanet(row, column);
          break;
        case 'SPACE':
          // Do nothing for empty space
          break;
        default:
          if (item.endsWith('_COMETH')) {
            const direction = item.split('_')[0];
            await createCometh(row, column, direction);
          } else if (item.endsWith('_SOLOON')) {
            const color = item.split('_')[0];
            await createSoloon(row, column, color);
          } else {
            console.warn(`Unknown entity "${item}" at (${row}, ${column})`);
          }
          break;
      }

      await delay(1000); // Adjust delay as needed to handle rate limiting
    }
  }
  console.log('Goal map has been successfully created.');
}

// Main function to orchestrate the process
async function main() {
  console.log('Starting the process to build the goal map.');

  // Step 1: Clear existing entities (optional but recommended)
  await clearGrid();

  // Step 2: Wait to ensure the API's rate limits are reset
  await delay(5000);

  // Step 3: Create the goal map
  await createGoalMap();

  console.log('Process completed successfully.');
}

// Execute the main function
main();
