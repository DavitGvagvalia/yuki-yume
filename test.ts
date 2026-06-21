import addProduct from './src/services/product.service.js'
import type { Product } from './src/schemes/templates'

type ProductInput = Pick<Product, "name" | "price"> & {
  ingredients: string
}

const products: ProductInput[] = [
  {
    name: "Unagi Philadelphia",
    price: 36,
    ingredients: "Sushi rice, nori, cream cheese, avocado, cucumber, unagi, unagi sauce, sesame",
  },
  {
    name: "California with snow crab",
    price: 29,
    ingredients: "Sushi rice, nori, snow crab, avocado, cucumber, tobiko",
  },
  {
    name: "California with shrimp",
    price: 32,
    ingredients: "Sushi rice, nori, shrimp, avocado, cucumber, tobiko",
  },
  {
    name: "California with salmon",
    price: 36,
    ingredients: "Sushi rice, nori, salmon, avocado, cucumber, tobiko",
  },
  {
    name: "Canada Unagi",
    price: 38,
    ingredients: "Sushi rice, nori, salmon, cream cheese, avocado, cucumber, unagi, unagi sauce, sesame",
  },
  {
    name: "Green Dragon",
    price: 32,
    ingredients: "Sushi rice, nori, shrimp tempura, cucumber, cream cheese, avocado, unagi sauce, sesame",
  },
  {
    name: "Alaska Bonito",
    price: 30,
    ingredients: "Sushi rice, nori, salmon, cream cheese, tomago, cucumber, sesame, bonito flakes",
  },
  {
    name: "Cream Arizona",
    price: 32,
    ingredients: "Sushi rice, nori, salmon, cream cheese, avocado, cucumber, sesame",
  },
  {
    name: "Arizona Deluxe",
    price: 36,
    ingredients: "Sushi rice, nori, salmon, avocado, cucumber, sesame",
  },
  {
    name: "Salmon New York",
    price: 46,
    ingredients: "Sushi rice, nori, salmon, avocado, cucumber",
  },
  {
    name: "Unagi New York",
    price: 44,
    ingredients: "Sushi rice, nori, salmon, avocado, cucumber, unagi, unagi sauce, sesame",
  },
]

function createClassicRollProduct(product: ProductInput): Product {
  return {
    image: "products/greenDragon.jpeg",
    name: product.name,
    description: `${product.name} is a classic sushi roll.`,
    price: product.price,
    category: "Classic Rolls",
    available: true,
    spicy: false,
    vegetarian: false,
    preparationTime: 10,
    ingredients: product.ingredients
      .split(",")
      .map((ingredient) => ingredient.trim()),
  }
}

async function addProducts() {
  for (const productInput of products) {
    const product = createClassicRollProduct(productInput)
    await addProduct(product)
  }
}

addProducts()
