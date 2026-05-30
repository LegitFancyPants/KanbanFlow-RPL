"use client";
import dynamic from 'next/dynamic';

const Projects = dynamic(() => import('@/frontend/pages/Projects'), { ssr: false });

export default function ProjectsPage() { return <Projects />; }