import { Skeleton } from "@/components/ui/skeleton"


export default function Loading(){
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 w-full">
        <div className="flex flex-1 flex-col">
          <div className=" flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* Button skeleton */}
                <Skeleton className="h-10 w-32" />
                
                <br/>
                <br/>
                
                {/* Table header skeleton */}
                <div className="rounded-md border">
                  <div className="p-4">
                    <Skeleton className="h-10 w-full mb-4" />
                  </div>
                  
                  {/* Table rows skeleton */}
                  <div className="p-4">
                    {Array(5).fill(0).map((_, index) => (
                      <div key={index} className="flex flex-col space-y-2 mb-6">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-6 w-1/4" />
                        </div>
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-6 w-1/5" />
                        </div>
                        <Skeleton className="h-6 w-2/3" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination skeleton */}
                  <div className="p-4 flex items-center justify-end space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}