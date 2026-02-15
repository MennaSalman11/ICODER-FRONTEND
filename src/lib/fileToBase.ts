export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. بنعرف المترجم (FileReader)
    const reader = new FileReader();

    // 2. بنقوله ابدأ اقرأ الملف ده وحوله لـ Data URL (اللي هو نص Base64)
    reader.readAsDataURL(file);

    // 3. لما يخلص تحويل (onload)، يبعت لنا النص اللي طلع
    reader.onload = () => resolve(reader.result as string);

    // 4. لو حصل مشكلة، يبلغنا بالإيرور
    reader.onerror = (error) => reject(error);
  });
};