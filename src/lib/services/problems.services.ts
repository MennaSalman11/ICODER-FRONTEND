import { getUserToken } from "../server-utils";

interface ProblemFilters {
  online_judge?: string;
  problem_title?: string;
  problem_code?: string;
  searchTerm?: string;
  size: number;
  sort: string;
  page: number;
}

interface ProblemWithoutFilters {
  size: number;
  sort: string;
  page: number;
}

// helper: هل السيرش غالبًا problem code؟
const looksLikeProblemCode = (value: string) => {
  const v = value.trim();

  // لو كله رقم -> code
  if (/^\d+$/.test(v)) return true;

  // لو pattern زي A / B / C / 4A / 71A / 339B / A1
  if (/^[A-Za-z0-9]+$/.test(v) && !/\s/.test(v)) return true;

  return false;
};

// get all problems
export const getProblems = async (filters: ProblemFilters) => {
  const { token } = await getUserToken();

  const query = new URLSearchParams({
    page: (filters.page - 1).toString(),
    size: filters.size.toString(),
    sort: filters.sort || "id,desc",
  });

  if (filters.online_judge && filters.online_judge !== "All Judges") {
    query.append("online_judge", filters.online_judge.toLowerCase());
  }

  if (filters.searchTerm?.trim()) {
    const term = filters.searchTerm.trim();

    if (looksLikeProblemCode(term)) {
      query.append("problemCode", term);
    } else {
      query.append("problemTitle", term);
    }
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems?${query.toString()}`,
    {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  return await res.json();
};

// get single problem by judge and code
export const getSingleProblem = async (judge: string, code: string) => {
  const { token } = await getUserToken();

  const formattedJudge = judge.toLowerCase();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/${formattedJudge}/${code}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  // لو status مش OK
  if (!res.ok) return null;

  const data = await res.json();

  // backend ساعات بيرجع object فيه title = 404 بدل ما يعمل status 404
  const title = String(data?.problem_title ?? "").trim();

  if (
    !data ||
    title === "404" ||
    title.toLowerCase() === "not found"
  ) {
    return null;
  }

  return data;
};

// get problems without filters (for reset button)
export const getProblemsWithoutFilters = async (
  withoutFilters: ProblemWithoutFilters
) => {
  const { token } = await getUserToken();
  const query = new URLSearchParams({
    page: (withoutFilters.page - 1).toString(),
    size: withoutFilters.size.toString(),
    sort: withoutFilters.sort || "id,desc",
  });

  return fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/reset-filters?${query.toString()}`,
    {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  ).then((res) => res.json());
};

// favorite a problem
export const favoriteProblem = async (problemId: any, isFavorite: boolean) => {
  const { token } = await getUserToken();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      problem_id: Number(problemId),
      is_favourite: isFavorite,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Server says:", errorText);
    throw new Error("Failed to update favorite status");
  }
  return res;
};

// get solved problems
export const getSolvedProblems = async (filters: ProblemFilters) => {
  const { token } = await getUserToken();
  const query = new URLSearchParams({
    page: (filters.page - 1).toString(),
    size: filters.size.toString(),
    sort: filters.sort || "id,desc",
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/solved?${query.toString()}`,
    {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  return await res.json();
};

// get favorite problems
export const getFavoriteProblems = async (filters: ProblemFilters) => {
  const { token } = await getUserToken();
  const query = new URLSearchParams({
    page: (filters.page - 1).toString(),
    size: filters.size.toString(),
    sort: filters.sort || "id,desc",
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/favorites?${query.toString()}`,
    {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  return await res.json();
};

// get attempted problems
export const getAttemptedProblems = async (filters: ProblemFilters) => {
  const { token } = await getUserToken();
  const query = new URLSearchParams({
    page: (filters.page - 1).toString(),
    size: filters.size.toString(),
    sort: filters.sort || "id,desc",
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/attempted?${query.toString()}`,
    {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  return await res.json();
};