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

router.get("/products/:id", async (req, res) => {
  try {
    const product = await products.findOne({
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
    const { Title, ...otherFields } = req.body;

    const existingProduct = await products.findOne({ Title });

    let similarityValue;
    if (existingProduct) {
      similarityValue = existingProduct.Similarity;
    } 
    else {
      const distinctTitlesCount = await products.distinct("Title").then(titles => titles.length);
      similarityValue = distinctTitlesCount + 1;
    }

    const newItem = new products({
      ...otherFields,
      Title,
      No: await products.countDocuments() + 1,
      purchaseCount: 0,
      viewCount: 0,
      Similarity: similarityValue,
      Reviews:[],
    });

    await newItem.save();

    res.status(201).json({ message: 'Stock added successfully', product: newItem });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
});

router.put('/products/:no/update-stock', async (req, res) => {
  const productNo = parseInt(req.params.no);
  const { Stock } = req.body;
  try {
      const product = await products.findOne({ No: productNo });
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      if (Stock < 0) {
          return res.status(400).json({ message: "Stock cannot be negative" });
      }
      product.Stock = Stock;
      await product.save();
      res.json({ message: "Stock updated successfully", product });
  } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ message: "Internal server error", error: error.message });
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

router.get("/productsforwishlist/:id", async (req, res) => {
  try {
    const product = await products.find({
      _id: req.params.id,
    });

    if (!product || product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

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

router.post("/add-review/:id", async (req, res) => {
  const { id } = req.params;
  const { username, review } = req.body;

  if (!username || !review) {
      return res.status(400).json({ message: "Username and review are required." });
  }

  try {
      const product = await products.findOne({No: id});
      if (!product) {
          return res.status(404).json({ message: "Product not found." });
      }

      product.Reviews.push({ username, review });

      await product.save();

      res.status(200).json({ message: "Review added successfully.", product });
  } catch (error) {
      res.status(500).json({ message: "Error adding review.", error: error.message });
  }
});

router.get("/:productNo/reviews", async (req, res) => {
  const { productNo } = req.params;

  try {
      const product = await products.findOne({ No: productNo });
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product.Reviews);
  } catch (error) {
      res.status(500).json({ message: "Error fetching reviews", error });
  }
});

router.get('/products/analytics/purchasecount', async (req, res) => {
  try {

      const mostBoughtProducts = await products.find()
          .sort({ purchaseCount: -1 })
          .limit(5);

      if (mostBoughtProducts.length === 0) {
          return res.status(404).json({ message: 'No products found.' });
      }

      res.status(200).json({ message: 'Most bought products fetched successfully.', products: mostBoughtProducts });
  } catch (error) {
      console.error('Error fetching most bought products:', error);
      res.status(500).json({ message: 'Failed to fetch most bought products.', error: error.message });
  }
});

router.get("/products/analytics/viewcount", async (req, res) => {
  try {
    const product = await products.find()
    .sort({ viewCount: -1 })
          .limit(7);
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});


router.put("/products/increase-viewcount/:id", async (req, res) => {

  try {
    const product = await products.findOneAndUpdate(
      { No: req.params.id },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Failed to increment viewCount:", error);
    res.status(500).json({ message: "Failed to increase view count", error });
  }
});



module.exports=router;