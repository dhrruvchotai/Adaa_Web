import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useUserDetails from "../../useUserDetails";
import { getCartByEmail, getProductByIdForCart, removeFromCartAPI, emptyCart, addToOrder } from "../API";
import './checkout-style.css';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Stripe publishable key
const stripePromise = loadStripe("pk_test_51QiIllP7psTNMuKWTQRdi2GGhJ5gPG1XAO5H7TLh42MGmQ7FORx515xmjEJqcia4JlX8CPY5a90OqXS2VIKc47Zl00bz7V40Fp");

const cityShippingCharges = {
    "Delhi": 30,
    "Mumbai": 40,
    "Bangalore": 50,
    "Chennai": 60,
    "Kolkata": 70,
    "Hyderabad": 80,
    "New Delhi": 90,
    "Pune": 100,
    
};

function ShoppingCheckout() {
    const { userData, isUserDataReady } = useUserDetails();
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [shipping, setShipping] = useState(30); // Default shipping cost
    const [couponCode, setCouponCode] = useState(""); 
    const [discount, setDiscount] = useState(0); 
    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        zip: "",
    });

    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();


    // Function to calculate shipping based on address
    const calculateShipping = (address) => {
        const city = address.city;
        console.log(city);
        

        // Check the shipping cost based on the city
        const shippingCost = cityShippingCharges[city] || 30; // Default to 30 if city is not found
        setShipping(shippingCost);
    };

    // Handle address input change
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prevAddress => {
            const updatedAddress = { ...prevAddress, [name]: value };
            // Recalculate shipping whenever the address is updated
            calculateShipping(updatedAddress);
            return updatedAddress;
        });
    };

    // Validate address before proceeding to payment
    const validateAddress = () => {
        return address.street && address.city && address.state && address.zip;
    };

    useEffect(() => {
        if (isUserDataReady && userData?.Email) {
            const fetchCartProducts = async () => {
                try {
                    const user = await getCartByEmail(userData.Email);
                    const productIds = user?.Cart || [];
                    const products = await Promise.all(
                        productIds.map(async (id) => {
                            const product = await getProductByIdForCart(id);
                            return product;
                        })
                    );
                    setCart(products);
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

        const discountedTotal = totalAmount - (totalAmount * (discount / 100));
        setTotal(discountedTotal + shipping); // Add shipping cost after discount
    }, [cart, discount, shipping]);

    const handleCouponChange = (e) => {
        setCouponCode(e.target.value);
    };

    const applyCoupon = async () => {
        try {
            const response = await fetch("http://localhost:3001/verify-coupon", {
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

    const handlePlaceOrder = async () => {
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

        if (!validateAddress()) {
            Swal.fire({
                title: "Missing Shipping Address",
                text: "Please provide a shipping address to proceed.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }

        const paymentMethod = selectedPayment.id;
        const orderItems = cart.flat().map(product => product.No);

        if (paymentMethod === "DebitCard" || paymentMethod === "UPI") {
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
                        const response = await fetch("http://localhost:3001/create-payment-intent", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                totalAmount: total + shipping,
                            }),
                        });
                        const { clientSecret } = await response.json();

                        const cardElement = elements.getElement(CardElement);

                        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                            payment_method: {
                                card: cardElement,
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
                                    totalAmount: total + shipping,
                                    address, // Include shipping address in the order
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
                title: 'Order Placed!',
                text: 'Your order has been successfully placed and will be delivered shortly.',
                icon: 'success',
                confirmButtonText: 'Okay',
            });
            await addToOrder({
                email: userData.Email,
                items: orderItems,
                paymentMethod,
                totalAmount: total + shipping,
                address, // Include shipping address in the order
            });

            await emptyCart(userData.Email);
            navigate('/shopping/cart');
        }
    };

    return (
        <div className="checkout-container" style={{ padding: "30px", backgroundColor: "#fceae8" }}>
            <div className="card">
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

            <div className="card">
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

            <div className="card">
                <div className="card-body">
                    <h3 className="card-title mb-4 mt-1">Payment Summary</h3>
                    <div>
                        <p><strong>Subtotal:</strong> ${cart.reduce((total, group) => {
                            return total + group.reduce((groupTotal, product) => {
                                return groupTotal + (product.SalePrice * (product.Quantity || 1));
                            }, 0);
                        }, 0)}</p>
                        <p><strong>Discount:</strong> {discount}%</p>
                        <p><strong>Shipping:</strong> ${shipping}</p>
                        <p><strong>Total:</strong> ${total}</p>
                    </div>
                    <div>
                        <h4>Payment Options</h4>
                        <p>
                            <input 
                                type="radio" 
                                name="payment" 
                                id="DebitCard" 
                                className="me-2"
                                style={{cursor: "pointer"}}
                            /> 
                            <label htmlFor="DebitCard" style={{cursor: "pointer"}}>Debit Card</label>
                        </p>
                        <p>
                            <input 
                                type="radio" 
                                name="payment" 
                                id="UPI" 
                                className="me-2"
                                style={{cursor: "pointer"}}
                            />  
                            <label htmlFor="UPI" style={{cursor: "pointer"}}>UPI</label>
                        </p>
                        <p>
                            <input 
                                type="radio" 
                                name="payment" 
                                id="COD" 
                                className="me-2"
                                style={{cursor: "pointer"}} 
                            /> 
                            <label htmlFor="COD" style={{cursor: "pointer"}}>Cash on Delivery</label>
                        </p>
                    </div>
                    <div>
                        <h4>Enter Card Details</h4>
                        <CardElement />
                    </div>
                </div>
            </div>  

            <div className="text-center">
                <button
                    className="btn btn-primary"
                    style={{ backgroundColor: "#150647", padding: "10px 20px" }}
                    onClick={handlePlaceOrder}
                    disabled={!stripe || !elements || !validateAddress()}
                >
                    Place Order
                </button>
            </div>
        </div>
    );
}

export default function CheckoutWrapper() {
    return (
        <Elements stripe={stripePromise}>
            <ShoppingCheckout />
        </Elements>
    );
}
