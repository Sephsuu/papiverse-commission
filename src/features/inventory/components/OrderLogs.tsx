import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { formatDateToWords, getWeekday } from "@/lib/formatter";
import { InventoryLog } from "@/types/inventory-log";
import dayjs from "dayjs"
import { Truck } from "lucide-react";
import { Fragment } from "react";

interface Props {
    logs: {
        "date": string,
        "logs": InventoryLog[]
    }[];
}

export function OrderLogs({ logs }: Props) {    
    return(
        <section className="animate-fade-in-up">
            {logs.map((item, index) => (
                <div className="my-1" key={ item.date }>
                    <Accordion type="multiple">
                        <div className="flex gap-2 items-center w-fit font-semibold py-2 px-4 border-1 border-gray-300 shadow-xs bg-light rounded-t-xl z-50">
                            <div>{formatDateToWords(item.date)}</div> 
                            <div className="bg-dark h-fit rounded-sm text-light px-2 font-semibold text-[10px]">{getWeekday(item.date)}</div>
                        </div>
                        <AccordionItem value={ item.date } key={ index }>
                            <AccordionTrigger className="rounded-none bg-light px-4 shadow-xs">
                                <div className="w-full grid grid-cols-3">
                                    <div>Order ID: <span className="font-semibold">{ item.logs[0].order?.id }</span></div>
                                    {/* <div>Source: <span className="font-semibold">{ subItem.logs[0].source }</span></div> */}
                                    <div>Type: <span className="font-semibold">{ item.logs[0].type === "IN" ? "INGOING" : "OUTGOING" }</span></div>
                                    <div className="flex-center-y gap-2">
                                        <Truck className="w-4 h-4 text-darkbrown" />
                                        <div className="text-sm">{ item.logs[0].branchName }</div>
                                    </div>
                                </div>
                            </AccordionTrigger> 
                            <AccordionContent className="table-wrapper px-4 bg-light border-b-darkred border-1">
                                
                                    {item.logs.map((subItem, index) => (
                                        <Fragment key={ index }>
                                            <div className="tdata grid grid-cols-4 py-2">
                                                <div>{ subItem.rawMaterialCode }</div>
                                                <div>Qty: { subItem.quantityChanged }</div>
                                                <div>{ subItem.rawMaterialName }</div>
                                                <div>
                                                    {dayjs(subItem.dateTime).format("dddd, MMMM D, YYYY h:mm A")}
                                                </div>
                                            </div>
                                            <Separator />
                                        </Fragment>
                                    ))}
                                
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            ))}
        </section>
    );
}