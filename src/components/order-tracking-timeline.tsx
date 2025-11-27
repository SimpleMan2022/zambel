"use client"

import type React from "react"

export interface TimelineItem {
  id: string
  title: string
  date: string
  time?: string
  description?: string
  isActive: boolean
  isCompleted: boolean
  icon?: React.ReactNode
}

interface OrderTrackingTimelineProps {
  items: TimelineItem[]
}

export function OrderTrackingTimeline({ items }: OrderTrackingTimelineProps) {
  return (
      <div className="relative p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Timeline Pesanan</h2>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-200">
            {/* Active portion of line */}
            <div
                className="absolute top-0 left-0 w-full bg-red-600 transition-all duration-500"
                style={{
                  height: `${(items.filter(item => item.isCompleted).length / items.length) * 100}%`
                }}
            />
          </div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {items.map((item, index) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  {/* Dot Indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            item.isCompleted
                                ? "bg-red-600 shadow-lg shadow-red-200"
                                : item.isActive
                                    ? "bg-red-600 shadow-lg shadow-red-200 animate-pulse"
                                    : "bg-white border-2 border-gray-300"
                        }`}
                    >
                      {item.isCompleted ? (
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                      ) : item.isActive ? (
                          <div className="w-3 h-3 bg-white rounded-full" />
                      ) : (
                          <div className="w-3 h-3 bg-gray-300 rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div
                      className={`flex-1 pb-2 transition-all duration-300 ${
                          item.isCompleted || item.isActive
                              ? "opacity-100"
                              : "opacity-60"
                      }`}
                  >
                    <div className={`rounded-lg p-4 transition-all duration-300 ${
                        item.isCompleted
                            ? "bg-red-50 border border-red-100"
                            : item.isActive
                                ? "bg-red-50 border border-red-200 shadow-sm"
                                : "bg-gray-50 border border-gray-100"
                    }`}>
                      <h3 className={`font-bold text-lg mb-1 ${
                          item.isCompleted || item.isActive
                              ? "text-gray-900"
                              : "text-gray-600"
                      }`}>
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{item.date}</span>
                        {item.time && (
                            <>
                              <span className="text-gray-400">•</span>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{item.time}</span>
                            </>
                        )}
                      </div>

                      {item.description && (
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                            {item.description}
                          </p>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .8;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      </div>
  )
}