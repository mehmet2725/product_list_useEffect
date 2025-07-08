import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  // localStorage'tan tema tercihine bak
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? true : false;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    // body class'ını güncelle
    document.body.className = darkMode ? 'dark' : 'light';
    // localStorage'a tema tercihine göre kaydet
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <>
      <button className="toggle-btn" onClick={() => setDarkMode(prev => !prev)}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <ProductList />
    </>
  );
}

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 30;

  // İlk yüklemede ürünleri getir
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Arama ve filtreleme için useEffect
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async (skip = 0) => {
    setLoading(true);
    try {
      const response = await fetch(`https://dummyjson.com/products?limit=${ITEMS_PER_PAGE}&skip=${skip}`);
      const data = await response.json();

      if (skip === 0) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }

      // Daha fazla ürün var mı kontrol et
      setHasMore(data.products.length === ITEMS_PER_PAGE && (skip + ITEMS_PER_PAGE) < data.total);
      setCurrentPage(Math.floor(skip / ITEMS_PER_PAGE) + 1);

      console.log('Fetched products:', data.products);
      console.log('Total products loaded:', skip === 0 ? data.products.length : products.length + data.products.length);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://dummyjson.com/products/categories');
      const data = await response.json();
      setCategories(data);
      console.log('Categories:', data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
    console.log('Filtered products:', filtered);
  };

  const handleLoadMore = () => {
    const nextSkip = currentPage * ITEMS_PER_PAGE;
    fetchProducts(nextSkip);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    console.log('Search term:', e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    console.log('Selected category:', e.target.value);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="page-title">Product List</h1>

        {/* Arama ve Filtreleme */}
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ürün Listesi */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="thumbnail">
                <img src={product.thumbnail} alt={product.title} />
              </div>

              <div className="product-info">
                <h3 className="title">{product.title}</h3>
                <p className="description">{product.description}</p>

                <div className="price-stock">
                  <span className="price">${product.price}</span>
                  <span className="stock">Stock: {product.stock}</span>
                </div>

                <div className="category-tag">
                  {product.category}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && !searchTerm && !selectedCategory && (
          <div className="load-more-container">
            <button onClick={handleLoadMore} className="load-more-btn">
              Load More Products
            </button>
          </div>
        )}

        {/* No More Products */}
        {!hasMore && !searchTerm && !selectedCategory && (
          <div className="no-more">
            <p>No more products to load</p>
          </div>
        )}
      </div>
    </div>
  );
};

