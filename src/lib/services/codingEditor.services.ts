import { getUserToken } from '../server-utils';
import { BatchSubmissionPayload, SubmissionPayload } from './../../schema/submission.schema';
// get all languages
export const getLanguageList = async () => {
    const res = await fetch('http://localhost:9090/api/v1/coding/editor/languages') 
    if (!res.ok) {
        return {
            status: res.status,
            message: 'Failed to fetch language list'
        } 
        }
        return await res.json();
}

// get specific language by id
export const getLanguageById = async (id: string) => {
    const query = new URLSearchParams({ id });
    const res = await fetch(`http://localhost:9090/api/v1/coding/editor/language?${query.toString()}`,{
        headers: {
            'content-type': 'application/json'
        }
    });
    if (!res.ok) {
        return {
            status: res.status,
            message: 'Failed to fetch language'
        }

       
    }
     return await res.json();
     
}

// submit code for a problem
export const submitCode = async (SubmissionPayload: SubmissionPayload) => {
    const { token } = await getUserToken();
    const res = await fetch (`http://localhost:9090/api/v1/coding/editor/submissions`,{
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(SubmissionPayload)
    });
    const data = await res.json();
    if (!res.ok) {
        return {
            status: res.status,
            message: data.message || 'Failed to submit code'
        }
    }
    return data;
}

// get submission result by submission token
export const getSubmissionResult = async (submissionToken: string) => {
    const { token } = await getUserToken(); 
    const res = await fetch(`http://localhost:9090/api/v1/coding/editor/submissions/${submissionToken}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    return await res.json();
}

// submit code for a problem with multiple test cases
export const submitBatchCode = async (batchPayload: BatchSubmissionPayload) => {
    const { token } = await getUserToken();
    const res = await fetch (`http://localhost:9090/api/v1/coding/editor/submissions/batch`,{
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(batchPayload)
    });
    const data = await res.json();
    if (!res.ok) {
        return {
            status: res.status,
            message: data.message || 'Failed to submit code'
        }
    }
    return data;
}

// get batch submission result by submission token
export const getBatchSubmissionResult = async (tokens: string[]) => {
    const { token } = await getUserToken();
const params = new URLSearchParams();
    tokens.forEach(t => params.append('tokens', t));
        const res = await fetch(`http://localhost:9090/api/v1/coding/editor/submissions/batch?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
        const data = await res.json();
    if (!res.ok) {
        return {
            status: res.status,
            message: data.message || 'Failed to submit code'
        }
    }
    return data;

}