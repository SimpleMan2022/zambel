export async function GET() {
    return Response.json({
      midtrans: process.env.MIDTRANS_SERVER_KEY,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    });
  }
  