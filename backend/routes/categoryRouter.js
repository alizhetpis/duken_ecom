import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';
import { isAdmin, isAuth } from '../utils.js';

const categoryRouter = express.Router();

// Получение списка категорий
categoryRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.send(categories);
  })
);

// Создание новой категории
categoryRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const category = new Category({
      name: req.body.name,
    });
    const createdCategory = await category.save();
    res.send({ message: 'Category Created', category: createdCategory });
  })
);

// Редактирование категории с указанным ID
categoryRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (category) {
      category.name = req.body.name;
      const updatedCategory = await category.save();
      res.send({ message: 'Category Updated', category: updatedCategory });
    } else {
      res.status(404).send({ message: 'Category Not Found' });
    }
  })
);

// Удаление категории с указанным ID
categoryRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (category) {
      const deletedCategory = await category.remove();
      res.send({ message: 'Category Deleted', category: deletedCategory });
    } else {
      res.status(404).send({ message: 'Category Not Found' });
    }
  })
);

export default categoryRouter;
