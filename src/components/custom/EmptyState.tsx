export function EmptyState({ title, message }: {
    title?: "No data found." | string
    message?: "There is no existing data. Try adjusting the filters." | string;
}) {
    return (
        <section className="flex-center flex-col w-full">
            <img 
                src="/images/no-data-found.png"
                className="w-80"
            />
            <div className="text-center text-lg font-bold text-gray -mt-8">{title ?? "No data found."}</div>
            <div className="text-center text-gray">{message ?? "There is no existing data. Try adjusting the filters."}</div>
        </section>
    )
}