# AgriMarket: Blockchain-Powered Decentralized Agricultural Marketplace

Welcome to **AgriMarket**, a decentralized marketplace application that allows users to buy and sell agricultural products securely and transparently using blockchain technology on the RSK testnet. This project supports features such as adding products to the cart, making purchases using MetaMask, storing images on IPFS via Pinata, and viewing transaction history.

## Features
- Add agricultural products with descriptions, images, and prices.
- Products are stored on IPFS using Pinata for decentralized storage.
- Buyers can browse products, add them to the cart, and make collective purchases.
- Transaction history and progress notifications for better user interaction.
- Real-time communication with the RSK blockchain using Web3 wallets (e.g., MetaMask).

## Technology Stack
- **Blockchain:** Rootstock (RSK) testnet
- **Frontend:** React.js
- **Smart Contract:** Solidity
- **IPFS Storage:** Pinata
- **Web3 Wallet:** MetaMask
- **Libraries:** React-Bootstrap, Web3.js, react-toastify

## Getting Started

### Prerequisites
To get started with this project, you need to have the following installed:

- **Node.js** (version 12+)
- **npm** (Node Package Manager)
- **MetaMask** (for testing transactions on the RSK testnet)
- **Pinata Account** (for storing product images on IPFS)

### Cloning the Repository
First, you need to clone the project repository. Run the following command in your terminal:

```bash
git clone https://github.com/Vijan45/AgriMarket-Blockchain-Powered.git

## Navigate to the project folder
Change your directory to the project folder:
cd AgriMarket-Blockchain-Powered
```

## Setting Up Environment Variables
Create a `.env` file in the root of the project directory and add your environment variables for Web3 wallet and Pinata credentials. This file should look like:

```plaintext
REACT_APP_PINATA_API_KEY=<your_pinata_api_key>
REACT_APP_PINATA_SECRET_API_KEY=<your_pinata_secret_api_key>
MNEMONIC=<your_mnemonic>
RSK_TESTNET_URL=https://public-node.testnet.rsk.co
REACT_APP_CONTRACT_ADDRESS=<your_smart_contract_address>
```

Replace the placeholder values with your actual Pinata API keys, wallet mnemonic, and RSK testnet URL.

## Install Dependencies
In order to run the project, you need to install all required dependencies. Run the following command:

```bash
npm install
```

Make sure the following key dependencies are installed:
- **react-toastify** for notifications
- **web3** for interacting with the blockchain
- **axios** for IPFS integration
- **pinata-sdk** for uploading images to IPFS

To install the dependencies manually, run the following commands:

```bash
npm install react-toastify web3 axios pinata-sdk
```

## Smart Contract Deployment
Before interacting with the frontend, ensure that the Marketplace smart contract is deployed on the RSK testnet. Copy the contract's ABI and address and include it in the `src/utils/Marketplace.json` file. The contract address should also be added to the `.env` file.

## Run the Application
Once all dependencies are installed and the contract is deployed, start the React application by running:

```bash
npm start
```

The app will be available at `http://localhost:3000`.

## Frontend Details

### React Components Structure
The project is structured around key React components:
- **App.js:** The main component that manages blockchain connection, product listings, cart, and transactions.
- **AddProduct.js:** This component allows users to add products to the marketplace, with images uploaded to IPFS.
- **ProductList.js:** Displays a list of all available products in the marketplace.
- **Cart.js:** Manages the user's cart and enables collective checkout through MetaMask.
- **Transaction History:** Lists previous purchases made by the user, stored locally.

### Styling and UX Improvements
The navigation bar contains **AgriMarket**, **Home**, **Products**, and **Cart** options, centered in green, bold font for an attractive UI. Real-time notifications and transaction progress indicators are managed using **react-toastify**.

### Dependencies Breakdown
To ensure everything runs smoothly, ensure the following dependencies are properly configured in your `package.json`:

```json
{
  "dependencies": {
    "axios": "^0.21.1",
    "bootstrap": "^5.1.0",
    "react": "^17.0.2",
    "react-bootstrap": "^1.6.1",
    "react-dom": "^17.0.2",
    "react-toastify": "^7.0.4",
    "web3": "^1.6.1",
    "pinata-sdk": "^1.1.22"
  }
}
```

### Run Linter (Optional)
For code quality assurance, run ESLint to maintain consistent code style:

```bash
npm run lint
```

## Interacting with the Application

### Using MetaMask for Transactions
1. Install the MetaMask extension in your browser.
2. Connect your MetaMask wallet to the RSK testnet using the custom network settings.
3. Ensure you have enough **tRBTC** for transactions on the testnet.

### Adding Products
To add products to the marketplace:
1. Navigate to the **Add Product** page.
2. Provide product details such as the name, price (in **tRBTC**), and image.
3. Click the submit button to upload the product details to IPFS and the marketplace.

### Viewing Products and Cart
1. Go to the **Products** page to see all the available products.
2. Click **Add to Cart** to add products to your cart.
3. Proceed to the **Cart** section to view your selected items and checkout using MetaMask.

### Viewing Transaction History
The transaction history is displayed at the bottom of the homepage, showing all previous purchases with timestamps.

## IPFS Integration (Pinata)
The product images are uploaded to IPFS using Pinata. Ensure your Pinata API keys are correctly configured in the `.env` file to upload product images securely.

## Contributing
Feel free to fork this repository and create pull requests with improvements, bug fixes, or new features.

## License
This project is licensed under the [MIT License](https://github.com/Vijan45/AgriMarket-Blockchain-Powered/blob/main/LICENSE). For more details, see the MIT License.

