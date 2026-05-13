import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
} from "@/state/api";

import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";

import {
  EllipsisVertical,
  MessageSquareMore,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { format } from "date-fns";
import Image from "next/image";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus = [
  "To Do",
  "Work In Progress",
  "Under Review",
  "Completed",
];

const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({ projectId: Number(id) });

  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: Record<string, string> = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`rounded-lg py-2 xl:px-2 ${
        isOver ? "bg-blue-100 dark:bg-neutral-950" : ""
      }`}
    >
      <div className="mb-3 flex w-full">
        <div
          className="w-2 rounded-s-lg"
          style={{ backgroundColor: statusColor[status] }}
        />

        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}

            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm dark:bg-dark-tertiary"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>

          <button
            className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={`${task.id}-${task.status}`} task={task} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
};

const Task = ({ task }: TaskProps) => {
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleDeleteTask = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await deleteTask(task.id).unwrap();
    } catch (error) {
      console.error(error);
      alert("Failed to delete task");
    }
  };

  const handleUpdateTask = async () => {
  try {
    await updateTask({
      id: task.id,
      projectId: task.projectId,
      title,
      description,
    });

    setIsEditing(false);
  } catch (error) {
    console.error(error);
    alert("Failed to update task");
  }
  };

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";

  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = task.comments?.length || 0;

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "Urgent"
          ? "bg-red-200 text-red-700"
          : priority === "High"
          ? "bg-yellow-200 text-yellow-700"
          : priority === "Medium"
          ? "bg-green-200 text-green-700"
          : priority === "Low"
          ? "bg-blue-200 text-blue-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}

            {taskTagsSplit.map((tag) => (
              <div
                key={`${task.id}-${tag}`}
                className="rounded-full bg-blue-100 px-2 py-1 text-xs"
              >
                {tag}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
            >
              <Pencil size={14} />
            </button>

            <button
              onClick={handleDeleteTask}
              className="rounded bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border p-2"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border p-2"
            />

            <div className="flex gap-2">
              <button
                onClick={handleUpdateTask}
                className="rounded bg-green-500 px-3 py-1 text-white"
              >
                Save
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="rounded bg-gray-400 px-3 py-1 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="my-3 flex justify-between">
              <h4 className="text-md font-bold dark:text-white">
                {task.title}
              </h4>

              {typeof task.points === "number" && (
                <div className="text-xs font-semibold dark:text-white">
                  {task.points} pts
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 dark:text-neutral-500">
              {formattedStartDate && <span>{formattedStartDate} - </span>}
              {formattedDueDate && <span>{formattedDueDate}</span>}
            </div>

            <p className="mt-2 text-sm text-gray-600 dark:text-neutral-500">
              {task.description}
            </p>
          </>
        )}

        <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {task.assignee?.profilePictureUrl && (
              <Image
                src={task.assignee.profilePictureUrl}
                alt={task.assignee.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
              />
            )}

            {task.author?.profilePictureUrl && (
              <Image
                src={task.author.profilePictureUrl}
                alt={task.author.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover"
              />
            )}
          </div>

          <div className="flex items-center text-gray-500">
            <MessageSquareMore size={20} />

            <span className="ml-1 text-sm">
              {numberOfComments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;