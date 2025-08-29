# Shiritori — 2-Player Word Game

A fun and interactive **Shiritori** game built using **React** and **Tailwind CSS**. The game allows two players to take turns entering words, following the traditional rules of **Shiritori**.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Game Rules](#game-rules)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**Shiritori** is a Japanese word game where players take turns to say a word that starts with the last letter of the previous word. The game continues until one player can't think of a valid word or time runs out.

This web-based version of **Shiritori** allows two players to play on the same device, with an added twist of **word validation** using an online dictionary API and **score tracking**. The game features a countdown timer and the option to pass the turn, with a penalty of -1 point for passing.

---

## Features

- **Real-time Gameplay**: Two players can take turns entering words.
- **Word Validation**: Words are validated using the [Dictionary API](https://dictionaryapi.dev/).
- **Player Score Tracking**: Players earn points for valid words and lose points for invalid words or passing.
- **Word History**: A history of all words played with validation status and time taken.
- **Timer**: A countdown timer for each player's turn.
- **Pass Turn**: Players can pass their turn but incur a -1 point penalty.
- **Customizable Player Names**: Players can edit their names during the game.
- **Randomized Start Letter**: The game can randomize the starting letter for words.
- **Responsive Design**: The game is designed to be played on desktops and mobile devices.

---

## Game Rules

1. **Turn-Based Gameplay**: Players take turns submitting words.
2. **Word Structure**: Each word must start with the last letter of the previous word (first word starts with a random letter).
3. **Word Validity**: Words must be at least 4 letters long and cannot be repeated.
4. **Passing**: If a player can't think of a valid word, they can pass, but they lose 1 point.
5. **Timeout**: Players have a limited time to submit their word (default: 15 seconds).
6. **Word Validation**: Words are validated using the Dictionary API. If a word is not found, it's marked invalid.

---

## Technologies Used

- **React**: For building the user interface and managing game state.
- **Tailwind CSS**: For styling the app and creating responsive layouts.
- **React Icons**: For incorporating icons into the UI (e.g., for editing names, starting the game).
- **Dictionary API**: Used for validating word meanings and checking if a word exists.
- **JavaScript (ES6)**: For managing game logic, turn-based gameplay, and timer functionality.

---

## Installation

To get started with the project, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/shiritori-game.git
