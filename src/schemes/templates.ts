
type TemplateObject = Record<string, any>;

function createFromTemplate<T extends TemplateObject>(
  defaults: T,
  requiredFields: (keyof T)[],
  data: Partial<T> = {}
): T {
  for (const key of Object.keys(data)) {
    if (!(key in defaults)) {
      throw new Error(`Invalid key: ${key}`);
    }
  }

  for (const field of requiredFields) {
    const value = data[field];

    if (
      !(field in data) ||
      value === null ||
      value === undefined ||
      value === ""
    ) {
      throw new Error(`Missing required field: ${String(field)}`);
    }
  }

  return {
    ...defaults,
    ...data,
  };
}




export type Product = {
  image: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  spicy: boolean;
  vegetarian: boolean;
  preparationTime: number;
  ingredients: string[];
};

export const productDefaults: Product = {
  image: "",
  name: "",
  description: "",
  price: 0,
  category: "",
  available: true,
  spicy: false,
  vegetarian: false,
  preparationTime: 0,
  ingredients: [],
};

export const productRequiredFields: (keyof Product)[] = [
  "image",
  "name",
  "description",
  "price",
  "image"
];

export function createProduct(data: Partial<Product> = {}): Product {
  return createFromTemplate(productDefaults, productRequiredFields, data);
}



export type Review = {
  reviewer: string;
  product: string;
  review: string;
  stars: number;
};

export const reviewDefaults: Review = {
  reviewer: "",
  product: "",
  review: "",
  stars: 0,
};

export const reviewRequiredFields: (keyof Review)[] = [
  "reviewer",
  "product",
  "review",
  "stars",
];

export function createReview(data: Partial<Review> = {}): Review {
  return createFromTemplate(reviewDefaults, reviewRequiredFields, data);
}

export type Order = {
  id: string;
  table: string;
  products: string[];
  date: string;
  totalPrice: number;
  status: string;
};

export const orderDefaults: Order = {
  id: "",
  table: "",
  products: [],
  date: "",
  totalPrice: 0,
  status: "",
};

export const orderRequiredFields: (keyof Order)[] = [
  "id",
  "table",
  "products",
  "date",
  "totalPrice",
  "status",
];

export function createOrder(data: Partial<Order> = {}): Order {
  return createFromTemplate(orderDefaults, orderRequiredFields, data);
}

