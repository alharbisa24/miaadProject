import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from "@prisma/client";

interface Slot {
  id: string;
  date: string | Date;
  timeStart: string;
  timeEnd: string;
  applicant: {
    id: string;
  } | null;
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ url: string }> }
) {
  try { 
    const url = (await params).url

    const form = await prisma.form.findUnique({
      where: {
        url: url,
      },
      include: {
        slots: {
          include: {
            applicant: {
              select: {
                id: true, 
              },
            },
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "النموذج غير موجود" },
        { status: 404 }
      );
    }

    const formattedResponse = {
      id: form.id,
      title: form.title,
      url: form.url,
      dates: {
        startDate: form.startDate,
        endDate: form.endDate
      },
      times: {
        timeStart: form.timeStart,
        timeEnd: form.timeEnd
      },
      timeDuration: form.timeDuration,
      slots: form.slots.map((slot: Slot) => ({
        id: slot.id,
        date: slot.date,
        timeStart: slot.timeStart,
        timeEnd: slot.timeEnd,
        isBooked: !!slot.applicant
      })),
      createdAt: form.createdAt,
    };

    return NextResponse.json(formattedResponse, { status: 200 });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "حدث خطا في جلب بيانات" },
      { status: 500 }
    );
  }
}

const BookingSchema = z.object({
    formId: z.string().min(1, "معرف النموذج مطلوب"),
    slotId: z.string().min(1, "معرف الموعد مطلوب"),
    name: z.string().min(2, "الاسم مطلوب ويجب أن يكون على الاقل حرفين"),
    email: z.string().email("البريد الإلكتروني غير صالح").optional(),
    phone: z.string().min(5, "رقم الهاتف غير صالح").optional(),
  }).refine(data => data.email || data.phone, {
    message: "يجب ادخال البريد الإلكتروني أو رقم الهاتف",
    path: ["contact"],
  });

  export async function POST(req: Request) {
    try {
      const body = await req.json();
      
      const validationResult = BookingSchema.safeParse(body);
      if (!validationResult.success) {
        console.error("Validation error:", validationResult.error);
        return NextResponse.json(
          { 
            error: "بيانات غير صالحة", 
            details: validationResult.error.issues 
          }, 
          { status: 400 }
        );
      }
      
      
      const { formId, slotId, name, email, phone } = validationResult.data;
        
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const slot = await tx.formSlot.findUnique({
      where: { id: slotId },
      include: { applicant: true }
    });
          if (!slot) {
            throw new Error("SLOT_NOT_FOUND");
          }
          
          if (slot.applicantId || slot.applicant) {
            throw new Error("SLOT_ALREADY_BOOKED");
          }
          
          if (slot.formId !== formId) {
            throw new Error("SLOT_FORM_MISMATCH");
          }
       
          const existingApplicants = await tx.applicant.findMany({
            where: {
              formId: formId,
              name: name,
              OR: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : [])
              ]
            }
          });
          
            
    if (existingApplicants.length > 0) {
        const hasExistingBooking = await tx.formSlot.findFirst({
          where: {
            applicantId: {
              in: existingApplicants.map((app: { id: string; }) => app.id)
            }
          }
        });
        
        if (hasExistingBooking) {
          throw new Error("DUPLICATE_BOOKING");
        }
      }
      const applicant = await tx.applicant.create({
        data: {
          name,
          email,
          phone,
          formId,
          formSlotId: slotId 
        }
      });
      
      const updatedSlot = await tx.formSlot.update({
        where: { id: slotId },
        data: { applicantId: applicant.id },
        include: { applicant: true }
      });
      
          return {
            applicant,
            slot: updatedSlot
          };
        });
        
        return NextResponse.json({
          success: true,
          message: "تم الحجز بنجاح",
        }, { status: 201 });
        
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "SLOT_NOT_FOUND") {
            return NextResponse.json(
              { error: "الموعد غير موجود" },
              { status: 404 }
            );
          }
          
          if (error.message === "SLOT_ALREADY_BOOKED") {
            return NextResponse.json(
              { error: "هذا الموعد محجوز مسبقا" },
              { status: 409 }
            );
          }
          if (error.message === "DUPLICATE_BOOKING") {
            return NextResponse.json(
              { error: "لديك حجز مسبق في هذا النموذج" },
              { status: 409 }
            );
          }
          if (error.message === "SLOT_FORM_MISMATCH") {
            return NextResponse.json(
                { error: "الموعد غير موجود" },
                { status: 400 }
            );
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error("Error processing booking:", error);
      
      return NextResponse.json(
        { 
          error: "حدث خطأ أثناء معالجة الحجز",
          details: error instanceof Error ? error.message : "خطأ غير معروف"
        },
        { status: 500 }
      );
    }

  }