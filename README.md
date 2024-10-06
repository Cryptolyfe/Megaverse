# Megaverse Grid Manager

## Overview
Megaverse Grid Manager is a Node.js project that automates interactions with the Crossmint API to manage entities within a grid-based system. It clears existing grid entities like **POLYanets**, **SOLoons**, and **comETHs**, and creates new ones based on a predefined goal map retrieved from the API.

## Features
- **Clear Grid**: Removes all existing POLYanets, SOLoons, and comETHs.
- **Populate Grid**: Fills the grid with entities based on the retrieved goal map.
- **Optimized Iteration**: Custom logic to intelligently skip "SPACE" entities during both creation and deletion phases, significantly reducing processing time and improving overall efficiency.
- **Rate Limiting Management**: Handles delays to avoid hitting API rate limits.
- **Retry Logic**: Implements retry mechanisms for handling rate limit errors (HTTP 429).
- **Logging**: Provides logs for progress tracking, including creation and deletion of entities.

## Prerequisites
Ensure you have the following before running the project:
- **Node.js** installed ([Node.js Official Site](https://nodejs.org))
- **npm** installed (comes with Node.js)
- **Candidate ID**

## Installation

### Clone the Repository

```bash
git clone https://github.com/Cryptolyfe/Megaverse_Grid_Manager.git
```
### Navigate to the project directory:

```bash
cd Megaverse_Grid_Manager
```
### Install the dependacies

```bash
npm install
```
## Configuration
### Create a .env file in the root directory of the project:

```bash
touch .env
```
### Add your Candidate ID in the .env file:

```bash
CANDIDATE_ID=your-candidate-id-here
```
## Usage
### The project uses a single script (index.js) to both clear the existing grid and populate it with new entities based on the goal map.

Run the script:

```bash
node index.js
```
### Expected Output:
```
Starting the process to build the goal map.
Clearing the grid...
Skipping entire row 0 during clearing, as it contains only 'SPACE'
Deleted COMETHS at (1, 7)
Deleted POLYANETS at (2, 2)
Deleted POLYANETS at (2, 3)
Deleted COMETHS at (2, 13)
Deleted POLYANETS at (2, 23)
...
Skipping entire row 29 as it contains only 'SPACE'
Goal map created successfully.
Process completed successfully.
```

## The script does the following:
-Clears the grid of all existing entities by deleting POLYanets, SOLoons, and comETHs.<br>
-Introduces a delay to prevent hitting API rate limits.<br>
-Implements retry logic for rate-limiting (HTTP 429) errors.<br>
-Populates the grid with new entities from the goal map retrieved from the API.<br>

![Example Grid](./images/map.png)



## Future Improvements:
### Although the current script works as intended, there are a few areas that can be optimized:

1. Separation of Concerns (Modularization)
Improvement: Separate the functionality into dedicated scripts: 
index.js
utils.js
clear.js: Dedicated to clearing the grid.
create.js: Dedicated to creating the entities.
Why: Modular scripts will improve maintainability and allow for more flexible testing and troubleshooting.

2. Optimize the Rate Limiting Delay
Improvement: Experiment with shorter delays between API calls (currently set at 500ms for deletions and 1000ms for creations) to find the optimal balance between speed and avoiding rate limits.

