import React, { useEffect, useState } from "react";
import useUserDetails from "../../useUserDetails";
import { getCartByEmail, getProductById, removeFromCartAPI, emptyCart, addToOrder } from "../API";
import './checkout-style.css';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import ErrorBoundary from "./ErrorBoundary";

const stripePromise = loadStripe("pk_test_51QiIllP7psTNMuKWTQRdi2GGhJ5gPG1XAO5H7TLh42MGmQ7FORx515xmjEJqcia4JlX8CPY5a90OqXS2VIKc47Zl00bz7V40Fp");

const cityShippingCharges = {
    "Delhi": 30,
    "Mumbai": 40,
    "Bangalore": 50,
    "Chennai": 60,
    "Kolkata": 70,
    "Hyderabad": 80,
    "Pune": 100,
};

const inputStyle = {
    base: {
        color: "#32325d",
        fontSize: "16px",
        fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
        "::placeholder": {
            color: "#aab7c4",
        },
    },
    invalid: {
        color: "#fa755a",
    },
};

function ShoppingCheckout() {

    const { userData, isUserDataReady } = useUserDetails();
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [quantity, setQuantity] = useState([]);
    const [shipping, setShipping] = useState(30);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        zip: "",
    });

    const [selectedPayment, setSelectedPayment] = useState("");

    const handlePaymentChange = (event) => {
        setSelectedPayment(event.target.id);
    };

    const stripe = useStripe();
    const elements = useElements();


    const calculateShipping = (address) => {
        const city = address.city;
        const shippingCost = cityShippingCharges[city] || 30;
        setShipping(shippingCost);
    };

    const handleCouponChange = (e) => {
        setCouponCode(e.target.value);
    };

    const applyCoupon = async () => {
        try {
            const response = await fetch("https://adaa-web-backend.onrender.com/verify-coupon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ couponCode }),
            });
            const data = await response.json();

            if (data.success) {
                setDiscount(data.discount);
                Swal.fire({
                    title: "Coupon Applied!",
                    text: `You've received a discount of ${data.discount}%`,
                    icon: "success",
                    confirmButtonText: "Okay",
                });
            } else {
                Swal.fire({
                    title: "Invalid Coupon",
                    text: data.message || "The coupon code is invalid or expired.",
                    icon: "error",
                    confirmButtonText: "Okay",
                });
                setDiscount(0);
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to apply coupon. Please try again later.",
                icon: "error",
                confirmButtonText: "Okay",
            });
        }
    };

    const navigate = useNavigate();

    // useEffect(() => {
    //     if (isUserDataReady && userData?.Email) {
    //         const fetchCartProducts = async () => {
    //             try {
    //                 const user = await getCartByEmail(userData.Email);
    //                 const productIds = user?.Cart || [];
    //                 const products = await Promise.all(
    //                     productIds.map(async (id) => {
    //                         const product = await getProductById(id);
    //                         return product;
    //                     })
    //                 );
    //                 setCart(products);
    //                 setQuantity(products.flat().map(() => 1));
    //             } catch (error) {
    //                 console.error("Failed to fetch cart products:", error);
    //             }
    //         };
    //         fetchCartProducts();
    //     }
    // }, [isUserDataReady, userData?.Email]);

    
