import axios from 'axios';
import React, { useState, useEffect } from 'react';

const AddProduct = ({ marketplace, account, web3 }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageHash, setImageHash] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [gasPrice, setGasPrice] = useState(null);

    // Fetch current gas price from the network
    useEffect(() => {
        const fetchGasPrice = async () => {
            if (web3 && web3.eth) {
                try {
                    const gasPrice = await web3.eth.getGasPrice();
                    setGasPrice(gasPrice);
                } catch (error) {
                    console.error('Error fetching gas price:', error.message || error);
                    setError('Error fetching gas price: ' + (error.message || 'An unknown error occurred.'));
                }
            } else {
                console.error('web3 or web3.eth is not defined');
                setError('Web3 is not available');
            }
        };

        fetchGasPrice();
    }, [web3]);

    // Handle file selection
    const captureFile = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Invalid file type. Please select an image file.');
        }
    };

    // Upload file to Pinata
    const uploadToPinata = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('No file selected. Please select an image file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const API_KEY = process.env.REACT_APP_PINATA_API_KEY;
        const SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;

        setUploading(true);

        try {
            const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                maxContentLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'pinata_api_key': API_KEY,
                    'pinata_secret_api_key': SECRET_KEY,
                },
            });

            if (res.data.IpfsHash) {
                setImageHash(res.data.IpfsHash);
                setSuccessMessage('Image uploaded successfully!');
                setError('');
            } else {
                setError('Image upload failed: No IPFS Hash returned.');
            }
        } catch (error) {
            setError('Error uploading image to IPFS. Please try again.');
            console.error('Error uploading file to IPFS via Pinata:', error);
        } finally {
            setUploading(false);
        }
    };

    // Add product to the marketplace
    const addProduct = async (e) => {
        e.preventDefault();

        if (!imageHash) {
            setError('Image not uploaded yet');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Ensure web3 and marketplace are defined before proceeding
            if (!marketplace || !web3) {
                throw new Error('Marketplace or web3 not initialized. Please check your connection.');
            }

            const priceInTRBTC = (parseFloat(price) * 10 ** 18).toString();

            await marketplace.methods.createProduct(name, description, imageHash, priceInTRBTC).send({
                from: account,
                gasPrice: gasPrice || '20000000000' // Use fetched gas price or fallback
            });

            // Reset fields after successful addition
            setName('');
            setDescription('');
            setPrice('');
            setImageHash('');
            setFile(null);
            setSuccessMessage('Product added successfully!');
        } catch (error) {
            setError('Failed to add product. Please try again. ' + (error.message || ''));
            console.error('Error adding product:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={addProduct}>
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <textarea
                    className="form-control"
                    placeholder="Product Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                ></textarea>
            </div>
            <div className="form-group">
                <input
                    type="file"
                    className="form-control"
                    onChange={captureFile}
                    required
                />
                <button
                    onClick={uploadToPinata}
                    className="btn btn-primary mt-2"
                    type="button"
                >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
            </div>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <div className="form-group">
                <input
                    type="number"
                    step="0.00000001"
                    className="form-control"
                    placeholder="Price in tRBTC"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Adding...' : 'Add Product'}
            </button>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {gasPrice && <div className="mt-2">Current Gas Price: {web3.utils.fromWei(gasPrice, 'gwei')} Gwei</div>}
        </form>
    );
};

export default AddProduct;
