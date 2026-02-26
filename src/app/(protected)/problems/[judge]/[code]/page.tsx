// ⚠️ مفيش "use client" هنا!
import { getSpecificProblem } from '@/src/lib/services/specificProblem.services';
import ProblemUI from './ProblemUI';
// import ProblemUI from './ProblemUI'; // هنكريت الملف ده دلوقتي

export default async function Page({ params }: { params: Promise<{ judge: string, code: string }> }) {
    const { judge, code } = await params;
    
    const res = await getSpecificProblem(judge, code);
console.log('Response from service:', res); // دي هتساعدنا نعرف إذا كانت الداتا بتيجي صح ولا لأ
    if (!res || res.status) {
        return <div className="p-10 text-center">Problem not found!</div>;
    }

    // بنبعت الداتا الجاهزة للـ Client Component
    return <ProblemUI data={res} />;
}