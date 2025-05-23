import React, { useState, useEffect } from "react";
import axios from "axios";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category?: string;
}

interface TaskListProps {
  token: string;
}

const TaskList: React.FC<TaskListProps> = ({ token }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:3000/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (err) {
        setError("Failed to fetch tasks");
      }
    };
    fetchTasks();
  }, [token]);

  const handleCreateOrUpdateTask = async () => {
    try {
      const data = { title, description, category: category || undefined };
      if (editId) {
        const response = await axios.patch(
          `http://localhost:3000/tasks/${editId}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setTasks(
          tasks.map((task) => (task.id === editId ? response.data : task)),
        );
        setEditId(null);
      } else {
        const response = await axios.post("http://localhost:3000/tasks", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks([...tasks, response.data]);
      }
      setTitle("");
      setDescription("");
      setCategory("");
    } catch (err) {
      setError("Failed to save task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category || "");
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/tasks/${id}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
    } catch (err) {
      setError("Failed to update task");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Category (e.g., Work, Personal)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={handleCreateOrUpdateTask}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={!title || !description}
        >
          {editId ? "Update Task" : "Add Task"}
        </button>
      </div>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3
                className={`text-lg font-semibold ${task.completed ? "line-through" : ""}`}
              >
                {task.title}
              </h3>
              <p>{task.description}</p>
              {task.category && (
                <p className="text-sm text-gray-500">
                  Category: {task.category}
                </p>
              )}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleToggleComplete(task.id, task.completed)}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                {task.completed ? "Unmark" : "Complete"}
              </button>
              <button
                onClick={() => handleEditTask(task)}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
