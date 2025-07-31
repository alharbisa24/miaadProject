"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, CheckCircleIcon, Loader2 } from 'lucide-react'

import { format, addDays, addMinutes, isBefore, parse } from 'date-fns'
import { arSA } from 'date-fns/locale'

const formSchema = z.object({
  title: z.string().min(1, 'الرجاء إدخال العنوان'),
  startDate: z.date().min(new Date(new Date().setDate(new Date().getDate() - 1)), { error: "الرجاء ادخال تاريخ صحيح" }),
  endDate: z.date().min(new Date(new Date().setDate(new Date().getDate() - 1)), { error:  "الرجاء ادخال تاريخ صحيح" }),
  startTime: z.string().min(1, 'الرجاء إدخال وقت البداية'),
  endTime: z.string().min(1, 'الرجاء إدخال وقت النهاية'),
  duration: z.string().min(1, 'الرجاء إدخال المدة'),
})

type Slot = {
  id: string
  date: Date
  start: Date
  end: Date
}

export default function AddFormPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() =>{
    async function getUser() {
      const session = await authClient.getSession()
      if (session.data?.user?.id) {
        setUserId(session.data.user.id)
      }
      }

    getUser()
  }, [])
 
   

  const router = useRouter()

  const today = new Date();
 today.setHours(0, 0, 0, 0);
 const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      startDate:today,
      endDate:today,
      startTime: '',
      endTime: '',
      duration: '',
    },
  })
  
  const [slotsGenerated, setSlotsGenerated] = useState(false);
  const [urlKey, setUrlKey] = useState('');
  const [slots, setSlots] = useState<Slot[]>([])

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  useEffect(() => {
  
    setUrlKey(generateRandomKey());
  }, []);
  
  const generateSlots = (
    startDate: Date,
    endDate: Date,
    startTime: string,
    endTime: string,
    durationMinutes: number
  ): Slot[] => {
    const allSlots: Slot[] = []
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    for (let i = 0; i <= days; i++) {
      const day = addDays(startDate, i)

      const baseDate = format(day, 'yyyy-MM-dd')
      const fullStart = parse(`${baseDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date())
      const fullEnd = parse(`${baseDate} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date())

      let current = fullStart
      while (isBefore(current, fullEnd) || current.getTime() === fullEnd.getTime()) {
        const end = addMinutes(current, durationMinutes)
        if (isBefore(end, fullEnd) || end.getTime() === fullEnd.getTime()) {
          const id = `${format(day, 'yyyy-MM-dd')}-${format(current, 'HH:mm')}-${format(end, 'HH:mm')}`;
          allSlots.push({ id, date: day, start: current, end })
     
        }
        current = end
      }
    }

    return allSlots
  }
  const handleDeleteSlot = (slotId: string) => {
    setSlots(prev => {
      const newSlots = prev.filter(slot => slot.id !== slotId);
      
      if (newSlots.length === 0) {
        setSlotsGenerated(false);
      }
      
      return newSlots;
    });
    
    toast("تم الحذف", {
      description: "تم حذف الموعد بنجاح",
    });
  };
  
  const handleGenerateSlots = async () => {

    const isValid = await form.trigger();
    
    if (!isValid) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة", {
        description: "تأكد من ملء جميع الحقول بشكل صحيح"
      });
      return;
        }
    
    const values = form.getValues();
    
    try {
      if (!values.startDate || !values.endDate || !values.startTime || !values.endTime || !values.duration) {
        return;
      }
      
      let duration = 30; 
      const durationMatch = values.duration.match(/\d+/);
      if (durationMatch) {
        duration = parseInt(durationMatch[0], 10);
      }
      
      if(duration <= 0){
        form.setError("duration", {
          type: "manual",
          message: "مدة الموعد يجب ان تكون صحيحة"
        });
        return;
      }


      if (values.endDate < values.startDate) {
        form.setError("endDate", {
          type: "manual",
          message: "تاريخ النهاية يجب ان يكون بعد تاريخ البداية"
        });
        return;
      }

      if(urlKey == null){
        toast.error("عذرا ! حدث خطا بانشاء الرابط يرجى اعاده تحميل الصفحة")

        return;
      }
      
      if (values.startDate.toDateString() === values.endDate.toDateString() &&
          values.endTime <= values.startTime) {
        form.setError("endTime", {
          type: "manual",
          message: "وقت النهاية يجب ان يكون بعد وقت البداية"
        });
        return;
      }
      
      const generatedSlots = generateSlots(
        values.startDate,
        values.endDate,
        values.startTime,
        values.endTime,
        duration
      );
      
      if (generatedSlots.length === 0) {
        form.setError("root", { 
          type: "manual",
          message: "لم يتم إنشاء أي مواعيد. الرجاء التحقق من الأوقات المدخلة."
        });
        return;
      }
      
      setSlots(generatedSlots);
      setSlotsGenerated(true);
    } catch (error) {
      console.error("Error generating slots:", error);
      form.setError("root", {
        type: "manual",
        message: "حدث خطأ أثناء توليد المواعيد. الرجاء التحقق من البيانات المدخلة."
      });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY_ID}`,
        },
        body: JSON.stringify({
          title: values.title,
          url: urlKey,
          userId: userId,
          startDate: new Date(Date.UTC(
            values.startDate.getFullYear(),
            values.startDate.getMonth(),
            values.startDate.getDate()
          )).toISOString(),
          endDate: new Date(Date.UTC(
            values.endDate.getFullYear(),
            values.endDate.getMonth(),
            values.endDate.getDate()
          )).toISOString(),
          timeStart: values.startTime,
          timeEnd: values.endTime,
          timeDuration: parseInt(values.duration.replace(/\D/g, ''), 10),
          slots: slots.map(slot => ({
            date: new Date(Date.UTC(
              slot.date.getFullYear(),
              slot.date.getMonth(),
              slot.date.getDate()
            )).toISOString(),  
            timeStart: slot.start.toTimeString().slice(0, 5),
            timeEnd: slot.end.toTimeString().slice(0, 5), 
          })),
        }),
      })
  
      const data = await res.json()
      if (!res.ok) {
        const errorMessage = data.message.error;
        toast.error(errorMessage)
        setIsSubmitting(false)

        return;
      }

      if(res.status == 409)
        setUrlKey(generateRandomKey());

      

    toast("النموذج جديد !", {
      description: "تم اضافة النموذج بنجاح ✅",
      action: {
        label: "عرض",
        onClick: () => router.push(`/dashboard/forms`),
      },
      position: "top-center"
    })

  
    setSlots([]);
    setSlotsGenerated(false);
    
    setUrlKey(generateRandomKey());
    const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  form.reset({
    title: "",
    startDate:today,
    endDate:today,
    startTime: '',
    endTime: '',
    duration: '',
  });
  setIsSubmitting(false)
    setIsSubmitting(false)

} catch (error) {
  setIsSubmitting(false)
  console.error('Error:', error)
  toast.error('فشل الاتصال بالخادم.')
}
  }

    return (
      <div className="flex flex-1 flex-col gap-4 p-4 w-full">
       <div className="flex flex-1 flex-col">
          <div className=" flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <br/>
                <Card className="w-full ">
      <CardHeader>
        <CardTitle>انشاء النموذج</CardTitle>
        <CardDescription>
         من هنا يمكنك انشاء نموذج جديد!
        </CardDescription>
        </CardHeader>
        <CardContent>

                <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العنوان</FormLabel>
              <FormControl>
                <Input placeholder="استبيان ١" {...field} />
              </FormControl>
   
              <FormMessage />
            </FormItem>
          )}
        />
    <div className="space-y-2">
      <FormLabel className="block">الرابط</FormLabel>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
        <Input
          placeholder="XXXXX"
          className="sm:rounded-r-none flex-1"
          value={urlKey}
          disabled
        />
        <div className="flex items-center justify-center h-10 px-3 rounded-md sm:rounded-l-md sm:rounded-r-none border border-input bg-muted text-muted-foreground">
          <Label className="text-sm text-center break-words sm:whitespace-nowrap">
            /{process.env.NEXT_PUBLIC_BASE_URL}/forms
          </Label>
        </div>
      </div>
    </div>

<FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ البداية</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn('w-full justify-start text-right', !field.value && 'text-muted-foreground')}
                      >
                        {field.value ? format(field.value, 'PPP', { locale: arSA }) : 'اختر التاريخ'}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
            mode="single"
            selected={field.value}
            onSelect={(date) => {
              field.onChange(date);
              setSlotsGenerated(false);
              setSlots([])

            }}
            locale={arSA}
            initialFocus
          />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

<FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ النهاية</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn('w-full justify-start text-right', !field.value && 'text-muted-foreground')}
                      >
                        {field.value ? format(field.value, 'PPP', { locale: arSA }) : 'اختر التاريخ'}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setSlotsGenerated(false);
                        setSlots([])
                      }}
                      locale={arSA}
            
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
 <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وقت البداية</FormLabel>
                <FormControl>
                  <Input {...field} type="time"
                       onSelect={() => {
                        setSlotsGenerated(false);
                        setSlots([])
          
                      }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وقت النهاية</FormLabel>
                <FormControl>
                  <Input {...field} type="time"
                   onSelect={() => {
                    setSlotsGenerated(false);
                    setSlots([])
      
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مدة الموعد (مثلاً: 30 دقيقة)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="30 دقيقة" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

         
     
        {slotsGenerated && slots.length > 0 && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-green-800">
                  تم توليد {slots.length} موعد بنجاح
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-4 justify-end">
          <Button 
            type="button"
            variant={slotsGenerated ? "outline" : "secondary"} 
            onClick={handleGenerateSlots}
          >
            توليد المواعيد
          </Button>
          
          {slotsGenerated && (
 <Button 
 type="submit" 
 disabled={isSubmitting}
>
 {isSubmitting ? (
   <>
     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
     جاري الإنشاء...
   </>
 ) : (
   "إنشاء الاستبيان"
 )}
</Button>
          )}
        </div>
      </form>
    </Form>
   
    {slots.length > 0 && (
  <div className="space-y-6 mt-8">
    <h2 className="text-2xl font-bold text-right text-purple-700">المواعيد المتاحة</h2>
    {[...new Set(slots.map(s => format(s.date, 'yyyy-MM-dd')))].map((dateKey) => {
      const daySlots = slots.filter(s => format(s.date, 'yyyy-MM-dd') === dateKey)
      return (
        <div key={dateKey}>
          <h3 className="text-xl font-semibold text-right border-b pb-2 mb-4 text-gray-700">
            {format(new Date(dateKey), 'eeee dd MMMM yyyy', { locale: arSA })}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {daySlots.map((slot) => (
              <Card 
                key={slot.id} 
                className="bg-purple-50 dark:bg-purple-900 dark:border-purple-700 border-purple-200 shadow-sm relative group"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                  aria-label="حذف الموعد"
                >
                  ×
                </button>
                <CardContent className="p-4 text-center text-sm font-medium text-purple-900 dark:text-white">
                  {format(slot.start, 'hh:mm a', { locale: arSA })} -{' '}
                  {format(slot.end, 'hh:mm a', { locale: arSA })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    })}
  </div>
)}
   
    </CardContent>
    </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }