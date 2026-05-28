"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSubmissions } from "@/src/lib/services/submitCode.services";
import { Content } from "@/src/types/submitCode.interface";
import SubmissionsTable from "@/src/components/SubmissionsTable";

export default function SubmissionsPage() {
  const params = useParams();
  const problemCode = params.code as string;
  
  const [submissions, setSubmissions] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        // 2. استخدام currentPage هنا ليتم جلب الصفحة الصحيحة
        const data = await getSubmissions({ page: currentPage, size: 20, problem_code: problemCode });
        setSubmissions(data.content);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSubmissions();
  }, [problemCode, currentPage]); // 3. إضافة currentPage هنا لتتحدث البيانات عند تغيير الصفحة

  if (loading && submissions.length === 0) 
    return <div className="p-8 text-center animate-pulse">Loading submissions...</div>;

  return (
    <div className="p-8">
      <SubmissionsTable 
        submissions={submissions} 
        loading={loading} 
        // 4. تمرير الدالة الصحيحة التي تغير الـ state
        onPageChange={(page) => setCurrentPage(page)} 
        // 5. تمرير الـ state الحالي
        currentPage={currentPage} 
      />
    </div>
  );
}