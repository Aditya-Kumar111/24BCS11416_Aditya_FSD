import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useState,
} from "react";

const student = {
  name: "Aditya Kumar",
  email: "aditya@gmail.com",
  year: "3rd Year",
};

const StudentContext = createContext(null);

function StudentProvider({ children }) {

  const value = useMemo(() => student, []);
  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}

function useUser() {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    throw new Error("useUser must be used within a StudentProvider");
  }
  return ctx;
}

const initialTasks = [
  { id: 1, title: "Finish DBMS assignment", completed: false },
  { id: 2, title: "Revise React hooks", completed: false },
  { id: 3, title: "Submit lab report", completed: true },
];

function taskReducer(state, action) {
  switch (action.type) {
    case "SET_TASKS":
      return action.payload;

    case "ADD_TASK": {
      const title = action.payload.trim();
      if (!title) return state;
      const newTask = {
        id: Date.now(),
        title,
        completed: false,
      };
      return [...state, newTask];
    }

    case "TOGGLE_TASK":
      return state.map((task) =>
        task.id === action.payload
          ? { ...task, completed: !task.completed }
          : task
      );

    case "DELETE_TASK":
      return state.filter((task) => task.id !== action.payload);

    default:
      return state;
  }
}

function useTaskStats(tasks) {
  return useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [tasks]);
}

function Header() {
  const { name } = useUser();
  return (
    <header className="border-b border-slate-200 pb-4 mb-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">
        StudyHub
      </h1>
      <p className="text-slate-500 mt-1">Welcome, {name}</p>
    </header>
  );
}


function ProfilePanel() {
  const { name, email, year } = useUser();
  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 mb-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">
        Student Details
      </h2>
      <dl className="space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium text-slate-600 w-16">Name:</dt>
          <dd className="text-slate-800">{name}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-slate-600 w-16">Email:</dt>
          <dd className="text-slate-800">{email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-slate-600 w-16">Year:</dt>
          <dd className="text-slate-800">{year}</dd>
        </div>
      </dl>
    </section>
  );
}
function TaskStats({ tasks }) {
  const { total, remaining } = useTaskStats(tasks);
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
      My Tasks{" "}
      <span className="text-slate-400 font-normal normal-case">
        ({remaining} remaining / {total} total)
      </span>
    </h2>
  );
}


function AddTaskForm({ onAdd }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New task..."
        className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm
                   font-medium px-4 py-2 rounded-md transition-colors"
      >
        Add Task
      </button>
    </form>
  );
}
const TaskItem = React.memo(function TaskItem({ task, onToggle, onDelete }) {

  return (
    <li className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
      <label className="flex items-center gap-2 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="h-4 w-4 accent-indigo-600"
        />
        <span
          className={
            task.completed
              ? "line-through text-slate-400 text-sm"
              : "text-slate-800 text-sm"
          }
        >
          {task.title}
        </span>
      </label>
      <button
        onClick={() => onDelete(task.id)}
        className="text-xs text-red-500 hover:text-red-700 font-medium"
      >
        Delete
      </button>
    </li>
  );
});


function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic py-4">
        No tasks yet — add one above.
      </p>
    );
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function TaskManager() {
  const [tasks, dispatch] = useReducer(taskReducer, initialTasks);

  const handleToggle = useCallback((id) => {
    dispatch({ type: "TOGGLE_TASK", payload: id });
  }, []);

  const handleDelete = useCallback((id) => {
    dispatch({ type: "DELETE_TASK", payload: id });
  }, []);

  const handleAdd = useCallback((title) => {
    dispatch({ type: "ADD_TASK", payload: title });
  }, []);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [tasks]);

  return (
    <section className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <TaskStats tasks={tasks} />
      </div>
      <AddTaskForm onAdd={handleAdd} />
      <TaskList
        tasks={sortedTasks}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </section>
  );
}


export default function App() {
  return (
    <StudentProvider>
      <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Header />
          <ProfilePanel />
          <TaskManager />
        </div>
      </div>
    </StudentProvider>
  );
}
