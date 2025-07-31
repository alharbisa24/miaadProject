import { SectionCards } from "@/components/section-cards"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Chartcomponent } from "@/components/homeChart";


export default async function Page() {
     const session = await auth.api.getSession({
          headers: await headers()
      })    
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/analytics`,
        {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY_ID}`,
          'X-User-ID': session?.user?.id || ''
        },
        cache: 'no-store'
      }
    );
    const data = await response.json()
      
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 w-full">
       <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards data={data}/>
              <div className="px-4 lg:px-6">

                <Chartcomponent data={data} />
          
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }