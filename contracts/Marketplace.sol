// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Marketplace is ReentrancyGuard, Pausable {
    uint public productCount = 0;

    struct Product {
        uint id;
        address payable seller;
        string name;
        string description;
        string imageHash; // IPFS hash
        uint price; // Price in tRBTC
        bool active;
    }

    mapping(uint => Product) public products;

    event ProductCreated(
        uint id,
        address seller,
        string name,
        string description,
        string imageHash,
        uint price,
        bool active
    );

    event ProductPurchased(
        uint id,
        address seller,
        address buyer,
        uint price
    );

    event ProductRemoved(uint id, address seller);

    // Create a new product
    function createProduct(
        string memory _name,
        string memory _description,
        string memory _imageHash,
        uint _price
    ) public whenNotPaused {
        require(bytes(_name).length > 0, "Name is required");
        require(_price > 0, "Price must be positive"); // Price is expected in tRBTC
        productCount++;
        products[productCount] = Product(
            productCount,
            payable(msg.sender),
            _name,
            _description,
            _imageHash,
            _price,
            true // Product is active upon creation
        );
        emit ProductCreated(
            productCount,
            msg.sender,
            _name,
            _description,
            _imageHash,
            _price,
            true
        );
    }

    // Purchase multiple products in the cart (with reentrancy protection)
    function purchaseProducts(uint[] memory _ids) public payable nonReentrant whenNotPaused {
        uint totalCost = 0;

        // Calculate total cost for all products
        for (uint i = 0; i < _ids.length; i++) {
            Product storage _product = products[_ids[i]];
            require(_product.id > 0 && _product.id <= productCount, "Invalid product ID");
            require(_product.active, "Product is not active");
            require(_product.seller != msg.sender, "Seller cannot buy their own product");

            totalCost += _product.price;
        }

        require(msg.value >= totalCost, "Insufficient funds");

        // Process the purchase and transfer funds
        for (uint i = 0; i < _ids.length; i++) {
            Product storage _product = products[_ids[i]];

            // Transfer funds to the seller
            (bool success, ) = _product.seller.call{value: _product.price}("");
            require(success, "Transfer failed to the seller");

            // Emit purchase event (product can be bought again)
            emit ProductPurchased(
                _product.id,
                _product.seller,
                msg.sender,
                _product.price
            );
        }
    }

    // Remove a product from the list (soft delete)
    function removeProduct(uint _id) public {
        Product storage _product = products[_id];
        require(_product.id > 0 && _product.id <= productCount, "Invalid product ID");
        require(_product.seller == msg.sender, "Only the seller can remove the product");

        _product.active = false; // Mark the product as inactive
        emit ProductRemoved(_id, msg.sender);
    }

    // Get product details, checking if it's active
    function getProduct(uint _id) public view returns (Product memory) {
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        Product memory product = products[_id];
        require(product.active, "Product is not available");
        return product;
    }

    // Pause the contract (in case of emergencies)
    function pause() public {
        _pause();
    }

    // Unpause the contract
    function unpause() public {
        _unpause();
    }
}
