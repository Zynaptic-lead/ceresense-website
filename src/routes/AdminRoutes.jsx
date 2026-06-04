import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import BlogManagement from "../pages/admin/BlogManagement";
import GalleryManagement from "../pages/admin/GalleryManagement";
import UserManagement from "../pages/admin/UserManagement";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="blog" element={<BlogManagement />} />
        <Route path="gallery" element={<GalleryManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;