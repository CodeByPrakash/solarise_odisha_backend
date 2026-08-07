import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "40px" }}>
      <h1>Solarise Dashboard</h1>

      {user ? (
        <>
          <h2>Welcome, {user.full_name}</h2>

          <p>Email: {user.email}</p>
          <p>Phone: {user.phone}</p>
          <p>Role: {user.role}</p>

          <button onClick={logout}>
            Logout
          </button>
        </>
      ) : (
        <p>No user logged in.</p>
      )}
    </div>
  );
};

export default Dashboard;