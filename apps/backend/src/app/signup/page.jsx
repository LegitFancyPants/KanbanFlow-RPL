"use client";
import dynamic from 'next/dynamic';

const SignUp = dynamic(() => import('@/frontend/pages/SignUp'), { ssr: false });

export default function SignUpPage() { return <SignUp />; }