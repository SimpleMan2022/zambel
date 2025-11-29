import { NextResponse } from "next/server";

interface ApiResponseOptions {
  status?: number;
  message?: string;
  success?: boolean;
}

export function apiResponse<T>(data: T, options?: ApiResponseOptions) {
  const status = options?.status || 200;
  const message = options?.message || "Success";
  const success = options?.success !== undefined ? options.success : true;

  return NextResponse.json(
    {
      data,
      message,
      success,
    },
    { status }
  );
}

export function apiError(message: string, status: number = 500) {
  return NextResponse.json(
    {
      data: null,
      message,
      success: false,
    },
    { status }
  );
}
