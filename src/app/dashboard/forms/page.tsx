export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Button } from "@/components/ui/button"
import { columns, Form } from "./columns"
import { DataTable } from "./data-table"
import Link from "next/link"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

async function getData(): Promise<Form[]> {
  noStore();

  try {
   const session = await auth.api.getSession({
        headers: await headers()
    })    
    if (!session?.user?.id) {
      console.error("No authenticated user found");
      return [];
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/forms`, 
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY_ID}`,
          'X-User-ID': session.user.id
        },
        cache: 'no-store'
      }
    );
    if (!response.ok) {
      console.error(`Error ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error("Failed to fetch forms:", error);
    return []; 
  }
}

 
export default async function FormsPage() {
    const data = await getData()

    return (
      <div className="flex flex-1 flex-col gap-4 p-4 w-full">
       <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Button>
                <Link href="add">اضافة نموذج</Link>

                </Button>
                <br/>
                <br/>
              <DataTable columns={columns} data={data} />

              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }