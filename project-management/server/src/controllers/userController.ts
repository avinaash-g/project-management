import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET ALL USERS
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving users: ${error.message}`,
    });
  }
};

// GET SINGLE USER BY ID
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: Number(userId),
      },
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({
      message: `Error retrieving user: ${error.message}`,
    });
  }
};

// CREATE USER
export const postUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      profilePictureUrl = "i1.jpg",
      teamId = null,
    } = req.body;

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password,
        profilePictureUrl,
        teamId,
      },
    });

    res.json({
      message: "User Created Successfully",
      newUser,
    });
  } catch (error: any) {
    res.status(500).json({
      message: `Error creating user: ${error.message}`,
    });
  }
};