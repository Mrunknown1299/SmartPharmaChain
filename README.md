# 🏥 SmartMediChain - Blockchain Pharmaceutical Supply Chain

A comprehensive blockchain-based pharmaceutical supply chain tracking system built with React, Node.js, and Ethereum smart contracts.

## ✨ Features

- **🔗 Blockchain Integration**: Ethereum smart contracts for immutable drug tracking
- **👥 Multi-Role System**: Manufacturer, Distributor, Retailer, Consumer, and Admin roles
- **📱 QR Code Generation**: Automatic QR code creation for drug verification
- **🛡️ Drug Safety Alerts**: Expiry warnings and storage guidelines
- **💊 Drug Interaction Checker**: Real-time medication interaction analysis
- **📊 Analytics Dashboard**: Real-time blockchain analytics and insights
- **🎨 Beautiful UI**: Modern, responsive design with Material-UI
- **🔐 Wallet Integration**: MetaMask wallet connectivity

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with Material-UI
- **Blockchain**: Ethers.js for smart contract interaction
- **Routing**: React Router for navigation
- **State Management**: React Context API
- **Styling**: Material-UI with custom themes

### Backend (Node.js)
- **Framework**: Express.js
- **QR Generation**: QRCode library
- **Security**: CORS, Helmet, Rate limiting
- **File Handling**: Multer for uploads

### Blockchain (Ethereum)
- **Network**: Sepolia Testnet
- **Framework**: Hardhat for development
- **Language**: Solidity 0.8.17
- **Testing**: Hardhat testing framework

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Sepolia testnet ETH

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smartmedichain.git
cd smartmedichain
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**
Create `.env` file in root directory:
```env
SEPOLIA_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

4. **Deploy Smart Contract**
```bash
npm run deploy
```

5. **Start the application**
```bash
npm run dev
```

## 📱 Usage

### For Manufacturers
1. Connect MetaMask wallet
2. Navigate to Manufacturer Dashboard
3. Register new pharmaceutical products
4. Generate QR codes for tracking

### For Distributors
1. Connect wallet and register as distributor
2. Search for manufactured drugs
3. Mark drugs as distributed

### For Retailers
1. Register as retailer
2. Receive distributed drugs
3. Sell to consumers

### For Consumers
1. Scan QR codes or enter batch IDs
2. Verify drug authenticity
3. View complete supply chain journey
4. Check drug interactions and safety alerts

### For Admins
1. Register stakeholders (manufacturers, distributors, retailers)
2. Monitor system analytics
3. Manage platform operations

## 🛠️ Technology Stack

- **Frontend**: React, Material-UI, Ethers.js
- **Backend**: Node.js, Express.js, QRCode
- **Blockchain**: Solidity, Hardhat, Ethereum
- **Network**: Sepolia Testnet
- **Deployment**: Vercel (Frontend), Railway (Backend)

## 📊 Smart Contract Functions

- `manufactureDrug()`: Create new drug entry
- `distributeDrug()`: Mark drug as distributed
- `retailDrug()`: Mark drug as retailed
- `sellDrug()`: Complete sale to consumer
- `getDrugDetails()`: Retrieve drug information
- `registerManufacturer()`: Register manufacturer
- `registerDistributor()`: Register distributor
- `registerRetailer()`: Register retailer

## 🔐 Security Features

- **Immutable Records**: Blockchain-based data storage
- **Role-Based Access**: Different permissions for each role
- **Wallet Authentication**: MetaMask integration
- **Input Validation**: Comprehensive form validation
- **Rate Limiting**: API protection against abuse

## 🌟 Future Enhancements

- [ ] MongoDB integration for enhanced data storage
- [ ] Mobile app development
- [ ] IoT sensor integration
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Regulatory compliance features

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Your Name
- **Project Type**: Final Year Project
- **Institution**: Your University

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Built with ❤️ for pharmaceutical supply chain transparency and safety**
