"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter,DialogClose } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Mail, Phone, Loader2, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

import { z } from "zod"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
export type Form = {
  id: string
  title: string
  url: string
  dates: {
    startDate: string
    endDate: string
  }
  times: {
    timeStart: string
    timeEnd: string
  }
  timeDuration: string
  slots: Array<{
    id: string
    date: string
    timeStart: string
    timeEnd: string
    applicant?: {
      name: string
      email?: string
      phone?: string
      createdAt: string
    }
  }>
}

const editFormSchema = z.object({
  title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل")
})

function SlotsCell({ form }: { form: Form }) {
  const totalSlots = form.slots.length;
  const bookedSlots = form.slots.filter(slot => slot.applicant).length;
  
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
  const [isDeletingSlot, setIsDeletingSlot] = useState(false);
  
  const slotsByDate: {[date: string]: typeof form.slots} = {};
  for (const slot of form.slots) {
    const isoDate = new Date(slot.date).toISOString().split('T')[0];
    if (!slotsByDate[isoDate]) {
      slotsByDate[isoDate] = [];
    }
    slotsByDate[isoDate].push(slot);
  }

  const sortedDateEntries = Object.entries(slotsByDate).sort(([dateA], [dateB]) => {
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  const handleDeleteSlot = async (slotId: string) => {
    setIsDeletingSlot(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/forms/slots`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY_ID}`,
        },
        body: JSON.stringify({
          slotId: slotId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete slot');
      }
      
      toast.success("تم الحذف", {
        description: "تم حذف الموعد بنجاح",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error("فشل الحذف", {
        description: "حدث خطأ أثناء محاولة حذف الموعد",
      });
    } finally {
      setIsDeletingSlot(false);
      setSlotToDelete(null);
    }
  };
  
  const renderDeleteButton = (slot: { id: string; applicant?: { name: string; email?: string; phone?: string; createdAt: string } }) => (
    <AlertDialog open={slotToDelete === slot.id} onOpenChange={(open) => !open && setSlotToDelete(null)}>
      <AlertDialogTrigger asChild>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => setSlotToDelete(slot.id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">تاكيد حذف الموعد</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            هل انت متأكد من حذف الموعد؟ 
            {slot.applicant && <span className="block text-red-500 font-medium mt-2">تحذير: هذا الموعد محجوز مسبقا</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteSlot(slot.id);
            }}
            disabled={isDeletingSlot}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeletingSlot ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          عرض المواعيد ({totalSlots})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-right mr-3">مواعيد {form.title}</DialogTitle>
          <DialogDescription className="text-right">
            اجمالي المواعيد: {totalSlots} | المحجوزة: {bookedSlots} | المتبقية: {totalSlots - bookedSlots}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" dir="rtl" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="booked">المحجوزة</TabsTrigger>
            <TabsTrigger value="available">المتاحة</TabsTrigger>
          </TabsList>

          {/* All Slots Tab */}
          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {sortedDateEntries.map(([date, dateSlots]) => {
                const sortedSlots = [...dateSlots].sort((slotA, slotB) => {
                  const timeNumberA = Number(slotA.timeStart.replace(':', ''));
                  const timeNumberB = Number(slotB.timeStart.replace(':', ''));
                  return timeNumberA - timeNumberB;
                });
                
                return (
                  <div key={date} className="mb-6">
                    <h3 className="text-lg font-semibold text-right mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {date}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {sortedSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-3 rounded-md border ${
                            slot.applicant
                              ? "bg-purple-50 dark:bg-purple-800 dark:border-purple-900 border-purple-200"
                              : "bg-gray-50 dark:bg-gray-800 dark:border-purple-900 border-gray-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant={slot.applicant ? "secondary" : "outline"}>
                                {slot.applicant ? "محجوز" : "متاح"}
                              </Badge>
                              {renderDeleteButton(slot)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {slot.timeEnd} - {slot.timeStart}
                              </span>
                            </div>
                          </div>
                          {slot.applicant && (
                            <div className="mt-3 pt-2 border-t border-dashed border-purple-200">
                              <h4 className="text-sm font-medium text-right mb-1">بيانات المستخدم</h4>
                              <div className="text-right text-sm space-y-1">
                                <div className="flex items-center gap-1 justify-end">
                                  <span>{slot.applicant.name}</span>
                                  <User className="h-3 w-3 text-muted-foreground" />
                                </div>
                                {slot.applicant.email && (
 <div className="flex items-center gap-1 justify-end">
 <span>{slot.applicant.email}</span>
 <Mail className="h-3 w-3 text-muted-foreground" />
</div>
                                )}
                                      {slot.applicant.phone && (

                                <div className="flex items-center gap-1 justify-end">
                                  <span>{slot.applicant.phone}</span>
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                </div>
                                      )}
                                      <div className="flex items-center gap-1 justify-end">
                                  <span>{new Date(slot.applicant.createdAt).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</span>
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                </div>     
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="booked" className="mt-4">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {sortedDateEntries.map(([date, dateSlots]) => {
                const bookedDateSlots = dateSlots.filter(slot => slot.applicant);
                
                if (bookedDateSlots.length === 0) return null;
                
                const sortedBookedSlots = [...bookedDateSlots].sort((slotA, slotB) => {
                  const timeNumberA = Number(slotA.timeStart.replace(':', ''));
                  const timeNumberB = Number(slotB.timeStart.replace(':', ''));
                  return timeNumberA - timeNumberB;
                });
                
                return (
                  <div key={date} className="mb-6">
                    <h3 className="text-lg font-semibold text-right mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {date}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {sortedBookedSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 rounded-md border bg-purple-50 dark:bg-purple-800 dark:border-purple-900 border-purple-200"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">محجوز</Badge>
                              {renderDeleteButton(slot)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {slot.timeEnd} - {slot.timeStart} 
                              </span>
                            </div>
                          </div>
                          
                              {slot.applicant && (
                            <div className="mt-3 pt-2 border-t border-dashed border-purple-200">
                              <h4 className="text-sm font-medium text-right mb-1">بيانات المستخدم</h4>
                              <div className="text-right text-sm space-y-1">
                                <div className="flex items-center gap-1 justify-end">
                                  <span>{slot.applicant.name}</span>
                                  <User className="h-3 w-3 text-muted-foreground" />
                                </div>
                                {slot.applicant.email && (
 <div className="flex items-center gap-1 justify-end">
 <span>{slot.applicant.email}</span>
 <Mail className="h-3 w-3 text-muted-foreground" />
</div>
                                )}
                                      {slot.applicant.phone && (

                                <div className="flex items-center gap-1 justify-end">
                                  <span>{slot.applicant.phone}</span>
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                </div>
                                      )}
                                      <div className="flex items-center gap-1 justify-end">
                                  <span>{new Date(slot.applicant.createdAt).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}</span>
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                </div>     
                              </div>
                            </div>
                          )}
                          
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </TabsContent>
          
          {/* Available Slots Tab - Fix time order */}
          <TabsContent value="available" className="mt-4">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {sortedDateEntries.map(([date, dateSlots]) => {
                const availableDateSlots = dateSlots.filter(slot => !slot.applicant);
                
                if (availableDateSlots.length === 0) return null;
                
                const sortedAvailableSlots = [...availableDateSlots].sort((slotA, slotB) => {
                  const timeNumberA = Number(slotA.timeStart.replace(':', ''));
                  const timeNumberB = Number(slotB.timeStart.replace(':', ''));
                  return timeNumberA - timeNumberB;
                });
                
                return (
                  <div key={date} className="mb-6">
                    <h3 className="text-lg font-semibold text-right mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {date}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {sortedAvailableSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 rounded-md border bg-gray-50 dark:bg-gray-800 dark:border-purple-900 border-gray-200"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">متاح</Badge>
                              {renderDeleteButton(slot)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {slot.timeEnd} - {slot.timeStart} 
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">إغلاق</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Create a proper React component for actions cell
function ActionsCell({ form }: { form: Form }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: form.title,
    },
  })

  async function onEditSubmit(values: z.infer<typeof editFormSchema>) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/forms`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY_ID}`,
        },
        body: JSON.stringify({
          formId: form.id,
          title: values.title
        }),
      })
      
      const responseData = await response.json();

      if (!response.ok) {
        toast.error("خطا", {
          description: responseData
        })
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      toast.success("تم التحديث", {
        description: "تم تحديث النموذج بنجاح",
        position: "top-center"
      })
      
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating form:', error)
      toast.error("فشل التحديث", {
        description: "حدث خطا في تحديث النموذج",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  async function handleDelete() {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/forms`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY_ID}`,
        },
        body: JSON.stringify({
          formId: form.id,
        }),
      });
      
      if (!response.ok) {
        console.log(response.json());
      } else {
        toast.success("تم الحذف", {
          description: "تم حذف النموذج بنجاح",
        })
        
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('Error deleting form:', error)
      toast.error("خطا بالحذف", {
        description: "حدث خطا أثناء حذف النموذج",
      })
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
    }
  }
  
 

  return (
    <div className="flex gap-2">
      <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/forms/${form.url}`} target="_blank">
        <Button size="sm" variant="outline">معاينة</Button>
      </a>
      
      {/* Export Button */}
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary">تعديل</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right mr-2">تعديل النموذج</DialogTitle>
            <DialogDescription className="text-right">
              قم بتعديل بيانات النموذج من هنا
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان النموذج" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : "حفظ التغييرات"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            حذف
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">هل انت متاكد من حذف النموذج؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم حذف النموذج &quot;{form.title}&quot; وجميع المواعيد المرتبطة به .
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const columns: ColumnDef<Form>[] = [
  {
    accessorKey: "id",
    header:"#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "title",
    header: "العنوان",
 
  },
  {
    accessorKey: "dates",
    header: "التاريخ",
    cell: ({row}) => {
      const form = row.original
      return (
        <div>
            <span className="text-green-300"> البداية :
            {new Date(form.dates.startDate).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            </span>
            <br />
            <span className="text-red-300"> النهاية :
            {new Date(form.dates.endDate).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            </span>


        </div>
      )
    }
  },
  {
    accessorKey: "times",
    header: "الوقت",
    cell: ({row}) => {
      const form = row.original
      return (
        <div>
            <span className="text-green-300"> البداية :
              {form.times.timeStart}
            </span>
            <br />
            <span className="text-red-300"> النهاية :
            {form.times.timeEnd}

            </span>


        </div>
      )
    }
  },
  {
    accessorKey: "timeDuration",
    header: "مدة الموعد",
    cell : ({row}) => {
      const form = row.original
      return (
        <span>{form.timeDuration} دقيقة</span>
      )
    }
  },
  {
    accessorKey: "slots",
    header: "المواعيد",
    cell: ({ row }) => <SlotsCell form={row.original} />
  },
  {
    header: "الإجراءات",
    cell: ({ row }) => <ActionsCell form={row.original} />
  },
]