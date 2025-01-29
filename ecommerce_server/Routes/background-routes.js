const express=require('express');
const bgs=require('../models/Backgrounds');

const router=express.Router();

router.get('/bgs', async (req, res) => {
  try {
      const ans = await bgs.find();
      res.status(200).send(ans);
  } catch (error) {
      console.error('Error fetching backgrounds:', error);
      res.status(500).send({ error: 'An error occurred while fetching backgrounds' });
  }
});

router.post('/bgs/add', async (req, res) => {
  try {
    const { URL } = req.body;    
    const newItem = new bgs({
      URL
    });

    await newItem.save();

    res.status(201).json({ message: 'Background added successfully', bg: newItem });
  } catch (error) {
    console.error('Error adding background:', error);
    res.status(500).json({ message: 'Failed to add background', error: error.message });
  }
});


router.post('/bgs/select', async (req, res) => {
  const { id } = req.body;

  try {
    await bgs.updateMany({}, { selected: false });

    const updatedBg = await bgs.findByIdAndUpdate(
        id,
        { selected: true }
    );

    if (!updatedBg) {
        return res.status(404).json({ message: 'Background not found' });
    }

    res.status(200).json({ message: 'Background selected successfully', bg: updatedBg });
  } catch (error) {
      console.error('Error selecting background:', error);
      res.status(500).json({ message: 'Failed to select background', error: error.message });
  }
});

module.exports = router;