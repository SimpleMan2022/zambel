"use client";

import { cn } from '@/lib/utils'; // Assuming you have a utility for class concatenation

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className, width, height, rounded = false, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        rounded && 'rounded-full',
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}
