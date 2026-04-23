"use client";
import React, { useState, useEffect } from "react";

interface Task {
  text: string;
  completed: boolean;
}

interface TodoListProps {
  initialTasks?: Task[];
  onSave?: (tasks: Task[]) => void;
  theme?: "light" | "dark";
}

export default function TodoList({ initialTasks = [], onSave, theme = "dark" }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [inputValue, setInputValue] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newList = [...tasks, { text: inputValue, completed: false }];
    setTasks(newList);
    setInputValue("");
    onSave?.(newList);
  };

  const toggleTask = (index: number) => {
    const newList = tasks.map((t, i) => i === index ? { ...t, completed: !t.completed } : t);
    setTasks(newList);
    onSave?.(newList);
  };

  const deleteTask = (index: number) => {
    const newList = tasks.filter((_, i) => i !== index);
    setTasks(newList);
    onSave?.(newList);
  };

  return (
    <div className="w-[240px] bg-app-card border-4 border-app-border p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] flex flex-col gap-4">
      <h3 className="text-sm font-black uppercase tracking-tighter border-b-4 border-app-border pb-2">
        Daily Tasks
      </h3>
      
      <ul className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
        {tasks.map((task, index) => (
          <li key={index} className="flex items-center gap-2 group">
            <button 
              onClick={() => toggleTask(index)}
              className={`w-5 h-5 border-2 border-app-border flex items-center justify-center transition-colors ${task.completed ? 'bg-app-accent' : 'bg-app-bg'}`}
            >
              {task.completed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
            <span className={`text-[12px] font-bold flex-1 truncate ${task.completed ? 'line-through opacity-40' : 'text-app-text'}`}>
              {task.text}
            </span>
            <button 
              onClick={() => deleteTask(index)}
              className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-red-500 uppercase"
            >
              Del
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddTask} className="flex flex-col gap-2 pt-2 border-t-2 border-app-border/20">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="New task..."
          className="bg-app-bg border-2 border-app-border p-2 text-[11px] font-bold focus:outline-none focus:border-app-accent transition-colors"
        />
        <button type="submit" className="bg-app-accent text-app-bg text-[10px] font-black uppercase py-1 border-2 border-app-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
          Add Task
        </button>
      </form>
    </div>
  );
}