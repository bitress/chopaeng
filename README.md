# Chopaeng

Official website for **[Chopaeng](https://www.chopaeng.com/)**, an Animal Crossing: New Horizons (ACNH) treasure island streamer.

## Overview

This project is a static website built to support the Chopaeng streaming community. It serves as a central hub for treasure island information, maps, and resources.

## Tech Stack

* **Framework:** [React](https://react.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)

## Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/bitress/chopaeng.git](https://github.com/bitress/chopaeng.git)
    cd chopaeng
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

## Environment Variables

This project reads the API base URL from a Vite environment variable.

1.  Copy `.env.example` to `.env`.
2.  Set the values as needed for your environment.

```bash
VITE_API_BASE=https://dodo.chopaeng.com
```

### Development Server
Start the local development server with Hot Module Replacement (HMR):
    
```bash
    npm run dev
 ```
    
### Production Build
Build the application for production:

```bash
    npm run build
 ```
