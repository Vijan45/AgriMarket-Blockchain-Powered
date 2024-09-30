import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import MarketplaceABI from '../utils/Marketplace.json';
import './Cart.css'; // Import the Cart.css file

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const Cart = ({ cart, setCart, transactionHistory, setTransactionHistory }) => {
    const [total, setTotal] = useState(0);
    const [web3, setWeb3] = useState(null);
    const [marketplace, setMarketplace] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    useEffect(() => {
        const initializeWeb3 = async () => {
            try {
                const web3Instance = new Web3(window.ethereum || 'https://public-node.testnet.rsk.co');
                setWeb3(web3Instance);

                const marketplaceContract = new web3Instance.eth.Contract(MarketplaceABI.abi, CONTRACT_ADDRESS);
                setMarketplace(marketplaceContract);
            } catch (error) {
                console.error('Error initializing web3 or contract:', error);
            }
        };
        initializeWeb3();
    }, []);

    useEffect(() => {
        if (cart.length > 0 && web3) {
            const calculatedTotal = cart.reduce((sum, product) => {
                const priceInTRBTC = parseFloat(web3.utils.fromWei(product.price, 'ether'));
                return sum + priceInTRBTC;
            }, 0);
            setTotal(calculatedTotal);
        }
    }, [cart, web3]);

    const handleCheckout = async () => {
        if (!marketplace || cart.length === 0) {
            setProgressMessage('Marketplace contract not initialized or cart is empty.');
            return;
        }

        setIsProcessing(true);
        setProgressMessage('Initiating transaction...');
        setPurchaseSuccess(false);

        try {
            const accounts = await web3.eth.getAccounts();
            console.log("Using account:", accounts[0]);

            const productIds = cart.map(product => product.id);
            const totalInWei = web3.utils.toWei(total.toString(), 'ether');

            const gasLimit = await marketplace.methods.purchaseProducts(productIds).estimateGas({
                from: accounts[0],
                value: totalInWei,
            });

            console.log("Estimated gas limit:", gasLimit);

            await marketplace.methods.purchaseProducts(productIds).send({
                from: accounts[0],
                value: totalInWei,
                gas: gasLimit,
                gasPrice: await web3.eth.getGasPrice(),
            })
                .on('transactionHash', (hash) => {
                    setProgressMessage(`Transaction sent! Hash: ${hash}. Waiting for confirmation...`);
                    console.log("Transaction Hash:", hash);
                })
                .on('receipt', (receipt) => {
                    console.log('Transaction receipt:', receipt);  // Log the full receipt
                    console.log('Receipt status value:', receipt.status);  // Log the status

                    const receiptStatus = Number(receipt.status); // Convert status to a simple number
                    const newTransaction = {
                        txnHash: receipt.transactionHash,
                        blockHash: receipt.blockHash,
                        blockNumber: receipt.blockNumber,
                        from: receipt.from,
                        to: receipt.to,
                        gasUsed: receipt.gasUsed,
                        cumulativeGasUsed: receipt.cumulativeGasUsed,
                        status: receiptStatus === 1 ? "Success" : "Failed",  // Simplified status check
                        time: new Date().toLocaleString(),
                        productIds,
                    };

                    setTransactionHistory(prevHistory => [...prevHistory, newTransaction]);
                    setCart([]);
                    setProgressMessage('Transaction successful! Your purchase has been completed.');
                    setPurchaseSuccess(true);
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    if (confirmationNumber === 1) {
                        console.log('Transaction confirmed:', receipt);
                    }
                })
                .on('error', (error) => {
                    console.error('Transaction Error:', error);
                    setProgressMessage('Transaction failed: ' + error.message);
                })
                .finally(() => {
                    setIsProcessing(false);
                });
        } catch (error) {
            console.error('Transaction Failed:', error);
            setProgressMessage('Transaction failed: ' + error.message);
            setIsProcessing(false);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(product => product.id !== productId));
        setProgressMessage(`Product with ID ${productId} removed from cart.`);
    };

    return (
        <div className="container">
            <h3>Your Cart</h3>
            {isProcessing && <p>{progressMessage}</p>}
            {purchaseSuccess && <div className="purchase-success">{progressMessage}</div>}
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <ul className="list-group mb-4">
                        {cart.map((product, index) => (
                            <li key={index} className="list-group-item d-flex align-items-center">
                                <img
                                    src={`https://gateway.pinata.cloud/ipfs/${product.imageHash}`}
                                    alt={product.name}
                                    style={{ width: '50px', height: '50px', marginRight: '10px', border: '1px solid #ddd', padding: '5px' }}
                                />
                                <div>
                                    <strong>{product.name}</strong>
                                    <p>{product.description}</p>
                                    <p>
                                        Price: {web3 && web3.utils ? parseFloat(web3.utils.fromWei(product.price, 'ether')).toFixed(4) : 'Loading...'} tRBTC
                                    </p>
                                    <button onClick={() => removeFromCart(product.id)} className="btn btn-danger">
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h5>Total: {web3 && web3.utils ? total.toFixed(4) : 'Loading...'} tRBTC</h5>
                    <button onClick={handleCheckout} className="btn btn-success mt-3" disabled={isProcessing || cart.length === 0}>
                        {isProcessing ? 'Processing...' : 'Checkout'}
                    </button>
                </div>
            )}

            <h4>Transaction History</h4>
            <ul className="transaction-history">
                {transactionHistory && transactionHistory.length > 0 ? (
                    transactionHistory.map((txn, index) => (
                        <li key={index} className="transaction-item">
                            <p><strong>Transaction Hash:</strong> {txn.txnHash}</p>
                            <p><strong>Block Hash:</strong> {txn.blockHash}</p>
                            <p><strong>Block Number:</strong> {txn.blockNumber.toString()}</p>
                            <p><strong>From:</strong> {txn.from}</p>
                            <p><strong>To:</strong> {txn.to}</p>
                            <p><strong>Gas Used:</strong> {txn.gasUsed.toString()}</p>
                            <p><strong>Cumulative Gas Used:</strong> {txn.cumulativeGasUsed.toString()}</p>
                            <p><strong>Status:</strong> {txn.status}</p>
                            <p><strong>Time:</strong> {txn.time}</p>
                            <p><strong>Product IDs:</strong> {txn.productIds.join(', ')}</p>
                        </li>
                    ))
                ) : (
                    <p>No transaction history yet.</p>
                )}
            </ul>
        </div>
    );
};

export default Cart;
