import "./AdminDashboard.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Badge, Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion, scale } from "framer-motion";




export default function AdminDashboard({ user, setUser }) {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Form state ---
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "", role: "USER" });
  const [storeForm, setStoreForm] = useState({
    name: "",
    address: "",
    ownerId: "",
  });
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // --- Search/Filter ---
  const [filter, setFilter] = useState("");

  const userFormRef = useRef(null);
  const storeFormRef = useRef(null);

  const [userSort, setUserSort] = useState({ field: "name", order: "ASC" });
  const [storeSort, setStoreSort] = useState({ field: "name", order: "ASC" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchStats();
    fetchUsers();
    fetchStores();
  }, [filter, userSort, storeSort]);


  async function fetchStats() {
    try {
      const res = await fetch("http://localhost:4002/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`http://localhost:4002/api/admin/users?q=${encodeURIComponent(filter)}&sort=${userSort.field}&order=${userSort.order}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.rows || data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  }

  async function fetchStores() {
    try {
      const res = await fetch(`http://localhost:4002/api/admin/stores?q=${encodeURIComponent(filter)}&sort=${storeSort.field}&order=${storeSort.order}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStores(data.rows || data || []);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  }

  // --- Validation ---
  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    
    if (!editingUserId) {
      
      if (!form.password.trim()) e.password = "Password is required";
      else if (form.password.length < 6) e.password = "Min 6 characters";
    }
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // --- Add User ---
  async function handleAddUser(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const method = editingUserId ? "PUT" : "POST";
      const url = editingUserId
        ? `http://localhost:4002/api/admin/users/${editingUserId}`
        : "http://localhost:4002/api/admin/users";

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          role: form.role.toUpperCase()
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingUserId ? "User Updated Successfully!" : "User Created Successfully!");
        setForm({ name: "", email: "", password: "", address: "", role: "USER" });
        setEditingUserId(null);
        fetchUsers();
        fetchStats();
      } else {
        alert(data.error || "Failed to save user");
      }
    } catch (err) {
      console.error("Error saving user:", err);
    } finally {
      setSubmitting(false);
    }

  }


  //  --- DELETE USER
  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:4002/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      if (res.ok) {
        alert("User deleted!");
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    }
  }


  // -- ADD STORE
  const handleSubmitStore = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = editingStoreId ? "PUT" : "POST";
      const url = editingStoreId
        ? `http://localhost:4002/api/admin/stores/${editingStoreId}`
        : "http://localhost:4002/api/admin/stores";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...storeForm,
          ownerId: storeForm.ownerId ? Number(storeForm.ownerId) : null
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(editingStoreId ? "Store Updated Successfully!" : "Store Created Successfully!");
        setStoreForm({ name: "", address: "", ownerId: "" });
        setEditingStoreId(null);
        fetchStores();
      } else {
        alert(data.error || "Failed to save store");
      }
    } catch (err) {
      console.error("Error saving store:", err);
      alert("Error saving store");
    } finally {
      setSubmitting(false);
    }
  }

  // -- DELETE STORE
  async function handleDeleteStore(id) {
    if (!window.confirm("Are you sure you want to delete this store?")) return;
    try {
      const res = await fetch(`http://localhost:4002/api/admin/stores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Store deleted!");
        fetchStores();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete store");
      }
    } catch (err) {
      console.error(err);
    }
  }


  // -- EDIT USER
  function handleEditUser(u) {
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      address: u.address,
      role: u.role,
    });
    setEditingUserId(u.id);

    setTimeout(() => {
      
      userFormRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }, 100);
  }


  //  -- EDIT STORE 
  function handleEditStore(s) {
    setStoreForm({
      name: s.name || "",
      address: s.address || "",
      ownerId: s.owner?.id?.toString() || "",
    });
    setEditingStoreId(s.id);

    if (storeFormRef.current) {
      storeFormRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }


  // --- Badge Colors for Roles ---
  const roleBadge = (role) => {
    switch (role) {
      case "ADMIN":
      case "Admin": return <Badge bg="primary">{role}</Badge>;
      case "OWNER":
      case "Store Owner": return <Badge bg="warning" text="dark">{role}</Badge>;
      default: return <Badge bg="secondary">{role}</Badge>;
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };


  return (
    <div
      style={{
        background: "linear-gradient(-45deg, #667eea, #764ba2, #ff758c, #ff7eb3)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: "1400px",
          width: "100%",
          borderRadius: "20px",
          padding: "30px",
          background: "rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          backdropFilter: "blur(15px)",
          border: "2px solid rgba(255,255,255,0.3)",
        }}
      >
        <Container fluid>
          {/* Header */}
          <Row className="mb-4 align-items-center">
            <Col>
              <div className="d-flex flex-row flex-md-row align-items-md-center justify-content-between">
                {/* Heading and Description */}
                <div className="text-start text-md-start">
                  <h2 className="fw-bold text-white mb-1">
                    🌐 Welcome, Mr. {user.name}
                  </h2>
                  <p className="text-light mb-0">
                    Manage users, stores, and monitor system activity.
                  </p>
                </div>

                {/* Logout Button */}
                <div className="mt-3 mt-md-0 text-center text-md-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-danger shadow-sm rounded-pill px-3 py-2 px-md-4 py-md-2 text-white fw-bold fs-6"
                    size="sm" // smaller button on all devices
                    onClick={() => {
                      localStorage.removeItem("ADMIN");
                      setUser(null);
                      navigate("/login");
                    }}
                  >
                    🚪 Logout
                  </motion.button>
                </div>
              </div>
            </Col>
          </Row>



          {/* Stats */}
          <Row className="mb-4">
            <Col md={4}>
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                <Card className="text-center shadow-sm border-0 bg-light bg-opacity-75 mb-3">
                  <Card.Body>
                    <h6 className="text-muted">Total Users</h6>
                    <h3 className="fw-bold text-primary">{stats.totalUsers}</h3>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={4}>
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                <Card className="text-center shadow-sm border-0 bg-light bg-opacity-75 mb-3">
                  <Card.Body>
                    <h6 className="text-muted">Total Stores</h6>
                    <h3 className="fw-bold text-success">{stats.totalStores}</h3>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={4}>
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
                <Card className="text-center shadow-sm border-0 bg-light bg-opacity-75 mb-2">
                  <Card.Body>
                    <h6 className="text-muted">Total Ratings</h6>
                    <h3 className="fw-bold text-warning">{stats.totalRatings}</h3>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>



          <Row>
            {/* Add User */}
            <Col lg={6} className="mb-4">
              <Card ref={userFormRef} className="shadow-sm border-0 bg-light bg-opacity-75">
                <Card.Header className="fw-bold bg-primary text-white">➕ Add New User</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAddUser}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      {errors.name && <small className="text-danger">{errors.name}</small>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      {errors.email && <small className="text-danger">{errors.email}</small>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      {errors.password && <small className="text-danger">{errors.password}</small>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control as="textarea" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                      {errors.address && <small className="text-danger">{errors.address}</small>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="OWNER">Store Owner</option>
                      </Form.Select>
                    </Form.Group>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-100 btn btn-primary shadow-sm rounded-pill px-3 py-2 px-md-4 py-md-2 fw-bold fs-6" disabled={submitting}>
                      {submitting ? (editingUserId ? "Updating..." : "Adding") : editingUserId ? "Update User" : "Add User"}
                    </motion.button>
                    {editingUserId && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variant="secondary" className="w-100 btn btn-secondary mt-2 shadow-sm rounded-pill px-3 py-2 px-md-4 py-md-2 fw-bold" onClick={() => {
                        setForm({ name: "", email: "", password: "", address: "", role: "USER" });
                        setEditingUserId(null);
                      }}>
                        Cancel Edit
                      </motion.button>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Col>


            {/* Add Store */}
            <Col lg={6} className="mb-4">
              <Card ref={storeFormRef} className="shadow-sm border-0 bg-light bg-opacity-75 mb-4 h-100">
                <Card.Header className="fw-bold bg-success text-white">🏬 Add New Store</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmitStore}>
                    <Form.Group className="mb-4">
                      <Form.Label>Store Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={storeForm.name}
                        onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                        required
                      />
                    </Form.Group>


                    <Form.Group className="mb-4">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={storeForm.address}
                        onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                        required
                      />
                    </Form.Group>


                    <Form.Group className="mb-4">
                      <Form.Label>Owner Email</Form.Label>
                      <Form.Select
                        type="email"
                        name="ownerId"
                        value={storeForm.ownerId}
                        onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}
                      >
                        <option value="">-- Select Owner --</option>
                        {users
                          .filter((u) => u.role === "OWNER") // ONLY OWNERS
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.email}
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" variant="success"
                      className="w-100 btn btn-success mt-2 shadow-sm rounded-pill px-3 py-2 px-md-4 py-md-2 fw-bold" disabled={submitting}>
                      {submitting ? (editingStoreId ? "Updating..." : "Adding...") : editingStoreId ? "Update Store" : "Add Store"}
                    </motion.button>
                    {editingStoreId && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variant="secondary" className="w-100 btn btn-secondary mt-2 shadow-sm rounded-pill px-3 py-2 px-md-4 py-md-2 fw-bold" onClick={() => {
                        setStoreForm({ name: "", email: "", address: "", ownerId: "" });
                        setEditingStoreId(null);
                      }}>
                        Cancel Edit
                      </motion.button>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search/Filter */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Control
                type="text"
                className="shadow-sm"
                placeholder="🔍 Search by Name, Email, Address, or Role..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Col>
          </Row>


          {/* Stores */}

          {/* COLLASABLE TABLE FOR SMALL SCREENS */}
          {/* Collapsible Tables for small screens */}
          <Row className="d-lg-none mb-4">
            <Col>
              <Accordion defaultActiveKey="0">
                {/* Stores Accordion */}
                <Accordion.Item eventKey="0">
                  <Accordion.Header>🏬 Stores</Accordion.Header>
                  <Accordion.Body>
                    <Card className="shadow-sm border-0 bg-light bg-opacity-75">
                      <Card.Body>
                        <Table striped bordered hover responsive className="align-middle shadow-sm">
                          <thead className="table-success">
                            <tr>
                              <th>Name</th>
                              <th>Owner Email</th>
                              <th>Address</th>
                              <th>Rating ⭐</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stores.map((s) => (
                              <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>{s.owner?.email || "N/A"}</td>
                                <td>{s.address}</td>
                                <td>{s.rating}</td>
                                <td>
                                  <Button variant="warning" size="sm" className="me-1" onClick={() => handleEditStore(s)}>✏️</Button>
                                  <Button variant="danger" size="sm" onClick={() => handleDeleteStore(s.id)}>🗑️</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Users Accordion */}
                <Accordion.Item eventKey="1">
                  <Accordion.Header>👥 Users</Accordion.Header>
                  <Accordion.Body>
                    <Card className="shadow-sm border-0 bg-light bg-opacity-75">
                      <Card.Body>
                        <Table striped bordered hover responsive className="align-middle shadow-sm">
                          <thead className="table-secondary">
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Address</th>
                              <th>Role</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((u) => (
                              <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.address}</td>
                                <td>{roleBadge(u.role)}</td>
                                <td>
                                  <Button variant="warning" size="sm" className="me-1" onClick={() => handleEditUser(u)}>✏️</Button>
                                  <Button variant="danger" size="sm" onClick={() => handleDeleteUser(u.id)}>🗑️</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>


          <Row className="d-none d-lg-block">
            <Col className="mb-4">
              <Card className="shadow-sm border-0 bg-light bg-opacity-75">
                <Card.Header className="fw-bold bg-success text-white">🏬 Stores</Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive className="align-middle shadow-sm">
                    <thead className="table-success">
                      <tr>
                        <th onClick={() =>
                          setStoreSort({ field: "name", order: storeSort.order === "ASC" ? "DESC" : "ASC" })
                        }>
                          Name {storeSort.field === "name" ? (storeSort.order === "ASC" ? "⬆️" : "⬇️") : ""}
                        </th>
                        <th onClick={() =>
                          setStoreSort({ field: "ownerId", order: storeSort.order === "ASC" ? "DESC" : "ASC" })
                        }>
                          Owner Email {storeSort.field === "ownerId" ? (storeSort.order === "ASC" ? "⬆️" : "⬇️") : ""}
                        </th>
                        <th onClick={() =>
                          setStoreSort({ field: "address", order: storeSort.order === "ASC" ? "DESC" : "ASC" })
                        }>
                          Address {storeSort.field === "address" ? (storeSort.order === "ASC" ? "⬆️" : "⬇️") : ""}
                        </th>
                        <th>Rating ⭐</th> {/* keep static unless you also want rating sorting */}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map((s) => (
                        <motion.tr
                          key={s.id}
                          variants={fadeInUp}
                          initial="hidden"
                          animate="visible"
                          transition={{ duration: 0.4, delay: 0.05 }}>
                          <td>{s.name}</td>
                          <td>{s.owner?.email || "N/A"}</td>
                          <td>{s.address}</td>
                          <td>{s.rating}</td>
                          <td>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              variant="warning"
                              size="sm"
                              className="me-1 btn btn-warning rounded-pill btn-sm"
                              onClick={() => handleEditStore(s)}
                            >
                              ✏️ Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              variant="danger"
                              size="sm"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteStore(s.id)}
                            >
                              🗑️ Delete
                            </motion.button>
                          </td>
                        </motion.tr>

                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>


          {/* Users */}
          <Row className="d-none d-lg-block">
            <Col>
              <Card className="shadow-sm border-0 bg-light bg-opacity-75">
                <Card.Header className="fw-bold bg-secondary text-white">👥 Users</Card.Header>
                <Card.Body>
                  <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{
                      duration: 0.6,
                      delay: 0.3
                    }}>
                    <Table striped bordered hover responsive className="align-middle shadow-sm">
                      <thead className="table-secondary">
                        <tr>
                          <th onClick={() => setUserSort({ field: "name", order: userSort.order === "ASC" ? "DESC" : "ASC" })}>
                            Name {userSort.field === "name" ? (userSort.order === "ASC" ? "⬆️" : "⬇️") : ""}
                          </th>
                          <th onClick={() => setUserSort({ field: "email", order: userSort.order === "ASC" ? "DESC" : "ASC" })}>
                            Email {userSort.field === "email" ? (userSort.order === "ASC" ? "⬆️" : "⬇️") : ""}
                          </th>
                          <th>Address</th>
                          <th onClick={() => setUserSort({ field: "role", order: userSort.order === "ASC" ? "DESC" : "ASC" })}>
                            Role {userSort.field === "role" ? (userSort.order === "ASC" ? "⬆️" : "⬇️") : ""}
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <motion.tr
                            key={u.id}
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ duration: 0.4, delay: 0.05 }}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.address}</td>
                            <td>{roleBadge(u.role)}</td>
                            <td>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                variant="warning"
                                size="sm"
                                className="me-2 btn btn-warning btn-sm"
                                onClick={() => handleEditUser(u)}
                              >
                                ✏️ Edit
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                variant="danger"
                                size="sm"
                                className="me-2 btn btn-danger btn-sm"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                🗑️ Delete
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </Table>
                  </motion.div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </motion.div>
    </div>
  );
}
