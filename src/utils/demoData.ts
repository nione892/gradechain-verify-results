
export interface Student {
  id: string;
  name: string;
  roll: string;
  program: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}

export interface Grade {
  courseId: string;
  marks: number;
  grade: string;
}

export interface ResultData {
  id: string;
  student: Student;
  semester: string;
  academicYear: string;
  issueDate: string;
  courses: Course[];
  grades: Grade[];
  gpa: number;
  verificationHash: string;
  ipfsHash?: string;
  resultImageUrl?: string;
}

// Empty record of results since we're removing all demo data
export const demoResults: Record<string, ResultData> = {};

export const getResultById = (id: string): ResultData | undefined => {
  return undefined; // Always return undefined since we're removing demo data
};
