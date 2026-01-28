'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { handleChange } from '../../lib/form-handle';
import { FormLoader } from '@/components/ui/loader';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { Toaster } from '@/components/ui/toaster';

export function AuthPage() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [onProcess, setProcess] = useState(false);

    async function handleSubmit() {
        try {
            setProcess(true);
            const token = await AuthService.authenticateUser(credentials);
            if (token) {
                localStorage.setItem('token', token);
                const res = await AuthService.setCookie(token);
                toast.success(res.message);
                window.location.href = '/'
            }
        } catch (error) { toast.error(`${error}`) }
        finally {
            setProcess(false);
        }
    }


    return(
        <section
            className="w-full h-screen flex-center bg-cover bg-center"
            style={{ backgroundImage: "url('/images/kp_login.jpg')" }}
        >
            <Toaster position="top-center" closeButton />
            <form 
                onSubmit={ (e) => {
                    e.preventDefault();
                    handleSubmit();
                } }
                method='post'
                className='flex flex-col gap-4 bg-light w-[400px] shadow-lg rounded-xl max-md:shadow-none max-md:border-0 max-md:-mt-24 px-8 py-12 pb-24 max-sm:mx-2'
            >
                <div>
                    <Image
                        src="/images/kp_logo.png"
                        alt="Krispy Papi Logo"
                        width={60}
                        height={60}
                        className="mx-auto"
                    />
                    <Image
                        src="/images/papiverse_logo.png"
                        alt="Papiverse Logo"
                        width={200}
                        height={0}
                        className="mx-auto mb-2"
                    />
                </div>
                <div className='flex flex-col gap-3'>
                    <input
                        className="text-base border border-slate-400 pl-3 py-1 rounded-md"
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={credentials.username}
                        onChange={ e => handleChange(e, setCredentials) }
                        required
                    />
                    <input
                        className="text-base border border-slate-400 pl-3 py-1 rounded-md"
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={credentials.password}
                        onChange={ e => handleChange(e, setCredentials) }
                        required
                    />
                </div>
                <Button
                    type='submit'
                    className='font-semibold'
                    disabled={ onProcess }
                >
                    <FormLoader onProcess={ onProcess } label='LOG IN' loadingLabel='LOGGING IN' />
                </Button>
                {/* <div className='flex-center-y justify-evenly text-sm text-gray gap-3'>
                    <Link className="underline hover:text-dark" href="#">
                        Forgot Password
                    </Link>
                    <Link className="underline hover:text-dark" href="#">
                        Reset Password
                    </Link>
                </div> */}
            </form>
        </section>
    );
}