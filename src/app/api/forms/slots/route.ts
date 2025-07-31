import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const apiKey = authorization.replace("Bearer ", "").trim();
    if (!apiKey.includes(process.env.NEXT_PUBLIC_API_KEY_ID || "")) {
      return NextResponse.json(
        { error: "مفتاح API غير صالح" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json(
        { error: "معرف الموعد مطلوب" },
        { status: 400 }
      );
    }

    const existingSlot = await prisma.formSlot.findUnique({
      where: { id: slotId },
      include: { applicant: true }
    });

    if (!existingSlot) {
      return NextResponse.json(
        { error: "الموعد غير موجود" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (existingSlot.applicantId) {
        await tx.applicant.delete({
          where: { id: existingSlot.applicantId }
        });
      }

      await tx.formSlot.delete({
        where: { id: slotId }
      });
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "تم حذف الموعد بنجاح" 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting slot:", error);
    
    return NextResponse.json(
      { 
        error: "حدث خطأ أثناء حذف الموعد",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      }, 
      { status: 500 }
    );
  }
}