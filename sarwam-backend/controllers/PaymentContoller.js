import express from "express";
import Payment from "../models/Payment.js";
import Purchase from "../models/Purchase.js";
import { jwtDecode } from "jwt-decode";

export const makePayment = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res
        .status(400)
        .json({ status: false, message: "token is required" });
    }

    const decoded= jwtDecode(authToken);
    const rollNo= decoded.rollNo;
    const amount=req.body.amount;

    const newPayment= await Payment.create({
        rollNo:rollNo,
        amount:amount

    })

    return res.status(200).json({status:'success',message:"payment done successfully!!!",data:newPayment});





  } catch (error) {
    return res
      .status(500)
      .json({ status: "failed", message: "network error!" });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(400).json({ status: false, message: "token is required" });
    }

    let decoded;
    try {
      decoded = jwtDecode(authToken);
    } catch (err) {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }

    const studentId = decoded.rollNo;
    const { items, totalAmount } = req.body;

    const currentDate = new Date();
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const newPurchase = await Purchase.create({
      studentId,
      items,
      totalAmount,
      month
    });

    return res.status(200).json({ status: 'success', message: "Purchase recorded successfully", data: newPurchase });
  } catch (error) {
    console.error("Create purchase error:", error);
    return res.status(500).json({ status: "failed", message: "network error!" });
  }
};

export const getPurchaseHistory = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(400).json({ status: false, message: "token is required" });
    }

    let decoded;
    try {
      decoded = jwtDecode(authToken);
    } catch (err) {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }

    const studentId = decoded.rollNo;

    const purchases = await Purchase.find({ studentId }).sort({ paymentTime: -1 });

    return res.status(200).json({ status: 'success', data: purchases });
  } catch (error) {
    console.error("Get purchase history error:", error);
    return res.status(500).json({ status: "failed", message: "network error!" });
  }
};

export const getMonthlyPurchases = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(400).json({ status: false, message: "token is required" });
    }

    let decoded;
    try {
      decoded = jwtDecode(authToken);
    } catch (err) {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }

    const studentId = decoded.rollNo;

    const currentDate = new Date();
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const purchases = await Purchase.find({ studentId, month });

    // Aggregate items and total spent
    const itemCounts = {};
    let totalSpent = 0;

    purchases.forEach(purchase => {
      totalSpent += purchase.totalAmount;
      purchase.items.forEach(item => {
        if (itemCounts[item.name]) {
          itemCounts[item.name] += item.quantity;
        } else {
          itemCounts[item.name] = item.quantity;
        }
      });
    });

    const graphData = Object.keys(itemCounts).map(name => ({
      name,
      quantity: itemCounts[name]
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        graphData,
        totalSpent,
        purchases
      }
    });
  } catch (error) {
    console.error("Get monthly purchases error:", error);
    return res.status(500).json({ status: "failed", message: "network error!" });
  }
};
