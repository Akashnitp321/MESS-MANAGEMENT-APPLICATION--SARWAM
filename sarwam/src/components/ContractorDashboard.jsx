import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Dashboard.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MdPeople, MdAnalytics, MdChat, MdLogout, MdDashboard, MdShoppingCart, MdEventAvailable, MdMenu, MdClose } from 'react-icons/md';
import { FaFilePdf } from 'react-icons/fa';
import io from 'socket.io-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL, SOCKET_URL } from "../config";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ContractorDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [purchaseAnalytics, setPurchaseAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [hostel, setHostel] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  // Chat functionality
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem('contractorChatMessages');
      return savedMessages ? JSON.parse(savedMessages) : [
        { id: 1, user: "Admin", text: "Welcome to the contractor community chat!", timestamp: new Date() }
      ];
    } catch {
      return [{ id: 1, user: "Admin", text: "Welcome to the contractor community chat!", timestamp: new Date() }];
    }
  });
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const storedHostel = localStorage.getItem("hostel");

    if (!token || role !== "contractor") {
      navigate("/contractor-login");
      return;
    }

    setHostel(storedHostel);
    fetchStudents();
    fetchPurchaseAnalytics();
    fetchLeaves();

    // Initialize socket connection for chat
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Contractor connected to chat');
      socketRef.current.emit('join', 'Contractor-' + storedHostel);
    });

    socketRef.current.on('receiveMessage', (data) => {
      const newMsg = {
        id: Date.now() + Math.random(),
        user: data.rollNo || data.user,
        text: data.message,
        timestamp: new Date(data.timestamp)
      };
      setMessages(prev => {
        const updated = [...prev, newMsg];
        localStorage.setItem('contractorChatMessages', JSON.stringify(updated));
        return updated;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const changeView = (next) => {
    setActiveView(next);
    setCollapsed(false);
    setIsMobileNavOpen(false);
  };

  // PDF Export Functions
  const exportStudentListPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(0, 225, 255);
    doc.text(`Student List - ${hostel}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Students: ${students.length}`, 14, 35);
    doc.text(`Verified: ${students.filter(s => s.isVerified).length} | Pending: ${students.filter(s => !s.isVerified).length}`, 14, 40);
    
    const tableData = students.map(s => [
      s.fullName,
      s.rollNo,
      s.email,
      s.instituteName,
      s.isVerified ? 'Verified' : 'Pending'
    ]);
    
    autoTable(doc, {
      head: [['Name', 'Roll No', 'Email', 'Institute', 'Status']],
      body: tableData,
      startY: 48,
      theme: 'grid',
      headStyles: { fillColor: [0, 225, 255], textColor: [0, 0, 0] },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { cellWidth: 40 }
      }
    });
    
    doc.save(`Student_List_${hostel}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Student list PDF downloaded!');
  };

  const exportAnalyticsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(0, 225, 255);
    doc.text(`Purchase Analytics - ${hostel}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Month: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);
    
    const tableData = purchaseAnalytics.map(item => [
      item.name,
      item.quantity.toString(),
      `₹${item.totalRevenue || 0}`
    ]);
    
    const totalRevenue = purchaseAnalytics.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
    const totalQuantity = purchaseAnalytics.reduce((sum, item) => sum + item.quantity, 0);
    
    autoTable(doc, {
      head: [['Item Name', 'Total Quantity', 'Total Revenue']],
      body: tableData,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [6, 255, 178], textColor: [0, 0, 0] },
      styles: { fontSize: 10 }
    });
    
    // Add summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Items Sold: ${totalQuantity}`, 14, finalY);
    doc.text(`Total Revenue: ₹${totalRevenue}`, 14, finalY + 7);
    
    doc.save(`Purchase_Analytics_${hostel}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Analytics PDF downloaded!');
  };

  const exportLeavesPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(0, 225, 255);
    doc.text(`Leave Applications - ${hostel}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Applications: ${leaves.length}`, 14, 35);
    
    const approved = leaves.filter(l => l.status === 'approved').length;
    const pending = leaves.filter(l => l.status === 'pending' || !l.status).length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    
    doc.text(`Approved: ${approved} | Pending: ${pending} | Rejected: ${rejected}`, 14, 40);
    
    const tableData = leaves.map(l => [
      l.studentName,
      l.rollNo,
      l.from,
      l.to,
      l.reason.substring(0, 40) + (l.reason.length > 40 ? '...' : ''),
      (l.status || 'pending').toUpperCase()
    ]);
    
    autoTable(doc, {
      head: [['Student', 'Roll No', 'From', 'To', 'Reason', 'Status']],
      body: tableData,
      startY: 48,
      theme: 'grid',
      headStyles: { fillColor: [0, 225, 255], textColor: [0, 0, 0] },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 50 }
      }
    });
    
    doc.save(`Leave_Applications_${hostel}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Leave applications PDF downloaded!');
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/contractor/students`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setStudents(data.students);
      } else {
        toast.error(data.error || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Fetch students error:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/contractor/purchase-analytics`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setPurchaseAnalytics(data.analytics);
      } else {
        toast.error(data.error || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
      toast.error("Network error");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchLeaves = async () => {
    setLeavesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/contractor/leaves`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setLeaves(data.leaves || []);
      } else {
        toast.error(data.error || "Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Fetch leaves error:", error);
      toast.error("Network error");
    } finally {
      setLeavesLoading(false);
    }
  };

  const handleApprove = async (studentId) => {
    setActionLoading(prev => ({ ...prev, [studentId]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/contractor/approve-student/${studentId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Student approved successfully!");
        setStudents(students.map(student =>
          student._id === studentId ? { ...student, isVerified: true } : student
        ));
      } else {
        toast.error(data.error || "Failed to approve student");
      }
    } catch (error) {
      console.error("Approve student error:", error);
      toast.error("Network error");
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleReject = async (studentId) => {
    setActionLoading(prev => ({ ...prev, [studentId]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/contractor/reject-student/${studentId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Student rejected successfully!");
        setStudents(students.map(student =>
          student._id === studentId ? { ...student, isVerified: false } : student
        ));
      } else {
        toast.error(data.error || "Failed to reject student");
      }
    } catch (error) {
      console.error("Reject student error:", error);
      toast.error("Network error");
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const handleApproveLeave = async (leaveId) => {
    setActionLoading(prev => ({ ...prev, [leaveId]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/contractor/approve-leave/${leaveId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Leave approved successfully!");
        setLeaves(prev => prev.map(l => l._id === leaveId ? { ...l, status: 'approved' } : l));
      } else {
        toast.error(data.error || "Failed to approve leave");
      }
    } catch (error) {
      console.error("Approve leave error:", error);
      toast.error("Network error");
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const handleRejectLeave = async (leaveId) => {
    setActionLoading(prev => ({ ...prev, [leaveId]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/contractor/reject-leave/${leaveId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Leave rejected successfully!");
        setLeaves(prev => prev.map(l => l._id === leaveId ? { ...l, status: 'rejected' } : l));
      } else {
        toast.error(data.error || "Failed to reject leave");
      }
    } catch (error) {
      console.error("Reject leave error:", error);
      toast.error("Network error");
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      message: newMessage.trim(),
      rollNo: 'Contractor (' + hostel + ')'
    });

    setNewMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("hostel");
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate("/");
  };

  const renderDashboardView = () => (
    <div className={styles.content}>
      <div className={styles.panel}>
        <h2>Dashboard Overview</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCardLarge}>
            <div className={styles.statIcon}>
              <MdPeople />
            </div>
            <div className={styles.statDetails}>
              <h3>{students.length}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className={styles.statCardLarge}>
            <div className={styles.statIcon} style={{ backgroundColor: '#4CAF50' }}>
              <MdDashboard />
            </div>
            <div className={styles.statDetails}>
              <h3>{students.filter(s => s.isVerified).length}</h3>
              <p>Verified Students</p>
            </div>
          </div>
          <div className={styles.statCardLarge}>
            <div className={styles.statIcon} style={{ backgroundColor: '#FF9800' }}>
              <MdDashboard />
            </div>
            <div className={styles.statDetails}>
              <h3>{students.filter(s => !s.isVerified).length}</h3>
              <p>Pending Verification</p>
            </div>
          </div>
          <div className={styles.statCardLarge}>
            <div className={styles.statIcon} style={{ backgroundColor: '#2196F3' }}>
              <MdShoppingCart />
            </div>
            <div className={styles.statDetails}>
              <h3>{purchaseAnalytics.length}</h3>
              <p>Items Purchased</p>
            </div>
          </div>
        </div>

        <h2 style={{ marginTop: '2rem' }}>All Students</h2>

        {students.length === 0 ? (
          <p className={styles.noData}>No students found in this hostel.</p>
        ) : (
          <div className={styles.studentsGrid}>
            {students.map((student) => (
              <div key={student._id} className={styles.studentCard}>
                <div className={styles.studentInfo}>
                  <h3>{student.fullName}</h3>
                  <p><strong>Roll No:</strong> {student.rollNo}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  <p><strong>Institute:</strong> {student.instituteName}</p>
                  <p><strong>Status:</strong>
                    <span className={student.isVerified ? styles.verified : styles.unverified}>
                      {student.isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </p>
                </div>

                <div className={styles.actions}>
                  {!student.isVerified ? (
                    <button
                      onClick={() => handleApprove(student._id)}
                      className={styles.approveBtn}
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(student._id)}
                      className={styles.rejectBtn}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentsView = () => (
    <div className={styles.content}>
      <div className={styles.panel}>
        <div className={styles.row}>
          <h2>All Students in {hostel}</h2>
          <button className={styles.pdfBtn} onClick={exportStudentListPDF}>
            <FaFilePdf /> Export PDF
          </button>
        </div>

        {students.length === 0 ? (
          <p className={styles.noData}>No students found in this hostel.</p>
        ) : (
          <div className={styles.studentsGrid}>
            {students.map((student) => (
              <div key={student._id} className={styles.studentCard}>
                <div className={styles.studentInfo}>
                  <h3>{student.fullName}</h3>
                  <p><strong>Roll No:</strong> {student.rollNo}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  <p><strong>Institute:</strong> {student.instituteName}</p>
                  <p><strong>Status:</strong>
                    <span className={student.isVerified ? styles.verified : styles.unverified}>
                      {student.isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </p>
                </div>

                <div className={styles.actions}>
                  {!student.isVerified ? (
                    <button
                      onClick={() => handleApprove(student._id)}
                      className={styles.approveBtn}
                      disabled={actionLoading[student._id]}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {actionLoading[student._id] && <div className={styles.spinner}></div>}
                      {actionLoading[student._id] ? 'Approving...' : 'Approve'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(student._id)}
                      className={styles.rejectBtn}
                      disabled={actionLoading[student._id]}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {actionLoading[student._id] && <div className={styles.spinner}></div>}
                      {actionLoading[student._id] ? 'Rejecting...' : 'Reject'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderLeavesView = () => (
    <div className={styles.content}>
      <div className={styles.panel}>
        <div className={styles.row}>
          <h2>Leave Applications - {hostel}</h2>
          <button className={styles.pdfBtn} onClick={exportLeavesPDF}>
            <FaFilePdf /> Export PDF
          </button>
        </div>

        {leavesLoading ? (
          <div className={styles.loading}>Loading leaves...</div>
        ) : leaves.length === 0 ? (
          <p className={styles.noData}>No leave applications for this hostel.</p>
        ) : (
          <div className={styles.leaveGrid}>
            {leaves.map((leave) => (
              <div key={leave._id} className={styles.leaveCard}>
                <div className={styles.leaveHeader}>
                  <div>
                    <h3>{leave.studentName}</h3>
                    <p className={styles.muted}>Roll No: {leave.rollNo}</p>
                    <p className={styles.muted}>Hostel: {leave.hostelName}</p>
                  </div>
                  <span className={
                    leave.status === 'approved' ? styles.statusApproved :
                    leave.status === 'rejected' ? styles.statusRejected :
                    styles.statusPending
                  }>
                    {leave.status || 'pending'}
                  </span>
                </div>

                <div className={styles.leaveBody}>
                  <p><strong>From:</strong> {leave.from}</p>
                  <p><strong>To:</strong> {leave.to}</p>
                  <p><strong>Reason:</strong> {leave.reason}</p>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => handleApproveLeave(leave._id)}
                    className={styles.approveBtn}
                    disabled={actionLoading[leave._id] || leave.status === 'approved'}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {actionLoading[leave._id] && <div className={styles.spinner}></div>}
                    {leave.status === 'approved' ? 'Approved' : actionLoading[leave._id] ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleRejectLeave(leave._id)}
                    className={styles.rejectBtn}
                    disabled={actionLoading[leave._id] || leave.status === 'rejected'}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {actionLoading[leave._id] && <div className={styles.spinner}></div>}
                    {leave.status === 'rejected' ? 'Rejected' : actionLoading[leave._id] ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className={styles.content}>
      <div className={styles.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2>Purchase Analytics - {hostel}</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className={styles.pdfBtn} onClick={exportAnalyticsPDF}>
              <FaFilePdf /> Export PDF
            </button>
            <button 
              onClick={fetchPurchaseAnalytics} 
              className={styles.primary}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Refresh Analytics
            </button>
          </div>
        </div>

        {analyticsLoading ? (
          <div className={styles.loading}>Loading analytics...</div>
        ) : purchaseAnalytics.length === 0 ? (
          <p className={styles.noData}>No purchase data available for this month.</p>
        ) : (
          <div className={styles.analyticsContainer}>
            <div className={styles.chartContainer}>
              <h3>Top Purchased Items (Bar Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={purchaseAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartContainer}>
              <h3>Purchase Distribution (Pie Chart)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={purchaseAnalytics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="quantity"
                  >
                    {purchaseAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.analyticsTable}>
              <h3>Detailed Statistics</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Total Quantity</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseAnalytics.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.totalRevenue || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderChatView = () => (
    <div className={styles.content}>
      <div className={styles.panel}>
        <h2>Community Chat</h2>
        <div className={styles.chatWrap}>
          <div className={styles.chatWindow}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.user && message.user.includes("Contractor") ? styles.msgYou : styles.msgOther
                }
              >
                <div className={styles.msgUser}>{message.user}</div>
                <div className={styles.msgText}>{message.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className={styles.chatForm}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${collapsed ? styles.collapsedPage : ''}`}>
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${isMobileNavOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <h2 className={styles.logo}>Contractor Panel</h2>
          <button
            onClick={() => {
              if (isMobileNavOpen) return setIsMobileNavOpen(false);
              setCollapsed(!collapsed);
            }}
            className={styles.collapseBtn}
          >
            {isMobileNavOpen ? <MdClose /> : collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${activeView === 'dashboard' ? styles.active : ''}`}
            onClick={() => changeView('dashboard')}
          >
            <MdDashboard />
            {!collapsed && 'Dashboard'}
          </button>
          <button
            className={`${styles.navBtn} ${activeView === 'students' ? styles.active : ''}`}
            onClick={() => changeView('students')}
          >
            <MdPeople />
            {!collapsed && 'Students'}
          </button>
          <button
            className={`${styles.navBtn} ${activeView === 'analytics' ? styles.active : ''}`}
            onClick={() => changeView('analytics')}
          >
            <MdAnalytics />
            {!collapsed && 'Analytics'}
          </button>
          <button
            className={`${styles.navBtn} ${activeView === 'chat' ? styles.active : ''}`}
            onClick={() => changeView('chat')}
          >
            <MdChat />
            {!collapsed && 'Chat'}
          </button>
          <button
            className={`${styles.navBtn} ${activeView === 'leaves' ? styles.active : ''}`}
            onClick={() => changeView('leaves')}
          >
            <MdEventAvailable />
            {!collapsed && 'Leaves'}
          </button>
          <button className={styles.navBtn} onClick={() => setShowLogoutModal(true)}>
            <MdLogout />
            {!collapsed && 'Logout'}
          </button>
        </nav>
      </div>
      <div
        className={`${styles.scrim} ${isMobileNavOpen ? styles.scrimVisible : ''}`}
        onClick={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content */}
      <div className={styles.main}>
        <header className={styles.header}>
          <button
            className={styles.mobileToggle}
            onClick={() => {
              setCollapsed(false);
              setIsMobileNavOpen(true);
            }}
            aria-label="Open navigation"
          >
            <MdMenu />
          </button>
          <h1>{hostel} - Contractor Dashboard</h1>
          <div className={styles.headerActions}>
            <span>Welcome, Contractor</span>
          </div>
        </header>

        {activeView === 'dashboard' && renderDashboardView()}
        {activeView === 'students' && renderStudentsView()}
        {activeView === 'leaves' && renderLeavesView()}
        {activeView === 'analytics' && renderAnalyticsView()}
        {activeView === 'chat' && renderChatView()}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button className={styles.secondary} onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className={styles.primary} onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}