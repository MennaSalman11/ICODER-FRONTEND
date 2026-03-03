
import { getSpecificProblem } from '@/src/lib/services/specificProblem.services';
import ProblemUI from './ProblemUI';

export default async function Page(props: { params: Promise<{ judge: string, code: string }> }) {
    const params = await props.params;
    const judge = params.judge;
    const code = params.code;
    
    const res = await getSpecificProblem(judge, code);
    if (!res || res.status) {
        return <div className="p-10 text-center">Problem not found!</div>;
    }

    return <ProblemUI data={res} />;
}