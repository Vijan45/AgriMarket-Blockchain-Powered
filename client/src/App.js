import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketplaceABI from './utils/Marketplace.json';
import AddProduct from './components/AddProduct';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Use the CONTRACT_ADDRESS from your .env file
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const App = () => {
    const [account, setAccount] = useState('');
    const [marketplace, setMarketplace] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [web3, setWeb3] = useState(null);

    // Load web3 and blockchain data
    useEffect(() => {
        const loadWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    console.log('MetaMask is connected');
                    await loadBlockchainData(web3Instance);
                } catch (error) {
                    console.error("User denied account access or error occurred:", error);
                }
            } else if (window.web3) {
                const web3Instance = new Web3(window.web3.currentProvider);
                setWeb3(web3Instance);
                console.log('Using legacy dApp browser');
                await loadBlockchainData(web3Instance);
            } else {
                window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
                console.error('Non-Ethereum browser detected');
            }
        };

        const loadBlockchainData = async (web3Instance) => {
            if (!web3Instance) {
                console.error('Web3 instance is not available');
                return;
            }

            const accounts = await web3Instance.eth.getAccounts();
            setAccount(accounts[0]);

            // Manually use the contract address from environment variables
            if (CONTRACT_ADDRESS) {
                const marketplaceInstance = new web3Instance.eth.Contract(MarketplaceABI.abi, CONTRACT_ADDRESS);
                setMarketplace(marketplaceInstance);

                const productCount = await marketplaceInstance.methods.productCount().call();
                const productsList = [];
                for (let i = 1; i <= productCount; i++) {
                    const product = await marketplaceInstance.methods.products(i).call();
                    productsList.push(product);
                }
                setProducts(productsList);
            } else {
                window.alert('Marketplace contract address is not provided.');
                console.error('Marketplace contract address is not provided');
            }
        };

        loadWeb3();
    }, []);  // Removed dependencies to avoid redundant renders

    const addToCart = (product) => {
        setCart([...cart, product]);
        toast.success(`${product.name} added to cart!`);
    };

    const removeProduct = (productId) => {
        setProducts(products.filter(product => product.id !== productId));
        toast.success(`Product with ID ${productId} removed from the product list!`);
    };

    const calculateTotal = () => {
        return cart.reduce((total, product) => total + parseFloat(web3.utils.fromWei(product.price, 'ether')), 0);
    };

    const checkout = async () => {
        if (!marketplace || !web3 || cart.length === 0) return;

        try {
            const productIds = cart.map((product) => product.id);
            const totalInWei = web3.utils.toWei(calculateTotal().toString(), 'ether');

            toast.info("Transaction in progress...");

            const gasLimit = await marketplace.methods.purchaseProducts(productIds).estimateGas({
                from: account,
                value: totalInWei,
            });

            await marketplace.methods.purchaseProducts(productIds).send({
                from: account,
                value: totalInWei,
                gas: gasLimit,
                gasPrice: await web3.eth.getGasPrice(),
            });

            toast.success("Purchase successful!");

            const newTransaction = {
                time: new Date().toLocaleString(),
                products: [...cart]
            };
            setTransactions([...transactions, newTransaction]);

            setCart([]);
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Transaction failed!");
        }
    };

    return (
        <Router>
            <div className="container">
                <nav className="navbar">
                    <Link to="/">AgriMarket</Link>
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/cart">Cart</Link>
                </nav>
                <h2>Agricultural Marketplace</h2>
                <p>Connected Account: {account}</p>

                <Routes>
                    <Route path="/" element={<AddProduct marketplace={marketplace} account={account} web3={web3} />} />
                    <Route path="/products" element={<ProductList products={products} addToCart={addToCart} removeProduct={removeProduct} web3={web3} />} />
                    <Route
                        path="/cart"
                        element={
                            <Cart
                                cart={cart}
                                setCart={setCart}
                                total={calculateTotal()}
                                checkout={checkout}
                                transactionHistory={transactions}
                                setTransactionHistory={setTransactions}
                                web3={web3}
                            />
                        }
                    />
                </Routes>

                <ToastContainer />
            </div>
        </Router>
    );
};

export default App;
