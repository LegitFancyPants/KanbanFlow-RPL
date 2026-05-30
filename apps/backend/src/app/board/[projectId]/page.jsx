"use client";
import dynamic from 'next/dynamic';

const Board = dynamic(() => import('@/frontend/pages/Board'), { ssr: false });

export default function BoardPage() { return <Board />; }