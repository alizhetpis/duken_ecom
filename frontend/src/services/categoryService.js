// frontend/src/services/categoryService.js

import axios from 'axios';

export const getCategories = async () => {
  try {
    const { data } = await axios.get('/api/categories');
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (category, token) => {
  try {
    const { data } = await axios.post(
      '/api/categories',
      { name: category },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  const { data } = await axios.delete(`/api/categories/${categoryId}`);
  return data;
};
