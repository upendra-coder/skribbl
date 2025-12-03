# 🎨 Skribbl Clone

A full-stack, real-time multiplayer drawing and guessing game inspired by Pictionary. Built from scratch to handle complex state synchronization, live networking, and game logic.

<img width="1920" height="960" alt="Screenshot (346)" src="https://github.com/user-attachments/assets/fafadda0-3784-4961-904b-56f8814119b2" />
<img width="1920" height="964" alt="Screenshot (347)" src="https://github.com/user-attachments/assets/92c5b116-49cd-4acf-8075-efde523c295c" />
<img width="1920" height="971" alt="Screenshot (349)" src="https://github.com/user-attachments/assets/c8537b2d-48d9-4204-a4b9-ee548a976383" />


## 🚀 Live Demo
**Play here:** https://skribblfrontend.vercel.app/

## ✨ Features

### 🎮 Core Gameplay
* **Real-time Whiteboard:** Instant drawing synchronization using Socket.io and HTML5 Canvas.
* **Game Loop:** Automated turn management, word selection, and round rotation.
* **Scoring System:** Dynamic point calculation based on guessing speed (timer-based).
* **Word Selection:** Drawer gets 3 random word options to choose from.

### 🛠 Technical Highlights
* **Room Architecture:** Isolated game rooms allowing multiple simultaneous matches.
* **State Recovery:** Handles browser refreshes and disconnects without losing user state or score.
* **Ghost Cleanup:** Server automatically detects and removes inactive users to prevent memory leaks.
* **Responsive Design:** Fully playable on Desktop and Mobile (Touch support included).

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Bootstrap, HTML5 Canvas API
* **Backend:** Node.js, Express
* **Real-time Communication:** Socket.io (WebSockets)
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## ⚙️ Local Setup Guide

Follow these steps to run the project locally on your machine.

### Prerequisites
* Node.js installed
* Git installed

### 1. Clone the Repository
```bash
git clone https://github.com/upendra-coder/skribbl.git
cd skribbl
