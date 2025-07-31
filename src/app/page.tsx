"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, User, ArrowUpLeft } from "lucide-react";

export default function BookingLandingPage() {
  return (
    <div className="bg-gradient-to-b from-purple-50 via-purple-100 to-white text-gray-900 font-sans text-center flex flex-col justify-center items-center gap-8 px-6 py-24">

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-5xl font-bold leading-snug max-w-5xl bg-clip-text text-transparent bg-gradient-to-br from-purple-900 to-purple-600 flex items-center flex-wrap justify-center">
         نظم مقابلاتك من أي مكان في العالم  مع 
         <span className="inline-flex items-center mx-1 justify-center">
           <Image src="/logo.png" alt="logo" width={120} height={120} style={{ display: 'inline-block' }} />
         </span>
         !
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-gray-800 max-w-3xl text-xl md:text-2xl leading-relaxed font-medium">
          يوفر ميعاد خدمة انشاء وادارة الروابط التي يمكن للعملاء استخدامها لحجز المواعيد بسهولة وسرعة.
      </motion.p>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
        <motion.a
          href="/login"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-purple-600 to-purple-800 px-8 sm:px-12 py-3 sm:py-4 rounded-3xl text-white shadow-[0_8px_30px_rgb(149,76,233,0.3)] border border-purple-500/20 cursor-pointer flex items-center justify-center gap-3 font-medium text-sm sm:text-base"
        >
          <span className="leading-none">تسجيل الدخول</span>
        </motion.a>

        <motion.a
          href="/register"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="relative flex items-center justify-center pl-12 sm:pl-16 pr-6 sm:pr-8 py-3 sm:py-4 rounded-full bg-white/40 backdrop-blur-sm text-black hover:bg-white/60 transition w-fit text-sm sm:text-base"
        >
          <span className="font-medium leading-none">انشاء حساب</span>

          <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 sm:w-9 h-7 sm:h-9 bg-white rounded-full flex items-center justify-center shadow-md">
        <ArrowUpLeft className="w-4 sm:w-5 h-4 sm:h-5 text-black" />
          </div>
        </motion.a>
      </div>
      
    

      <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.6 }}
  className="mt-16 relative w-full max-w-4xl overflow-hidden px-4 sm:px-0"
>
      
        <div className="relative bg-white p-6 rounded-2xl  border border-purple-100/50 backdrop-blur-lg overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User size={14} className="text-purple-600" />
              </div>
              <div className="h-6 w-20 bg-purple-100 rounded-md"></div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-4 w-full md:w-1/3 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div className="h-5 w-5 bg-purple-400 rounded-md"></div>
                <div className="h-6 w-24 bg-purple-200 rounded-md"></div>
                <div className="h-5 w-5 bg-purple-400 rounded-md"></div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["ح", "ن", "ث", "ر", "خ", "ج", "س"].map((day, i) => (
                  <div key={`day-${i}`} className="text-xs font-medium text-purple-600 py-1">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {[...Array(31)].map((_, i) => {
                  const isSelected = i === 14;
                  const isToday = i === 7;
                  const hasAppointment = [4, 12, 20, 26].includes(i);
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                        isSelected 
                          ? 'bg-purple-600 text-white' 
                          : isToday 
                            ? 'border-2 border-purple-400 text-purple-800' 
                            : hasAppointment 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {i < 31 ? i + 1 : ''}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="w-full md:w-2/3 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-8 w-32 bg-gradient-to-r from-purple-200 to-purple-300 rounded-lg"></div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar size={18} className="text-purple-600" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={`input-${i}`} className="h-14 bg-gray-50 rounded-xl border border-gray-100 flex items-center px-4 hover:border-purple-300 transition-all">
                    <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center ml-3">
                      <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="h-4 w-full max-w-[120px] bg-gray-200 rounded-md"></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-5 w-5 bg-purple-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={`time-${i}`} 
                      className={`h-10 ${i === 2 ? 'bg-purple-500 text-white' : 'bg-white border border-gray-200'} rounded-lg flex items-center justify-center`}
                    >
                      <div className={`h-3 w-16 ${i === 2 ? 'bg-white/30' : 'bg-gray-200'} rounded`}></div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-3">
                <div className="h-11 w-32 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center px-4">
                  <div className="h-3 w-20 bg-white/40 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.section 
        id="contactus"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl mt-32 mb-16 relative"
      >
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-40 h-40 bg-purple-200 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-10 w-32 h-32 bg-indigo-200 rounded-full filter blur-3xl opacity-30"></div>
        
        <motion.div 
          initial={{ y: 30 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600"
        >
          تواصل معنا
        </motion.div>
        <div className="bg-white backdrop-blur-xl bg-opacity-80 p-8 md:p-12 rounded-3xl shadow-xl border border-purple-100 relative z-10">
  <div className="flex flex-col items-center justify-center text-center">
    <h3 className="font-bold text-2xl mb-6 text-purple-900">تواصل معنا</h3>
    
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      {/* Email */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="p-5 bg-purple-100 rounded-2xl inline-block mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-bold text-xl mb-2 text-purple-900">البريد الإلكتروني</h3>
        <p className="text-gray-600 text-lg">alharbisa24@gmail.com</p>
      </motion.div>
      
      {/* GitHub */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <motion.a 
          href="https://github.com/alharbisa24" 
          target="_blank" 
          rel="noopener noreferrer"
          whileHover={{ y: -8, scale: 1.05 }}
          className="group flex flex-col items-center"
        >
          <div className="p-5 bg-purple-100 rounded-2xl inline-block mb-4 group-hover:bg-gray-800 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-700 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-xl mb-2 text-purple-900">GitHub</h3>
          <p className="text-gray-600 text-lg group-hover:text-purple-700">alharbisa24</p>
        </motion.a>
      </motion.div>
    </div>
  </div>

</div>
      </motion.section>
    </div>
  );
}