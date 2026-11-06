import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy-loaded Pages for Route-Based Code Splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Retailers = lazy(() => import("./pages/Retailers"));
const Orders = lazy(() => import("./pages/Orders"));
const AIRecommendations = lazy(() => import("./pages/AIRecommendations"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Sales = lazy(() => import("./pages/Sales"));
const ProductSuppliers = lazy(() => import("./pages/ProductSuppliers"));
const WeightConfigurations = lazy(() => import("./pages/WeightConfigurations"));
const Weightages = lazy(() => import("./pages/Weightages"));
const HumanEvaluations = lazy(() => import("./pages/HumanEvaluations"));

/**
 * Root application component.
 * Configures all top-level routes for SKUDynamic.
 * Every page is rendered inside DashboardLayout, with Suspense fallback
 * to optimize bundle size and page loading latency.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {/* Default redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route
          path="dashboard"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Dashboard..." />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="products"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Products..." />}>
              <Products />
            </Suspense>
          }
        />
        <Route
          path="inventory"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Inventory..." />}>
              <Inventory />
            </Suspense>
          }
        />
        <Route
          path="suppliers"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Suppliers..." />}>
              <Suppliers />
            </Suspense>
          }
        />
        <Route
          path="retailers"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Retailers..." />}>
              <Retailers />
            </Suspense>
          }
        />
        <Route
          path="sales"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Sales..." />}>
              <Sales />
            </Suspense>
          }
        />
        <Route
          path="/product-suppliers"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Product Suppliers..." />}>
              <ProductSuppliers />
            </Suspense>
          }
        />
        <Route
          path="/weight-configurations"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Configurations..." />}>
              <WeightConfigurations />
            </Suspense>
          }
        />
        <Route
          path="/weightages"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Weightages..." />}>
              <Weightages />
            </Suspense>
          }
        />
        <Route
          path="/human-evaluations"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Evaluations..." />}>
              <HumanEvaluations />
            </Suspense>
          }
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Orders..." />}>
              <Orders />
            </Suspense>
          }
        />
        <Route
          path="ai-recommendations"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading AI Recommendations..." />}>
              <AIRecommendations />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Reports..." />}>
              <Reports />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<LoadingSpinner message="Loading Settings..." />}>
              <Settings />
            </Suspense>
          }
        />

        {/* Fallback: redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
