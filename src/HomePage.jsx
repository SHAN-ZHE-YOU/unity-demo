import React, { useState } from 'react';

const HomePage = ({ onStartSurvey }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    title: '',
    email: '',
    phone: '',
    consent: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 將表單資料往上傳遞，準備與問卷結果一起存入資料庫
    onStartSurvey(formData);
  };

  // 驗證必填欄位是否皆已填寫[cite: 1]
  const isFormValid = formData.companyName && formData.contactName && 
                      formData.email && formData.consent;

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-down">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 sm:px-8 py-8 sm:py-10 text-center">
          <img
            src="/logo.svg"
            alt="優樂地永續健檢 Logo"
            className="mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">優樂地永續健檢</h1>
          <p className="text-slate-300 text-sm sm:text-base">請填寫基本資料以開始進行永續供應鏈快速健檢</p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">公司名稱 <span className="text-red-500">*</span></label>
            <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange}
              className="w-full px-4 py-3 sm:py-3.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all text-base" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">聯絡人姓名 <span className="text-red-500">*</span></label>
              <input type="text" name="contactName" required value={formData.contactName} onChange={handleChange}
                className="w-full px-4 py-3 sm:py-3.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all text-base" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">職稱</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 sm:py-3.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all text-base" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 sm:py-3.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all text-base" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">聯絡電話</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              className="w-full px-4 py-3 sm:py-3.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all text-base" />
          </div>

          <div className="pt-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required
                className="mt-1 w-5 h-5 text-slate-600 border-slate-300 rounded focus:ring-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 leading-relaxed font-medium">
                我同意後續由優樂地永續服務股份有限公司聯繫並提供相關服務資訊。<span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          <button type="submit" disabled={!isFormValid}
            className={`w-full py-3.5 sm:py-4 rounded-lg font-bold text-base transition-all duration-300 shadow-md mt-6 touch-manipulation
              ${isFormValid ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            開始健檢
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;