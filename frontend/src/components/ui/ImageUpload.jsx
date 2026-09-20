import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export const ImageUpload = ({ value, onChange, label = 'Hình Ảnh Sản Phẩm', monochrome = false }) => {
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const processedValueRef = useRef('');

  const convertToMonochrome = (dataUrl) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

      for (let index = 0; index < pixels.data.length; index += 4) {
        const luminance = 0.299 * pixels.data[index] + 0.587 * pixels.data[index + 1] + 0.114 * pixels.data[index + 2];
        const value = luminance < 180 ? 0 : 255;
        pixels.data[index] = value;
        pixels.data[index + 1] = value;
        pixels.data[index + 2] = value;
      }

      context.putImageData(pixels, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });

  useEffect(() => {
    if (!monochrome || !value || value === processedValueRef.current) return;

    convertToMonochrome(value)
      .then((imageData) => {
        processedValueRef.current = imageData;
        if (imageData !== value) onChange(imageData);
      })
      .catch(() => setError('Không thể chuyển ảnh QR sang đen trắng.'));
  }, [value, monochrome]);

  const processFile = async (file) => {
    setError('');

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh PNG, JPG hoặc WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imageData = monochrome ? await convertToMonochrome(reader.result) : reader.result;
        onChange(imageData);
      } catch {
        setError('Không thể xử lý ảnh QR. Vui lòng thử ảnh khác.');
      }
    };
    reader.onerror = () => setError('Không thể đọc ảnh. Vui lòng thử lại.');
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleApplyUrl = async () => {
    if (!urlInput.trim()) return;

    try {
      const imageData = monochrome ? await convertToMonochrome(urlInput.trim()) : urlInput.trim();
      onChange(imageData);
      setUrlInput('');
      setIsUrlMode(false);
      setError('');
    } catch {
      setError('Không thể tải hoặc chuyển đổi ảnh từ URL này.');
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          {isUrlMode ? (
            <>
              <Upload className="w-3 h-3" /> Tải từ máy tính
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" /> Dán link URL ảnh
            </>
          )}
        </button>
      </div>

      {isUrlMode ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Dán đường dẫn ảnh https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-700 transition shadow-sm"
          >
            Áp Dụng
          </button>
        </div>
      ) : null}

      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}

      {value ? (
        <div className="relative w-full h-36 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center group">
          <img
            src={value}
            alt="Preview"
            className={`w-full h-full object-contain p-2 ${monochrome ? 'grayscale contrast-150' : ''}`}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition opacity-90 group-hover:opacity-100"
            title="Xóa ảnh"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="product-image-upload"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition group ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-2 pb-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center mb-1.5 transition">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Nhấn để tải ảnh hoặc kéo thả vào đây
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Hỗ trợ PNG, JPG, WEBP tối đa 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            id="product-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
