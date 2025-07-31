"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock, User, Check, ArrowRight, ArrowLeft, Loader2, AlertTriangle, Mail, Phone } from "lucide-react";
import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";

const userSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  contact: z.string().min(5, "يجب إدخال بريد إلكتروني أو رقم هاتف صحيح")
});

type FormData = {
  id: string;
  title: string;
  url: string;
  dates: {
    startDate: string;
    endDate: string;
  };
  times: {
    timeStart: string;
    timeEnd: string;
  };
  timeDuration: number;
  slots: Array<{
    id: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    isBooked: boolean;
  }>;
  createdAt: string;
};

type Step = "userInfo" | "dateSelection" | "timeSelection" | "confirmation" | "success";

export default function FormViewPage() {
  const params = useParams<{ url: string }>();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookError, setbookError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("userInfo");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);
  const [dateSlots, setDateSlots] = useState<FormData['slots']>([]);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(userSchema),
    mode: "onChange"
  });
  
  const [userData, setUserData] = useState({
    name: "",
    contact: ""
  });

  useEffect(() => {
    async function fetchFormData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/client_forms/${params.url}`);
        
        if (!response.ok) {
          return;
        }
        
        const data: FormData = await response.json();
        setFormData(data);
        
        const dates = [...new Set(data.slots.map(slot => {
          return format(parseISO(slot.date), 'yyyy-MM-dd');
        }))];
        
        setUniqueDates(dates);
      } catch (error) {
        console.error("Error fetching form:", error);
        setError("حدث خطا أثناء تحميل النموذج، يرجى المحاولة مرة أخرى");
      } finally {
        setLoading(false);
      }
    }
    
    fetchFormData();
  }, [params.url]);

  type UserInfo = {
    name: string;
    contact: string;
  };
  const onUserInfoSubmit = (data: UserInfo) => {
    setUserData({
      name: data.name,
      contact: data.contact
    });
    setCurrentStep("dateSelection");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    
    if (formData) {
      const slots = formData.slots.filter(slot => {
        return format(parseISO(slot.date), 'yyyy-MM-dd') === date;
      });
      
      setDateSlots(slots);
      setCurrentStep("timeSelection");
    }
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setCurrentStep("confirmation");
  };

  const handleBooking = async () => {
    if (!selectedSlot || !formData || !userData.name || !userData.contact) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const isEmail = userData.contact.includes('@');
      
      const response = await fetch(`/api/client_forms/${params.url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: formData.id,
          slotId: selectedSlot,
          name: userData.name,
          email: isEmail ? userData.contact : undefined,
          phone: !isEmail ? userData.contact : undefined,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setbookError(result.error);
        return;
      }
      
      setCurrentStep("success");
    } catch (error) {
      setbookError(error instanceof Error ? error.message : String(error));
      return;
   
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-white flex flex-col items-center justify-center p-6">
        <div className="rounded-full bg-white p-4 shadow-md">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
        <p className="mt-4 text-purple-700 font-medium">جاري تحميل النموذج...</p>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="rounded-full bg-red-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">عذرا، لم نتمكن من تحميل النموذج</h2>
          <p className="text-gray-600 mb-6">
            {error || "النموذج غير متوفر او تم حذفه"}
          </p>
          <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-white text-gray-900 font-sans flex flex-col items-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-purple-800 mb-2">{formData.title}</h1>
          <p className="text-gray-600">حدد موعدًا مناسبًا لك</p>
          
          <div className="flex justify-center items-center gap-2 mt-6">
            {["userInfo", "dateSelection", "timeSelection", "confirmation"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${currentStep === step ? "bg-purple-600" : currentStep === "success" ? "bg-green-500" : index < ["userInfo", "dateSelection", "timeSelection", "confirmation"].indexOf(currentStep) ? "bg-purple-400" : "bg-gray-300"}`}></div>
                {index < 3 && <div className={`w-5 h-0.5 ${index < ["userInfo", "dateSelection", "timeSelection"].indexOf(currentStep) ? "bg-purple-400" : "bg-gray-300"}`}></div>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === "userInfo" && (
            <motion.div
              key="userInfo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8"
            >
              <h2 className="text-xl font-bold mb-6 text-right">المعلومات الشخصية</h2>
              <form onSubmit={handleSubmit(onUserInfoSubmit)} className="space-y-6">
                <div className="space-y-2 text-right">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("name")}
                    id="name"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="أدخل اسمك الكامل"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>
                  )}
                </div>
                
                <div className="space-y-2 text-right">
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                    البريد الإلكتروني او رقم الجوال <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("contact")}
                    id="contact"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="ادخل بريدك الالكتروني او رقم جوالك"
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-sm">{errors.contact.message?.toString()}</p>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                    disabled={!isValid}
                  >
                    <span>التالي</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {currentStep === "dateSelection" && (
            <motion.div
              key="dateSelection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8"
            >
              <h2 className="text-xl font-bold mb-6 text-right">اختر التاريخ</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uniqueDates
      .sort((a, b) => {
        const dateA = parseISO(a);
        const dateB = parseISO(b);
        return dateA.getTime() - dateB.getTime();
      })
      .map(date => {
        const hasAvailableSlots = formData.slots.some(slot => 
          format(parseISO(slot.date), 'yyyy-MM-dd') === date && !slot.isBooked
        );
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`p-4 rounded-md text-center border-2 hover:border-purple-500 transition-all ${
                          hasAvailableSlots 
                            ? "border-gray-200 bg-white hover:bg-purple-50" 
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!hasAvailableSlots}
                      >
                        <CalendarIcon className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                        <span className="block font-medium">
                          {format(parseISO(date), 'EEEE', { locale: arSA })}
                        </span>
                        <span className="block text-sm">
                          {format(parseISO(date), 'd MMMM yyyy', { locale: arSA })}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentStep("userInfo")}
                    className="px-6 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>السابق</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {currentStep === "timeSelection" && (
            <motion.div
              key="timeSelection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8"
            >
              <h2 className="text-xl font-bold mb-6 text-right">اختر الوقت</h2>
              <p className="text-gray-600 mb-4 text-right">
                {selectedDate && format(parseISO(selectedDate), 'EEEE d MMMM yyyy', { locale: arSA })}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {dateSlots
                  .filter(slot => !slot.isBooked)
                  .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
                  .map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot.id)}
                      className="p-4 border-2 border-gray-200 rounded-md text-center hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                      <span className="block">
                        {slot.timeStart} - {slot.timeEnd}
                      </span>
                    </button>
                  ))}
              </div>
              
              {dateSlots.filter(slot => !slot.isBooked).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد مواعيد متاحة في هذا التاريخ
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep("dateSelection")}
                  className="px-6 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>السابق</span>
                </button>
              </div>
            </motion.div>
          )}
          
          {currentStep === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8"
            >
              <h2 className="text-xl font-bold mb-6 text-right">تاكيد الحجز</h2>
              
              <div className="bg-purple-50 rounded-md p-4 mb-6">
                <h3 className="font-bold text-right mb-3 text-purple-800">{formData.title}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>التاريخ:</span>
                    </div>
                    <span className="font-medium">
                      {selectedDate && format(parseISO(selectedDate), 'EEEE d MMMM yyyy', { locale: arSA })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>الوقت:</span>
                    </div>
                    <span className="font-medium">
                      {selectedSlot && formData.slots.find(s => s.id === selectedSlot)?.timeStart} - 
                      {selectedSlot && formData.slots.find(s => s.id === selectedSlot)?.timeEnd}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>الاسم:</span>
                    </div>
                    <span className="font-medium">{userData.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      {userData.contact?.includes('@') ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                      <span>للتواصل:</span>
                    </div>
                    <span className="font-medium">{userData.contact}</span>
                  </div>
                </div>
              </div>
              {bookError && (
                  <span className="text-red-500">{bookError}
                  <br/></span>
                )}
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep("timeSelection")}
                  className="px-6 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>السابق</span>
                </button>
                
           
                <button
                  onClick={handleBooking}
                  disabled={submitting}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>جاري الحجز...</span>
                    </>
                  ) : (
                    <>
                      <span>تأكيد الحجز</span>
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
          
          {currentStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">تم الحجز بنجاح!</h2>
              <p className="text-gray-600 mb-6">
                سنتواصل معك لاحقا . شكرا لك!
              </p>
              
              <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                العودة للصفحة الرئيسية
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}