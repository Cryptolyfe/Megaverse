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
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry logic for handling 429 errors
async function handleRateLimitRetry(fn, retryCount = 3, delayTime = 5000) {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            return await fn(); // Attempt the operation
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.warn(`Rate limit hit. Retrying in ${delayTime / 1000} seconds (Attempt ${attempt}/${retryCount})...`);
                await delay(delayTime);
            } else {
                throw error; // If it's not a rate-limit error, rethrow it
            }
        }
    }
    throw new Error('Max retry attempts reached. Aborting.');
}

// Abstracted class for Polyanet, Soloon, and Cometh
class Entity {
    constructor(type, row, column, candidateId) {
        this.type = type;
        this.row = row;
        this.column = column;
        this.candidateId = candidateId;
    }

    // Create an entity (Polyanet, Soloon, Cometh)
    async create(extra = {}) {
        const payload = {
            candidateId: this.candidateId,
            row: this.row,
            column: this.column,
            ...extra,
        };

        const fn = () => axiosInstance.post(`/${this.type}`, payload);

        await handleRateLimitRetry(fn);
        console.log(`${this.type.toUpperCase()} created at (${this.row}, ${this.column})`);
    }

    // Delete an entity
    async delete() {
        const payload = {
            candidateId: this.candidateId,
            row: this.row,
            column: this.column,
        };

        const fn = () => axiosInstance.delete(`/${this.type}`, { data: payload });

        await handleRateLimitRetry(fn);
        console.log(`Deleted ${this.type.toUpperCase()} at (${this.row}, ${this.column})`);
    }
}

// Class to manage the entire grid and goal map
class GoalMap {
    constructor(candidateId) {
        this.candidateId = candidateId;
    }

    // Retrieve the goal map
    async getGoalMap() {
        const fn = () => axiosInstance.get(`/map/${this.candidateId}/goal`);
        const response = await handleRateLimitRetry(fn);
        return response.data.goal;
    }

    // Clear the grid based on the goal map (only delete entities that exist)
    async clearGrid() {
        const goalMap = await this.getGoalMap();
        const numRows = goalMap.length;
        const numColumns = goalMap[0].length;

        console.log('Clearing the grid...');

        for (let row = 0; row < numRows; row++) {
            const isRowAllSpace = goalMap[row].every(item => item === 'SPACE');
            if (isRowAllSpace) {
                console.log(`Skipping entire row ${row} during clearing, as it contains only 'SPACE'`);
                continue;
            }

            for (let column = 0; column < numColumns; column++) {
                const item = goalMap[row][column];

                if (item === 'SPACE') continue; // Skip 'SPACE'

                // Only delete the specific entity that exists at this location
                if (item === 'POLYANET') {
                    const polyanet = new Entity('polyanets', row, column, this.candidateId);
                    await polyanet.delete();
                } else if (item.endsWith('_COMETH')) {
                    const cometh = new Entity('comeths', row, column, this.candidateId);
                    await cometh.delete();
                } else if (item.endsWith('_SOLOON')) {
                    const soloon = new Entity('soloons', row, column, this.candidateId);
                    await soloon.delete();
                }

                await delay(500); // Delay to respect rate limits
            }
        }

        console.log('Grid cleared successfully.');
    }

    // Create the goal map (only create the necessary entity)
    async createGoalMap() {
        const goalMap = await this.getGoalMap();
        const numRows = goalMap.length;
        const numColumns = goalMap[0].length;

        for (let row = 0; row < numRows; row++) {
            const isRowAllSpace = goalMap[row].every(item => item === 'SPACE');
            if (isRowAllSpace) {
                console.log(`Skipping entire row ${row} as it contains only 'SPACE'`);
                continue; // Skip this row
            }

            for (let column = 0; column < numColumns; column++) {
                const item = goalMap[row][column];

                if (item === 'SPACE') continue; // Skip 'SPACE'

                console.log(`Processing item "${item}" at (${row}, ${column})`);

                if (item === 'POLYANET') {
                    const polyanet = new Entity('polyanets', row, column, this.candidateId);
                    await polyanet.create();
                } else if (item.endsWith('_COMETH')) {
                    const direction = item.split('_')[0].toLowerCase();
                    const cometh = new Entity('comeths', row, column, this.candidateId);
                    await cometh.create({ direction });
                } else if (item.endsWith('_SOLOON')) {
                    const color = item.split('_')[0].toLowerCase();
                    const soloon = new Entity('soloons', row, column, this.candidateId);
                    await soloon.create({ color });
                } else {
                    console.warn(`Unknown entity "${item}" at (${row}, ${column})`);
                }

                await delay(500); // Delay to respect rate limits
            }
        }
        console.log('Goal map created successfully.');
    }
}

// Main function to orchestrate the process
async function main() {
    console.log('Starting the process to build the goal map.');

    const goalMapManager = new GoalMap(CANDIDATE_ID);

    // Step 1: Clear existing entities, skipping 'SPACE'
    await goalMapManager.clearGrid();

    // Step 2: Wait to ensure the API's rate limits are reset
    await delay(5000);

    // Step 3: Create the goal map, skipping 'SPACE'
    await goalMapManager.createGoalMap();

    console.log('Process completed successfully.');
}

// Execute the main function
main();
