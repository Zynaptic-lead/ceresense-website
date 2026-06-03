import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminRegister from "../pages/admin/AdminRegister";
import AdminDashboard from "../pages/admin/AdminDashboard";
import BlogManagement from "../pages/admin/BlogManagement";
import GalleryManagement from "../pages/admin/GalleryManagement";
import UserManagement from "../pages/admin/UserManagement";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="register" element={<AdminRegister />} />
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="blog" element={<BlogManagement />} />
        <Route path="gallery" element={<GalleryManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;