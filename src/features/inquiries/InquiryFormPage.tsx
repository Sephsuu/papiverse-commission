"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormLoader } from "@/components/ui/loader"
import { Textarea } from "@/components/ui/textarea"
import { updateField } from "@/lib/utils"
import { InquiryService } from "@/services/inquiry.service"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function InquiryFormPage() {
    return (
        <section className="stack-md reveal px-16 py-8">
            <div className="grid grid-cols-2 gap-2">
                <InquiryLeftSide />
                <InquiryForm />
            </div>
        </section>
    )
}

function InquiryLeftSide() {
    return (
        <section className="space-y-2">
            <div className="flex-center-y gap-2">
                <img
                    src="/images/kp_logo.png"
                    className="w-15 h-15"
                />
                <X strokeWidth={2} />
                <img
                    src="/images/papiverse_logo.png"
                    className="w-35"
                />
            </div>
            <div className="text-4xl font-extrabold text-shadow-2xs text-darkbrown">Krispy Papi Inquiry</div>
            <div className="text-gray-900 text-[16px] scale-x-105 origin-left w-100">
                Have a question or inquiry to Krispy Papi? Reach us out using this form. We&apos;re here to help!
            </div>  
            <div className="text-[16px] text-gray-900 mt-8 scale-x-105 origin-left">
                <div className="text-sm text-gray scale-x-105 origin-left">Our main location:</div>
                <div>Silang Manguyam - Main Branch</div>
                <div>Cavite Philippines</div>
            </div>
            <div className="mt-8">
                <div className="text-sm text-gray scale-x-105 origin-left">Email us at:</div>
                <div className="text-gray-900 text-[16px] scale-x-105 origin-left">papiverse@gmail.com</div>
            </div>
            <div className="flex gap-2 mt-4">
                <div className="rounded-full border-[1.5px] border-darkbrown flex-center w-10 h-10">
                    <i className="fa fa-lg fa-facebook text-darkbrown"></i>
                </div>
                <div className="rounded-full border-[1.5px] border-darkbrown flex-center w-10 h-10">
                    <i className="fa fa-lg fa-twitter text-darkbrown"></i>
                </div>
                <div className="rounded-full border-[1.5px] border-darkbrown flex-center w-10 h-10">
                    <i className="fa fa-lg fa-instagram text-darkbrown"></i>
                </div>
            </div>
        </section>
    )
}

function InquiryForm() {
    const [onProcess, setProcess] = useState(false);
    const [inquiry, setInquiry] = useState<Partial<Inquiry>>({
        fullName: '',
        email: '',
        contact: '',
        message: ''
    });

    async function handleSubmit() {
        try {
            setProcess(true);
            const data = await InquiryService.createInquiry(inquiry);
            if (data) {
                toast.success('Inquiry submitted successfully.');
                setInquiry({
                    fullName: '',
                    email: '',
                    contact: '',
                    message: ''
                });
            }
        } catch (error) {
            toast.error(`${error}`);
        } finally {
            setProcess(false);
        }
    }

    return (
        <section className="space-y-10 py-4">
            <div>
                <Label className="text-[16px]">Full Name *</Label>
                <Input 
                    value={inquiry.fullName}
                    className="border-0 !bg-transparent shadow-none border-b-2 border-darkbrown rounded-none !text-[16px] scale-x-105 origin-left font-semibold focus:!outline-none focus:!ring-0 focus:border-black"
                    onChange={e => updateField(setInquiry, 'fullName', e.target.value)}
                />
            </div>

            <div>
                <Label className="text-[16px]">Email Address *</Label>
                <Input 
                    value={inquiry.email}
                    className="border-0 !bg-transparent shadow-none border-b-2 border-darkbrown rounded-none !text-[16px] scale-x-105 origin-left font-semibold focus:!outline-none focus:!ring-0 focus:border-black"
                    onChange={e => updateField(setInquiry, 'email', e.target.value)}
                />
            </div>

            <div>
                <Label className="text-[16px]">Mobile No. *</Label>
                <Input 
                    value={inquiry.contact}
                    className="border-0 !bg-transparent shadow-none border-b-2 border-darkbrown rounded-none !text-[16px] scale-x-105 origin-left font-semibold focus:!outline-none focus:!ring-0 focus:border-black"
                    onChange={e => updateField(setInquiry, 'contact', e.target.value)}
                />
            </div>

            <div>
                <Label className="text-[16px]">Message *</Label>
                <Textarea   
                    value={inquiry.message}
                    className="h-30 w-full bg-light mt-2 border-1 border-darkbrown !text-[16px] scale-x-105 origin-left"
                    placeholder="Enter your message here..."
                    onChange={e => updateField(setInquiry, 'message', e.target.value)}
                />
            </div>

            <Button
                onClick={handleSubmit}
                disabled={onProcess}
                className="font-bold text-lg !bg-darkbrown w-35 scale-x-105"
            >
                <FormLoader
                    onProcess={onProcess}
                    label="Submit"
                    loadingLabel="Processing"
                />
            </Button>
        </section>
    );
}
