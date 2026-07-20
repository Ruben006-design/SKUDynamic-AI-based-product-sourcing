import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Retailers from "./pages/Retailers";
import Orders from "./pages/Orders";
import AIRecommendations from "./pages/AIRecommendations";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Sales from "./pages/Sales";
import ProductSuppliers from "./pages/ProductSuppliers";
import WeightConfigurations from "./pages/WeightConfigurations";
import Weightages from "./pages/Weightages";
import HumanEvaluations from "./pages/HumanEvaluations";
/**
 * Root application component.
 * Configures all top-level routes for SKUDynamic.
 * Every page is rendered inside DashboardLayout, which provides
 * the persistent sidebar, topbar, and content shell.
 * BrowserRouter is provided at the entry point (main.jsx).
 */

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {/* Default redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="retailers" element={<Retailers />} />
        <Route path="sales" element={<Sales />} />
        <Route
          path="/product-suppliers"
          element={<ProductSuppliers />}
        />
        <Route
          path="/weight-configurations"
          element={<WeightConfigurations />}
        />
        <Route
          path="/weightages"
          element={<Weightages />}
        />
        <Route
          path="/human-evaluations"
          element={<HumanEvaluations />}
        />
        <Route path="orders" element={<Orders />} />
        <Route path="ai-recommendations" element={<AIRecommendations />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />

        {/* Fallback: redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
