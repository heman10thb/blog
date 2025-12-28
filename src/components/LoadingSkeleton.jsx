export function CardSkeleton() {
    return (
        <div className="rounded-xl border border-border p-6 animate-pulse">
            <div className="flex justify-between mb-4">
                <div className="skeleton h-6 w-16 rounded-full"></div>
                <div className="skeleton h-6 w-24 rounded-full"></div>
            </div>
            <div className="skeleton h-6 w-3/4 mb-3"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-5/6 mb-4"></div>
            <div className="flex gap-2 mb-4">
                <div className="skeleton h-6 w-16 rounded-md"></div>
                <div className="skeleton h-6 w-20 rounded-md"></div>
                <div className="skeleton h-6 w-14 rounded-md"></div>
            </div>
            <div className="flex justify-between pt-4 border-t border-border">
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-16"></div>
            </div>
        </div>
    );
}

export function TutorialDetailSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="skeleton h-4 w-48 mb-6"></div>
            <div className="flex gap-3 mb-4">
                <div className="skeleton h-6 w-16 rounded-full"></div>
                <div className="skeleton h-6 w-24 rounded-full"></div>
            </div>
            <div className="skeleton h-10 w-3/4 mb-4"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-5/6 mb-8"></div>

            <div className="skeleton h-8 w-48 mb-4"></div>
            <div className="skeleton h-40 w-full rounded-xl mb-8"></div>

            <div className="skeleton h-8 w-36 mb-4"></div>
            <div className="skeleton h-96 w-full rounded-xl"></div>
        </div>
    );
}

export function CategorySkeleton() {
    return (
        <div className="rounded-xl border border-border p-6 animate-pulse">
            <div className="skeleton w-14 h-14 rounded-xl mb-4"></div>
            <div className="skeleton h-6 w-3/4 mb-2"></div>
            <div className="skeleton h-4 w-full mb-2"></div>
            <div className="skeleton h-4 w-5/6 mb-4"></div>
            <div className="skeleton h-4 w-24"></div>
        </div>
    );
}
