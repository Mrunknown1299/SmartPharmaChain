import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Contract configuration
  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x279fFe8FB7A99D6AE2C3295485a7f8E946980Dc7";
console.log('Environment CONTRACT_ADDRESS:', process.env.REACT_APP_CONTRACT_ADDRESS);
console.log('Final CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
  const CONTRACT_ABI = [
    "function manufactureDrug(string memory _batchId, string memory _name, string memory _manufacturer, uint256 _expiryDate) public",
    "function distributeDrug(string memory _batchId) public",
    "function retailDrug(string memory _batchId) public",
    "function sellDrug(string memory _batchId, address _consumer) public",
    "function getDrugDetails(string memory _batchId) public view returns (string memory, string memory, uint256, uint256, uint8, address, address, address, address)",
    "function verifyDrug(string memory _batchId) public view returns (bool)",
    "function isDrugExpired(string memory _batchId) public view returns (bool)",
    "function registerManufacturer(address _manufacturer) public",
    "function registerDistributor(address _distributor) public",
    "function registerRetailer(address _retailer) public",
    "function manufacturers(address) public view returns (bool)",
    "function distributors(address) public view returns (bool)",
    "function retailers(address) public view returns (bool)",
    "function owner() public view returns (address)"
  ];

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider and signer
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);

      // Initialize contract if address is available
      if (CONTRACT_ADDRESS) {
        try {
          console.log('Connecting to contract at:', CONTRACT_ADDRESS); // Debug log
          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            web3Signer
          );
          setContract(contractInstance);
          console.log('Contract connected successfully'); // Debug log
        } catch (error) {
          console.error('Error connecting to contract:', error);
          toast.error('Failed to connect to smart contract');
        }
      } else {
        console.log('No contract address found in environment');
        toast.error('Contract address not configured');
      }

      toast.success(`🎉 Wallet connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setChainId(null);
    toast.info('Wallet disconnected');
  };

  // Check if wallet is already connected
  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await web3Provider.getNetwork();

        console.log('Network detected:', network.chainId); // Debug log

        // Always set the chainId so we can show network status
        setChainId(network.chainId);

        // Connect regardless of network (we'll show warning if wrong)
        const web3Signer = web3Provider.getSigner();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(accounts[0]);

        if (CONTRACT_ADDRESS && (network.chainId === 11155111 || network.chainId === 1337)) {
          try {
            console.log('Loading contract at:', CONTRACT_ADDRESS); // Debug log
            const contractInstance = new ethers.Contract(
              CONTRACT_ADDRESS,
              CONTRACT_ABI,
              web3Signer
            );
            setContract(contractInstance);
            console.log('Contract loaded successfully'); // Debug log
          } catch (error) {
            console.error('Error loading contract:', error);
          }
        } else {
          console.log('Contract not loaded. Address:', CONTRACT_ADDRESS, 'ChainId:', network.chainId);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(parseInt(newChainId, 16));
        window.location.reload(); // Reload to reset state
      });

      // Check if already connected
      checkConnection();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Utility functions
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isCorrectNetwork = () => {
    console.log('Current chainId:', chainId); // Debug log
    console.log('Type of chainId:', typeof chainId); // Debug log

    // Sepolia testnet chainId is 11155111
    const sepoliaChainId = 11155111;
    const localhostChainId = 1337;

    return chainId === sepoliaChainId || chainId === localhostChainId;
  };

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add Sepolia network');
        }
      } else {
        console.error('Error switching network:', switchError);
        toast.error('Failed to switch to Sepolia network');
      }
    }
  };

  const value = {
    account,
    provider,
    signer,
    contract,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
    isCorrectNetwork,
    switchToSepolia,
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
