const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROOT TEST
app.get("/", (req, res) => {
  res.send("Backend working");
});

// PROJECTS DATA
app.get("/projects", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Project Alpha",
      description: "Demo project",
      startDate: "2024-01-01",
      endDate: "2024-12-31"
    }
  ]);
});

// TASKS DATA
app.get("/tasks", (req, res) => {
  const { projectId } = req.query;

  res.json([
    {
      id: 1,
      title: "Design UI",
      status: "To Do",
      priority: "High",
      projectId: Number(projectId),
    },
    {
      id: 2,
      title: "Build Backend",
      status: "Work In Progress",
      priority: "Urgent",
      projectId: Number(projectId),
    },
    {
      id: 3,
      title: "Testing",
      status: "Completed",
      priority: "Medium",
      projectId: Number(projectId),
    }
  ]);
});

// EMPTY ROUTES (to stop errors)
app.get("/users", (req, res) => res.json([]));
app.get("/teams", (req, res) => res.json([]));

app.listen(8000, () => {
  console.log("Server running on port 8000");
});