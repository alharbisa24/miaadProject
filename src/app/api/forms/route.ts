import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { z } from "zod";
interface Applicant {
  name: string;
  id: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  formId: string;
  formSlotId: string | null;
}

interface Slot {
  id: string;
  date: Date;
  timeStart: string;
  timeEnd: string;
  formId: string;
  applicantId: string | null;
  applicant?: Applicant | null;
}

interface Form {
  id: string;
  title: string;
  url: string;
  startDate: Date;
  endDate: Date;
  timeStart: string;
  timeEnd: string;
  timeDuration: number;
  slots: Slot[];
}
export async function GET(req: Request) {
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }
    const apiKey = authorization.replace("Bearer ", "").trim();
    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY_ID) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        );
      }

      const userId = req.headers.get("X-User-ID") || new URL(req.url).searchParams.get("userId");
    
      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      const forms = await prisma.form.findMany({
        where: { userId },
        include: {
          slots: {
            include: {
              applicant: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

   const formattedForms = forms.map((form: Form) => ({
      id: form.id,
      title: form.title,
      url: form.url,
      dates: {
        startDate: form.startDate.toISOString(),
        endDate: form.endDate.toISOString(),
      },
      times: {
        timeStart: form.timeStart,
        timeEnd: form.timeEnd,
      },
      timeDuration: form.timeDuration.toString(),
      slots: form.slots.map((slot: Slot) => ({
        id: slot.id,
        date: slot.date.toISOString(),
        timeStart: slot.timeStart,
        timeEnd: slot.timeEnd,
        ...(slot.applicant
          ? {
              applicant: {
                name: slot.applicant.name,
                email: slot.applicant.email ?? null,
                phone: slot.applicant.phone ?? null,
                createdAt: slot.applicant.createdAt.toISOString(),
              },
            }
          : {}),
      })),
    }));

    return NextResponse.json(formattedForms, { status: 200 });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

const SlotSchema = z.object({
  date: z.string().datetime(),
  timeStart: z.string(),
  timeEnd: z.string(),
});

const FormSchema = z.object({
  title: z.string(),
  url: z.string().min(6),
  userId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timeStart: z.string(),
  timeEnd: z.string(),
  timeDuration: z.number().int().positive(),
  slots: z.array(SlotSchema).optional().default([]), 
});

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }
    const apiKey = authorization.replace("Bearer ", "").trim();
    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY_ID) {
        return NextResponse.json(
          { error: "invalid API key" },
          { status: 401 }
        );
      }
    const body = await req.json();
    const data = FormSchema.parse(body);
    const existingForm = await prisma.form.findUnique({
      where: {
        url: data.url
      }
    });

    if (existingForm) {
      return NextResponse.json(
        { error: "الرابط المولد موجود مسبقا وتم توليد اخر، يرجى اعادة تقديم الطلب ." }, 
        { status: 409 }
      );
    }
    const form = await prisma.form.create({
      data: {
        title: data.title,
        url: data.url,
        userId: data.userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        timeStart: data.timeStart,
        timeEnd: data.timeEnd,
        timeDuration: data.timeDuration,
      },
    });

    await Promise.all(
        data.slots.map((slot) =>
          prisma.formSlot.create({
            data: {
              date: new Date(slot.date),
              timeStart: slot.timeStart,
              timeEnd: slot.timeEnd,
              formId: form.id,
            },
          })
        )
      );

    return NextResponse.json({ success: true, form }, { status: 200 });
  } catch (error: unknown) {
    console.error("❌ Error creating form:", error);
  
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "خطا في البيانات المدخلة" }, { status: 400 });
    }
  
    if (error instanceof Error) {
      return NextResponse.json({ error: "حدث خطأ غير متوقع", details: error.message }, { status: 500 });
    }
  
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

const UpdateFormSchema = z.object({
    formId: z.string().min(1, "معرف النموذج مطلوب"),
    title: z.string().min(3, "العنوان يجب أن يكون 3 أحرف على الأقل"),
  });
  
  export async function PUT(req: Request) {
    try {
      const authorization = req.headers.get("Authorization");
      if (!authorization) {
        return NextResponse.json(
          { error: "Authorization header is required" },
          { status: 401 }
        );
      }
      
      const apiKey = authorization.replace("Bearer ", "").trim();
      if (apiKey !== process.env.NEXT_PUBLIC_API_KEY_ID) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        );
      }
  
  
      const body = await req.json();
      const parseResult = UpdateFormSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json(
          { error: "خطأ في البيانات المدخلة", details: parseResult.error.issues },
          { status: 400 }
        );
      }
  
      const data = parseResult.data;

      
      const formId = data.formId; 

      const existingForm = await prisma.form.findFirst({
        where: {
          id: formId,
        }
      });
  
      if (!existingForm) {
        return NextResponse.json(
          { error: "Form not found" },
          { status: 404 }
        );
      }
  
      const updatedForm = await prisma.form.update({
        where: {
          id: formId
        },
        data: {
          title: data.title
        }
      });
  
      return NextResponse.json({
        success: true,
        form: {
          id: updatedForm.id,
          title: updatedForm.title
        }
      }, { status: 200 });
      
    } catch (error: unknown) {
      console.error("Error updating form:", error);
    
      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          error: "خطا في البيانات المدخلة",
          details: error 
        }, { status: 400 });
      }
    
      if (error instanceof Error) {
        return NextResponse.json(
          { error: "فشل في تحديث النموذج", details: error.message },
          { status: 500 }
        );
      }
    
      return NextResponse.json(
        { error: "فشل في تحديث النموذج" },
        { status: 500 }
      );
    }
  }
    
  
  const DeleteFormSchema = z.object({
    formId: z.string().min(1, "معرف النموذج مطلوب"),
  });
  
  export async function DELETE(req: Request) {
    try {
      const authorization = req.headers.get("Authorization");
      if (!authorization) {
        return NextResponse.json(
          { error: "Authorization header is required" },
          { status: 401 }
        );
      }
      
      const apiKey = authorization.replace("Bearer ", "").trim();
      if (apiKey !== process.env.NEXT_PUBLIC_API_KEY_ID) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        );
      }
  

  
      const body = await req.json();
      const data = DeleteFormSchema.parse(body);
      const formId = data.formId;
  
      const existingForm = await prisma.form.findFirst({
        where: {
          id: formId,
        }
      });
  
      if (!existingForm) {
        return NextResponse.json(
          { error: "Form not found or you don't have permission to delete it" },
          { status: 404 }
        );
      }
  
      await prisma.applicant.deleteMany({
        where: {
          formId: formId
        }
      });
      await prisma.formSlot.deleteMany({
        where: {
          formId: formId
        }
      });
  
      await prisma.form.delete({
        where: {
          id: formId
        }
      });
  
      return NextResponse.json({
        success: true,
        message: "تم حذف النموذج بنجاح"
      }, { status: 200 });
      
    } catch (error: unknown) {
      console.error("❌ Error deleting form:", error);
    
      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          error: "خطأ في البيانات المدخلة",
          details: error 
        }, { status: 400 });
      }
    
      if (error instanceof Error) {
        return NextResponse.json(
          { error: "فشل في حذف النموذج", details: error.message },
          { status: 500 }
        );
      }
    
      return NextResponse.json(
        { error: "فشل في حذف النموذج" },
        { status: 500 }
      );
    }
  }