useEffect(() => {
    if (isUserDataReady && userData?.Email) {
        const fetchCartProducts = async () => {
            try {
                const user = await getCartByEmail(userData.Email);
                const productIds = user?.Cart || [];

                // Ensure productIds is an array
                if (!Array.isArray(productIds)) {
                    console.error("Cart data is not an array:", productIds);
                    return;
                }

                // Fetch product details for each product ID
                const products = await Promise.all(
                    productIds.map(async (id) => {
                        const product = await getProductById(id);
                        return product;
                    })
                );

                // Set cart as an array of arrays (groups of products)
                setCart([products]); // Wrap products in an array to match the expected structure
                setQuantity(products.map(() => 1)); // Initialize quantities for each product
            } catch (error) {
                console.error("Failed to fetch cart products:", error);
            }
        };
        fetchCartProducts();
    }
}, [isUserDataReady, userData?.Email]);

    useEffect(() => {
        const totalAmount = cart.reduce((total, group) => {
            return total + group.reduce((groupTotal, product) => {
                return groupTotal + (product.SalePrice * (product.Quantity || 1));
            }, 0);
        }, 0);

        setTotal(totalAmount);
        const discountedTotal = totalAmount - (totalAmount * (discount / 100));
        setFinalTotal(discountedTotal + shipping);
    }, [cart, shipping, discount]);

    // const handleRemoveItem = async (groupIndex, productId) => {
    //     try {
    //         const response = await removeFromCartAPI(userData.Email, productId);
    //         if (response.success) {
    //             const user = await getCartByEmail(userData.Email);
    //             const productIds = user?.Cart || [];
    //             const products = await Promise.all(
    //                 productIds.map(async (id) => {
    //                     const product = await getProductById(id);
    //                     return product;
    //                 })
    //             );
    //             setCart(products);
    //             setQuantity((prevQuantities) => {
    //                 const updatedQuantities = [...prevQuantities];
    //                 updatedQuantities.splice(groupIndex, 1);
    //                 return updatedQuantities;
    //             });
    //         } else {
    //             console.error("Failed to remove item from the cart:", response.message);
    //             alert("Failed to remove the item. Please try again.");
    //         }
    //     } catch (error) {
    //         console.error("Error removing item from the cart:", error);
    //         alert("Something went wrong. Please try again later.");
    //     }
    // };

    const handleRemoveItem = async (groupIndex, productId) => {
        try {
            const response = await removeFromCartAPI(userData.Email, productId);
            if (response.success) {
                const user = await getCartByEmail(userData.Email);
                const productIds = user?.Cart || [];
    
                // Fetch updated product details
                const products = await Promise.all(
                    productIds.map(async (id) => {
                        const product = await getProductById(id);
                        return product;
                    })
                );
    
                // Update cart and quantity state
                setCart([products]); // Wrap products in an array
                setQuantity((prevQuantities) => {
                    const updatedQuantities = [...prevQuantities];
                    updatedQuantities.splice(groupIndex, 1);
                    return updatedQuantities;
                });
            } else {
                console.error("Failed to remove item from the cart:", response.message);
                alert("Failed to remove the item. Please try again.");
            }
        } catch (error) {
            console.error("Error removing item from the cart:", error);
            alert("Something went wrong. Please try again later.");
        }
    };
    
    const handleQuantityChange = (index, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedQuantity = [...quantity];
        updatedQuantity[index] = newQuantity;
        setQuantity(updatedQuantity);

        const updatedCart = cart.map((group, groupIndex) =>
            group.map((product, productIndex) => {
                const globalIndex = groupIndex * group.length + productIndex;
                if (globalIndex === index) {
                    return { ...product, Quantity: newQuantity };
                }
                return product;
            })
        );
        setCart(updatedCart);
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prevAddress => {
            const updatedAddress = { ...prevAddress, [name]: value };
            calculateShipping(updatedAddress);
            return updatedAddress;
        });
    };

    const validateAddress = () => {
        return address.street && address.city && address.state && address.zip;
    };

    const handlePlaceOrder = async () => {
        if (!validateAddress()) {
            Swal.fire({
                title: "Missing Shipping Address",
                text: "Please provide a shipping address to proceed.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (!selectedPayment) {
            Swal.fire({
                title: 'Error',
                text: 'Please select a payment method.',
                icon: 'error',
                confirmButtonText: 'Okay'
            });
            return;
        }

        const paymentMethod = selectedPayment.id;
        const orderItems = cart.flat().map(product => ({
            No: product.No,
            Quantity: product.Quantity || 1,
        }));

        if (paymentMethod === "DebitCard" || paymentMethod === "CreditCard") {
            const cardNumberElement = elements.getElement(CardNumberElement);
            const cardExpiryElement = elements.getElement(CardExpiryElement);
            const cardCvcElement = elements.getElement(CardCvcElement);

            if (!cardNumberElement || !cardExpiryElement || !cardCvcElement ||
                !cardNumberElement._complete || !cardExpiryElement._complete || !cardCvcElement._complete) {
                Swal.fire({
                    title: 'Missing Card Details',
                    text: 'Please enter all card details to proceed.',
                    icon: 'error',
                    confirmButtonText: 'Okay',
                });
                return;
            }
            Swal.fire({
                title: 'Are you sure?',
                text: 'You are about to place the order!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Place it!',
                cancelButtonText: 'Cancel'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await fetch("https://adaa-web-backend.onrender.com/create-payment-intent", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                totalAmount: finalTotal,
                            }),
                        });
                        const { clientSecret } = await response.json();

                        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                            payment_method: {
                                card: cardNumberElement,
                                billing_details: {
                                    name: userData.Name,
                                    email: userData.Email,
                                },
                            },
                        });

                        if (error) {
                            Swal.fire({
                                title: 'Payment Failed',
                                text: error.message,
                                icon: 'error',
                                confirmButtonText: 'Okay',
                            });
                        } else {
                            if (paymentIntent.status === "succeeded") {
                                const orderResponse = await addToOrder({
                                    email: userData.Email,
                                    items: orderItems,
                                    paymentMethod,
                                    totalAmount: finalTotal,
                                    address,
                                });

                                if (orderResponse.success) {

                                    setCart([]);
                                    setTotal(0);

                                    Swal.fire({
                                        title: 'Order Placed!',
                                        text: 'Your order has been successfully placed.',
                                        icon: 'success',
                                        confirmButtonText: 'Okay',
                                    });

                                    await emptyCart(userData.Email);
                                    navigate('/shopping/cart');
                                } else {
                                    Swal.fire({
                                        title: 'Error',
                                        text: orderResponse.message || 'Failed to place the order. Please try again.',
                                        icon: 'error',
                                        confirmButtonText: 'Okay',
                                    });
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error placing order:', error.message);
                        Swal.fire({
                            title: 'Error',
                            text: 'Something went wrong. Please try again later.',
                            icon: 'error',
                            confirmButtonText: 'Okay',
                        });
                    }
                }
            });
        } else if (paymentMethod === "COD") {
            Swal.fire({
                title: 'Are you sure?',
                text: 'You are about to place the order!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Place it!',
                cancelButtonText: 'Cancel'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const orderResponse = await addToOrder({
                        email: userData.Email,
                        items: orderItems,
                        paymentMethod,
                        totalAmount: finalTotal,
                        address,
                    });

                    if (orderResponse.success) {
                        setCart([]);
                        setTotal(0);
                        Swal.fire({
                            title: 'Order Placed!',
                            text: 'Your order has been successfully placed and will be delivered shortly.',
                            icon: 'success',
                            confirmButtonText: 'Okay',
                        });
                        await emptyCart(userData.Email);
                        navigate('/shopping/cart');
                    }
                }
            })
        }
    };

    return (
        <div className="checkout-container" style={{ padding: "30px", backgroundColor: "#fceae8" }}>
            <div className="text-center mb-4 h1" style={{ color: "#150647" }}>Checkout</div>
            <div className="card mb-4">
                <div className="card-body">
                    <h3 className="card-title mb-4 mt-1">Review Your Items</h3>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover checkout-table">
                            <thead>
                                <tr>
                                    <th className="text-center" style={{ width: "100px" }}>Image</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th style={{ width: "120px" }}>Action</th>
                                </tr>
                            </thead>
                            {/* <tbody>
                                {cart.map((group, groupIndex) =>
                                    group.map((product, productIndex) => {
                                        const globalIndex = groupIndex * group.length + productIndex;
                                        return (
                                            <tr key={`${groupIndex}-${productIndex}`} style={{ cursor: "pointer" }}>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <img
                                                            src={product.Image || "default-image-path.jpg"}
                                                            alt={product.Title || "Product Image"}
                                                            style={{
                                                                width: "60px",
                                                                height: "60px",
                                                                objectFit: "cover",
                                                                borderRadius: "5px",
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td>{product.Title}</td>
                                                <td>{product.Category}</td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => handleQuantityChange(globalIndex, quantity[globalIndex] - 1)}
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={quantity[globalIndex]}
                                                            style={{
                                                                width: "50px",
                                                                textAlign: "center",
                                                                margin: "0 10px",
                                                                border: "1px solid #ddd",
                                                                borderRadius: "5px",
                                                            }}
                                                        />
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => handleQuantityChange(globalIndex, quantity[globalIndex] + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>₹{product.SalePrice}</td>
                                                <td>₹{(product.SalePrice * quantity[globalIndex]).toFixed(2)}</td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleRemoveItem(groupIndex, product.No)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody> */}

                            
                            <tbody>
                                {cart.map((group, groupIndex) =>
                                    group.map((product, productIndex) => {
                                        const globalIndex = groupIndex * group.length + productIndex;
                                        return (
                                            <tr key={`${groupIndex}-${productIndex}`} style={{ cursor: "pointer" }}>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <img
                                                            src={product.Image || "default-image-path.jpg"}
                                                            alt={product.Title || "Product Image"}
                                                            style={{
                                                                width: "60px",
                                                                height: "60px",
                                                                objectFit: "cover",
                                                                borderRadius: "5px",
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td>{product.Title}</td>
                                                <td>{product.Category}</td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => handleQuantityChange(globalIndex, quantity[globalIndex] - 1)}
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={quantity[globalIndex]}
                                                            style={{
                                                                width: "50px",
                                                                textAlign: "center",
                                                                margin: "0 10px",
                                                                border: "1px solid #ddd",
                                                                borderRadius: "5px",
                                                            }}
                                                        />
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => handleQuantityChange(globalIndex, quantity[globalIndex] + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>₹{product.SalePrice}</td>
                                                <td>₹{(product.SalePrice * quantity[globalIndex]).toFixed(2)}</td>
                                                <td>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleRemoveItem(groupIndex, product.No)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h3 className="card-title mb-4 mt-1">Shipping Address</h3>
                    <input
                        type="text"
                        className="form-control"
                        name="street"
                        placeholder="Street Address"
                        value={address.street}
                        onChange={handleAddressChange}
                    />
                    <input
                        type="text"
                        className="form-control mt-2"
                        name="city"
                        placeholder="City"
                        value={address.city}
                        onChange={handleAddressChange}
                    />
                    <input
                        type="text"
                        className="form-control mt-2"
                        name="state"
                        placeholder="State"
                        value={address.state}
                        onChange={handleAddressChange}
                    />
                    <input
                        type="text"
                        className="form-control mt-2"
                        name="zip"
                        placeholder="ZIP Code"
                        value={address.zip}
                        onChange={handleAddressChange}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title mb-4 mt-1">Order Summary</h3>
                            <div>
                                <p><strong>Items Total:</strong> ₹{total}</p>
                                <p><strong>Shipping:</strong> ₹{shipping}</p>
                                {discount > 0 && (
                                    <p><strong>Discount:</strong> ₹{(discount * total) / 100}</p>
                                )}
                                <p><strong>Total:</strong> ₹{finalTotal}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card mt-4">
                        <div className="card-body">
                            <h3 className="card-title mb-4 mt-1">Coupon Code</h3>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Coupon Code"
                                value={couponCode}
                                onChange={handleCouponChange}
                            />
                            <button
                                className="btn btn-primary mt-2"
                                style={{ backgroundColor: "#150647", padding: "10px 20px" }}
                                onClick={applyCoupon}
                            >
                                Apply Coupon
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title mb-4 mt-1">Payment Options</h3>
                            <div>
                                <div className="mb-2">
                                    <input
                                        type="radio"
                                        name="payment"
                                        id="DebitCard"
                                        className="me-2"
                                        style={{ cursor: "pointer" }}
                                        onChange={handlePaymentChange}
                                    />
                                    <label
                                        htmlFor="DebitCard"
                                        style={{ cursor: "pointer" }}
                                    >
                                        Debit Card
                                    </label>
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="radio"
                                        name="payment"
                                        id="CreditCard"
                                        className="me-2"
                                        style={{ cursor: "pointer" }}
                                        onChange={handlePaymentChange}
                                    />
                                    <label
                                        htmlFor="CreditCard"
                                        style={{ cursor: "pointer" }}
                                    >
                                        Credit Card
                                    </label>
                                </div>
                                <div>
                                    <input
                                        type="radio"
                                        name="payment"
                                        id="COD"
                                        className="me-2"
                                        style={{ cursor: "pointer" }}
                                        onChange={handlePaymentChange}
                                    />
                                    <label
                                        htmlFor="COD"
                                        style={{ cursor: "pointer" }}
                                    >
                                        Cash on Delivery
                                    </label>
                                </div>
                            </div>
                            {(selectedPayment === "DebitCard" || selectedPayment === "CreditCard") && (
                                <div className="mt-4">
                                    <h4 className="mb-3">Enter Card Details</h4>
                                    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
                                        <div style={{ marginBottom: "15px" }}>

                                            <div
                                                style={{
                                                    border: "1px solid #ccc",
                                                    borderRadius: "5px",
                                                    padding: "10px",
                                                }}
                                            >
                                                <CardNumberElement options={{ style: inputStyle }} />
                                            </div>
                                        </div>

                                        {/* Line 2: Expiry and CVC */}
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <div style={{ flex: 1 }}>

                                                <div
                                                    style={{
                                                        border: "1px solid #ccc",
                                                        borderRadius: "5px",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    <CardExpiryElement options={{ style: inputStyle }} />
                                                </div>
                                            </div>
                                            <div style={{ flex: 1 }}>

                                                <div
                                                    style={{
                                                        border: "1px solid #ccc",
                                                        borderRadius: "5px",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    <CardCvcElement options={{ style: inputStyle }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button
                    className="btn btn-primary"
                    style={{ backgroundColor: "#150647", padding: "10px 20px" }}
                    onClick={handlePlaceOrder}
                >
                    Place Order
                </button>
            </div>
        </div>
    );
}

export default function CheckoutWrapper() {
    return (
        <ErrorBoundary>
            <Elements stripe={stripePromise}>
                <ShoppingCheckout />
            </Elements>
        </ErrorBoundary>
    );
} 