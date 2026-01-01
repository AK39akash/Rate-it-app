import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Hook for screen size detection
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export default function OwnerDashboard({ setUser }) {
  const [stores, setStores] = useState([]);
  const [ownerName, setOwnerName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (user) {
      setOwnerName(user.name);
      fetchOwnerStores();
    }
  }, []);

  async function fetchOwnerStores(sortBy = "value", order = "DESC") {
    try {
      const storeRes = await fetch(
        "http://localhost:4002/api/stores/my-stores",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const storesData = await storeRes.json();
      if (!storeRes.ok)
        throw new Error(storesData.error || "Failed to fetch stores");

      const storesWithRatings = await Promise.all(
        storesData.map(async (store) => {
          const res = await fetch(
            `http://localhost:4002/api/ratings/store/${store.id}/raters?sort=${sortBy}&order=${order}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const raters = await res.json();

          let avg = 0;
          if (res.ok && raters.length > 0) {
            avg = (
              raters.reduce((sum, r) => sum + r.value, 0) / raters.length
            ).toFixed(2);
          }

          return {
            ...store,
            raters: res.ok ? raters : [],
            averageRating: avg,
            sortOption: `${sortBy}_${order}`,
          };
        })
      );

      setStores(storesWithRatings);
    } catch (err) {
      console.error("Failed to fetch owner stores:", err);
    } finally {
      setFetching(false);
    }
  }

  async function handleSortChange(storeId, value) {
    const [sortBy, order] = value.split("_");
    try {
      const res = await fetch(
        `http://localhost:4002/api/ratings/store/${storeId}/raters?sort=${sortBy}&order=${order}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const raters = await res.json();

      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId ? { ...s, raters, sortOption: value } : s
        )
      );
    } catch (err) {
      console.error("Failed to sort raters:", err);
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    if (newPassword.length < 6)
      return alert("Password must be at least 6 characters");

    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:4002/api/owner/update-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update password");

      alert("Password updated successfully!");
      setNewPassword("");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea, #764ba2, #43cea2)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          borderRadius: "20px",
          padding: "20px",
          background: "rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          backdropFilter: "blur(15px)",
        }}
      >
        <Container fluid>
          {/* Header */}
          <Row className="mb-4">
            <Col
              xs={12}
              className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
            >
              <div>
                <h2 className="fw-bold text-white mb-1 text-center text-md-start">
                  🏬 Store Owner: {ownerName}
                </h2>
                <p className="text-light mb-0 text-center text-md-start">
                  Manage all your stores and ratings.
                </p>
              </div>
              <Button
                variant="danger"
                className="shadow-sm rounded-pill px-4 py-2 fw-bold"
                onClick={handleLogout}
              >
                🚪 Logout
              </Button>
            </Col>
          </Row>

          {/* Stores */}
          {fetching ? (
            <div className="text-center text-white py-5">
              <Spinner animation="border" variant="light" />
              <p className="mt-2">Loading stores...</p>
            </div>
          ) : (
            stores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Row className="mb-5">
                  <Col xs={12}>
                    {/* Store Header */}
                    <Card
                      className="shadow-sm border-0 mb-3"
                      style={{
                        borderRadius: "15px",
                        background: "rgba(255, 255, 255, 0.95)",
                      }}
                    >
                      <Card.Body>
                        <h4 className="fw-bold text-primary">🏬 {store.name}</h4>
                        <p className="text-muted">
                          👤 Owner: {store.owner?.name || "Owner"}
                        </p>
                        <h6 className="text-muted">Average Rating</h6>
                        <h3 className="fw-bold text-success">
                          {store.averageRating || "No ratings yet"}
                        </h3>
                      </Card.Body>
                    </Card>

                    {/* Raters */}
                    <Card
                      className="shadow-sm border-0"
                      style={{
                        borderRadius: "15px",
                        background: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      <Card.Header
                        className="fw-bold d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 text-white"
                        style={{
                          background: "linear-gradient(90deg, #43cea2, #185a9d)",
                        }}
                      >
                        <span>👥 Users who rated {store.name}</span>
                        <Form.Select
                          size="sm"
                          value={store.sortOption || "value_DESC"}
                          onChange={(e) =>
                            handleSortChange(store.id, e.target.value)
                          }
                          style={{ maxWidth: "250px" }}
                        >
                          <option value="value_DESC">Highest Rating</option>
                          <option value="value_ASC">Lowest Rating</option>
                          <option value="name_ASC">Name (A-Z)</option>
                          <option value="email_ASC">Email (A-Z)</option>
                        </Form.Select>
                      </Card.Header>
                      <Card.Body>
                        {/* Desktop Table */}
                        {!isMobile && (
                          <Table
                            striped
                            hover
                            responsive
                            className="align-middle shadow-sm text-center"
                            style={{ borderRadius: "10px", overflow: "hidden" }}
                          >
                            <thead
                              style={{
                                background:
                                  "linear-gradient(90deg, #667eea, #764ba2)",
                                color: "#fff",
                              }}
                            >
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Rating ⭐</th>
                              </tr>
                            </thead>
                            <tbody>
                              {store.raters.length > 0 ? (
                                store.raters.map((r) => (
                                  <motion.tr
                                    key={r.id}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 200,
                                    }}
                                  >
                                    <td>{r.name}</td>
                                    <td>{r.email}</td>
                                    <td>{r.value}</td>
                                  </motion.tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="3"
                                    className="text-center text-muted"
                                  >
                                    No ratings yet
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        )}

                        {/* Mobile Card View */}
                        {isMobile && (
                          <Row className="g-3">
                            {store.raters.length > 0 ? (
                              store.raters.map((r) => (
                                <Col xs={12} key={r.id}>
                                  <Card
                                    className="shadow-sm border-0"
                                    style={{
                                      borderRadius: "12px",
                                      background: "rgba(255,255,255,0.95)",
                                    }}
                                  >
                                    <Card.Body>
                                      <p className="mb-1">
                                        <strong>Name:</strong> {r.name}
                                      </p>
                                      <p className="mb-1">
                                        <strong>Email:</strong> {r.email}
                                      </p>
                                      <p className="mb-0">
                                        <strong>Rating ⭐:</strong> {r.value}
                                      </p>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))
                            ) : (
                              <Col xs={12} className="text-center text-muted">
                                No ratings yet
                              </Col>
                            )}
                          </Row>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            ))
          )}

          {/* Update Password */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Row>
              <Col xs={12} md={6} className="mx-auto">
                <Card
                  className="shadow-sm border-0"
                  style={{
                    borderRadius: "15px",
                    background: "rgba(255,255,255,0.95)",
                  }}
                >
                  <Card.Header
                    className="fw-bold text-white"
                    style={{
                      background: "linear-gradient(90deg, #667eea, #764ba2)",
                    }}
                  >
                    🔑 Update Password
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handlePasswordUpdate}>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </Form.Group>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-100 fw-bold"
                        style={{
                          background: "linear-gradient(90deg, #43cea2, #185a9d)",
                          border: "none",
                        }}
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </motion.div>
    </div>
  );
}
