const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const products = {
  "laptop": { name: "High-End Workstation", price: 2500, region: "Conflict Zone" },
  "shirt": { name: "Cotton T-Shirt", price: 30, region: "Stable Zone" }
};

// NOTICE THE 'async' KEYWORD BELOW
app.get('/api/analyze/:item', async (req, res) => {
  const item = req.params.item;
  const product = products[item];

  const newsHeadline = item === "laptop" 
    ? "War escalates in chip manufacturing hub, factories closing down." 
    : "Local textile markets see record harvest and peace.";

  try {
    const options = { 
      method: 'POST',
      url: 'https://twinword-sentiment-analysis.p.rapidapi.com/analyze/',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': '80901096a4msh4f1c16c8dee7778p15c5f5jsn9aae9194fb7d',
        'X-RapidAPI-Host': 'twinword-sentiment-analysis.p.rapidapi.com'
      },
      data: new URLSearchParams({ text: newsHeadline })
    };

    const response = await axios.request(options);
    const sentimentScore = response.data.score;
    const isUrgent = sentimentScore < -0.3 && product.region === "Conflict Zone";

    res.json({
      ...product,
      newsHeadline,
      sentimentScore,
      isUrgent,
      recommendation: isUrgent ? "BUY NOW: Prices likely to spike" : "PRICE STABLE: Buy at leisure"
    });

  } catch (error) {
    console.log("Using fallback logic due to API error");
    const mockScore = item === "laptop" ? -0.85 : 0.65; 
    const isUrgent = mockScore < -0.3 && product.region === "Conflict Zone";

    res.json({
      ...product,
      newsHeadline,
      sentimentScore: mockScore + " (Simulated)",
      isUrgent,
      recommendation: isUrgent ? "BUY NOW: Prices likely to spike" : "PRICE STABLE: Buy at leisure"
    });
  }
});

app.listen(5000, () => console.log("Logic Server on Port 5000"));