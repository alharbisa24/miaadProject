"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface AnalyticsData {
  success: boolean;
  analytics: {
    forms: {
      total: number;
      completed: number;
      incomplete: number;
    };
    slots: {
      total: number;
      booked: number;
      available: number;
    };
  };
  charts: {
    bookingsTrend: Array<{
      date: string;
      bookings: number;
    }>;
    formsTrend: Array<{
      date: string;
      forms: number;
    }>;
    slotsByForm: Array<{
      name: string;
      total: number;
      booked: number;
      available: number;
    }>;
  };
}

const chartConfig = {
  views: {
    label: "معدلات",
  },
  bookings: {
    label: "الحجوزات",
    color: "var(--chart-1)",
  },
  forms: {
    label: "النماذج",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface SectionCardsProps {
  data: AnalyticsData | null; 
}

export function Chartcomponent({ data }: SectionCardsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [activeChart, setActiveChart] = useState<"bookings" | "forms">("bookings");
  
  useEffect(() => {
    if (data) {
      setAnalyticsData(data);
    }
  }, [data]);
  
  const chartData = useMemo(() => {
    if (!analyticsData?.charts?.bookingsTrend) return [];
    
    return analyticsData.charts.bookingsTrend.map((item, index) => ({
      date: item.date,
      bookings: item.bookings,
      forms: analyticsData.charts.formsTrend[index]?.forms || 0
    }));
  }, [analyticsData]);

  const total = useMemo(() => {
    if (!analyticsData?.charts) {
      return { bookings: 0, forms: 0 };
    }
    
    return {
      bookings: analyticsData.charts.bookingsTrend.reduce((acc, curr) => acc + curr.bookings, 0),
      forms: analyticsData.charts.formsTrend.reduce((acc, curr) => acc + curr.forms, 0)
    };
  }, [analyticsData]);

 
  if (!analyticsData) {
    return (
      <Card className="py-4 sm:py-0">
        <CardHeader>
          <CardTitle>معدل الطلبات</CardTitle>
          <CardDescription>لا توجد بيانات متاحة</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>معدل الطلبات</CardTitle>
          <CardDescription>
            رسم بياني بمعدل الطلبات والنماذج خلال آخر 30 يوم
          </CardDescription>
        </div>
        <div className="flex">
          {(["bookings", "forms"] as const).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-right even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-muted-foreground text-xs">
                {chartConfig[key].label}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {total[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("ar-EG", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("ar-EG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={activeChart === "bookings" ? "var(--chart-1)" : "var(--chart-2)"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}