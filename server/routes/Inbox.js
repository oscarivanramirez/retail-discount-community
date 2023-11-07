import express from "express";
import { getInboxSummary } from "../controllers/Inbox.js";

const router = express.Router();

// Get inbox summary for the authenticated user
router.get('/summary', getInboxSummary);

export default router;