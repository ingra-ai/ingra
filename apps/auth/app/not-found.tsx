'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Input } from "@repo/components/ui/input"
import { Button } from "@repo/components/ui/button"
import { Search, Home, Cpu } from 'lucide-react'
import Link from 'next/link'

interface Twinkle {
  top: string;
  left: string;
  width: string;
  height: string;
  animationDuration: string;
}

export default function NotFoundPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const circuitRef = useRef<HTMLDivElement>(null)

  // Initialize twinkles once using useMemo
  const twinkles: Twinkle[] = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 3 + 1}px`, // Ensuring minimum size of 1px
      height: `${Math.random() * 3 + 1}px`,
      animationDuration: `${Math.random() * 5 + 3}s`, // 3s to 8s
    }));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (circuitRef.current) {
        const rect = circuitRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left - rect.width / 2,
          y: e.clientY - rect.top - rect.height / 2,
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full max-w-2xl text-center">
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 border-4 border-blue-500 rounded-full opacity-80 transform -translate-x-1/2 -translate-y-1/2"
          ref={circuitRef}
          style={{
            boxShadow: '0 0 20px #3b82f6',
            animation: 'pulse 8s infinite alternate',
          }}
        />
        <div
          className="relative z-10 animate-fadeIn"
        >
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <p className="text-xl text-gray-300 mb-8">Oops! You've encountered a glitch in the matrix.</p>
        </div>
        <div
          className="relative z-10 mb-8"
          style={{
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <Cpu className="w-40 h-40 mx-auto text-blue-400 animate-float" />
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-4">
          {/* <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" placeholder="Debug query" className="bg-gray-800 text-white border-blue-500" />
            <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div> */}
          <Link href="/">
            <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-900">
              <Home className="mr-2 h-4 w-4" />
              Return to Main Interface
            </Button>
          </Link>
        </div>
      </div>
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${mousePosition.y * 0.2}px, ${mousePosition.x * 0.2}px)`, // Subtle movement
          transition: 'transform 0.3s ease-out', // Smooth transition
        }}
      >
        {
          twinkles.map((twinkle, i) => (
            <div
              key={i}
              className="absolute bg-blue-400 rounded-full animate-twinkle"
              style={{
                top: twinkle.top,
                left: twinkle.left,
                width: twinkle.width,
                height: twinkle.height,
                animationDuration: twinkle.animationDuration,
                // Optional: Add slight individual transform based on mouse position for more depth
                transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            />
          ))
        }
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes twinkle {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle var(--twinkle-duration) infinite;
          transition: opacity 0.5s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}