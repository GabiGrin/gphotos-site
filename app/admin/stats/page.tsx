"use client";

import { useEffect, useState } from "react";

interface SiteVisitStats {
  username: string;
  total_visits: number;
  image_count: number;
}

type SortField = "username" | "total_visits" | "image_count";
type FilterType = "all" | "no_images" | "no_visits" | "active";

export default function AdminStats() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [stats, setStats] = useState<SiteVisitStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<SortField>("total_visits");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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

  const sortStats = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filterStats = (stats: SiteVisitStats[]) => {
    switch (activeFilter) {
      case "no_images":
        return stats.filter((stat) => stat.image_count === 0);
      case "no_visits":
        return stats.filter((stat) => stat.total_visits === 0);
      case "active":
        return stats.filter(
          (stat) => stat.total_visits > 0 && stat.image_count > 0
        );
      default:
        return stats;
    }
  };

  const getSortedAndFilteredStats = () => {
    return filterStats([...stats]).sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;
      return multiplier * (a[sortField] > b[sortField] ? 1 : -1);
    });
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

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded ${
              activeFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("no_images")}
            className={`px-3 py-1 rounded ${
              activeFilter === "no_images"
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}
          >
            No Images
          </button>
          <button
            onClick={() => setActiveFilter("no_visits")}
            className={`px-3 py-1 rounded ${
              activeFilter === "no_visits"
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}
          >
            No Visits
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`px-3 py-1 rounded ${
              activeFilter === "active"
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}
          >
            Active Sites
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left">#</th>
                <th
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => sortStats("username")}
                >
                  Username{" "}
                  {sortField === "username" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => sortStats("total_visits")}
                >
                  Total Visits{" "}
                  {sortField === "total_visits" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-6 py-3 text-left cursor-pointer"
                  onClick={() => sortStats("image_count")}
                >
                  Images{" "}
                  {sortField === "image_count" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSortedAndFilteredStats().map((stat, index) => (
                <tr
                  key={stat.username}
                  className={`border-b ${
                    stat.image_count === 0
                      ? "bg-red-50"
                      : stat.total_visits === 0
                        ? "bg-yellow-50"
                        : ""
                  }`}
                >
                  <td className="px-6 py-4 text-gray-500">{index + 1}</td>
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
