import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import styles from "../styles/Dashboard.module.css";
import toast, { Toaster } from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FaCalendarAlt, FaFileAlt, FaPaperPlane } from 'react-icons/fa';
import { MdRestaurantMenu, MdEventNote, MdHistory, MdChat, MdShoppingCart, MdLogout } from 'react-icons/md';
import io from 'socket.io-client';
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const today = new Date();
const dayName = days[today.getDay()];

const token = localStorage.getItem("token");

export default function StudentDashboard() {
  const [view, setView] = useState("today");
  const [collapsed, setCollapsed] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);

  const [menu, setMenu] = useState({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  });

  //name
  const [name, setName] = useState("student");

  // Leave
  const [leaveForm, setLeaveForm] = useState({ from: "", to: "", reason: "" });
  const [leaveHistory, setLeaveHistory] = useState([]);

  // Chat
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on initial render
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      const chatMessages = savedMessages ? JSON.parse(savedMessages) : [];
      // Always start with welcome message
      return [
        { id: 1, user: "Admin", text: "Welcome to the community chat!" },
        ...chatMessages
      ];
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [{ id: 1, user: "Admin", text: "Welcome to the community chat!" }];
    }
  });
  const [msgText, setMsgText] = useState("");
  const chatEndRef = useRef(null);

  // Socket
  const [socket, setSocket] = useState(null);
  const [rollNo, setRollNo] = useState("");

  // Initialize socket connection on mount
  useEffect(() => {
    const newSocket = io('http://localhost:3004');
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []); // Empty dependency array - run once on mount

  // Set up socket listeners when socket is available
  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (data) => {
      const { message, rollNo: senderRollNo, timestamp } = data;
      const newMessage = {
        id: Date.now(),
        user: senderRollNo === rollNo ? "You" : senderRollNo,
        text: message,
        timestamp
      };
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on('joined', (message) => {
      console.log(message);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('joined');
    };
  }, [socket, rollNo]); // Re-run when socket or rollNo changes

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      // Only save messages after the welcome message
      const messagesToSave = messages.filter(msg => msg.user !== "Admin");
      localStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  }, [messages]);

  // Modal
  const [modal, setModal] = useState({ show: false, type: "success", message: "" });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Purchase History
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [monthlyData, setMonthlyData] = useState({ graphData: [], totalSpent: 0, purchases: [] });

  // Purchase
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState([
    { name: "Coke", price: 20 },
    { name: "Chips", price: 15 },
    { name: "Biscuits", price: 10 },
    { name: "Juice", price: 25 },
    { name: "Sandwich", price: 30 },
    { name: "Tea", price: 15 },
  ]);

  // Fetch menu and other data once
  useEffect(() => {
    let mounted = true;

    const fetchNo = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/info/me", {
          method: "GET",
          headers: {
            authorization: token,
            "content-type": "application/json",
          },
        });

        if (!res.ok) {
          console.log("failed to fetch the student information");
        }
        const data = await res.json();
        if (data) {
          setName(data.user.rollNo);
          setRollNo(data.user.rollNo);
          // Join chat room after getting rollNo
          if (socket) {
            socket.emit('join', data.user.rollNo);
          }
        }
      } catch (error) {
        console.log("Failed to fetch the student data");
      }
    };

    const fetchMenu = async () => {
      setMenuLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/mess/today", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day: dayName }),
        });
        if (!res.ok) throw new Error("no menu");
        const data = await res.json();
        if (!mounted) return;
        setMenu({
          breakfast: data["Breakfast"] || [],
          lunch: data["Lunch"] || [],
          snacks: data["Snacks"] || [],
          dinner: data["Dinner"] || [],
        });
      } catch (e) {
        console.error("Failed to load menu:", e.message);
        if (!mounted) return;
        setMenu({ breakfast: [], lunch: [], snacks: [], dinner: [] });
      } finally {
        if (mounted) setMenuLoading(false);
      }
    };

    const fetchLeaveHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return toast.error("Login first");
        }

        const res = await fetch("http://localhost:3000/api/history/me", {
          method: "GET",
          headers: {
            Authorization: token, // send token here
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          return toast.error("Failed to fetch history");
        }

        const result = await res.json();
        setLeaveHistory(result.data || []); // data is sorted newest first from backend
      } catch (error) {
        console.error(error);
        toast.error("Network error occurred!");
      }
    };

    fetchMenu();

    fetchNo();
    fetchLeaveHistory();
    fetchPurchaseHistory();
    fetchMonthlyPurchases();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/payment/purchase-history", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) return;

      const result = await res.json();
      setPurchaseHistory(result.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMonthlyPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/payment/monthly-purchases", {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) return;

      const result = await res.json();
      setMonthlyData(result.data || { graphData: [], totalSpent: 0, purchases: [] });
    } catch (error) {
      console.error(error);
    }
  };

  // Leave submit
  const submitLeave = async (e) => {
    e.preventDefault();

    // Get token
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error(err);
      toast.error("Invalid token, please login again");
      return;
    }

    // Check form fields
    if (!leaveForm.from || !leaveForm.to || !leaveForm.reason) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      // Send flattened payload
      const res = await fetch("http://localhost:3000/api/submit/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leaveForm, rollNo: decoded.rollNo }),
      });

      const data = await res.json();

      if (res.ok) {
        // Reset form
        setLeaveForm({ from: "", to: "", reason: "" });
        setLeaveHistory((prev) => [data.message, ...prev]);
        // Show a clean toast message
        const msg = `Leave submitted from ${data.message.from} to ${data.message.to} for Roll No: ${data.message.rollNo}`;
        toast.success(msg);
      } else {
        // Handle backend error
        const errMsg = data.error || "Submit failed";
        toast.error(errMsg);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  // Chat send
  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgText.trim() || !socket) return;

    // Send message via socket
    socket.emit('sendMessage', {
      message: msgText.trim(),
      rollNo: name // name contains rollNo
    });

    // Don't add locally - let socket handle it to avoid duplication
    setMsgText("");
  };

  // Purchase functions
  const addToCart = (item) => {
    const existing = selectedItems.find(sel => sel.item.name === item.name);
    if (existing) {
      setSelectedItems(selectedItems.map(sel => sel.item.name === item.name ? {...sel, qty: sel.qty + 1} : sel));
    } else {
      setSelectedItems([...selectedItems, {item, qty: 1}]);
    }
  };

  const updateQty = (idx, delta) => {
    setSelectedItems(selectedItems.map((sel, i) => i === idx ? {...sel, qty: Math.max(1, sel.qty + delta)} : sel));
  };

  const removeItem = (idx) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== idx));
  };

  const handlePay = async () => {
    const total = selectedItems.reduce((sum, sel) => sum + sel.item.price * sel.qty, 0);
    if (total === 0) return toast.error("No items selected");

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Login first");

    const items = selectedItems.map(sel => ({
      name: sel.item.name,
      quantity: sel.qty,
      price: sel.item.price
    }));

    try {
      const res = await fetch("http://localhost:3000/api/payment/create-purchase", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items, totalAmount: total })
      });

      if (res.status === 401) {
        setModal({ show: true, type: "error", message: "Invalid token, please login again" });
        return;
      }

      if (!res.ok) throw new Error("Failed to create purchase");

      setModal({ show: true, type: "success", message: `Purchase successful! Total: ₹${total}` });
      setSelectedItems([]);
      // Refresh history
      fetchPurchaseHistory();
      fetchMonthlyPurchases();
    } catch (error) {
      setModal({ show: true, type: "error", message: "Purchase failed" });
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, view]);

  return (
    <div className={`${styles.page} ${collapsed ? styles.collapsedPage : ""}`}>
      <Toaster position="top-right" />
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.brand}>
          <div className={styles.logo}>SARWAM</div>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? "⮞" : "⮜"}
          </button>
        </div>
        <nav className={styles.nav}>
          <button
            className={view === "today" ? styles.active : ""}
            onClick={() => setView("today")}
          >
            <MdRestaurantMenu />
            <span>Today Menu</span>
          </button>
          <button
            className={view === "leave" ? styles.active : ""}
            onClick={() => setView("leave")}
          >
            <MdEventNote />
            <span>Leave Application</span>
          </button>
          <button
            className={view === "purchase-history" ? styles.active : ""}
            onClick={() => setView("purchase-history")}
          >
            <MdHistory />
            <span>Purchase History</span>
          </button>
          <button
            className={view === "chat" ? styles.active : ""}
            onClick={() => setView("chat")}
          >
            <MdChat />
            <span>Community Chat</span>
          </button>
          <button
            className={view === "purchase" ? styles.active : ""}
            onClick={() => setView("purchase")}
          >
            <MdShoppingCart />
            <span>Purchase Items</span>
          </button>
          <div className={styles.footerBtns}>
            <button
              onClick={() => setShowLogoutModal(true)}
            >
              <MdLogout />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Student Dashboard</h1>
          <div className={styles.headerRight}>
            <div className={styles.welcome}>Hello, {name}</div>
          </div>
        </header>

        <section className={styles.content}>
          {view === "today" && (
            <div className={styles.grid}>
              {menuLoading ? (
                <div className={styles.card}>
                  <p>Loading menu...</p>
                </div>
              ) : (
                <>
                  <div className={styles.card}>
                    <h3>Breakfast</h3>
                    <ul className={styles.menuList}>
                      {menu.breakfast.length > 0 ? (
                        menu.breakfast.map((i, idx) => (
                          <li key={idx} className={styles.menuItem}>
                            <span>{i}</span>
                          </li>
                        ))
                      ) : (
                        <li>No items</li>
                      )}
                    </ul>
                  </div>
                  <div className={styles.card}>
                    <h3>Lunch</h3>
                    <ul className={styles.menuList}>
                      {menu.lunch.length > 0 ? (
                        menu.lunch.map((i, idx) => (
                          <li key={idx} className={styles.menuItem}>
                            <span>{i}</span>
                          </li>
                        ))
                      ) : (
                        <li>No items</li>
                      )}
                    </ul>
                  </div>
                  <div className={styles.card}>
                    <h3>Snacks</h3>
                    <ul className={styles.menuList}>
                      {menu.snacks.length > 0 ? (
                        menu.snacks.map((i, idx) => (
                          <li key={idx} className={styles.menuItem}>
                            <span>{i}</span>
                          </li>
                        ))
                      ) : (
                        <li>No items</li>
                      )}
                    </ul>
                  </div>
                  <div className={styles.card}>
                    <h3>Dinner</h3>
                    <ul className={styles.menuList}>
                      {menu.dinner.length > 0 ? (
                        menu.dinner.map((i, idx) => (
                          <li key={idx} className={styles.menuItem}>
                            <span>{i}</span>
                          </li>
                        ))
                      ) : (
                        <li>No items</li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {view === "leave" && (
            <div className={styles.panel}>
              <div className={styles.panelLeft}>
                <h2>Apply for Leave</h2>
                <form onSubmit={submitLeave} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      <FaCalendarAlt className={styles.inputIcon} />
                      From Date
                    </label>
                    <input
                      type="date"
                      value={leaveForm.from}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, from: e.target.value })
                      }
                      className={styles.inputField}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      <FaCalendarAlt className={styles.inputIcon} />
                      To Date
                    </label>
                    <input
                      type="date"
                      value={leaveForm.to}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, to: e.target.value })
                      }
                      className={styles.inputField}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      <FaFileAlt className={styles.inputIcon} />
                      Reason
                    </label>
                    <textarea
                      value={leaveForm.reason}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, reason: e.target.value })
                      }
                      className={styles.textareaField}
                      placeholder="Please provide a reason for your leave..."
                      required
                    />
                  </div>
                  <button type="submit" className={styles.submitBtn}>
                    <FaPaperPlane className={styles.btnIcon} />
                    Submit Application
                  </button>
                </form>
              </div>
              <div className={styles.panelRight}>
                <h2>Leave History</h2>
                <ul className={styles.list}>
                  {leaveHistory.map((l) => (
                    <li key={l.id}>
                      <div>
                        <strong>
                          {l.from} → {l.to}
                        </strong>{" "}
                        <span className={styles.badge}>
                          {l.status || "Pending"}
                        </span>
                      </div>
                      <div className={styles.muted}>{l.reason}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {view === "purchase-history" && (
            <div>
              <h2>Monthly Purchase Overview</h2>
              <div className={styles.row}>
                <div>Total Spent This Month: ₹{monthlyData.totalSpent}</div>
              </div>
              <div style={{ width: '100%', height: 300, background: 'var(--card)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                <BarChart width="100%" height={260} data={monthlyData.graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#e6eef6" />
                  <YAxis stroke="#e6eef6" />
                  <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid rgba(110,231,183,0.2)', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="quantity" fill="var(--accent)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </BarChart>
              </div>
              <h2>Purchase History</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseHistory.map((p) => (
                    <tr key={p._id}>
                      <td>{new Date(p.paymentTime).toLocaleDateString()}</td>
                      <td>
                        {p.items.map((item, idx) => (
                          <div key={idx}>{item.name} x{item.quantity} @ ₹{item.price}</div>
                        ))}
                      </td>
                      <td>₹{p.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "chat" && (
            <div className={styles.chatWrap}>
              <div className={styles.chatWindow}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.user === "You" ? styles.msgYou : styles.msgOther
                    }
                  >
                    <div className={styles.msgUser}>{m.user}</div>
                    <div className={styles.msgText}>{m.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendMessage} className={styles.chatForm}>
                <input
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Write a message..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
          )}

          {view === "purchase" && (
            <div>
              <h2>Purchase Items</h2>
              <div className={styles.grid}>
                {items.map((item, idx) => (
                  <div key={idx} className={styles.card}>
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                    <button className={styles.primary} onClick={() => addToCart(item)}>Select</button>
                  </div>
                ))}
              </div>
              <div className={styles.panel}>
                <div className={styles.panelLeft}>
                  <h3>Selected Items</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((sel, idx) => (
                        <tr key={idx}>
                          <td><img src={`https://via.placeholder.com/50x50?text=${encodeURIComponent(sel.item.name)}`} alt={sel.item.name} className={styles.menuImg} /></td>
                          <td>{sel.item.name}</td>
                          <td>
                            <button onClick={() => updateQty(idx, -1)}>-</button>
                            {sel.qty}
                            <button onClick={() => updateQty(idx, 1)}>+</button>
                          </td>
                          <td>₹{sel.item.price}</td>
                          <td>₹{sel.item.price * sel.qty}</td>
                          <td><button onClick={() => removeItem(idx)}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p>Total: ₹{selectedItems.reduce((sum, sel) => sum + sel.item.price * sel.qty, 0)}</p>
                  <button className={styles.primary} onClick={handlePay}>Pay Now</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {modal.show && (
        <div className={styles.modalOverlay} onClick={() => setModal({ ...modal, show: false })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={modal.type === "success" ? styles.success : styles.error}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p>{modal.message}</p>
            <button className={styles.modalClose} onClick={() => setModal({ ...modal, show: false })}>
              Close
            </button>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className={styles.secondary} onClick={() => setShowLogoutModal(false)}>
                No
              </button>
              <button className={styles.primary} onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
