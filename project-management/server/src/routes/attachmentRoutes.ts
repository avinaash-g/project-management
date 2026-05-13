import express from "express";
import { uploadAttachment } from "../controllers/attachmentController";
import upload from "../middleware/upload";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadAttachment);

export default router;