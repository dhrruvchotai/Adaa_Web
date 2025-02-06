import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMostBoughtProducts, getViewCountProducts, getFrequentBuyers } from '../API';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement } from 'chart.js';
import './analytics-style.css';
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);
const BusinessAnalytics = () => {
    const [products, setProducts] = useState([]);
    const [viewCountProducts, setViewCountProducts] = useState([]);
    const [frequentBuyers, setFrequentBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const result = await getMostBoughtProducts();
                setProducts(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    useEffect(() => {
        const fetchViewCountProducts = async () => {
            try {
                const result = await getViewCountProducts();
                setViewCountProducts(result);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchViewCountProducts();
    }, []);
    useEffect(() => {
        const fetchFrequentBuyers = async () => {
            try {
                const result = await getFrequentBuyers();
                setFrequentBuyers(result);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchFrequentBuyers();
    }, []);
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    const purchaseCountData = {
        labels: products.map((product) => `${product.Brand} - ${product.Title} (${product.Category})`),
        datasets: [
            {
                label: 'Purchases',
                data: products.map((product) => product.purchaseCount),
                backgroundColor: products.map(() => `#${Math.floor(Math.random() * 1637).toString(16)}`),
                borderColor: '#fff',
                borderWidth: 2,
            }
        ]
    };
    const viewCountData = {
        labels: viewCountProducts.map((product) => `${product.Brand} - ${product.Title} (${product.Category})`),
        datasets: [
            {
                label: 'Views',
                data: viewCountProducts.map((product) => product.viewCount),
                backgroundColor: viewCountProducts.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`),
                borderColor: '#fff',
                borderWidth: 2,
            }
        ]
    };
    const frequentBuyersData = {
        labels: frequentBuyers.map((buyer) => `${buyer.Email}`),
        datasets: [
            {
                label: 'Orders Placed',
                data: frequentBuyers.map((buyer) => buyer.orderCount),
                backgroundColor: '#FF7F50',
                borderColor: '#333333',
                borderWidth: 2,
            }
        ]
    };
    const chartOptions = (labelText, dataset = []) => ({
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw} ${labelText}`;
                    }
                }
            },
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 20,
                    font: { size: 14 },
                }
            },
            title: {
                display: true,
                text: labelText,
                font: { size: 18 },
            }
        },
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const clickedIndex = elements[0].index;
                const clickedProduct = dataset[clickedIndex];
                if (clickedProduct && clickedProduct.No) {
                    navigate('/admin/products/' + clickedProduct.No);
                }
            }
        }
    });
    const barChartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw} Orders`;
                    }
                }
            },
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: "Orders Placed",
                font: { size: 18 },
            }
        },
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: Math.max(...frequentBuyers.map(buyer => buyer.orderCount), 10), 
                ticks: {
                    stepSize: 1,
                },
            }
        }
    };
    
    return (
        <div className="analytics-container">
            <div className="row mb-3">
                <div className="col text-center fw-bold" style={{ fontSize: "45px",color:"white" }}>
                    Analytics
                </div>
            </div>
            {/* Row for Pie Charts */}
            <div className="row">
                <div className="col-md-6 chart-container">
                    <h4 style={{color:"white"}}>Product Purchase Analytics</h4>
                    <div className="pie-chart-wrapper">
                        <Pie data={purchaseCountData} options={chartOptions("Purchases", products)} />
                    </div>
                </div>
                <div className="col-md-6 chart-container" style={{color:"white"}}>
                    <h4>Product View Count Analytics</h4>
                    <div className="pie-chart-wrapper">
                        <Pie data={viewCountData} options={chartOptions("Views", viewCountProducts)} />
                    </div>
                </div>
            </div>
            {/* Row for Bar Chart */}
            <div className="row mt-4">
                <div className="col-12 chart-container">
                    <h4 style={{color:"white"}}>Most Frequent Buyers</h4>
                    <div className="bar-chart-wrapper">
                        <Bar data={frequentBuyersData} options={barChartOptions} style={{backgroundColor : "white"}}/>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default BusinessAnalytics;