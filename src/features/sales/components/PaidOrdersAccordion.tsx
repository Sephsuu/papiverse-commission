import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatToPeso } from "@/lib/formatter";
import { PaidOrder } from "@/types/sales";

const columns = [
    { title: 'Order ID', style: '' },
    { title: 'Products', style: '' },
    { title: 'Total Paid', style: '' },
    { title: 'Type', style: '' },
    { title: 'Payment Date', style: '' },
]

export function PaidOrdersAccordion({ paidOrders }: {
    paidOrders: PaidOrder[]
}) {
    // Calculate total of all paid orders

    return(
        <section>
            <Accordion type="multiple">
                <AccordionItem value="1">
                    <AccordionTrigger className="flex justify-between bg-white p-4 !h-fit border-1 shadow-sm font-semibold">
                        <div>September 30, 2004</div>
                        <div className="font-medium">Total Orders: <span className="font-semibold">35</span></div>
                        <div className="font-medium">Total Sales: <span className="font-semibold">{ formatToPeso(900) }</span></div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white p-4">
                        <div className="thead grid grid-cols-5">
                            {columns.map((item, _) => (
                                <div key={_} className={`th ${item.style}`}>{ item.title }</div>
                            ))}
                        </div>
                        {paidOrders.map((item, index: number) => {
                            const grandTotal = paidOrders.reduce((acc, order) => acc + order.totalPaid, 0);
                            return (
                                <div className="tdata grid grid-cols-5 !border-b-gray" key={ index }>
                                    <div className="td">{ item.orderId }</div>
                                    <div>
                                        {item.items!.map((subItem, productIndex) => {
                                            const globalIndex = 
                                            paidOrders
                                                .slice(0, index)
                                                .reduce((acc: number, o) => acc + o.items!.length, 0) 
                                            + productIndex; 

                                            return (
                                            <div
                                                key={productIndex}
                                                className={`p-2 text-sm ${
                                                globalIndex % 2 === 0 ? "bg-[#F5F5F5]" : "bg-[#FCFCFC]"
                                                }`}
                                            >
                                                {`${subItem.productName} x ${subItem.quantity}`}
                                            </div>
                                            );
                                        })}
                                    </div>
                                    <div className="td">{ formatToPeso(item.totalPaid) }</div>
                                    <div className="td">{ item.orderType }</div>
                                    <div className="td">{ item.paymentTime }</div>

                                </div>
                            ) 
                        })}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
}