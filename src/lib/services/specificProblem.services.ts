"use server";
// import { getSpecificProblem } from './specificProblem.services';
import { getUserToken } from "../server-utils";

// get specific problem by id
export const getSpecificProblem = async (judge : string, code : string) =>{
    const {token} = await getUserToken();
    const res = await fetch(`http://localhost:9090/api/v1/problems/${judge}/${code}`, {
        headers:{
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if(!res.ok){
        return {
            status: res.status,
            message: await res.text()
        }
    }
    return await res.json();
        }
// get specific problem by crewaller

export const getSpecificProblemByCrawler = async (judge : string, code : string) =>{
    const {token} = await getUserToken();
    const res = await fetch(`http://localhost:9090/api/v1/problems/recrawl/${judge}/${code}`, { 
        headers:{
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }); 
    if(!res.ok){
        return {
            status: res.status,
            message: await res.text()
        }
    }   
    return await res.json();
        }