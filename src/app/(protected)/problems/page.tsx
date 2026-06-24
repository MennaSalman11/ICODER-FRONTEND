"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  favoriteProblem,
  getAttemptedProblems,
  getFavoriteProblems,
  getProblems,
  getProblemsWithoutFilters,
  getSingleProblem,
  getSolvedProblems,
} from "@/src/lib/services/problems.services";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ProblemTable from "@/src/components/problemTable";

interface ProblemFilters {
  online_judge: string;
  searchTerm: string;
  size: number;
  page: number;
  sort: string;
}

interface Problem {
  problem_id: string;
  online_judge: string;
  problem_code: string;
  searchTerm: string;
  size: number;
  page: number;
  sort: string;
  problem_title: string;
  problem_link: string;
  solved_count: number;
  fetched_at: string;
  is_favorite: boolean;
  favorite?: boolean;
}

interface ProblemWithoutFilters {
  size: number;
  sort: string;
  page: number;
}

interface PaginationMeta {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}

const looksLikeProblemCode = (value: string) => {
  const v = value.trim();

  if (/^\d+$/.test(v)) return true;
  if (/^[A-Za-z0-9]+$/.test(v) && !/\s/.test(v)) return true;

  return false;
};

export default function ProblemPage() {
  const { data: session } = useSession();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [load, setLoad] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const [filters, setFilters] = useState<ProblemFilters>({
    online_judge: "All Judges",
    sort: "id,desc",
    searchTerm: "",
    size: 10,
    page: 1,
  });

  const [problemWithoutFilters, setProblemWithoutFilters] =
    useState<ProblemWithoutFilters>({
      size: 10,
      page: 1,
      sort: "id,desc",
    });

  const [pagination, setPagination] = useState<PaginationMeta>({
    totalElements: 0,
    totalPages: 1,
    currentPage: 1,
    size: 10,
    first: true,
    last: true,
  });

  // دي اللي هتتحكم في إظهار/إخفاء الباجينيشن
  const [showPagination, setShowPagination] = useState(true);

  // =========================
  // helper to map pagination response
  // =========================
  const applyPaginatedData = (data: any, favTab = false) => {
    if (data && data.content) {
      const mappedProblems = data.content.map((p: any) => ({
        ...p,
        favorite: favTab ? true : (p.is_favorite ?? p.favorite ?? false),
      }));

      setProblems(mappedProblems);

      setPagination({
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 1,
        currentPage: (data.number ?? 0) + 1, // backend page starts from 0
        size: data.size ?? filters.size,
        first: data.first ?? true,
        last: data.last ?? true,
      });

      // هنا معناه إننا جبنا من endpoint paginated
      setShowPagination(true);
    } else {
      setProblems([]);
      setPagination({
        totalElements: 0,
        totalPages: 1,
        currentPage: 1,
        size: filters.size,
        first: true,
        last: true,
      });
      setShowPagination(false);
    }
  };

  // =========================
  // load all by current tab + filters
  // =========================
  const loadDataByTab = async () => {
    setLoad(true);
    try {
      let data;

      switch (activeTab) {
        case "All":
          data = await getProblems(filters);
          break;
        case "Solved":
          data = await getSolvedProblems(filters);
          break;
        case "Attempted":
          data = await getAttemptedProblems(filters);
          break;
        case "Favorite":
          data = await getFavoriteProblems(filters);
          break;
        default:
          data = await getProblems(filters);
      }

      applyPaginatedData(data, activeTab === "Favorite");
    } catch (error) {
      console.error("Fetch failed:", error);
      toast.error("Failed to load problems");
    } finally {
      setLoad(false);
    }
  };

  // =========================
  // reset
  // =========================
  const handleProblemWithoutFilters = async () => {
    setLoad(true);
    try {
      const resetFilters = {
        online_judge: "All Judges",
        searchTerm: "",
        sort: "id,desc",
        size: 10,
        page: 1,
      };

      setFilters(resetFilters);
      setProblemWithoutFilters({
        size: 10,
        page: 1,
        sort: "id,desc",
      });
      setActiveTab("All");

      const data = await getProblemsWithoutFilters({
        page: 1,
        size: 10,
        sort: "id,desc",
      });

      applyPaginatedData(data, false);
    } catch (error) {
      console.error("Fetch without filters failed:", error);
      toast.error("Failed to reset filters");
    } finally {
      setLoad(false);
    }
  };

  // =========================
  // filter click
  // =========================
  const onFilterClick = async () => {
    // أي فلترة جديدة تبدأ من الصفحة الأولى
    const nextFilters = {
      ...filters,
      page: 1,
    };

    setFilters(nextFilters);

    // لو مختار judge + كاتب code واضح -> استخدم getSingleProblem
if (
  nextFilters.online_judge !== "All Judges" &&
  nextFilters.searchTerm.trim() &&
  looksLikeProblemCode(nextFilters.searchTerm)
) {
  setLoad(true);
  try {
    const judgeParam = nextFilters.online_judge.toLowerCase();
    const result = await getSingleProblem(
      judgeParam,
      nextFilters.searchTerm.trim()
    );

    if (result) {
      setProblems([
        {
          ...result,
          favorite:
            activeTab === "Favorite"
              ? true
              : (result.is_favorite ?? result.favorite ?? false),
        },
      ]);

      setShowPagination(false);

      setPagination({
        totalElements: 0,
        totalPages: 1,
        currentPage: 1,
        size: 1,
        first: true,
        last: true,
      });
    } else {
      setProblems([]);
      setShowPagination(false);

      setPagination({
        totalElements: 0,
        totalPages: 1,
        currentPage: 1,
        size: 1,
        first: true,
        last: true,
      });

      toast.error("Problem not found.");
    }
  } catch (error) {
    console.error("Error fetching specific problem:", error);
    setProblems([]);
    setShowPagination(false);

    setPagination({
      totalElements: 0,
      totalPages: 1,
      currentPage: 1,
      size: 1,
      first: true,
      last: true,
    });

    toast.error("Problem not found.");
  } finally {
    setLoad(false);
  }

  return;
}

    // غير كده: فلترة عادية paginated
    setLoad(true);
    try {
      const data =
        activeTab === "Solved"
          ? await getSolvedProblems(nextFilters)
          : activeTab === "Attempted"
          ? await getAttemptedProblems(nextFilters)
          : activeTab === "Favorite"
          ? await getFavoriteProblems(nextFilters)
          : await getProblems(nextFilters);

      applyPaginatedData(data, activeTab === "Favorite");
    } catch (error) {
      console.error("Filter failed:", error);
      toast.error("Failed to filter problems");
    } finally {
      setLoad(false);
    }
  };

  // =========================
  // favorite
  // =========================
  const handleFavorite = async (problemId: string, currentState: boolean) => {
    const nextStatus = !currentState;

    // optimistic update
    setProblems((prev) =>
      prev.map((p: any) =>
        p.problem_id === problemId
          ? { ...p, favorite: nextStatus, is_favorite: nextStatus }
          : p
      )
    );

    try {
      const res = await favoriteProblem(problemId, nextStatus);
      if (!res.ok) {
        setProblems((prev) =>
          prev.map((p: any) =>
            p.problem_id === problemId
              ? { ...p, favorite: currentState, is_favorite: currentState }
              : p
          )
        );
        toast.error("Failed to update favorite status");
        return;
      }

      // لو في Favorite tab وشلت الفيفوريت
      if (activeTab === "Favorite" && !nextStatus) {
        setProblems((prev) => prev.filter((p) => p.problem_id !== problemId));
      }

      toast.success(
        nextStatus ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error) {
      setProblems((prev) =>
        prev.map((p: any) =>
          p.problem_id === problemId
            ? { ...p, favorite: currentState, is_favorite: currentState }
            : p
        )
      );
      toast.error("Failed to update favorite status");
    }
  };

  // =========================
  // useEffect on tab/page/session
  // =========================
  useEffect(() => {
    loadDataByTab();
  }, [activeTab, filters.page, session]);

  // =========================
  // pagination handlers
  // =========================
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === filters.page) return;
    setFilters((prev) => ({ ...prev, page }));
  };

  const getVisiblePages = () => {
    const total = pagination.totalPages;
    const current = filters.page;

    if (total <= 1) return [1];

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }

    return [current - 2, current - 1, current, current + 1, current + 2];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Problem Set</h1>
            <p className="text-slate-500 mt-1">
              Hone your skills with thousands of curated problems.
            </p>
          </div>

          {/* Top Pagination */}
          {!load && showPagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600"
                disabled={filters.page === 1}
                onClick={() => goToPage(filters.page - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </Button>

              {visiblePages.map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={filters.page === page ? "default" : "ghost"}
                  className={
                    filters.page === page
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600"
                disabled={filters.page === pagination.totalPages}
                onClick={() => goToPage(filters.page + 1)}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Online Judge
              </label>
              <select
                value={filters.online_judge}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    online_judge: e.target.value,
                    page: 1,
                  })
                }
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Judges</option>
                <option>Codeforces</option>
                <option>CSES</option>
              </select>
            </div>

            <div className="md:col-span-6 relative">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Search Problem
              </label>
              <Search
                className="absolute left-3 bottom-3 text-slate-400"
                size={18}
              />
              <Input
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    searchTerm: e.target.value,
                    page: 1,
                  })
                }
                className="pl-10 bg-slate-50"
                placeholder="Search by problem code or title..."
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <Button
                disabled={load}
                className="flex-1 bg-[#1b4583] hover:bg-[#08316e] gap-2"
                onClick={onFilterClick}
              >
                {load ? (
                  <>Filtering...</>
                ) : (
                  <>
                    <Filter size={18} /> Filter
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="text-slate-400"
                onClick={handleProblemWithoutFilters}
              >
                <RotateCcw size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b mb-6 text-sm font-medium">
          <button
            onClick={() => {
              setActiveTab("All");
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-4 border-b-2 ${
              activeTab === "All"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            } transition`}
          >
            All
          </button>

          <button
            onClick={() => {
              setActiveTab("Solved");
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-4 transition ${
              activeTab === "Solved"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Solved
          </button>

          <button
            onClick={() => {
              setActiveTab("Attempted");
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-4 transition ${
              activeTab === "Attempted"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Attempted
          </button>

          <button
            onClick={() => {
              setActiveTab("Favorite");
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-4 transition ${
              activeTab === "Favorite"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Favorite
          </button>
        </div>

        {/* content */}
        {load ? (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900"></div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">
              Loading problems, please wait...
            </p>
          </div>
        ) : problems.length > 0 ? (
          <>
            <ProblemTable
              problems={problems}
              handleFavorite={handleFavorite}
              load={load}
            />

            {/* Bottom Pagination */}
            {showPagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl border shadow-sm">
                <p className="text-sm text-slate-500">
                  Showing page{" "}
                  <span className="font-semibold">{filters.page}</span> of{" "}
                  <span className="font-semibold">{pagination.totalPages}</span>
                  {" • "}
                  Total problems:{" "}
                  <span className="font-semibold">
                    {pagination.totalElements}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() => goToPage(filters.page - 1)}
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </Button>

                  {visiblePages.map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={filters.page === page ? "default" : "outline"}
                      className={
                        filters.page === page
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === pagination.totalPages}
                    onClick={() => goToPage(filters.page + 1)}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed">
            <p className="text-slate-400">
              No problems found. Try adjusting your filters or check back later
              for new additions!
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-12 mb-8">
          © 2025 ICoder. Built for excellence in competitive programming.
        </p>
      </div>
    </div>
  );
}