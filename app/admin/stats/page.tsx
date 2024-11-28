"use client";

import { useEffect, useState } from "react";

interface SiteVisitStats {
  username: string;
  total_visits: number;
  image_count: number;
}

export default function AdminStats() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [stats, setStats] = useState<SiteVisitStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setError("Invalid password");
      }
    } catch (error) {
      setError("Authentication failed");
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/site-visits?month=${selectedMonth}`
      );

      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, selectedMonth]);

  const viewSite = (username: string) => {
    window.open(`https://${username}.myphotos.site`, "_blank");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <form onSubmit={authenticate} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="border p-2 rounded"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="block w-full bg-blue-500 text-white p-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Site Visit Statistics</h1>

      <div className="mb-6">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value + "-01")}
          className="border p-2 rounded"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-left">Total Visits</th>
                <th className="px-6 py-3 text-left">Images</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.username} className="border-b">
                  <td className="px-6 py-4">{stat.username}</td>
                  <td className="px-6 py-4">{stat.total_visits}</td>
                  <td className="px-6 py-4">{stat.image_count}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => viewSite(stat.username)}
                      className="text-blue-500 hover:underline"
                    >
                      View Site
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
