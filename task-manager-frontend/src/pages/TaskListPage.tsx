import { useState } from "react";
import TaskCard from "../components/TaskCard";
import { Task } from "../types";

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddTask = () => {
    const task: Task = {
      _id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      completed: false,
      userId: "temp-user-id",
    };
    setTasks([...tasks, task]);
    setIsAddingTask(false);
    setNewTask({ title: "", description: "", category: "" });
  };

  const handleCompleteTask = (id: string) => {
    // TODO: Implement complete task logic
  };

  const handleDeleteTask = (id: string) => {
    // TODO: Implement delete task logic
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Task List</h1>
        <button
          onClick={() => setIsAddingTask(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          Add new task
        </button>
      </div>

      {isAddingTask && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add new task</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                rows={3}
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <input
                id="category"
                type="text"
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingTask(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks. Add a new task!</p>
          </div>
        )}
      </div>
    </div>
  );
}
