# Megaverse Grid Manager

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Future Improvements](#future-improvements)
- [Repository Structure](#repository-structure)

## Overview
Megaverse Grid Manager is a Node.js project that automates interactions with the Crossmint API to manage entities within a grid-based system. It clears existing grid entities like **POLYanets**, **SOLoons**, and **comETHs**, and creates new ones based on a predefined goal map retrieved from the API.

## Features
- **Clear Grid**: Removes all existing POLYanets, SOLoons, and comETHs.
- **Populate Grid**: Fills the grid with entities based on the retrieved goal map.
- **Rate Limiting Management**: Handles delays to avoid hitting Crossmint API's rate limits.
- **Logging**: Provides logs for progress tracking, including creation and deletion of entities.

## Prerequisites
Ensure you have the following before running the project:
- **Node.js** installed ([Node.js Official Site](https://nodejs.org))
- **npm** installed (comes with Node.js)
- **Crossmint API Candidate ID**

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
Starting the process to build the goal map.
Deleted POLYanet at (0, 0)
...
POLYanet created at (5, 10)
Attempting to create SOLoon (red) at (6, 12)
...
Goal map has been successfully created.
Process completed successfully.


## The script does the following:
 Clears the grid of all existing entities by deleting POLYanets, SOLoons, and comETHs.
 Introduces a delay to prevent hitting API rate limits.
 Populates the grid with new entities from the goal map retrieved from the API.

## Future Improvements:
### Although the current script works as intended, there are a few areas that can be optimized:

1. Separation of Concerns (Modularization)
Improvement: Separate the functionality into dedicated scripts:
clear.js: Dedicated to clearing the grid.
create.js: Dedicated to creating the entities.
Why: Modular scripts will improve maintainability and allow for more flexible testing and troubleshooting.
2. Optimize the Deletion Process
Improvement: The script currently tries to delete entities at every grid position, including empty spots marked as "SPACE". We could skip positions that are already "SPACE" to reduce unnecessary API calls.
3. Refactor certian entities to Classes: While the current function-based approach works well for this project, refactoring the code to use classes can provide better encapsulation, reusability, and maintainability if the project grows or becomes more complex. By creating separate classes for entities like Polyanet, Soloon, and Cometh, the code could be more organized and modular, allowing for easier modifications or extensions of individual components without affecting others.
4. Optimize the Rate Limiting Delay
Improvement: Experiment with shorter delays between API calls (currently set at 500ms for deletions and 1000ms for creations) to find the optimal balance between speed and avoiding rate limits.
5. Error Handling and Retry Mechanism
Improvement: Enhance error handling by implementing a retry mechanism when the script encounters rate limits or other transient API errors.
