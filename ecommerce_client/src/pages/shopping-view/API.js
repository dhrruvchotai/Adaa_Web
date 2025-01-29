const api = 'http://localhost:3001';

export const fetchProducts = async () => {
    try {
        const response = await fetch(api + '/products');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const response = await fetch(`${api}/products/${id}`, { method: "GET" });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch product with ID ${id}:`, error);
        throw error;
    }
};

export const getProductByIdForCart = async (id) => {
    try {
        const response = await fetch(`${api}/productsforcart/${id}`, { method: "GET" });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch product with ID ${id}:`, error);
        throw error;
    }
};

export const removeFromCartAPI = async (userEmail, productId) => {
    try {
        const response = await fetch(api + "/cart/remove", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userEmail,
                productId,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to remove product from cart");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error removing product from cart:", error.message);
        return { error: error.message };
    }
};

export const getCartByEmail = async (email) => {
    try {
        const res = await fetch(api + '/cart/' + email, { method: "GET" });
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error in getCartByEmail:", error);
        throw error;
    }
};

export const addToCartAPI = async (userEmail, productId) => {
    try {
        const response = await fetch(api+"/cart/add", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userEmail, productId }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error adding product to cart:", error);
        throw error;
    }
};

export const emptyCart = async (email) => {
    try {
        const response = await fetch(api+'/cart/empty', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error clearing cart:", error);
        return { success: false, message: 'Something went wrong. Please try again later.' };
    }
};

export const getOrdersByEmail = async (email) => {
    try {
        const res = await fetch(api + '/orders/' + email, { method: "GET" });
        if (!res.ok) {
            throw new Error(`Error: ${res.statusText}`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
};

export const addToOrder = async ({ email, items, paymentMethod, totalAmount, address }) => {
    const formatOrderDate = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const orderDate = formatOrderDate();
    try {
        const response = await fetch(api+'/order/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                items,
                paymentMethod,
                totalAmount,
                address,
                orderDate
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to place the order.');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error placing order:', error.message);
        return { success: false, message: error.message };
    }
};

export const getProductStock = async (productNo) => {
    try {
        const response = await fetch(api+'/products/stock/'+productNo);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && data.Stock !== undefined) {
            return data.Stock;
        } else {
            throw new Error('Stock information not available');
        }
    } catch (error) {
        console.error("Failed to fetch product stock:", error);
        throw error;
    }
};
   
export const getRecommendations = async (email) => {
    try {
        const response = await fetch(api + '/recommendations/' + email);
        if (!response.ok) {
            throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        throw new Error("Failed to fetch recommendations");
    }
};

export const addToWishlistAPI = async (email, productId) => {
    try {
        const response = await fetch('http://localhost:3001/wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email, // Ensure this is a valid email
                productId: productId, // Ensure productId is correct (valid ObjectId as string)
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to add to wishlist');
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to update wishlist:', error);
        throw error;
    }
};

export const getWishlistByEmail = async (email) => {
    const response = await fetch(`${api}/wishlist/${email}`);
    if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
    }
    return response.json();
};

export const getProductByIdForWishlist = async (id) => {
    try {
        const response = await fetch(`${api}/productsforwishlist/${id}`, { method: "GET" });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch product with ID ${id}:`, error);
        throw error;
    }
};

export const addReviewAPI = async (productNo, username, review) => {
    const response = await fetch(api+'/add-review/'+productNo, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, review }),
    });
    if (!response.ok) {
        throw new Error("Failed to add review");
    }
};

export const getReviewsAPI = async (productNo) => {
    const response = await fetch(api+'/'+productNo+'/reviews');
    if (!response.ok) {
        throw new Error("Failed to fetch reviews");
    }
    return response.json();
};