import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import MainProducts from './pages/MainProducts';
import MainProductImpurities from './pages/MainProductImpurities';
import ImpurityForm from './pages/ImpurityForm';
import Products from './pages/Products';
import DocumentsHub from './pages/DocumentsHub';
import Inquiries from './pages/Inquiries';
import Clients from './pages/Clients';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected CRM Administration Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />

            <Route
              path="/main-products"
              element={
                <ProtectedRoute>
                  <MainProducts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/main-products/:id/impurities"
              element={
                <ProtectedRoute>
                  <MainProductImpurities />
                </ProtectedRoute>
              }
            />

            <Route
              path="/main-products/:mainProductId/impurities/new"
              element={
                <ProtectedRoute>
                  <ImpurityForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/main-products/:mainProductId/impurities/edit/:id"
              element={
                <ProtectedRoute>
                  <ImpurityForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/new"
              element={<Navigate to="/main-products" replace />}
            />

            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute>
                  <ImpurityForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DocumentsHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inquiries"
              element={
                <ProtectedRoute>
                  <Inquiries />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
