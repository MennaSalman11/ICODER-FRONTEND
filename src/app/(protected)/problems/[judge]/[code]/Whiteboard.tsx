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
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      // تظبيط مقاس الكانفاس ليناسب الشاشة
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    }
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
    <div className="flex flex-col h-full bg-white rounded-xl border shadow-sm overflow-hidden relative">
      {/* الـ Toolbar الشيك اللي في الصورة */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50/50 z-10">
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <button 
            onClick={() => setIsEraser(false)}
            className={`p-2 rounded-md ${!isEraser ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => setIsEraser(true)}
            className={`p-2 rounded-md ${isEraser ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Eraser size={18} />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button onClick={clearCanvas} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
        
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scratchpad Mode</p>
      </div>

      {/* مساحة الرسم */}
      <div className="relative flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] cursor-crosshair">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* كلمة Draw your algorithm here المختفية */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
          <h2 className="text-5xl font-black text-center">DRAW YOUR<br/>ALGORITHM HERE</h2>
        </div>
      </div>
    </div>
  );
}