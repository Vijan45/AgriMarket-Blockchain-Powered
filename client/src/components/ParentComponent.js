import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import MarketplaceABI from '../utils/Marketplace.json';
import AddProduct from './AddProduct';
import Cart from './Cart';
import ProductList from './ProductList';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const ParentComponent = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [marketplace, setMarketplace] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [transactionHistory, setTransactionHistory] = useState([]);

    useEffect(() => {
        const initWeb3AndContract = async () => {
            try {
                const web3Instance = new Web3(window.ethereum || 'https://public-node.testnet.rsk.co');
                setWeb3(web3Instance);

                if (window.ethereum) {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                }
                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                const marketplaceContract = new web3Instance.eth.Contract(MarketplaceABI.abi, CONTRACT_ADDRESS);
                setMarketplace(marketplaceContract);

                const productCount = await marketplaceContract.methods.productCount().call();
                const loadedProducts = [];
                for (let i = 1; i <= productCount; i++) {
                    const product = await marketplaceContract.methods.products(i).call();
                    loadedProducts.push(product);
                }
                setProducts(loadedProducts);
            } catch (error) {
                console.error("Error initializing Web3 or contract:", error);
            }
        };

        initWeb3AndContract();
    }, []);

    const addToCart = (product) => {
        setCart([...cart, product]);
    };

    const removeProduct = (productId) => {
        // Remove the product from the product list
        setProducts(products.filter(product => product.id !== productId));
        // Also remove the product from the cart if it exists
        setCart(cart.filter(product => product.id !== productId));
    };

    const updateTransactionHistory = (newTransaction) => {
        setTransactionHistory([...transactionHistory, newTransaction]);
    };

    return (
        <div>
            <h2>Marketplace</h2>
            <AddProduct marketplace={marketplace} account={account} web3={web3} />

            <ProductList
                products={products}
                addToCart={addToCart}
                removeProduct={removeProduct} // Pass the removeProduct function
                web3={web3}
            />

            <Cart
                cart={cart}
                setCart={setCart}
                transactionHistory={transactionHistory}
                setTransactionHistory={updateTransactionHistory} // Pass the function to update transaction history
                marketplace={marketplace}
            />
        </div>
    );
};

export default ParentComponent;
