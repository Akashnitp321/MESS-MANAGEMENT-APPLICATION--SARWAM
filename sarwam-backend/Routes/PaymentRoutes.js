import express from "express";
import { makePayment, createPurchase, getPurchaseHistory, getMonthlyPurchases } from "../controllers/PaymentContoller.js";

const router = express.Router();

router.post("/make-payment", makePayment);
router.post("/create-purchase", createPurchase);
router.get("/purchase-history", getPurchaseHistory);
router.get("/monthly-purchases", getMonthlyPurchases);

export default router;