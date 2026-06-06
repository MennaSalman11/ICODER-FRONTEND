// import { getUserToken } from "../server-utils";

// interface ProblemFilters {
//   online_judge?: string;
//   problem_title?: string;
//   problem_code?: string;
//   searchTerm?: string;
//   size: number;
//   sort: string;
//   page: number;
// }
// interface ProblemWithoutFilters {
//     size: number;
//     sort: string;
//     page: number;
// }

// // get all problems
// export const getProblems = async (filters: ProblemFilters) => {
//     const { token } = await getUserToken();
//     console.log('token in service:', token);
    
//     const query = new URLSearchParams({
//         page: (filters.page - 1).toString(),
//         size: filters.size.toString(),
//         sort: filters.sort || 'id,desc',
//     });

//     if (filters.online_judge && filters.online_judge !== 'All Judges') {
//         query.append('online_judge', filters.online_judge);
//     }

//     if (filters.searchTerm) {
//         query.append('problemCode', filters.searchTerm);

//     }

//     const res = await fetch(`http://localhost:9090/api/v1/problems?${query.toString()}`, {
//         headers: {
//             'content-type': 'application/json',
//             'Authorization': `Bearer ${token}` }
//     });
//     return await res.json();
// };



// // get single problem by judge and code
// export const getSingleProblem = async (judge: string, code: string) => {
//     const { token } = await getUserToken();

//     const res = await fetch(`http://localhost:9090/api/v1/problems/${judge}/${code}/metadata`, {
//         headers: {
//             'Authorization': `Bearer ${token}`,
//         }
//     });
    
//     if (!res.ok) return null;
//     return await res.json(); 
// };

// // get problems without filters (for reset button)
// export const getProblemsWithoutFilters = async (withoutFilters : ProblemWithoutFilters) => {
//     const { token } = await getUserToken();       
//     const query = new URLSearchParams({
//         page: (withoutFilters.page - 1).toString(),
//         size: withoutFilters.size.toString(),
//         sort: withoutFilters.sort || 'id,desc',
//     }); 

//     return fetch(`http://localhost:9090/api/v1/problems/reset-filters?${query.toString()}`, {
//         headers: {
//             'content-type': 'application/json',
//             'Authorization': `Bearer ${token}` 
//         }
//     }).then(res => res.json());
// };

// // favorite a problem
// export const favoriteProblem = async (problemId: any, isFavorite: boolean) => {
//     const { token } = await getUserToken();

//     const res = await fetch(`http://localhost:9090/api/v1/problems`, { 
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//             problem_id: Number(problemId), 
//             is_favourite: isFavorite       
//         })
//     });

//     if (!res.ok) {
//         const errorText = await res.text();
//         console.error("Server says:", errorText);
//         throw new Error('Failed to update favorite status');
//     }
//     return res;
// };

// // get solved problems
// export const getSolvedProblems = async (filters : ProblemFilters) =>{
//     const { token } = await getUserToken();
//     const query = new URLSearchParams({
//         page: (filters.page - 1).toString(),
//         size: filters.size.toString(),
//         sort: filters.sort || 'id,desc',
//     })
//     const res = await fetch(`http://localhost:9090/api/v1/problems/solved?${query.toString()}`, {
//         headers: {
//             'content-type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         }
//     });
//     return await res.json();

// }

// // get favorite problems
// export const getFavoriteProblems = async (filters : ProblemFilters) =>{
//     const { token } = await getUserToken();
//     const query = new URLSearchParams({     
//         page: (filters.page - 1).toString(),
//         size: filters.size.toString(),
//         sort: filters.sort || 'id,desc',        
//     })
//     const res = await fetch(`http://localhost:9090/api/v1/problems/favorites?${query.toString()}`, {
//         headers: {
//             'content-type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         }
//     });
//     return await res.json();    
// }

// // get attempted problems
// export const getAttemptedProblems = async (filters : ProblemFilters) =>{
//     const { token } = await getUserToken();     
//     const query = new URLSearchParams({
//         page: (filters.page - 1).toString(),
//         size: filters.size.toString(),
//         sort: filters.sort || 'id,desc',        
//     })
//     const res = await fetch(`http://localhost:9090/api/v1/problems/attempted?${query.toString()}`, {
//         headers: {
//             'content-type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         }
//     });
//     return await res.json();    
// }

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

// get all problems
export const getProblems = async (filters: ProblemFilters) => {
    const { token } = await getUserToken();
    
    const query = new URLSearchParams({
        page: (filters.page - 1).toString(),
        size: filters.size.toString(),
        sort: filters.sort || 'id,desc',
    });

    if (filters.online_judge && filters.online_judge !== 'All Judges') {
        // التعديل 1: تحويل الـ judge لـ lowercase
        query.append('online_judge', filters.online_judge.toLowerCase());
    }

    if (filters.searchTerm) {
        // التعديل 2: التأكد من مسمى الباراميتر الصحيح
        query.append('problemCode', filters.searchTerm);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems?${query.toString()}`, {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });
    return await res.json();
};

// get single problem by judge and code
export const getSingleProblem = async (judge: string, code: string) => {
    const { token } = await getUserToken();

    // التعديل 3: السيرفر مستني الـ judge في الـ URL حروف صغيرة (codeforces/123/metadata)
    const formattedJudge = judge.toLowerCase();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/${formattedJudge}/${code}/metadata`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
    
    if (!res.ok) return null;
    return await res.json(); 
};

// get problems without filters (for reset button)
export const getProblemsWithoutFilters = async (withoutFilters : ProblemWithoutFilters) => {
    const { token } = await getUserToken();       
    const query = new URLSearchParams({
        page: (withoutFilters.page - 1).toString(),
        size: withoutFilters.size.toString(),
        sort: withoutFilters.sort || 'id,desc',
    }); 

    return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/reset-filters?${query.toString()}`, {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    }).then(res => res.json());
};

// favorite a problem
export const favoriteProblem = async (problemId: any, isFavorite: boolean) => {
    const { token } = await getUserToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems`, { 
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            problem_id: Number(problemId), 
            is_favourite: isFavorite       
        })
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Server says:", errorText);
        throw new Error('Failed to update favorite status');
    }
    return res;
};

// get solved problems
export const getSolvedProblems = async (filters : ProblemFilters) =>{
    const { token } = await getUserToken();
    const query = new URLSearchParams({
        page: (filters.page - 1).toString(),
        size: filters.size.toString(),
        sort: filters.sort || 'id,desc',
    })
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/solved?${query.toString()}`, {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return await res.json();
}

// get favorite problems
export const getFavoriteProblems = async (filters : ProblemFilters) =>{
    const { token } = await getUserToken();
    const query = new URLSearchParams({     
        page: (filters.page - 1).toString(),
        size: filters.size.toString(),
        sort: filters.sort || 'id,desc',        
    })
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/favorites?${query.toString()}`, {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return await res.json();    
}

// get attempted problems
export const getAttemptedProblems = async (filters : ProblemFilters) =>{
    const { token } = await getUserToken();     
    const query = new URLSearchParams({
        page: (filters.page - 1).toString(),
        size: filters.size.toString(),
        sort: filters.sort || 'id,desc',        
    })
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/problems/attempted?${query.toString()}`, {
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return await res.json();    
}