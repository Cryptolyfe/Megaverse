// index.js

require('dotenv').config();
const axios = require('axios');
const pLimit = require('p-limit');
const axiosRetry = require('axios-retry');

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

// Implement retry logic for rate limiting
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount, error) => {
    const retryAfter = error.response && error.response.headers['retry-after'];
    if (retryAfter) {
      return parseInt(retryAfter) * 1000; // Convert seconds to milliseconds
    }
    return axiosRetry.exponentialDelay(retryCount);
  },
  retryCondition: (error) => {
    return error.response && error.response.status === 429;
  },
});

// Function to retrieve the current map from the API
async function getCurrentMap() {
  try {
    const response = await axiosInstance.get(`/map/${CANDIDATE_ID}`);
    return response.data.map;
  } catch (error) {
    console.error('Failed to retrieve current map:', error.message);
    throw error;
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

// Function to create an entity at a specific position
async function createEntity(type, row, column, properties = {}) {
  const payload = {
    candidateId: CANDIDATE_ID,
    row,
    column,
    ...properties,
  };

  try {
    await axiosInstance.post(`/${type}`, payload);
    console.log(`${type} created at (${row}, ${column})`);
  } catch (error) {
    console.error(
      `Failed to create ${type} at (${row}, ${column}):`,
      error.response ? error.response.data : error.message
    );
  }
}

// Function to delete an entity at a specific position
async function deleteEntity(type, row, column) {
  const payload = {
    candidateId: CANDIDATE_ID,
    row,
    column,
  };

  try {
    await axiosInstance.delete(`/${type}`, { data: payload });
    console.log(`${type} deleted at (${row}, ${column})`);
  } catch (error) {
    // Ignore errors; entity might not exist
  }
}

// Main function to create the goal map
async function createGoalMap() {
  const goalMap = await getGoalMap();
  const currentMap = await getCurrentMap();

  const numRows = goalMap.length;
  const numColumns = goalMap[0].length;

  const limit = pLimit(5); // Limit concurrency to 5 simultaneous requests

  const tasks = [];

  for (let row = 0; row < numRows; row++) {
    for (let column = 0; column < numColumns; column++) {
      const goalItem = goalMap[row][column];
      const currentItem = currentMap[row][column];

      // Normalize currentItem and goalItem to 'SPACE' if they are falsy or empty
      const normalizedCurrentItem = currentItem || 'SPACE';
      const normalizedGoalItem = goalItem || 'SPACE';

      if (normalizedCurrentItem === normalizedGoalItem) {
        // No action needed
        continue;
      }

      tasks.push(
        limit(async () => {
          // Delete current entity if it exists and is different from the goal
          if (normalizedCurrentItem !== 'SPACE') {
            let entityType;
            if (normalizedCurrentItem === 'POLYANET') {
              entityType = 'polyanets';
            } else if (normalizedCurrentItem.endsWith('_COMETH')) {
              entityType = 'comeths';
            } else if (normalizedCurrentItem.endsWith('_SOLOON')) {
              entityType = 'soloons';
            }

            if (entityType) {
              await deleteEntity(entityType, row, column);
            }
          }

          // Create the goal entity if it's not SPACE
          if (normalizedGoalItem !== 'SPACE') {
            let entityType;
            let properties = {};

            if (normalizedGoalItem === 'POLYANET') {
              entityType = 'polyanets';
            } else if (normalizedGoalItem.endsWith('_COMETH')) {
              entityType = 'comeths';
              properties.direction = normalizedGoalItem.split('_')[0];
            } else if (normalizedGoalItem.endsWith('_SOLOON')) {
              entityType = 'soloons';
              properties.color = normalizedGoalItem.split('_')[0];
            }

            if (entityType) {
              await createEntity(entityType, row, column, properties);
            }
          }
        })
      );
    }
  }

  // Wait for all tasks to complete
  await Promise.all(tasks);

  console.log('Goal map has been successfully created.');
}

// Execute the main function
createGoalMap();
