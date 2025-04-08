
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
}

export const demoResults: Record<string, ResultData> = {
  'STU20210001-SEM2-123': {
    id: 'STU20210001-SEM2-123',
    student: {
      id: 'STU20210001',
      name: 'Alex Johnson',
      roll: '2021CS001',
      program: 'B.Tech Computer Science'
    },
    semester: '2nd Semester',
    academicYear: '2021-2022',
    issueDate: '2022-05-15',
    courses: [
      { id: 'CS101', code: 'CS101', name: 'Introduction to Programming', credits: 4 },
      { id: 'CS102', code: 'CS102', name: 'Data Structures', credits: 4 },
      { id: 'MA101', code: 'MA101', name: 'Calculus', credits: 3 },
      { id: 'PH101', code: 'PH101', name: 'Physics', credits: 3 },
      { id: 'HS101', code: 'HS101', name: 'Communication Skills', credits: 2 }
    ],
    grades: [
      { courseId: 'CS101', marks: 85, grade: 'A' },
      { courseId: 'CS102', marks: 78, grade: 'B+' },
      { courseId: 'MA101', marks: 90, grade: 'A+' },
      { courseId: 'PH101', marks: 75, grade: 'B' },
      { courseId: 'HS101', marks: 82, grade: 'A-' }
    ],
    gpa: 3.7,
    verificationHash: '0x7c5ea36004851c664b3e3b0dae9d71b4e0069fa7a8d24c6f0d0748f5c4c947d1',
    ipfsHash: 'QmXRcTnYC2CchfYm8yVA6KLB7QmkUQDXpUdSGRMVZuRoRo'
  },
  'STU20210002-SEM1-456': {
    id: 'STU20210002-SEM1-456',
    student: {
      id: 'STU20210002',
      name: 'Maya Patel',
      roll: '2021EC005',
      program: 'B.Tech Electronics'
    },
    semester: '1st Semester',
    academicYear: '2021-2022',
    issueDate: '2021-12-20',
    courses: [
      { id: 'EC101', code: 'EC101', name: 'Basic Electronics', credits: 4 },
      { id: 'EC102', code: 'EC102', name: 'Digital Logic Design', credits: 4 },
      { id: 'MA101', code: 'MA101', name: 'Calculus', credits: 3 },
      { id: 'PH101', code: 'PH101', name: 'Physics', credits: 3 },
      { id: 'HS101', code: 'HS101', name: 'Communication Skills', credits: 2 }
    ],
    grades: [
      { courseId: 'EC101', marks: 92, grade: 'A+' },
      { courseId: 'EC102', marks: 88, grade: 'A' },
      { courseId: 'MA101', marks: 85, grade: 'A' },
      { courseId: 'PH101', marks: 80, grade: 'A-' },
      { courseId: 'HS101', marks: 78, grade: 'B+' }
    ],
    gpa: 3.8,
    verificationHash: '0x8d5ea36004851c664b3e3b0dae9d71b4e0069fa7a8d24c6f0d0748f5c4c947d2',
    ipfsHash: 'QmYRcTnYC2CchfYm8yVA6KLB7QmkUQDXpUdSGRMVZuRoRp'
  },
  'STU20210003-SEM3-789': {
    id: 'STU20210003-SEM3-789',
    student: {
      id: 'STU20210003',
      name: 'John Smith',
      roll: '2021ME010',
      program: 'B.Tech Mechanical'
    },
    semester: '3rd Semester',
    academicYear: '2022-2023',
    issueDate: '2022-12-18',
    courses: [
      { id: 'ME201', code: 'ME201', name: 'Thermodynamics', credits: 4 },
      { id: 'ME202', code: 'ME202', name: 'Fluid Mechanics', credits: 4 },
      { id: 'ME203', code: 'ME203', name: 'Material Science', credits: 3 },
      { id: 'MA201', code: 'MA201', name: 'Differential Equations', credits: 3 },
      { id: 'HS201', code: 'HS201', name: 'Economics', credits: 2 }
    ],
    grades: [
      { courseId: 'ME201', marks: 68, grade: 'C+' },
      { courseId: 'ME202', marks: 72, grade: 'B-' },
      { courseId: 'ME203', marks: 75, grade: 'B' },
      { courseId: 'MA201', marks: 65, grade: 'C' },
      { courseId: 'HS201', marks: 82, grade: 'A-' }
    ],
    gpa: 2.9,
    verificationHash: '0x9d5ea36004851c664b3e3b0dae9d71b4e0069fa7a8d24c6f0d0748f5c4c947d3',
    ipfsHash: 'QmZRcTnYC2CchfYm8yVA6KLB7QmkUQDXpUdSGRMVZuRoRq'
  }
};

export const getResultById = (id: string): ResultData | undefined => {
  return demoResults[id];
};
