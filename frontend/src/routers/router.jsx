import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import OwnerDashboard from "../components/OwnerDashboard";
// import StoreOwnerDashboard from "../components/StoreOwnerDashboard";

// A wrapper for protected routes
// const ProtectedRoute = ({ user, allowedRoles, children }) => {
//   if (!user) {
//     return <Login />;
//   }
//   if (!allowedRoles.includes(user.role)) {
//     return <Login />;
//   }
//   return children;
// };

const createAppRouter = (user, setUser) =>
  createBrowserRouter([
    {
      path: "/",
      element: <Login setUser={setUser} />,
    },
    {
      path: "/login",
      element: <Login setUser={setUser} />,
    },
    {
      path: "/register",
      element: <Register setUser={setUser} />,
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute role="USER">
          <UserDashboard user={user} setUser={setUser} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin-dashboard",
      element: (
        <ProtectedRoute role="ADMIN">
          <AdminDashboard user={user} setUser={setUser} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/owner-dashboard",
      element: (
        <ProtectedRoute role="OWNER">
          <OwnerDashboard user={user} setUser={setUser} />
        </ProtectedRoute>
      ),
    },
  ]);

export default createAppRouter;
