
import { getSpecificProblem } from '@/src/lib/services/specificProblem.services';
import ProblemUI from './ProblemUI';
import { getLanguageList } from '@/src/lib/services/codingEditor.services';

export default async function Page(props: { params: Promise<{ judge: string, code: string }> }) {
    const params = await props.params;
    const judge = params.judge;
    const code = params.code;
    
    const res = await getSpecificProblem(judge, code);
    const languages = await getLanguageList();
console.log("Fetched langueges:", languages);
    if (!res || res.status) {
        return <div className="p-10 text-center">Problem not found!</div>;
    }

    return <ProblemUI data={res} languagesList={languages} />;
}