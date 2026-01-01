import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
} from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function UserDashboard({ user, setUser }) {
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [search, setSearch] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // --- Fetch stores & ratings ---
  useEffect(() => {
    const fetchStoresAndRatings = async () => {
      try {
        const token = localStorage.getItem("token");

        const storeRes = await fetch(
          `http://localhost:4002/api/stores?q=${search}&sort=${sortField}&order=${sortOrder}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const storeData = await storeRes.json();
        setStores(storeData.stores || []);

        const ratingRes = await fetch("http://localhost:4002/api/ratings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ratingData = await ratingRes.json();
        setRatings(ratingData.ratings || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchStoresAndRatings();
  }, [search, sortField, sortOrder]);

  // --- Store ratings ---
  const storeRatings = useMemo(() => {
    const ratingMap = {};
    stores.forEach((s) => {
      const storeRatings = ratings.filter((r) => r.storeId === s.id);
      const avg =
        storeRatings.length > 0
          ? (
              storeRatings.reduce((acc, r) => acc + r.value, 0) /
              storeRatings.length
            ).toFixed(1)
          : "N/A";
      ratingMap[s.id] = avg;
    });
    return ratingMap;
  }, [stores, ratings]);

  // --- User ratings ---
  const userRatings = ratings.reduce((acc, r) => {
    if (r.userId === user.id) acc[r.storeId] = r.value;
    return acc;
  }, {});

  // --- Submit rating ---
  const handleRating = async (storeId, value) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4002/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId, value }),
      });

      const data = await res.json();

      if (data.success) {
        setRatings((prev) => {
          const existing = prev.find(
            (r) => r.userId === user.id && r.storeId === storeId
          );
          if (existing) {
            return prev.map((r) =>
              r.userId === user.id && r.storeId === storeId
                ? { ...r, value }
                : r
            );
          }
          return [
            ...prev,
            { id: prev.length + 1, userId: user.id, storeId, value },
          ];
        });
      } else {
        alert("Failed to submit rating");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting rating");
    }
  };

  // --- Update password ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6)
      return alert("Password must be at least 6 characters");

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:4002/api/auth/user/update-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setPasswordUpdated(true);
        setNewPassword("");
        setTimeout(() => setPasswordUpdated(false), 3000);
        navigate("/login");
      } else {
        alert(data.message || "Password update failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Filter stores ---
  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea, #764ba2, #d36476)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Container fluid>
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="d-flex flex-column flex-md-row justify-content-between align-items-md-center"
            >
              <h2 className="fw-bold text-white mb-2">
                👤 Welcome, {user.name}
              </h2>
              <Button
                variant="danger"
                size="sm"
                className="rounded-pill py-2 px-2 px-md-3 shadow"
                onClick={() => {
                  localStorage.removeItem("user");
                  setUser(null);
                  navigate("/login");
                }}
              >
                🚪 Logout
              </Button>
            </motion.div>
          </Col>
        </Row>

        {/* Password Update */}
        {/* Password Update + Search + Sorting Section */}
<Row className="mb-4 g-4">
  {/* Update Password */}
  <Col lg={4} md={6}>
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-lg border-0 bg-light bg-opacity-75 rounded-4 h-100">
        <Card.Header className="fw-bold bg-primary text-white rounded-top-4">
          🔑 Update Password
        </Card.Header>
        <Card.Body>
          {passwordUpdated && (
            <Alert variant="success">Password updated successfully!</Alert>
          )}
          <Form onSubmit={handlePasswordUpdate}>
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  </Col>

  {/* Search and Sorting */}
  <Col lg={8} md={6}>
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-lg border-0 bg-light bg-opacity-75 rounded-4 h-100">
        <Card.Header className="fw-bold bg-info text-white rounded-top-4">
          🔍 Search & Sorting
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search stores by name or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="shadow-sm"
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="shadow-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="address">Sort by Address</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="shadow-sm"
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </motion.div>
  </Col>
</Row>


        {/* Stores */}
        <Row>
          <Col>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="shadow-lg border-0 bg-light bg-opacity-75 rounded-4">
                <Card.Header className="fw-bold bg-success text-white rounded-top-4">
                  🏬 Stores
                </Card.Header>
                <Card.Body>
                  {/* --- Desktop Table --- */}
                  <div className="d-none d-md-block">
                    <Table
                      striped
                      bordered
                      hover
                      responsive
                      className="align-middle text-center"
                    >
                      <thead className="table-success">
                        <tr>
                          <th>Store Name</th>
                          <th>Address</th>
                          <th>Overall Rating ⭐</th>
                          <th>Your Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStores.map((store) => (
                          <tr key={store.id}>
                            <td>{store.name}</td>
                            <td>{store.address}</td>
                            <td>{storeRatings[store.id]}</td>
                            <td>
                              <Form.Select
                                value={userRatings[store.id] || ""}
                                onChange={(e) =>
                                  handleRating(
                                    store.id,
                                    parseInt(e.target.value)
                                  )
                                }
                              >
                                <option value="">Rate</option>
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <option key={val} value={val}>
                                    {val}
                                  </option>
                                ))}
                              </Form.Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* --- Mobile Card View --- */}
                  <div className="d-block d-md-none">
                    {filteredStores.map((store) => (
                      <div
                        key={store.id}
                        className="card mb-3 shadow-sm border-0"
                        style={{ borderRadius: "12px" }}
                      >
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-success">
                            {store.name}
                          </h6>
                          <p className="mb-1">
                            <strong>📍 Address:</strong> {store.address}
                          </p>
                          <p className="mb-1">
                            <strong>⭐ Overall Rating:</strong>{" "}
                            {storeRatings[store.id]}
                          </p>
                          <div>
                            <strong>📝 Your Rating:</strong>
                            <Form.Select
                              size="sm"
                              className="mt-2"
                              value={userRatings[store.id] || ""}
                              onChange={(e) =>
                                handleRating(store.id, parseInt(e.target.value))
                              }
                            >
                              <option value="">Rate</option>
                              {[1, 2, 3, 4, 5].map((val) => (
                                <option key={val} value={val}>
                                  {val}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
