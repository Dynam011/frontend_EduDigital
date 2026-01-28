
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Replace with actual data fetching from your database
  const summaryData = {
    totalStudents: 2350,
    totalTeachers: 573,
    totalCourses: 12234,
    totalRevenue: 45231.89,
  };

  return NextResponse.json(summaryData);
}
