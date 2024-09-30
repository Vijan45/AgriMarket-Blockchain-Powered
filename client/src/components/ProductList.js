import React from 'react';

const ProductList = ({ products, addToCart, removeProduct, web3 }) => {
    return (
        <div className="container">
            <h3 className="my-4">Available Products</h3>
            {products.length === 0 ? (
                <p>No products available.</p>
            ) : (
                <div className="row">
                    {products.map((product, index) => (
                        <div key={index} className="col-md-4 mb-4">
                            <div className="card">
                                <img
                                    src={`https://gateway.pinata.cloud/ipfs/${product.imageHash}`}
                                    alt={product.name}
                                    className="card-img-top"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{product.name}</h5>
                                    <p className="card-text">{product.description}</p>
                                    <p className="card-text">
                                        <strong>Price: </strong>
                                        {web3 ? web3.utils.fromWei(product.price, 'ether') : 'Loading...'} tRBTC
                                    </p>
                                    <button
                                        className="btn btn-success"
                                        style={{ backgroundColor: 'green' }}
                                        onClick={() => addToCart(product)}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className="btn btn-danger mt-2"
                                        onClick={() => removeProduct(product.id)} // Call removeProduct correctly
                                    >
                                        Remove Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
