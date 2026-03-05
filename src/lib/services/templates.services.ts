import { getUserToken } from '@/src/lib/server-utils';
import { Template, TemplateContent } from "@/src/types/templates.interface";

// import { getUserToken } from "../server-utils";

export default async function getAllTemplates(page:number , token:string): Promise<Template> {
    const res = await fetch(`http://localhost:9090/api/v1/coding/editor/templates?page=${page}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch templates: ${res.statusText}`);   
    }
    return res.json();
}
// create a new template
export const createTemplate = async (templateData: Omit<TemplateContent, 'template_id' | 'enabled' | 'monaco_name'>, token: string) => {
    // const { token } = await getUserToken();
const res = await fetch(`http://localhost:9090/api/v1/coding/editor/templates`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(templateData)
});

if (!res.ok) {
    throw new Error(`Failed to create template: ${res.statusText}`);
}
return res.json();  
}

// edit template 
export const editTemplate = async ( templateData : Omit<TemplateContent, 'template_id' | 'enabled' | 'monaco_name'>,id : number) => {
    const {token} = await getUserToken();
const res = await fetch (`http://localhost:9090/api/v1/coding/editor/templates/${id}`,{
    method:'PUT',
    headers:{
       "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(templateData)
});
if (!res.ok){
    throw new Error (`Failed to create template: ${res.statusText}`)
}
return res.json();
}

// delete template 
export const deleteTemplate = async (id : number) => {
    const {token} = await getUserToken();
    const res = await fetch(`http://localhost:9090/api/v1/coding/editor/templates/${id}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to delete template: ${res.statusText}`);
    }

    return res.ok; 
}

// toggle 
export const toggleTemplateStatus = async (id: number, forceValue: boolean) => {
    const { token } = await getUserToken();
    
    const res = await fetch(`http://localhost:9090/api/v1/coding/editor/templates/${id}/toggle?force=${forceValue}`, {
        method: 'PATCH', 
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });

    if (!res.ok) throw new Error("Failed to update status");
    return res.json(); 
}

// retrieve templtae
export const getTemplateById = async (id: number): Promise<TemplateContent> => {
    const { token } = await getUserToken();
    const res = await fetch(`http://localhost:9090/api/v1/coding/editor/templates/${id}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        },
    });

    if (!res.ok) throw new Error("Failed to fetch template details");
    return res.json();
}