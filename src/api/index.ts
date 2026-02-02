import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000,
});

export const getProducts = (limit = 30) =>
  api.get('/products?limit=' + limit);

export const getCategories = () =>
  api.get('/products/categories');