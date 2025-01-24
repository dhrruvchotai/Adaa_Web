const express=require('express');
const products=require('../models/Products');

const router=express.Router();

router.get('/products', async (req, res) => {
  try {
      const ans = await products.find();
      res.status(200).send(ans);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send({ error: 'An error occurred while fetching products' });
  }
});

router.get("/productsforwishlist/:id", async (req, res) => {
  try {
    const product = await products.find({
      _id: req.params.id,
    });

    if (!product || product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return the first product from the array since you expect only one
    res.json(product[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the product", error });
  }
});

router.get("/productsforcart/:id", async (req, res) => {
  try {
    const product = await products.find({
      No: req.params.id,
    });
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch the product", error });
  }
});

router.post('/products', async (req, res) => {
  try {
    const newItem = new products({ ...req.body,No: await products.countDocuments() + 1 });
    await newItem.save();
    res.status(201).json({ message: 'Stock added successfully', product: newItem });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
          return res.status(400).json({ message: 'Invalid product ID' });
      }

      const result = await products.findOneAndDelete({ No: productId });
      if (result) {
          res.status(200).json({ message: 'Product deleted successfully!' });
      } else {
          res.status(404).json({ message: 'Product not found!' });
      }
  } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'An error occurred while deleting the product' });
  }
});

router.post('/products/:id', async (req, res) => {
  try {
      const { deletedNo } = req.body;

      if (typeof deletedNo !== 'number') {
          return res.status(400).json({ message: 'Invalid input: deletedNo must be a number' });
      }

      await products.updateMany(
          { No: { $gt: deletedNo } },
          { $inc: { No: -1 } }
      );

      const updatedItems = await products.find().sort({ No: 1 });

      res.status(200).json(updatedItems);
  } catch (error) {
      console.error('Error updating product numbers:', error);
      res.status(500).json({ message: 'An error occurred while updating products' });
  }
});

router.get('/products/stock/:productNo', async (req, res) => {
  try {
      const { productNo } = req.params;
      const product = await products.findOne({ No: productNo });

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ Stock: product.Stock });
  } catch (error) {
      console.error('Error fetching product stock:', error);
      res.status(500).json({ message: 'Failed to fetch product stock' });
  }
});

module.exports=router;