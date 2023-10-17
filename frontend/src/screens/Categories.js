import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Container, Form, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

// Reducer для управления состоянием страницы
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, categories: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function Categories() {
  const [{ loading, error, categories }, dispatch] = useReducer(reducer, {
    loading: true,
    categories: [],
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/categories', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: data,
        });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        const { data } = await axios.put(
          `/api/categories/${selectedCategory._id}`,
          { name },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('Category updated successfully');
        setSelectedCategory(null);
        setName('');
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: categories.map((x) => (x._id === data._id ? data : x)),
        });
      } else {
        const { data } = await axios.post(
          '/api/categories',
          { name },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('Category created successfully');
        setName('');
        dispatch({ type: 'FETCH_SUCCESS', payload: [...categories, data] });
      }
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const editHandler = (category) => {
    setSelectedCategory(category);
    setName(category.name);
  };

  const cancelEditHandler = () => {
    setSelectedCategory(null);
    setName('');
  };

  const deleteHandler = async (category) => {
    if (window.confirm(`Are you sure to delete ${category.name}?`)) {
      try {
        await axios.delete(`/api/categories/${category._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Category deleted successfully');
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: categories.filter((x) => x._id !== category._id),
        });
      } catch (error) {
        toast.error(getError(error));
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Categories</title>
      </Helmet>
      <h1>Categories</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CATEGORY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>{category._id}</td>
                  <td>{category.name}</td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => editHandler(category)}
                    >
                      Edit
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(category)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Form onSubmit={submitHandler} className="d-flex align-items-center">
            <Form.Control
              type="text"
              placeholder="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mr-2"
              style={{ width: '400px', marginRight: '1rem' }}
            />
            {selectedCategory ? (
              <>
                <Button type="button" className="mr-2" onClick={submitHandler}>
                  Update Category
                </Button>
                <Button
                  type="button"
                  variant="light"
                  onClick={cancelEditHandler}
                  className="mr-2"
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" onClick={submitHandler} variant="primary">
                Create Category
              </Button>
            )}
          </Form>
        </>
      )}
    </div>
  );
}

export default Categories;
