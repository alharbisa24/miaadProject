import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {

    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    const apiKey = authorization.replace("Bearer ", "").trim();
    if (apiKey !== process.env.NEXT_PUBLIC_API_KEY_ID) {
      return NextResponse.json(
        { error: "مفتاح API غير صالح" },
        { status: 401 }
      );
    }

    const userId = req.headers.get("X-User-ID") || new URL(req.url).searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 }
      );
    }

    const forms = await prisma.form.findMany({
      where: { userId },
      include: {
        slots: {
          include: {
            applicant: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const totalForms = forms.length;
    let completedForms = 0;
    let totalSlots = 0;
    let bookedSlots = 0;

    forms.forEach(form => {
      const formSlots = form.slots.length;
      const formBookedSlots = form.slots.filter(slot => slot.applicantId || slot.applicant).length;
      
      totalSlots += formSlots;
      bookedSlots += formBookedSlots;
      
      if (formSlots > 0 && formBookedSlots === formSlots) {
        completedForms++;
      }
    });

    const incompleteForms = totalForms - completedForms;
    const availableSlots = totalSlots - bookedSlots;

    // Generate data for charts
    
    // 1. Bookings over time (for line chart)
    // Get all applicants with creation dates
    const applicants = forms.flatMap(form => 
      form.slots
        .filter(slot => slot.applicant)
        .map(slot => ({
          date: slot.applicant?.createdAt || new Date(),
          formId: form.id,
          formTitle: form.title
        }))
    );

    // Group bookings by date
    const bookingsByDate = applicants.reduce((acc, booking) => {
      const date = new Date(booking.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    // 2. Forms created over time
    const formsByDate = forms.reduce((acc, form) => {
      const date = new Date(form.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    // Format data for line charts - last 30 days
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const bookingsChartData = last30Days.map(date => ({
      date,
      bookings: bookingsByDate[date] || 0
    }));

    const formsChartData = last30Days.map(date => ({
      date,
      forms: formsByDate[date] || 0
    }));

    // Format data for bar chart - slots by form
    const slotsByForm = forms.map(form => ({
      name: form.title,
      total: form.slots.length,
      booked: form.slots.filter(slot => slot.applicantId || slot.applicant).length,
      available: form.slots.filter(slot => !slot.applicantId && !slot.applicant).length
    }));

    return NextResponse.json({
      success: true,
      analytics: {
        forms: {
          total: totalForms,
          completed: completedForms,
          incomplete: incompleteForms
        },
        slots: {
          total: totalSlots,
          booked: bookedSlots,
          available: availableSlots
        }
      },
      charts: {
        bookingsTrend: bookingsChartData,
        formsTrend: formsChartData,
        slotsByForm: slotsByForm
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    
    return NextResponse.json(
      { 
        error: "حدث خطأ أثناء جلب البيانات التحليلية",
        details: error instanceof Error ? error.message : "خطأ غير معروف"
      }, 
      { status: 500 }
    );
  }
}