import { Request, Response } from "express";
import prisma from "../prismaClient";

export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    const { uploadedById } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const attachmentData: any = {
  fileURL: (req.file as any).path,
  fileName: req.file.originalname,
  uploadedById: Number(uploadedById),
};

const attachment = await prisma.attachment.create({
  data: attachmentData,
});

    res.json(attachment);
  } catch (error: any) {
    console.log("UPLOAD ERROR:", error);

    res.status(500).json({
      message: error?.message || "Upload failed",
    });
  }
};