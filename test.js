import addProduct from './src/services/product.service.js';

addProduct({
  image: "/products/greenDragon.jpeg",
  name: "testing california",
  description: "this is the best sushi you ever tried, it is soo good you woulnot believe it, it is very tasty and good, and also healthy for you, yeah actually if we dont count cheese sushi is so healthy you wouldnt notice but it is very good",
  price: 1.5,
  category: "sushi",
  available: true,
  spicy: true,
  vegetarian: true,
  preparationTime: 30,
  ingredients: ["cucumber","rice","avocado","carrot","seaweed","sesame oil","soy sauce","wasabi","ginger","shiitake mushroom","nori"]
});