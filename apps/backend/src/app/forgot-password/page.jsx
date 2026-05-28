"use client";
import dynamic from 'next/dynamic';

const ForgotPassword = dynamic(() => import('@/frontend/pages/ForgotPassword'), { ssr: false });

export default function ForgotPasswordPage() { return <ForgotPassword />; }
