import React, { useState } from "react";
import Auth from "./Auth";
import TaskList from "./TaskList";

function App() {
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = (token: string) => {
    setToken(token);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {token ? <TaskList token={token} /> : <Auth onLogin={handleLogin} />}
    </div>
  );
}

export default App;
