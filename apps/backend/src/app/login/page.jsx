"use client";
import dynamic from 'next/dynamic';

const Login = dynamic(() => import('@/frontend/pages/Login'), { ssr: false });

export default function LoginPage() { return <Login />; }