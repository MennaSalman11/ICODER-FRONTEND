"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Trash2, Download } from 'lucide-react';

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1a4b8f'); // لون القلم
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // تجهيز الكانفاس أول ما الصفحة تفتح
useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // دالة لضبط المقاسات
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // إعادة ضبط الـ context بعد تغيير المقاس لأن المسح بيحصل أوتوماتيك
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    };

    // تشغيلها فوراً
    updateSize();

    // تشغيلها لو مقاس الشاشة اتغير
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // دالة بدء الرسم
  const startDrawing = (e: React.MouseEvent) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  };

  // دالة الرسم أثناء تحريك الماوس
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = isEraser ? '#ffffff' : color; // لو ممحاة يرسم بلون الخلفية
      ctx.lineWidth = isEraser ? 20 : lineWidth;
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

return (
    <div className="flex flex-col h-full min-h-[500px] bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50/50 z-20">
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <button 
            type="button"
            onClick={() => setIsEraser(false)}
            className={`p-2 rounded-md transition-all ${!isEraser ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Pencil size={18} />
          </button>
          <button 
            type="button"
            onClick={() => setIsEraser(true)}
            className={`p-2 rounded-md transition-all ${isEraser ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Eraser size={18} />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button onClick={clearCanvas} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
        
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Scratchpad Mode</p>
      </div>

      {/* مساحة الرسم */}
      {/* تأكدي إن الـ flex-1 واخدة h-full */}
      <div className="relative flex-1 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] cursor-crosshair overflow-hidden">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 block touch-none z-10" // touch-none مهم للموبايل والـ z-10 عشان يكون فوق الـ Grid
        />
        
        {/* النص الخلفي */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] select-none z-0">
          <h2 className="text-6xl font-black text-center leading-none">DRAW YOUR<br/>ALGORITHM</h2>
        </div>
      </div>
    </div>
  );
}